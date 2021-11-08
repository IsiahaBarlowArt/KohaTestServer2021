#!/usr/bin/perl -w

use Modern::Perl;

use CGI qw ( -utf8 );
use Data::Dumper; # Remove
use JSON;
use URI::Escape;
use Scalar::Util qw(looks_like_number);

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

my $query = CGI->new();
my ($status, $cookie, $sessionID) = check_api_auth($query, { catalogue => '*'} );

unless ($status eq "ok") {
    binmode STDOUT, ':encoding(UTF-8)';
    print $query->header(-type => 'application/json', -status => '403', -charset => 'UTF-8');
    exit 0;
}
sub is_integer {
   defined $_[0] && $_[0] =~ /^[+-]?\d+$/;
}

sub is_float {
   defined $_[0] && $_[0] =~ /^[+-]?\d+(\.\d+)?$/;
}
# Render data to browser
sub output {
    my ($object, $type, $status) = @_;
    my $output = new CGI;

    binmode STDOUT, ':encoding(UTF-8)';
    print $output->header(-type => $type, -status => $status, -charset => 'UTF-8');

    print $object;
}

sub add_credit {
    my $input = CGI->new();

    my $borrowernumber = $input->param('borrowernumber');
    my $patron = Koha::Patrons->find($borrowernumber);
    # Note: If the logged in user is not allowed to see this patron an invoice can be forced
    # Here we are trusting librarians not to hack the system
    my $barcode = $input->param('barcode');
    my $item_id;

    if ($barcode) {
        my $item = Koha::Items->find({barcode => $barcode});
        $item_id = $item->itemnumber if $item;
    }
    my $description = $input->param('desc') || '';
    my $note        = $input->param('note') || '';
    my $reqamount   = $input->param('amount') || 0;
    # format amount to .00
    my $amount      = sprintf("%.2f", $reqamount);
    my $type        = $input->param('type') || 'credit';
    my $library_id = C4::Context->userenv ? C4::Context->userenv->{'branch'} : undef;
    my $send_data = {
        amount      => $amount,
        description => $description,
        item_id     => $item_id,
        library_id  => $library_id,
        note        => $note,
        type        => $type,
        user_id     => $borrowernumber,
        interface   => C4::Context->interface
    };
    my $transaction_message;

    $patron->account->add_credit($send_data);
    $transaction_message = "credit added response";

    if ( C4::Context->preference('AccountAutoReconcile') ) {
        $patron->account->reconcile_balance;
        $transaction_message = "credit applied response";
    }

    my $account           = $patron->account;
    my $account_lines     = $account->outstanding_debits;
    # Credits and Outstanding
    my $outstanding_credits = $account->outstanding_credits->total_outstanding;
    my $total_outstanding = $account_lines->total_outstanding;

    my @accounts;
    my @accountlines_id;

    while (my $account_line = $account_lines->next) {
        push @accounts, $account_line->{_result}{_column_data};
        push @accountlines_id, $account_line->{_result}{_column_data}{accountlines_id};
    }
    my $response = {
        accounts => \@accounts,
        total_outstanding => $total_outstanding,
        outstanding_credits => $outstanding_credits,
        accountlines_id => \@accountlines_id,
        send_data => $send_data,
        reconcile_balance => $total_outstanding - $outstanding_credits,
        transaction_message => $transaction_message
    };
    return $response;
}
# Account lines
sub get_credit {
    my $input = CGI->new();
    # Patron values
    my $borrowernumber    = $input->param('borrowernumber');
    my $patron            = Koha::Patrons->find($borrowernumber);
    my $account           = $patron->account;
    my $account_lines     = $account->outstanding_debits;
    # Credits and Outstanding
    my $outstanding_credits = $account->outstanding_credits->total_outstanding;
    my $total_outstanding = $account_lines->total_outstanding;

    my @accounts;
    my @accountlines_id;

    while (my $account_line = $account_lines->next) {
        push @accounts, $account_line->{_result}{_column_data};
        push @accountlines_id, $account_line->{_result}{_column_data}{accountlines_id};
    }
    my $response = {
        accounts => \@accounts,
        total_outstanding => $total_outstanding,
        outstanding_credits => $outstanding_credits,
        accountlines_id => \@accountlines_id
    };

    return $response;
}

my $output = CGI->new();
my $process = $query->param('process');
my $amount = $query->param('amount') || 0;
my $status = 200;
my $message;
my $transaction;

if ($amount eq 0) {
    $message = "no amount response";
}

if ($process eq 'get_credit') {
    $transaction = get_credit();
    $message = "get_credit response";
}

if ($process eq 'add_credit' && $amount ne 0 && (is_integer($amount) || is_float($amount))) {
    $transaction = add_credit();
    $message = $transaction->{'transaction_message'};
}

my @account_lines = $transaction->{'accounts'};
my $prejson = {
    status => $status,
    message => $message,
    request_type => $process,
    data => {
        request_type => $process,
        transaction => $transaction,
        account_lines => \@account_lines
    }
};
my $json = encode_json($prejson);
output($json, 'application/json', $status);
