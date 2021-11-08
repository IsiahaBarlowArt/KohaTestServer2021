[% INCLUDE 'blocking_errors.inc' %]
[% USE Koha %]
[% USE Branches %]
[% USE Categories %]
[% USE AuthorisedValues %]
[% USE scalar %]
<div id="toolbar" class="btn-toolbar">

    <div class="btn-group">
        <a href="/cgi-bin/koha/circ/circulation.pl?borrowernumber=[% patron.borrowernumber | html %]" class="btn-toolbar-menu btn btn-default">
            <i class="fa fa-home"></i>
        </a>
    </div>

    [% IF ( CAN_user_reserveforothers ) %]
        <button id="holdsearchmodalLabel" type="button" class="btn-toolbar-menu btn btn-default" data-toggle="modal" data-target="#hold_search_modal">
            <i class="fa fa-search"></i>
            Place hold
        </button>
        <!--<a id="searchtohold" class="btn btn-default" href="#"><i class="fa fa-search"></i> Place hold</a>-->
    [% END %]

    <!-- Messages menu -->
    [% USE msgcount = iterator(messages) %]
    [% FOREACH msgcnt IN msgcount %]
    [% END %]
    <div class="btn-group">
        <button id="addnewmessageLabel" data-toggle="modal" class="btn-toolbar-menu btn btn-default" data-target="#add_message_form">
            Compose
            [% UNLESS ( msgcount.size ) %]
            message
            [% END %]
        </button>
        [% IF ( msgcount.size > 0 ) %]
        <button id="viewmessagesLabel" href="#view_messages_modal" data-toggle="modal" class="btn-toolbar-menu btn btn-warning">
            Messages
            ([% msgcount.size %])
        </button>
        [% END %]
    </div>

    <!-- Charges menu -->
    <div class="btn-group">
        [% IF ( charges ) %]
        <a style="color:#fff" title="There is [% chargesamount | $Price %] in overdues charges" class="btn-toolbar-menu btn btn-warning text-white" href="/cgi-bin/koha/members/pay.pl?borrowernumber=[% patron.borrowernumber %]">
            <i class="fa fa-warning"></i>
            [% chargesamount | $Price %]
        </a>
        [% END %]
        [% IF ( credits ) %]
        <a style="color:#fff" title="There is [% creditsamount | $Price %] in account credit" class="btn-toolbar-menu btn btn-success text-white" href="/cgi-bin/koha/members/boraccount.pl?borrowernumber=[% patron.borrowernumber %]">
            <i class="fa fa-money"></i>
            [% creditsamount | $Price %]
        </a>
        [% END %]
        <button id="cash_sale_modal_link" data-toggle="modal"  data-target="#cash_sale_modal" class="btn-toolbar-menu btn btn-default">
            Fees & charges
        </button>
        [% IF CAN_user_circulate_circulate_remaining_permissions %]
        <button id="credit_account_modal_link" data-toggle="modal"  data-target="#add_credit_modal" class="btn-toolbar-menu btn btn-default">
            Credit
        </button>
        [% END %]
    </div>

    <!-- More dropdown menu -->
    <div class="btn-group">
        <button class="btn btn-default dropdown-toggle" data-toggle="dropdown">More <span class="caret"></span></button>
        <ul class="dropdown-menu dropdown-menu-right">
            <li class="disabled"><a tabindex="-1" href="#">Patron actions</a></li>
            [% IF CAN_user_borrowers_edit_borrowers %]
                <li><a id="editpatron" href="/cgi-bin/koha/members/memberentry.pl?op=modify&amp;destination=circ&amp;borrowernumber=[% patron.borrowernumber | html %]">Edit patron</a></li>
            [% END %]
            [% IF CAN_user_borrowers_edit_borrowers %]
                <li><a id="renewpatron" href="/cgi-bin/koha/members/setstatus.pl?borrowernumber=[% patron.borrowernumber | html %]&amp;destination=[% destination | html %]&amp;reregistration=y">Renew patron</a></li>
            [% ELSE %]
                <li class="disabled"><a data-toggle="tooltip" data-placement="left" title="You are not authorized to renew patrons" id="renewpatron" href="#">Renew patron</a></li>
            [% END %]
            [% IF ( CAN_user_permissions ) %]
                <li><a id="patronflags" href="/cgi-bin/koha/members/member-flags.pl?member=[% patron.borrowernumber | html %]">Set patron permissions</a></li>
            [% ELSE %]
                <li class="disabled"><a data-toggle="tooltip" data-placement="left" title="You are not authorized to set permissions" id="patronflags" href="#">Set permissions</a></li>
            [% END %]
            [% IF CAN_user_borrowers_edit_borrowers && useDischarge %]
                <li><a href="/cgi-bin/koha/members/discharge.pl?borrowernumber=[% patron.borrowernumber | uri %]">Discharge</a></li>
            [% END %]
            [% IF CAN_user_borrowers_edit_borrowers %]
                <li><a id="deletepatron" href="#">Delete patron account</a></li>
            [% ELSE %]
                <li class="disabled"><a data-toggle="tooltip" data-placement="left" title="You are not authorized to delete patrons" id="deletepatron" href="#">Delete</a></li>
            [% END %]
            [% SET adult_categories = Categories.scalar.all(category_type => 'A') %]
            [% IF adult_categories.count > 0 %]
                [% IF patron.is_child %]
                    <li><a id="updatechild" href="#">Update child to adult patron</a></li>
                [% ELSE %]
                    <li class="disabled"><a data-toggle="tooltip" data-placement="left" title="Patron is an adult" id="updatechild" href="#">Update child to adult patron</a></li>
                [% END %]
            [% END %]

            <li class="divider"></li>
            <li class="disabled"><a tabindex="-1" href="#">Circulation actions</a></li>

            [% IF Koha.Preference('RESTOAuth2ClientCredentials') %]
                [% IF CAN_user_superlibrarian OR loggedinusernumber == patron.borrowernumber %]
                    <li><a id="apikeys" href="/cgi-bin/koha/members/apikeys.pl?patron_id=[% patron.borrowernumber | html %]">Manage API keys</a></li>
                [% ELSE %]
                    <li class="disabled"><a data-toggle="tooltip" data-placement="left" title="You are not authorized to manage API keys" id="apikeys" href="#">Manage API keys</a></li>
                [% END %]
            [% END %]

            [% IF Koha.Preference('intranetreadinghistory') %]
                [%IF ( privacy == 2 ) %]
                    <li class="disabled"><a data-toggle="tooltip" data-placement="left" title="Not allowed by patron's privacy settings" id="exportbarcodes" href="#">Export today's checked in barcodes</a></li>
                [% ELSE %]
                    <li><a id="exportcheckins" href="#">Export today's checked in barcodes</a></li>
                [% END %]
            [% END %]
        </ul>
    </div>

    <!-- Print dropdown menu -->
    [% IF CAN_user_circulate_circulate_remaining_permissions %]
    <div class="btn-group">
        <div class="btn-group" role="group">
            <button class="btn btn-default dropdown-toggle" data-toggle="dropdown"><i class="fa fa-print"></i> Print <span class="caret"></span></button>
            <ul class="dropdown-menu">
                <li><a id="printsummary" href="#">Print summary</a></li>
                <li><a id="printslip" href="#">Print slip</a></li>
                <li><a id="printquickslip" href="#">Print quick slip</a></li>
                [% IF patron.has_overdues %]
                    <li><a id="print_overdues" href="#">Print overdues</a></li>
                [% END %]
                <li><a id="printcheckinslip" href="#">Print checkin slip</a></li>
            </ul>
        </div>
        <!-- Close and print button -->
        <button id="quitprintquickslip" class="btn btn-default"><i class="fa fa-times"></i> Close and print</button>
    </div>
    [% END %]

</div><!-- End menu -->
