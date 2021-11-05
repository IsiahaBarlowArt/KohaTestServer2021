#!/usr/bin/perl -w

use Modern::Perl;

use CGI qw ( -utf8 );
use JSON;

use C4::Context;
use C4::Charset;
use C4::Auth qw/check_api_auth/;

use Koha::AuthorisedValues;

my $query = CGI->new();
my ($status, $cookie, $sessionID) = check_api_auth($query, { catalogue => '*'} );
unless ($status eq "ok") {
    binmode STDOUT, ':encoding(UTF-8)';
    print $query->header(-type => 'application/json', -status => '403', -charset => 'UTF-8');
    exit 0;
}

my $input = new CGI;
my $category = $input->param('category');
my $avs = Koha::AuthorisedValues->search(
    {
        category => $category,
    },
    {
        order_by => [ 'category', 'lib' ],
    }
);
my @json;
while ( my $av = $avs->next ) {
    push @json, { lib => $av->lib, authorised_value => $av->authorised_value };
}
my $data_status = !@json ? 0: 1;
my $message = $category || 'Category not selected';
my $prejson = {
    data => \@json,
    status => $data_status,
    message => {
        category => $message
    }
};
my $json = encode_json($prejson);

binmode STDOUT, ':encoding(UTF-8)';
print $input->header(-type => 'application/json', -charset => 'UTF-8');
print $json;
