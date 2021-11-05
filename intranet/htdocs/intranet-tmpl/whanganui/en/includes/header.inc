[% USE raw %]
[% USE Branches %]
[% USE Desks %]
[% USE Registers %]
[% USE Koha %]
<nav class="navbar">
    <div class="navbar-header">
        <a href="#" class="header-menu-link collapsed" data-toggle="collapse" data-target="#header" aria-expanded="false" aria-controls="header">
            <i class="fa fa-bars"></i> Menu
        </a>
    </div>
    <div id="header" class="navbar-collapse collapse">
        <ul id="toplevelmenu" class="nav navbar-nav">
            [% IF ( CAN_user_circulate_circulate_remaining_permissions ) %]<li><a href="/cgi-bin/koha/circ/circulation-home.pl">Circulation</a></li>[% END %]
            [% IF CAN_user_borrowers_edit_borrowers %]<li><a href="/cgi-bin/koha/members/members-home.pl">Patrons</a></li>[% END %]
            <li id="catalog-search-link">
                <a href="/cgi-bin/koha/catalogue/search.pl">Search</a>
            </li>
            <li class="dropdown" id="catalog-search-dropdown">
                <a href="/cgi-bin/koha/catalogue/search.pl" class="dropdown-toggle" data-toggle="dropdown"><b class="caret"></b></a>
                <ul class="dropdown-menu dropdown-menu-right">
                    [% IF ( CAN_user_catalogue ) %]<li><a href="/cgi-bin/koha/catalogue/search.pl">Advanced search</a></li>
                    <li><a href="/cgi-bin/koha/catalogue/itemsearch.pl">Item search</a></li>[% END %]
                </ul>
            </li>
            [% IF ( Koha.Preference('intranetbookbag') ) %]
                <li>
                    <a href="#" id="cartmenulink"><i class="fa fa-shopping-cart"></i>Cart<span id="basketcount"></span></a>
                </li>
            [% END %]
            [% Koha.Preference('IntranetNav') | $raw %]
            <!-- Previous Patrons list -->
            [% INCLUDE 'previous-patrons.inc' %]

            [% IF ( !patron.borrowernumber) %]
              <li>
                  <a id="cash_sale_modal_link" href="#" data-toggle="modal" data-target="#cash_sale_modal">Cash sale</a>
              </li>
            [% END %]


            <li class="dropdown">
                <a href="/cgi-bin/koha/mainpage.pl" class="dropdown-toggle" data-toggle="dropdown">More <b class="caret"></b></a>
                <ul class="dropdown-menu dropdown-menu-right">
                    <li><a href="/cgi-bin/koha/virtualshelves/shelves.pl">Lists</a></li>
                    [% IF ( CAN_user_editcatalogue_edit_catalogue || CAN_user_editcatalogue_edit_items ) %]
                        <li><a href="/cgi-bin/koha/cataloguing/addbooks.pl">Cataloging</a></li>
                    [% END %]
                    [% IF ( CAN_user_acquisition ) %]
                        <li><a href="/cgi-bin/koha/acqui/acqui-home.pl">Acquisitions</a></li>
                    [% END %]
                    <li><a href="/cgi-bin/koha/authorities/authorities-home.pl">Authorities</a></li>
                    [% IF Koha.Preference('ILLModule') && CAN_user_ill %]
                        <li><a href="/cgi-bin/koha/ill/ill-requests.pl">ILL requests</a></li>
                    [% END %]
                    [% IF ( CAN_user_serials ) %]
                        <li><a href="/cgi-bin/koha/serials/serials-home.pl">Serials</a></li>
                    [% END %]
                    [% IF ( Koha.Preference('UseCourseReserves') ) %]
                        <li><a href="/cgi-bin/koha/course_reserves/course-reserves.pl">Course reserves</a></li>
                    [% END %]
                    [% IF ( CAN_user_reports ) %]
                        <li><a href="/cgi-bin/koha/reports/reports-home.pl">Reports</a></li>
                    [% END %]
                    [% IF ( CAN_user_suggestions_suggestions_manage ) %]
                        <li><a href="/cgi-bin/koha/suggestion/suggestion.pl">Suggestions</a></li>
                    [% END %]
                    [% IF ( CAN_user_tools ) %]
                        <li><a href="/cgi-bin/koha/tools/tools-home.pl">Tools</a></li>
                    [% END %]
                    [% IF ( Koha.Preference('EnablePointOfSale') && Koha.Preference('UseCashRegisters') && CAN_user_cash_management_takepayment ) %]
                        <li><a href="/cgi-bin/koha/pos/pay.pl">Point of sale</a></li>
                    [% END %]
                    [% IF ( CAN_user_parameters ) %]
                        <li><a href="/cgi-bin/koha/admin/admin-home.pl">Administration</a></li>
                    [% END %]
                    <li><a href="/cgi-bin/koha/about.pl">About Koha</a></li>
                </ul>
            </li>
        </ul>
    </div>
        <ul id="user-menu" class="nav navbar-nav navbar-right">
            [% IF ( loggedinusername ) %]
            <li class="dropdown">
                <a href="#" id="logged-in-menu" role="button" class="dropdown-toggle" data-toggle="dropdown">
                    <span id="logged-in-info-brief">
                        <i class="fa fa-user"></i>
                    </span>
                    <span id="logged-in-info-full">
                        [% SET is_superlibrarian = CAN_user_superlibrarian ? 'is_superlibrarian' : '' %]
                        <span class="loggedinusername [% is_superlibrarian | html %]">[% logged_in_user.userid | html %]</span>
                        <span class="separator">|</span>
                        [% IF ( AutoLocation ) %]
                            <brand>
                                [% Branches.GetLoggedInBranchname | html %]
                            </brand>
                        [% ELSE %]
                            <strong>
                                <span class="logged-in-branch-name">[% Branches.GetLoggedInBranchname | html %]</span>
                                <span class="logged-in-branch-code content_hidden">[% Branches.GetLoggedInBranchcode | html %]</span>
                            </strong>
                        [% END %]
                        [% IF Koha.Preference('UseCirculationDesks') && Desks.ListForLibrary.count %]
                            <span class="separator">|</span>
                            <strong>
                                [% IF ( Desks.GetLoggedInDeskName == '' ) %]
                                   <span class="logged-in-desk-name">NO DESK SET</span>
                                [% ELSE %]
                                    <span class="logged-in-desk-name">[% Desks.GetLoggedInDeskName | html %]</span>
                                    <span class="logged-in-desk-id content_hidden">[% Desks.GetLoggedInDeskId | html %]</span>
                                [% END %]
                            </strong>
                        [% END %]
                        [% IF Koha.Preference('UseCashRegisters') && !(Registers.session_register_name == '') %]
                            <span class="separator">|</span>
                            <strong>
                                <span class="logged-in-register-name">[% Registers.session_register_name | html %]</span>
                                <span class="logged-in-register-id content_hidden">[% Registers.session_register_id | html %]</span>
                            </strong>
                        [% END %]
                    </span>
                    <b class="caret"></b>
                </a>
                <ul class="dropdown-menu dropdown-menu-right" role="menu" aria-labelledby="logged-in-menu">

                    <li class="loggedin-menu-label">
                        Logged in as:<br />
                        <span class="loggedinusername">[% logged_in_user.userid | html %]</span>
                    </li>
                    <li class="loggedin-menu-label">
                        [% IF ( AutoLocation ) %]
                            <brand>
                                [% Branches.GetLoggedInBranchname | html %]
                            </brand>
                        [% ELSE %]
                            Location: <br />
                            <span class="logged-in-branch-name">[% Branches.GetLoggedInBranchname | html %]</span>
                            <span class="logged-in-branch-code content_hidden">[% Branches.GetLoggedInBranchcode | html %]</span>
                        [% END %]
                    </li>

                    [% IF Koha.Preference('UseCirculationDesks') && Desks.ListForLibrary.count %]
                    <li class="loggedin-menu-label">
                        Desk: <br />
                        [% IF ( Desks.GetLoggedInDeskName == '' ) %]
                           <span class="logged-in-desk-name">NO DESK SET</span>
                        [% ELSE %]
                            <span class="logged-in-desk-name">[% Desks.GetLoggedInDeskName | html %]</span>
                            <span class="logged-in-desk-id content_hidden">[% Desks.GetLoggedInDeskId | html %]</span>
                        [% END %]
                    </li>
                    [% END %]

                    [% IF Koha.Preference('UseCashRegisters') && !(Registers.session_register_name == '') %]
                        <li class="loggedin-menu-label">
                            Register: <br />
                            <span class="logged-in-register-name">[% Registers.session_register_name | html %]</span>
                            <span class="logged-in-register-id content_hidden">[% Registers.session_register_id | html %]</span>
                        </li>
                    [% END %]

                    [% IF !( Koha.Preference('IndependentBranches') && !CAN_user_superlibrarian && !CAN_user_editcatalogue_edit_catalogue ) %]
                    <li role="separator" class="loggedin-menu-label divider"></li>
                    <li>
                        [% IF Koha.Preference('UseCirculationDesks') && Koha.Preference('UseCashRegisters') %]
                        <a class="toplinks" href="/cgi-bin/koha/circ/set-library.pl">Set library, desk and register</a>
                        [% ELSIF Koha.Preference('UseCirculationDesks') %]
                        <a class="toplinks" href="/cgi-bin/koha/circ/set-library.pl">Set library and desk</a>
                        [% ELSIF Koha.Preference('UseCashRegisters') %]
                        <a class="toplinks" href="/cgi-bin/koha/circ/set-library.pl">Set library and cash register</a>
                        [% ELSE %]
                        <a class="toplinks" href="/cgi-bin/koha/circ/set-library.pl">Set library</a>
                        [% END %]
                    </li>
                    [% ELSIF Koha.Preference('UseCirculationDesks') && Koha.Preference('UseCashRegisters') %]
                    <li role="separator" class="loggedin-menu-label divider"></li>
                    <li>
                        <a class="toplinks" href="/cgi-bin/koha/circ/set-library.pl">Set desk and cash register</a>
                    </li>
                    [% ELSIF Koha.Preference('UseCirculationDesks') %]
                    <li role="separator" class="loggedin-menu-label divider"></li>
                    <li>
                        <a class="toplinks" href="/cgi-bin/koha/circ/set-library.pl">Set desk</a>
                    </li>
                    [% ELSIF Koha.Preference('UseCashRegisters') %]
                    <li role="separator" class="loggedin-menu-label divider"></li>
                    <li>
                        <a class="toplinks" href="/cgi-bin/koha/circ/set-library.pl">Set cash register</a>
                    </li>
                    [% END %]
                    [% IF EnableSearchHistory %]
                    <li>
                        <a class="toplinks" href="/cgi-bin/koha/catalogue/search-history.pl">Search history</a>
                    </li>
                    [% END %]

                    [% IF loggedinusernumber %]
                        <li class ="toplinks-myaccount">
                            <a class="toplinks" href="/cgi-bin/koha/members/moremember.pl?borrowernumber=[% loggedinusernumber | html %]">My account</a>
                        </li>
                        <li class="toplinks-mycheckouts">
                            <a class="toplinks" href="/cgi-bin/koha/circ/circulation.pl?borrowernumber=[% loggedinusernumber | html %]">My checkouts</a>
                        </li>
                    [% END %]
                    <li>
                        <a id="logout" class="toplinks" href="/cgi-bin/koha/mainpage.pl?logout.x=1">Log out</a>
                    </li>
                </ul>
            </li>
            [% INCLUDE 'langmenu-staff-top.inc' %]
            <li>
                <a class="toplinks" href="/cgi-bin/koha/help.pl" id="helper"><i class="fa fa-question-circle"></i> <span>Help</span></a>
            </li>
            [% ELSE %]
            <li class="loggedout">
                <span>
                    <a href="/cgi-bin/koha/mainpage.pl" id="login">Log in</a>
                    <span class="separator">|</span>
                    <a class="toplinks" href="/cgi-bin/koha/help.pl" id="helper"><i class="fa fa-question-circle"></i> <span>Help</span></a>
                </span>
            </li>
            [% END %]
        </ul>



    [% IF Koha.Preference('showLastPatron') %][% INCLUDE 'last-borrower.inc' %][% END %]
    [% IF ( Koha.Preference('intranetbookbag') ) %]<div id="cartDetails">Your cart is empty.</div>[% END %]

</nav>