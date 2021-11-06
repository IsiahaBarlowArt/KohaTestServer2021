$( document ).ready(function() {
  // Make sure were are loggedin before running script
  var isLoggedIn = $(".loggedinusername").text();
  // Check were loggedin
  if (isLoggedIn) {
    function bakeCookie(name, value) {
      var cookie = [
          name, '=',
          JSON.stringify(value),
          '; domain=.', window.location.host.toString(),
          '; path=/;'
        ].join('');
      document.cookie = cookie;
    }
    function readCookie(name) {
      var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
      result && (result = JSON.parse(result[1]));
      return result;
    }
    function deleteCookie(name) {
      document.cookie = [
        name,
        '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.',
        window.location.host.toString()
      ].join('');
    }
    // Load autized values in the backgroud
    getAuthorisedValues();

    // TODO

    /*
     * 1. getAuthorisedValues - save as cookie only update at login
     * 2. Refactor code
     *
     */

    // Debug mode
    function Debug(mesg1, mesg2=null) {
      var mode = true,
          css1 = 'color: #ffffff',
          css2 = 'color: #bada55';
      return mode ? console.log(mesg1, mesg2): "";
    }
    /*******************************************************/
    /********* Cash sale main functions
    /*******************************************************/
    // Constants
    var MONTH_NAMES = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    // Misc functions
    function sum(input){
      if (toString.call(input) !== "[object Array]") {
        return false;
      } else {
        var total =  0;
        for (var i=0;i<input.length;i++) {
          if (isNaN(input[i])) {
            continue;
          }
          total += Number(input[i]);
        }
        return total;
      }
    }
    function addZeroes(num) {
      var value = Number(num);
      var res = num.split(".");
      if(res.length == 1 || (res[1].length < 3)) {
          value = value.toFixed(2);
      }
      return value
    }
    function isNumberKey(evt, element) {
      var charCode = (evt.which) ? evt.which : event.keyCode
      if (charCode > 31 && (charCode < 48 || charCode > 57) && !(charCode == 46 || charCode == 8))
        return false;
      else {
        var len = $(element).val().length;
        var index = $(element).val().indexOf('.');
        if (index > 0 && charCode == 46) {
          return false;
        }
        if (index > 0) {
          var CharAfterdot = (len + 1) - index;
          if (CharAfterdot > 3) {
            return false;
          }
        }

      }
      return true;
    }
    // Formating functions
    function getFormattedDate(date, prefomattedDate=false, hideYear=false) {
      var day = date.getDate(),
        month = MONTH_NAMES[date.getMonth()],
        year = date.getFullYear(),
        hours = date.getHours(),
        minutes = date.getMinutes();

      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      if (prefomattedDate) {
        return prefomattedDate + ' at ' + hours + ':' + minutes;
      }
      if (hideYear) {
        return day + '.' + month + ' at ' + hours + ':' + minutes;
      }

      return day + '.' + month + '.'+ year + ' at ' + hours + ':' + minutes;
    }
    // Re: getFormattedDate()
    function timeAgo(dateParam) {
      if (!dateParam) {
        return null;
      }

      var date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
      var DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
      var today = new Date(),
        yesterday = new Date(today - DAY_IN_MS),
        seconds = Math.round((today - date) / 1000),
        minutes = Math.round(seconds / 60);

      var isToday = today.toDateString() === date.toDateString();
      var isYesterday = yesterday.toDateString() === date.toDateString();
      var isThisYear = today.getFullYear() === date.getFullYear();

      if (seconds < 5) {
        return 'now';
      } else if (seconds < 60) {
        return seconds + ' seconds ago';
      } else if (seconds < 90) {
        return 'about a minute ago';
      } else if (minutes < 60) {
        return minutes + ' minutes ago';
      } else if (isToday) {
        return getFormattedDate(date, 'Today'); // Today at 10:20
      } else if (isYesterday) {
        return getFormattedDate(date, 'Yesterday'); // Yesterday at 10:20
      } else if (isThisYear) {
        return getFormattedDate(date, false, true); // 10. January at 10:20
      }

      return getFormattedDate(date); // 10. January 2017. at 10:20
    }
    // Standard date format
    function formatedDate(date) {
      var datetime = new Date(date),
        ampm = (datetime.getHours() < 12) ? "AM" : "PM",
        hours = datetime.getHours() % 12 || 12,
        formatted_date = datetime.getDate() +
          "/" + datetime.getMonth() +
          "/" + datetime.getFullYear() +
          " " + hours +
          ":" + datetime.getMinutes() +
          "" + ampm;

      return formatted_date;
    }
    // Build out account lines for table
    function buildAccountLineRows(data) {
      var accountLines = data.data.account_lines,
        accounts = accountLines.accounts,
        accountsResort = accounts.sort(function(a, b){return b-a;}),
        total_outstanding = accountLines.total_outstanding,
        outstanding_credits = accountLines.outstanding_credits,
        totaloutstanding = [],
        tableRow;
      // Check accounts not empty
      if (accountsResort.length !== 0) {
        accountsResort.forEach(function(row) {
          tableRow += '<tr id="cs_account_lines_row_' + row.accountlines_id + '" ' +
          'class="cs-account-lines-rows" ' +
          'data-accountline-id="' + row.accountlines_id + '">' +
          '<td>' + timeAgo(row.timestamp) + '</td>' +
          '<td>' + row.description + ' / ' + row.note + '</td>' +
          '<td id="cs_item_amount_row_' + row.accountlines_id + '">' +
          '<strong id="cs_item_amount_span_' + row.accountlines_id + '" class="text-danger">' +
          Number(row.amountoutstanding).toFixed(2) +
          '</strong></td>' +
          '<td id="cs_item_action_row_' + row.accountlines_id + '">' +
          '<button id="pay_cs_item_button_' + row.accountlines_id + '" ' +
          'data-account-line-id="' + row.accountlines_id + '" ' +
          'type="button" class="pay-cs_item-button btn btn-default btn-xs btn-toggle-disable">' +
          'Pay now</button></td>' +
          '</tr>' + "\n";
          totaloutstanding.push(row.amountoutstanding);
        });
        var totalowing = sum(totaloutstanding);

        setOutstandingCredits(outstanding_credits, totalowing);
        setTotalOutstanding(totalowing);
        return tableRow;
      } else {
        return null;
      }
    }
    // Build settings table rows
    function buildSettingsTableRow(obj, url) {
      var tablerow = '';
      if (obj!==null) {
        tablerow = '<tr>' +
          '<td>Account</td><td>' +
          '<a href="' + url + obj.borrowernumber +'">' +
          'View account' +
          '</a></td>' +
          '</tr><tr>' +
          '<td>Account ID</td><td>' +
          obj.borrowernumber +
          '</td>' +
          '</tr><tr>' +
          '<td>Firstname</td><td>' +
          obj.firstname + '</td>' +
          '</tr><tr>' +
          '<td>Surname</td><td>' +
          obj.surname + '</td>' +
          '</tr><tr>' +
          '<td colspan="2"><small class="muted">Logged in user: ' +
          obj.loggedin_user + '</small></td>' +
          '</tr>';
      }

      return tablerow;
    }
    function buildSettingsRows(data) {
      var location_protocol = window.location.protocol,
        location_host = window.location.host,
        location_url = location_protocol + '//' + location_host,
        url = location_url + '/cgi-bin/koha/members/pay.pl?borrowernumber=',
        settings = data.data.transaction.settings,
        accountLines = data.data.account_lines,
        total_outstanding = accountLines.total_outstanding,
        tableRow;

      try {
        setCashSaleSettingsStorage(settings);
        var borrower = getCashSaleSettingsStorage();
        Debug(borrower, true);
        tableRow = buildSettingsTableRow(borrower, url);

        return tableRow;
      } catch(e) {
        Debug(e, true);
        return false;
      }
    }
    // Sorts an array of objects "in place". (Meaning that the original array will be modified and nothing gets returned.)
    function sortOn(arr, prop) {
      arr.sort (
          function (a, b) {
              if (a[prop] < b[prop]){
                  return -1;
              } else if (a[prop] > b[prop]){
                  return 1;
              } else {
                  return 0;
              }
          }
      );
    }
    // Build out select options for authorised values
    function buildSelectOptions(data) {
      var options = data.data,
        output = [];
      var optionCopy = options.slice(0);
      // Alpha sort
      sortOn(optionCopy, "authorised_value");

      Debug("OptionCopy object resort", optionCopy);
      // Build html select options
      optionCopy.forEach(function(option){
        output.push('<option value="' + option.lib +
        '" data-cs-desc="' + option.authorised_value +
        '">' + option.authorised_value + '</option>');
      });

      return output.join("\n");
    }

    // Set and style total outstanding
    function setOutstandingCredits(outstanding_credits, total_outstanding) {
      var outstanding = Number(total_outstanding).toFixed(2),
        credits = Number(outstanding_credits).toFixed(2),
        difference = Number(credits) + Number(outstanding),
        html = "Apply credit " + "(" + credits + ")",
        poststr = '';
      $("#cs_credit_amount_applied").text(credits);
      Debug(outstanding_credits);
      if (credits < "0.00") {
        $("#cs_apply_credit_button").show();
        $("#cs_apply_credit_button").text(html);
        if (difference < "0.00") {
          $("#cs_tfoot_outstanding_credits").removeClass('text-danger');
          $("#cs_tfoot_outstanding_credits").addClass('text-success');
          poststr = " credit";
        } else {
          $("#cs_tfoot_outstanding_credits").removeClass('text-success');
          $("#cs_tfoot_outstanding_credits").addClass('text-danger');
          poststr = " debit";
        }
        $("#cs_tfoot_credit_row").show();
        $("#cs_tfoot_outstanding_credits").text(Number(difference).toFixed(2));
      } else {
        $("#cs_tfoot_credit_row").hide();
        $("#cs_apply_credit_button").hide();
        $("#cs_apply_credit_button").text(html);
      }
      if (outstanding==="0.00") {
        $("#cs_apply_credit_button").hide();
      }
    }
    // Set and style total outstanding
    function setTotalOutstanding(total_outstanding) {
      var outstanding = Number(total_outstanding).toFixed(2);

      if (outstanding > "0.00") {
        $("#cs_tfoot_total_outstanding").removeClass("text-success");
        $("#cs_tfoot_total_outstanding").addClass("text-danger");
      } else {
        $("#cs_tfoot_total_outstanding").removeClass("text-danger");
        $("#cs_tfoot_total_outstanding").addClass("text-success");
      }
      $("#cs_tfoot_total_outstanding_row").show();
      $("#cs_tfoot_total_outstanding").text(outstanding);

      if(total_outstanding>0) {
        $("#cs_pay_all_button").show();
      } else {
        $("#cs_pay_all_button").hide();
      }
    }
    // Update account lines table
    function updateAccountLineRows(data) {
      var accountLines = data.data.account_lines,
        accounts = accountLines.accounts,
        accountsResort = accounts.sort(function(a, b){return b-a;}),
        successfulIds = data.data.transaction.successful_ids,
        outstanding_credits = accountLines.outstanding_credits,
        total_outstanding = accountLines.total_outstanding;

      successfulIds.forEach(function(row) {
        $("#cs_account_lines_row_"+row.accountline_id).addClass('bg-success');
        $("#cs_item_amount_span_"+row.accountline_id).text(Number(row.amount_outstanding).toFixed(2));
        $("#cs_item_amount_span_"+row.accountline_id).removeClass('text-danger');
        $("#cs_item_amount_span_"+row.accountline_id).addClass('text-success');
        $("#pay_cs_item_button_"+row.accountline_id).remove();
        $("#cs_item_action_row_"+row.accountline_id).addClass('text-success');
        $("#cs_item_action_row_"+row.accountline_id).html("<strong>PAID</strong>");
      });

      accountsResort.forEach(function(row) {
        $("#cs_item_amount_span_"+row.accountlines_id).text(Number(row.amountoutstanding).toFixed(2)).fadeOut(250).fadeIn(250);
      });

      setOutstandingCredits(outstanding_credits, total_outstanding);
      setTotalOutstanding(total_outstanding);
    }
    // Loading table rows
    function tableLoadingRows() {
      var loadingtable = '<tr><td colspan="4" class="text-center">' +
        '<strong>Thinking <i class="fa fa-spinner fa-spin"></i></strong></td></tr>';
      return loadingtable;
    }
    function setDefaultAmountValues() {
      var cs_type_options_val_selected = $("#cs_type_options").find(":selected").val(),
        cs_type_options_text_selected = $("#cs_type_options").find(":selected").text();

      var cs_amount_calculation = parseFloat(cs_type_options_val_selected * $("#cs_qty").val()).toFixed(2);
      var cs_ammount_valid = isNaN(cs_amount_calculation) ? 0 :cs_amount_calculation;

      $("#cs_desc").val(cs_type_options_text_selected);
      $("#cs_amount").val(cs_ammount_valid);
    }
    // Load and reset default values for charge inputs
    function loadDefaultVals() {
      setDefaultAmountValues();
      var loadingtable = '<tr><td colspan="4" class="text-center">' +
        '<strong>Thinking <i class="fa fa-spinner fa-spin"></i></strong></td></tr>';
      $("#cs_account_lines_table_body").html(loadingtable);
    }
    // Get borrowernumber distinguish between Circ borrower and storage borrower
    function getBorrowNumber() {
      // pull borrower number from storage or if CASH_SALES_BORROWERNUMBER set
      if (CASH_SALES_BORROWERNUMBER!=="0") {
        // Remove settings page
        // Change modal header
        // Change modal theme to distinquish between normal cash sales
        // Update on screen totals {using ids}
        return CASH_SALES_BORROWERNUMBER;
      } else {
        if (checkCashSaleSettingsStorage()) {
          return getSettingsValue('borrowernumber');
        } else {
          return false;
        }
      }
    }    
    // Get authorised values
    async function getAuthorisedValues() {
      Debug("CALLBACK getAuthorisedValues", true);
      var location_protocol = window.location.protocol,
        location_host = window.location.host,
        location_url = location_protocol + '//' + location_host,
        url = location_url + '/cgi-bin/koha/circ/ajax-getauthvalue.pl?category=MANUAL_INV',
        addchargebtn = $("#cs_add_charge_button"),
        typeoptions = $('#cs_type_options');
      // Disable charge button while fetching data
      addchargebtn.attr('disabled', true);
      try {
        var data = await getData(url),
          options = buildSelectOptions(data);
        // Populate charge type options
        typeoptions.html(options);
        // Populate amount input
        setDefaultAmountValues();
        // Turn on charge button
        addchargebtn.attr('disabled', false);
      } catch (error) {
        console.error(error);
      }
    }
    // Get data fetch method
    async function getData(url = '', data = {}) {
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
    function checkDataReturned(data, $obj) {
      if (typeof(data.data[$obj]) !== 'undef') {
        var dataObject = data.data[$obj];
        return dataObject;
      } else {
        return false;
      }
    }
    // Get authorised values
    async function sendGetRequest(safeuri, req=null) {
      var location_protocol = window.location.protocol,
        location_host = window.location.host,
        location_url = location_protocol + '//' + location_host,
        url = location_url + '/cgi-bin/koha/circ/ajax-accounttransaction.pl' + safeuri,
        acctlinesrow = $("#cs_account_lines_table_body"),
        acctlinesrowthead = $("#cs_account_lines_table_thead"),
        settingsrow = $("#cs_settings_table_body"),
        addchargebtn = $("#cs_add_charge_button"),
        payallbtn = $("#cs_pay_all_button"),
        paynowbtn = $(".pay-cs_item-button"),
        invoicepgbtn = $("#cs_invoice_button"),
        settingspgbtn = $("#cs_settings_button"),
        settingspgalert = $("#cs_settings_page_alert"),
        applycrtbtn = $("#cs_apply_credit_button"),
        applycrttext = $("#cs_apply_credit_text"),
        creditrow = $("#cs_tfoot_credit_row"),
        amtoutrow = $("#cs_tfoot_total_outstanding_row"),
        checkerror = $("#cs_check_error"),
        checkmessage = $("#cs_check_message"),
        checkbnbtn = $("#cs_check_save_borrowernumber_button"),
        closemodalbtn = $("#cs_close_cash_sale_modal_button");
        // Await response lock add charge button show loading
      try {
        // Turn off buttons
        addchargebtn.attr('disabled', true);
        paynowbtn.attr('disabled', true);
        payallbtn.attr('disabled', true);
        closemodalbtn.attr('disabled', true);
        checkbnbtn.attr('disabled', true);
        invoicepgbtn.attr('disabled', true);
        settingspgbtn.attr('disabled', true);
        applycrtbtn.attr('disabled', true);
        applycrtbtn.hide();
        // Hide amount credit row
        creditrow.hide();
        // Wait on data
        var data = await getData(url);
        Debug("AWAIT RETURNED: ", data);

        if (req==='pay' || req==='apply_credits') {
          updateAccountLineRows(data);
        } else if (req==='check') {
          var message = data.message;
          if (message === "Error: Patron not valid") {
            checkerror.html(message);
            checkmessage.hide();
          } else {
            var tablerows = buildSettingsRows(data);
            var tablerows2 = buildAccountLineRows(data);
            loadSettingsDefaults();
            checkerror.html("");
            checkmessage.show();
            settingspgalert.slideUp();
            invoicepgbtn.html("Invoice list");
            settingsrow.html(tablerows);
            acctlinesrow.html(tablerows2);
          }
        } else {
          var tablerows = buildAccountLineRows(data);
          acctlinesrow.html(tablerows);
        }
        // Turn on buttons
        addchargebtn.attr('disabled', false);
        paynowbtn.attr('disabled', false);
        payallbtn.attr('disabled', false);
        var checkData = checkDataReturned(data, 'account_lines');
        if (checkData) {
          if (checkData.total_outstanding>0) {
            payallbtn.show();
          } else {
            payallbtn.hide();
          }
        }
        closemodalbtn.attr('disabled', false);
        checkbnbtn.attr('disabled', false);
        applycrtbtn.attr('disabled', false);
        // Make sure invoice page not accessible if cashSaleSettings not set
        if(checkCashSaleSettingsStorage()){
          invoicepgbtn.attr('disabled', false);
        } else {
          invoicepgbtn.attr('disabled', true);
          invoicepgbtn.html("Invoice list");
        }
        settingspgbtn.attr('disabled', false);
        acctlinesrowthead.show();
        // Relabel buttons
        payallbtn.text('Pay all');
        checkbnbtn.text('Check & save borrower');
        addchargebtn.html('<i class="fa fa-plus"></i> Add charge');
      } catch (error) {
        console.error(error);
      }
    }
    // Build URI Object
    function buildUriObject(req, accountlines=null) {
      var borrowerNumber = {'name': 'borrowernumber', 'value': getBorrowNumber()};
      if (req==='account') {
        return [borrowerNumber] || null;
      }
      if (req==='charge') {
        var formData = $('#cs_add_charge_form'),
          data = formData.serializeArray();
          data.push(borrowerNumber);
        return data;
      }
      if (req==='check') {
        var settings_borrowernumber = $('#cs_settings_borrowernumber').val();
        return [{'name': 'borrowernumber', 'value': settings_borrowernumber}];
      }
      if (req==='pay' || req==='apply_credits') {
        return [
          borrowerNumber,
          {'name': 'account_lines', 'value': accountlines}];
      }
    }
    // Build get requests
    function buildSafeGetRequest(uriObject, req) {
      var uri_str = '',
        pre_uri_str = '?process=' + req;

      uriObject.forEach(function(ob) {
        uri_str += '&' + ob.name + '=' + ob.value;
      });
      var safeuri = encodeURI(pre_uri_str + uri_str);

      return safeuri;
    }
    // Listeners to reset amount values
    $("#cs_type_options").on('change', function() {
      var text_selected= $(this).find(":selected").text(),
        val_selected= $(this).find(":selected").val();
      var cs_amount_calculation_optchange = parseFloat(val_selected * $("#cs_qty").val()).toFixed(2);
      var cs_amount_valid = isNaN(cs_amount_calculation_optchange) ? 0 : cs_amount_calculation_optchange;
      $("#cs_qty").val(1);
      $("#cs_desc").val(text_selected);
      $("#cs_amount").val(cs_amount_valid);
    });
    $("#cs_qty").bind('change keyup', function() {
      var cs_amount_calculation_qtychange = parseFloat($("#cs_type_options option:selected").val() * $("#cs_qty").val()).toFixed(2);
      var cs_amount_valid = isNaN(cs_amount_calculation_qtychange) ? 0 : cs_amount_calculation_qtychange;
      $("#cs_amount").val(cs_amount_valid);
    });
    // Listener number only for amount
    // $("#cs_amount").bind("keypress", function(e) {
    //   isNumberKey(e, $(this));
    // });
    //
    // Listeners for actions pay, payall, quick invoice link
    //
    $("#cash_sale_modal").on('hidden.bs.modal', function () {
      if (CASH_SALES_BORROWERNUMBER!=="0") {
        Debug("cash_sale_modal Closed Borrower Number", true);

        $("#cash_sale_page_refresh_modal").modal('show');
        location.reload();
      }
      // do something on modal close…
      // Reset cash sale amount, qty, note
      $("#cs_qty").val('1');
      $("#cs_note").val('');
      $("#cs_amount").val('0');
      // Focus on barcode input
      setTimeout(function(){
        $(".head-searchbox").filter(":visible").focus();
      }, 200);
      Debug("Modal close", "#cash_sale_modal")
    });

    document.addEventListener('click', function (event) {
      // Listener: Apply credit
      if (event.target.matches('#cs_apply_credit_button')) {
        $(event.target).html('Thinking ' + '<i class="fa fa-spinner fa-spin"></i>');
        var accountlineIds = $(".cs-account-lines-rows"),
          accounts = [];

        accountlineIds.each(function(key, acctline) {
          Debug(acctline);
          accounts.push($(acctline).data('accountlineId'));
        });
        var accountline_ids = accounts.join(','),
          uriObject = buildUriObject('apply_credits', accountline_ids);
        Debug(uriObject);
        var safeuri = buildSafeGetRequest(uriObject, 'apply_credits');
        Debug(safeuri);

        sendGetRequest(safeuri, 'apply_credits');
      }
      // Listener: Pay individual account line
      if (event.target.matches('.pay-cs_item-button')) {
        $(event.target).html('Thinking ' + '<i class="fa fa-spinner fa-spin"></i>');
        var accountline_id = $(event.target).data('accountLineId'),
          uriObject = buildUriObject('pay', accountline_id);
        Debug(uriObject);
        var safeuri = buildSafeGetRequest(uriObject, 'pay');
        Debug(safeuri);

        sendGetRequest(safeuri, 'pay');
        }
      // Listener: Pay all account lines
      if (event.target.matches('#cs_pay_all_button')) {
        $('#cs_pay_all_button').html('Thinking ' + '<i class="fa fa-spinner fa-spin"></i>');
        $('#cs_amount').val('0'); // reset amount to 0
        $('#cs_note').val(''); // reset note to empty
        $('#cs_qty').val('1'); // reset qty to 1

        var accountlineIds = $(".cs-account-lines-rows"),
          accounts = [];

        accountlineIds.each(function(key, acctline) {
          Debug(acctline);
          accounts.push($(acctline).data('accountlineId'));
        });
        var accountline_ids = accounts.join(','),
          uriObject = buildUriObject('pay', accountline_ids);
        Debug(uriObject);
        var safeuri = buildSafeGetRequest(uriObject, 'pay');
        Debug(safeuri);

        sendGetRequest(safeuri, 'pay');
      }
      // Listener: Add charge item
      if (event.target.matches('#cs_add_charge_button')) {
        event.preventDefault();
        event.stopPropagation();
        $('#cs_add_charge_button').html('Thinking <i class="fa fa-spinner fa-spin"></i>');
        var uriObject = buildUriObject('charge');
        Debug(uriObject);
        var safeuri = buildSafeGetRequest(uriObject, 'charge');
        Debug(safeuri);

        sendGetRequest(safeuri);
      }
      // Listener: Load quick invoice link
      if (event.target.matches('#cash_sale_modal_link')) {
        var checksetting = checkCashSaleSettingsStorage(),
          checkborrower = getBorrowNumber(),
          uriObject = buildUriObject('account'),
          safeuri = buildSafeGetRequest(uriObject, 'account');

        loadDefaultVals();

        // Load default data
        if (CASH_SALES_BORROWERNUMBER!=="0") { // Load Borrower from GET Request (?borrowernumber=id)
          loadBorrowerDefaults();
          Debug("loadBorrowerDefaults: Callback");
        } else { // Load Borrower from LocalStorage
          loadSettingsDefaults();
          Debug("loadSettingsDefaults: Callback");
        }
        // Check we have borrowernumber from settings is set
        if (checksetting || CASH_SALES_BORROWERNUMBER!=="0") { // Local storage = TRUE
          chargePage(true);
          settingsPage(false);
          sendGetRequest(safeuri);
        } else { // Local storage = FALSE
          chargePage(false);
          settingsPage(true);
        }
        Debug("checksetting: ", checksetting);
        Debug("checkborrower: ", checkborrower);
      }
      // Listener: Charge page
      if (event.target.matches('#cs_invoice_button')) {
        Debug("Charge page unlock");
        chargePage(true);
        settingsPage(false);
      }
      // Listener: Settings page
      if (event.target.matches('#cs_settings_button')) {
        Debug("Settings page unlock");
        settingsPage(true);
        chargePage(false);
      }
      // Listener: Check borrower number
      if (event.target.matches('#cs_check_save_borrowernumber_button')) {
        event.preventDefault();
        event.stopPropagation();
        $('#cs_check_save_borrowernumber_button').html('Thinking <i class="fa fa-spinner fa-spin"></i>');
        var uriObject = buildUriObject('check');
        Debug(uriObject);
        var safeuri = buildSafeGetRequest(uriObject, 'check');
        Debug(safeuri);

        sendGetRequest(safeuri, 'check');
      }

    }, false);
    // Load settings default
    function loadSettingsDefaults() {
      var location_protocol = window.location.protocol,
        location_host = window.location.host,
        location_url = location_protocol + '//' + location_host,
        url = location_url + '/cgi-bin/koha/members/pay.pl?borrowernumber=',
        settings = getCashSaleSettingsStorage(),
        tableRow = buildSettingsTableRow(settings, url);

      if (settings!==null) {
        Debug("settings: ", settings);
        var text = settings.firstname + ' ' +
          settings.surname;

        $("#cs_account_name").text(text);
        $("#cs_settings_borrowernumber").val(settings.borrowernumber);
      }
      var html = '<i class="fa fa-building"></i> ';

      $("#cs_account_title").html(html);
      $("#cs_settings_table_body").html(tableRow);
    }
    // Load settings default
    function loadBorrowerDefaults() {
      var html = '<i class="fa fa-user"></i> ';
      var text = CS_BORROWER_FIRSTNAME + ' ' +
        CS_BORROWER_SURNAME + ' (' +
        CASH_SALES_CARDNUMBER + ') ';

      $("#cs_account_name").text(text);
      $("#cs_account_title").html(html);
    }
    // Charge page load/unload
    function chargePage(display) {
      if (display===true) {
        $("#cs_invoice_button").addClass('active btn-default');
        $("#cs_add_charge_wrapper").show();
        $("#cs_show_account_lines_wrapper").show();
        $("#cs_pay_all_button").show();
        Debug("chargePage TRUE");
      } else {
        $("#cs_invoice_button").removeClass('active btn-default');
        $("#cs_add_charge_wrapper").hide();
        $("#cs_show_account_lines_wrapper").hide();
        $("#cs_pay_all_button").hide();
        Debug("chargePage FALSE");
      }
      if (checkCashSaleSettingsStorage()) {
        $("#cs_invoice_button").attr('disabled', false);
        $("#cs_invoice_button").html('Invoice list');
        Debug("checkCashSaleSettingsStorage TRUE");
      } else {
        $("#cs_invoice_button").removeClass('active btn-default');
        $("#cs_invoice_button").attr('disabled', true);
        $("#cs_invoice_button").html('<i class="fa fa-lock"></i> Invoice list');
        Debug("checkCashSaleSettingsStorage FALSE");
      }
      if (CASH_SALES_BORROWERNUMBER!=="0") {
        Debug("Hide page button!!!");
        $("#cs_invoice_button").hide();
      }
    }
    // Setting page load/unload
    function settingsPage(display, locked=false) {
      if (display===true) {
        $("#cs_settings_button").addClass('active btn-default');
        $("#cs_settings_header_wrapper").show();
        $("#cs_settings_wrapper").show();
        $("#cs_pay_all_button").hide();
      } else {
        $("#cs_settings_button").removeClass('active btn-default');
        $("#cs_settings_header_wrapper").hide();
        $("#cs_settings_wrapper").hide();
        $("#cs_pay_all_button").show();
      }
      if (locked) {
        $("#cs_settings_button").addClass('btn-default');
        $("#cs_settings_button").attr('disabled', true);
        $("#cs_settings_button").html('<i class="fa fa-lock"></i> Settings');
      }
      if (CASH_SALES_BORROWERNUMBER!=="0") {
        Debug("Hide settings button!!!");
        $("#cs_settings_button").hide();
        $("#cs_settings_header_wrapper").hide();
        $("#cs_settings_wrapper").hide();
      }
      checkCashSaleSettingsStorageAlert();
    }
    // Setting page alert
    function checkCashSaleSettingsStorageAlert() {
      if (!checkCashSaleSettingsStorage()) {
        var alert = '<div class="alert alert-warning" role="alert">' +
          'You need to set the borrower account to invoice to!' +
          '</div>';
        $("#cs_settings_page_alert").html(alert);
        $("#cs_check_message").addClass("text-danger");
        $("#cs_pay_all_button").attr("disabled", true);
        $("#cs_pay_all_button").hide();
        $("#cs_apply_credit_button").hide();
      } else {
        $("#cs_settings_page_alert").html('');
        $("#cs_check_message").removeClass("text-danger");
        $("#cs_pay_all_button").show();
        $("#cs_pay_all_button").attr("disabled", false);
      }
    }
    /*******************************************************/
    /* END **** Cash sale main functions
    /*******************************************************/

    /*******************************************************/
    /********* Session system for main functions
    /*******************************************************/
    // Check local settings
    function checkCashSaleSettingsStorage() {
      if(localStorage.hasOwnProperty("cashSaleSettings") &&
         localStorage.getItem("cashSaleSettings") !== '') {
        return true;
      } else {
        return false;
      }
    }
    // Get local settings
    function setCashSaleSettingsStorage(settings) {
      var csSettings = JSON.stringify(settings);
      // Set local
      try {
        localStorage.setItem('cashSaleSettings', csSettings);

        return true;
      }
      catch(e) {
        console.error("Error: cashSaleSettings - ", e);
        return false;
      }
    }
    // Get local settings
    function getCashSaleSettingsStorage() {
      try {
        var csSettings = localStorage.getItem('cashSaleSettings');

        return JSON.parse(csSettings);
      }
      catch(e) {
        console.error("Error: getCashSaleSettingsStorage - ", e);
        return false;
      }
    }
    // Get local settings by value
    function getSettingsValue(value) {
      var settings = getCashSaleSettingsStorage();
      Debug("Call back: getSettingsValue - ", settings[value]);

      return settings[value];
    }
  } // edn if isLoggedIn
});
