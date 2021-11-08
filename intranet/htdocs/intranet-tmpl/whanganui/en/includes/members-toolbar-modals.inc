
<!-- Add message modal -->
<div id="add_message_form" class="modal fade in" tabindex="-1" role="dialog" aria-labelledby="addnewmessageLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form method="post" action="/cgi-bin/koha/circ/add_message.pl" id="message_form" name="message_f">
                <div class="modal-header">
                    <h3>Leave a message</h3>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="message_type">Add a message for:</label>
                        <select name="message_type" id="message_type">
                            <option value="L">Staff - Internal note</option>
                            <option value="B">OPAC - [% patron.firstname | html %] [% patron.surname | html %]</option>
                        </select>
                    </div>
                    [% bor_notes = AuthorisedValues.Get( 'BOR_NOTES' ) %]
                    [% IF bor_notes %]
                        <div class="form-group">
                            <label for="select_patron_messages">Predefined notes: </label>
                            <select name="type" id="select_patron_messages">
                                <option value="">Select note</option>
                                [% FOREACH bor_note IN bor_notes %]
                                    <option value="[% bor_note.lib | html %]">[% bor_note.lib | html %]</option>
                                [% END %]
                            </select>
                        </div>
                    [% END %]
                    <div class="form-group">
                        <textarea rows="3" class="modal-textarea" name="borrower_message" id="borrower_message" ></textarea>
                    </div>
                    <input type="hidden" name="borrowernumber" value="[% patron.borrowernumber | html %]" />
                    <input type="hidden" name="batch" value="[% batch | html %]" />
                    <input type="hidden" name="branchcode" value="[% Branches.GetLoggedInBranchcode | html %]" />
                </div>
                <div class="modal-footer">
                    <button class="btn btn-default approve" type="submit"><i class="fa fa-check"></i> Save</button>
                    <button class="btn btn-default deny cancel" href="#" data-dismiss="modal" aria-hidden="true"><i class="fa fa-times"></i> Cancel</button>
                </div>
            </form>
        </div>
    </div>
</div>
<!-- Hold search modal -->
<div class="modal fade in" id="hold_search_modal" tabindex="-1" role="dialog" aria-labelledby="holdsearchmodalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">
                    Search and place hold
                </h3>
            </div>
            <form id="hold_search_form" action="/cgi-bin/koha/catalogue/search.pl" method="post" class="form-inline">

            <div class="modal-body">
                <div class="control-group">
                    <div class="controls">
                        <style>#hold_search_form_input_q{padding:6px;font-size:14px}</style>
                        <input id="hold_search_form_input_q" name="q" required="required" class="noEnterSubmit" placeholder="Search for item">

                        <button id="submit_search_hold" type="submit" class="btn btn-default">
                            <i class="fa fa-search"></i> Search
                        </button>
                    </div>
                </div>
            </div>

            </form>
            <div class="modal-footer">

                <button class="deny btn btn-default" data-dismiss="modal" aria-hidden="true">
                    <i class="fa fa-times"></i>
                    Cancel
                </button>
            </div>

        </div>
    </div>
</div
<!-- Start Modal - Add credit -->
<div class="modal fade" id="add_credit_modal" tabindex="-1" role="dialog" aria-labelledby="add_credit_modal_link" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">
                    Credit details for
                    <span>
                      [% IF (patron.borrowernumber) %]
                        [% patron.firstname %] [% patron.surname %]
                        ([% patron.borrowernumber %])
                      [% END %]
                    </span>

                </h3>
            </div>
            <div class="modal-body">
              <div class="row">
                  <form id="ac_mancredit">
                    <div class="col-sm-6">
                      <input id="ac_borrowernumber" type="hidden" name="borrowernumber" id="borrowernumber" value="[% patron.borrowernumber %]">

                      <div class="form-group">
                          <label for="type">Credit type: </label>
                          <br />
                          <select name="type" id="ac_type" class="noEnterSubmit">
                              <option value="credit">Credit</option>
                              <option value="forgiven">Forgiven</option>
                          </select>
                      </div>

                      <div class="form-group">
                          <label for="desc">Description: </label>
                          <br />
                          <input name="desc" id="ac_desc" class="noEnterSubmit" type="text">
                      </div>

                      <div class="form-group">
                          <label for="note">Note: </label>
                          <br />
                          <input name="note" id="ac_note" class="noEnterSubmit" type="text">
                      </div>

                      <div class="form-group">
                          <label for="amount">Amount: (examples - 2, 2.00 or 0.5)</label>
                          <br />
                          <input name="amount" id="ac_amount" required="required" value="" class="noEnterSubmit num-only" type="text">
                      </div>
                    </div>

                  </form>
                <div class="col-sm-6">
                  <strong>
                    Your credit:
                    <span id="ac_outstanding_credits"></span>
                    <span id="ac_credit_message"></span>
                  </strong>
                </div>
              </div>
            </div>
            <div class="modal-footer">
                <button id="ac_add_credit_btn" class="btn btn-default">
                    Add credit
                </button>
                <button id="ac_cancel_credit_btn" class="deny btn btn-default" data-dismiss="modal" aria-hidden="true">
                    <i class="fa fa-times"></i>
                    Cancel
                </button>
            </div>
        </div>
    </div>
</div>
<!-- End Modal - Add credit -->
<!-- End Modal - Add credit -->
<script type="text/javascript">
ready(function(){
  //
  var borrowerfullname = "[% patron.firstname %]" + "[% patron.surname %]";
  // Get authorised values
  async function getCreditData(req) {
    var location_protocol = window.location.protocol,
      location_host = window.location.host,
      location_url = location_protocol + '//' + location_host,
      url = location_url + '/cgi-bin/koha/circ/ajax-accountcredit.pl',
      addcreditbtn = $("#ac_add_credit_btn"),
      cancelcreditbtn = $("#ac_cancel_credit_btn");

    if (req==="add_credit") {
      var uriObject = processCreditFormData(),
        safeurl = buildCreditGetRequest(uriObject, req);
        console.log(safeurl);
    } else {
      var ac_borrowernumber = $("#ac_borrowernumber").val(),
        uriObject = [{'name': 'borrowernumber', 'value': ac_borrowernumber}],
        safeurl = buildCreditGetRequest(uriObject, req);
        console.log(safeurl);
    }

    try {
      addcreditbtn.attr('disabled', true);
      cancelcreditbtn.attr('disabled', true);

      var data = await sendRequestForCredit(url+safeurl);

      console.log(data);

      var transaction = data.data.transaction,
        message = data.message,
        credit = Number(transaction.outstanding_credits).toFixed(2),
        html = '',
        innerhtml = '';
      // No amount sent check
      if (message==="no amount response") {
        innerhtml = '<br /><span id="ac_credit_message_inner" class="text-danger">No credit amount added - please enter credit amount.</span>';
        $("#ac_credit_message").html(innerhtml);
        $("#ac_credit_message_inner").fadeOut(4000);
      } else {
        // Add credit good
        if (message==="credit added response") {
          console.log("transaction amount: ", transaction.send_data.amount);
          var amount_sent = transaction.send_data.amount;
          innerhtml = '<br /><span id="ac_credit_message_inner" class="text-success">Credit amount ' + amount_sent + ' successfully added.</span>';
          $("#ac_credit_message").html(innerhtml);
          $("#ac_credit_message_inner").fadeOut(4000);
        }

        if (credit > 0) {
          html = '<span class="text-danger">' + credit + '</span>';
        } else {
          html = '<span class="text-success">' + credit + '</span>';
        }
        $("#ac_outstanding_credits").html(html);
      }

      addcreditbtn.attr('disabled', false);
      addcreditbtn.html("Add credit");
      cancelcreditbtn.attr('disabled', false);
    } catch (error) {
      console.error(error);
    }
    return data;
  }
  async function sendRequestForCredit(url) {
    // Default options are marked with *
    var response = await fetch(url, {
      method: 'GET',
      mode: 'same-origin',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',
      referrer: 'no-referrer',
    });

    return await response.json(); // parses JSON response into native JavaScript objects
  }

  function processCreditFormData() {
    var formData = $('#ac_mancredit'),
      data = formData.serializeArray();

    return data;
  }

  // Build get requests
  function buildCreditGetRequest(uriObject, req) {
    var uri_str = '',
      pre_uri_str = '?process=' + req;

    uriObject.forEach(function(ob) {
      uri_str += '&' + ob.name + '=' + ob.value;
    });
    var safeuri = encodeURI(pre_uri_str + uri_str);

    return safeuri;
  }
  var add_credit_modal = document.getElementById('add_credit_modal');

  function isFloat(num) {
      return Number(num) === num && num % 1 !== 0;
  }

  function trimNumber(num) {
    var regxpdot = /^[.]/gm;
    if (regxpdot.test(num)) {
      return '0' + num;
    } else {
      return num;
    }
  }
  $('.num-only').keyup(function () {
      this.value = trimNumber(this.value.replace(/[^0-9\.]/g,''));
  });

  $("#add_credit_modal").on('hidden.bs.modal', function () {
    if (CASH_SALES_BORROWERNUMBER!=="0") {
      console.log("add_credit_modal Closed");

      $("#cash_sale_page_refresh_modal").modal('show');
      location.reload();
    }
  });

  document.addEventListener('click', function (event) {
    // Listener: Add credit
    if (event.target.matches('#credit_account_modal_link')) {
      var html = 'Thinking ' + '<i class="fa fa-spinner fa-spin"></i>';
      $("#ac_outstanding_credits").html(html);

      getCreditData("get_credit");
    }
    // Listener: Add credit
    if (event.target.matches('#ac_add_credit_btn')) {
      $(event.target).html('Thinking ' + '<i class="fa fa-spinner fa-spin"></i>');

      getCreditData("add_credit");
    }
    // Listener: Search and hold
    if (event.target.matches('#submit_search_hold')) {
      submitSearchHoldForm();
    }

  });

  function submitSearchHoldForm() {
    var date = new Date();
    date.setTime(date.getTime() + (10 * 60 * 1000));
    $.cookie("holdfor", [% patron.borrowernumber %], { path: "/", expires: date });
    processSearchHoldFormData();
  }
  function processSearchHoldFormData() {
    document.getElementById("hold_search_form").submit();
  }
});
function ready(callback){
  // in case the document is already rendered
  if (document.readyState!='loading') callback();
  // modern browsers
  else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
  // IE <= 8
  else document.attachEvent('onreadystatechange', function(){
      if (document.readyState=='complete') callback();
  });
}
</script>
