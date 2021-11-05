#!/usr/bin/perl -w

use Modern::Perl;

use CGI qw ( -utf8 );
use Data::Dumper; # Remove
use JSON;
use URI::Escape;
use Try::Tiny;

use C4::Context;
use C4::Charset;
use C4::Auth qw/check_api_auth/;
use C4::Output;
use C4::Members;
use C4::Accounts;
use C4::Koha;

use Koha::Patrons;
use Koha::Patron::Categories;
use Koha::AuthorisedValues;
use Koha::Account;
use Koha::Token;

# Account transaction process
# 1. Send GET request
#    A. Send GET => &process=charge
#    B. Send GET => &process=pay

# Subroutines

# Apply credits
sub apply_credits {
    my $input = CGI->new();
    # Patron values
    my $accountline_ids   = $input->param('account_lines');
    my $borrowernumber    = $input->param('borrowernumber');
    my $patron            = Koha::Patrons->find($borrowernumber);
    # Push old out
    my @accountline_ids  = split(',', $accountline_ids);
    my @accounts;
    #
    my $account           = $patron->account;
    my $account_lines     = $account->outstanding_debits;
    # First request pre credit applied
    while (my $account_line = $account_lines->next) {
        push @accounts, $account_line->{_result}{_column_data};
    }
    # Credits and Outstanding
    my $outstanding_credits = $account->outstanding_credits->total_outstanding;
    my $total_outstanding = $account_lines->total_outstanding;
    # Apply credit and reconcile balance
    $patron->account->reconcile_balance();
    # Get account dat Post credit applied
    my $postpatron          = Koha::Patrons->find($borrowernumber);
    my $postaccount         = $postpatron->account;
    my $postaccount_lines   = $postaccount->outstanding_debits;
    my @postcredit_accountline_ids;
    # Get the post credit account line ids
    while (my $postaccount_line = $postaccount_lines->next) {
        push @postcredit_accountline_ids, $postaccount_line->{_result}{_column_data}{accountlines_id};
    }
    # Difference hash
    my %diff;
    my @successful_ids;
    # Compare and remove hash
    @diff{ @accountline_ids } = @accountline_ids;
    delete @diff{ @postcredit_accountline_ids };
    # Extract values from hash
    my @account_line_ids = values %diff;
    # Loop through old account
    foreach (@accounts) {
        my $aline = $_;
        # Check diff and old account line match
        my $accountline_id = $aline->{'accountlines_id'};
        if (grep( /^$accountline_id/, @account_line_ids )) {
            my $line = Koha::Account::Lines->find($accountline_id);
            my $outstanding = $line->amountoutstanding;
            my $amount_paid = $line->amount-$line->amountoutstanding;
            my $successful_transaction = {
                accountline_id => $accountline_id,
                amount_paid => "$amount_paid",
                amount_outstanding => "$outstanding"
            };
            push(@successful_ids, $successful_transaction);
        }
    }

    my $response = {
        total_outstanding   => $total_outstanding,
        outstanding_credits => $outstanding_credits,
        difference          => $outstanding_credits+$total_outstanding,
        successful_ids      => \@successful_ids,
        account_line_ids    => \@account_line_ids
    };

    return $response;
}
# Charge account
sub charge {

    my $input = CGI->new();

    my $library_id     = C4::Context->userenv->{'branch'};
    my $desc           = $input->param('desc');
    my $amount         = $input->param('amount');
    my $note           = uri_unescape scalar $input->param('note');
    my $debit_type     = $input->param('type');
    my $barcode        = $input->param('barcode');
    my $borrowernumber = $input->param('borrowernumber');
    my $patron         = Koha::Patrons->find( $borrowernumber );
    my $add            = $input->param('add') || 'null';

    my $itemnum;
    my $response;
    my @errors;


    if ($amount && $debit_type && $patron && $borrowernumber) {
        try {
            my $line = $patron->account->add_debit(
                {
                    amount      => $amount,
                    description => $desc,
                    note        => $note,
                    interface   => 'intranet',
                    library_id  => $library_id,
                    type        => $debit_type
                }
            );

            if ( C4::Context->preference('AccountAutoReconcile') ) {
                $patron->account->reconcile_balance;
            }

            if ( $add eq 'save and pay' ) {
                my $url = sprintf(
                    '/cgi-bin/koha/members/paycollect.pl?borrowernumber=%s&pay_individual=1&debit_type_code=%s&amount=%s&amountoutstanding=%s&description=%s&itemnumber=%s&accountlines_id=%s',
                    map { uri_escape_utf8($_) } (
                        $borrowernumber,
                        $line->debit_type_code,
                        $line->amount,
                        $line->amountoutstanding,
                        $line->description,
                        $line->itemnumber,
                        $line->id
                    )
                );
            }
        } catch {
            my $error = $_;
            if ( ref($error) eq 'Koha::Exceptions::Object::FKConstraint' ) {
                push(@errors, $error->broken_fk);
            }
            else {
                push(@errors, $error);
            }
        };

        $response = {
            errors         => \@errors,
            type           => $debit_type,
            barcode        => $barcode,
            desc           => $desc,
            note           => $note,
            amount         => $amount,
            borrowernumber => $borrowernumber,
        };

        return $response;
    }
}

# Check account
sub check {
  my $input = CGI->new();
  # Patron values
  my $borrowernumber      = $input->param('borrowernumber');
  my $patron              = Koha::Patrons->find($borrowernumber);
  my $borrower            = $patron->unblessed;
  my $account             = $patron->account;
  my $account_lines       = $account->outstanding_debits;
  # Credits and Outstanding
  my $outstanding_credits = $account->outstanding_credits->total_outstanding;
  my $total_outstanding   = $account_lines->total_outstanding;

  my $response = {
      settings => {
          userid          => $borrower->{'userid'},
          firstname       => $borrower->{'firstname'},
          surname         => $borrower->{'surname'},
          borrowernumber  => $borrower->{'borrowernumber'}
      },
      total_outstanding   => $total_outstanding,
      outstanding_credits => $outstanding_credits
  };

  return $response;
}

# Account lines
sub get_account_lines {
    my $input = CGI->new();
    # Patron values
    my $borrowernumber      = $input->param('borrowernumber');
    my $patron              = Koha::Patrons->find($borrowernumber);
    my $account             = $patron->account;
    my $account_lines       = $account->outstanding_debits;
    # Credits and Outstanding
    my $outstanding_credits = $account->outstanding_credits->total_outstanding;
    my $total_outstanding   = $account_lines->total_outstanding;

    my @accounts;
    my @accountlines_id;

    while (my $account_line = $account_lines->next) {
        push @accounts, $account_line->{_result}{_column_data};
        push @accountlines_id, $account_line->{_result}{_column_data}{accountlines_id};
    }
    my $response = {
        accounts            => \@accounts,
        total_outstanding   => $total_outstanding,
        outstanding_credits => $outstanding_credits,
        accountlines_id     => \@accountlines_id
    };

    return $response;
}

# Pay account
sub pay {
    my $input = CGI->new();
    # Param values
    my $borrowernumber = $input->param('borrowernumber');
    my $account_lines  = $input->param('account_lines');
    my $payment_note   = uri_unescape scalar $input->param('payment_note');
    my $payment_type   = uri_unescape scalar $input->param('payment_type');
    # Patron values
    my $branch         = C4::Context->userenv->{'branch'};
    my $patron         = Koha::Patrons->find($borrowernumber);
    # Account values
    my @account_lines  = split(',', $account_lines);
    my @errors;
    my @payments;
    my @successful_ids;
    # Loop through accountline ids
    foreach my $accountline_id (@account_lines) {
        my $line = Koha::Account::Lines->find($accountline_id);
        # Check account line is valid
        if (defined $line) {
            my $amount = $line->amountoutstanding;
            my $paid = "Fail: No oustanding amount for account line: $accountline_id";
            # Check amount is owing on account line
            if ($amount ne "0.000000") {
                Koha::Account->new( { patron_id => $borrowernumber } )->pay(
                    {
                        lines        => [$line],
                        amount       => $amount,
                        library_id   => $branch,
                        note         => $payment_note,
                        interface    => C4::Context->interface,
                        payment_type => $payment_type
                    }
                );
                if ( C4::Context->preference('AccountAutoReconcile') ) {
                    $patron->account->reconcile_balance;
                }
                $paid = "Success: Paid \$$amount to account line: $accountline_id";
                my $reline = Koha::Account::Lines->find($accountline_id);
                my $amount_outstanding = $reline->amountoutstanding;
                my $successful_transaction = {
                    accountline_id => $accountline_id,
                    amount_paid => $amount,
                    amount_outstanding => $amount_outstanding
                };
                push(@successful_ids, $successful_transaction);
            }
            my $payment_request = {
                account_line_id => $accountline_id,
                amount          => $amount,
                library_id      => $branch,
                note            => $payment_note,
                payment_type    => $payment_type,
                paid            => $paid
            };
            push(@payments, $payment_request);
        } else {
            # Invalid account line number
            my $errors = {
                account_line_id => $accountline_id,
                message => "Error: Account line not found"
            };
            push(@errors, $errors);
        }
    }
    my $response = {
        account_line_ids => \@account_lines,
        payment_request  => \@payments,
        successful_ids   => \@successful_ids,
        errors           => \@errors
    };

    return $response;
}

# Render data to browser
sub output {
    my ($object, $type, $status) = @_;
    my $output = new CGI;

    binmode STDOUT, ':encoding(UTF-8)';
    print $output->header(-type => $type, -status => $status, -charset => 'UTF-8');
    print $object;
}

# Main script
my $input = CGI->new;
my ($status, $cookie, $sessionID) = check_api_auth($input, { catalogue => '*'} );
# Check authorised user
unless ($status eq "ok") {
    binmode STDOUT, ':encoding(UTF-8)';
    print $input->header(-type => 'application/json', -status => '403', -charset => 'UTF-8');
    exit 0;
}
# Set vars
my $process         = $input->param('process') || "check";
my $borrowernumber  = $input->param('borrowernumber');
my $patron          = Koha::Patrons->find( $borrowernumber );
my $response_status = '200';
# Check patron valid
unless ( $patron ) {
    my $prejson = {
        status  => $response_status,
        message => "Error: Patron not valid",
        data    => {}
    };

    my $json = encode_json($prejson);
    output($json, 'application/json', $response_status);
} else {
    my $transaction;

    if ($process eq 'charge') {
        $transaction = charge();
    }

    if ($process eq 'apply_credits') {
        $transaction = apply_credits();
    }

    if ($process eq 'pay') {
        $transaction = pay();
    }

    if ($process eq 'check') {
        $transaction = check();
    }

    my $message = "$process response";
    my $account_lines = get_account_lines();
    my $prejson = {
        status  => $response_status,
        message => $message,
        data    => {
            session_id    => $sessionID,
            request_type  => $process,
            transaction   => $transaction,
            account_lines => $account_lines
        }
    };
    my $json = encode_json($prejson);

    output($json, 'application/json', $response_status);
}
