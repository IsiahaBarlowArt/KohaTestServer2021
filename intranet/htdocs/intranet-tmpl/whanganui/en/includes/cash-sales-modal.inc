<div id="cash_sale_modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="cashSaleModalLabel" aria-hidden="true"  data-backdrop="static" data-keyboard="false">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          <span id="cs_account_title"></span>
          <span id="cs_account_name"></span>
          <span id="cs_total_outstanding"></span>
          <span id="cs_settings_button_wrapper" class="pull-right">
            <button id="cs_invoice_button" class="btn btn-secondary btn-xs btn-toggle-disable">
              Invoice list
            </button>
            <button id="cs_settings_button" class="btn btn-secondary btn-xs btn-toggle-disable">
              Settings
            </button>
          </span>
        </h3>
      </div>
      <div class="modal-body">
        <div id="cs_add_charge_wrapper">
          <form id="cs_add_charge_form">
            <input id="cs_desc" name="desc" type="hidden" value="" />
            <input id="cs_type" name="type" type="hidden" value="MANUAL" />
            <style>.borderless, .borderless td, .borderless th { border: none !important; } .borderless { border-bottom: 1px solid #bcbcbc !important; } .borderless th { text-align: left !important; border-bottom: 1px solid #bcbcbc !important; }</style>
            <table id="cs_add_charge_table" class="table borderless table-sm">
              <tbody>
                <tr>
                  <td>
                    <strong>Invoice type</strong>

                    <div id="cs_type_options_loading">

                    </div>
                    <select id="cs_type_options" class="input-toggle-disable" style="width:120px" >
                    </select>
                  </td>
                  <td>
                    <strong>Notes</strong>
                    <input id="cs_note" name="note" class="input-toggle-disable" type="text" placeholder="Add notes" style="width:120px" />
                  </td>
                  <td>
                    <strong>Qty</strong>
                    <input id="cs_qty" type="number" class="input-toggle-disable" value="1" step="any" min="1" style="width:60px" />
                  </td>
                  <td>
                    <strong>Amount</strong>
                    <input type="number" id="cs_amount" class="input-toggle-disable" step="any" name="amount" required="required" value="" style="width:60px" />
                  </td>
                  <td>
                    <strong>Action</strong>
                    <button id="cs_add_charge_button" class="btn btn-xs btn-default btn-toggle-disable">
                      <i class="fa fa-plus"></i> Add charge
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>

        </div>
        <div id="cs_settings_header_wrapper">
          <div id="cs_settings_page_alert">

          </div>
        </div>
        <div id="cs_settings_wrapper">
          <div class="table-responsive-sm">
            <table id="cs_settings_table" style="width:100%" class="table borderless">
              <thead id="cs_settings_table_head">
                <tr>
                  <th>
                    <span id="cs_check_message">
                      Enter borrower number
                    </span>

                    <span id="cs_check_error"></span>
                    <input id="cs_settings_borrowernumber" name="cs_borrowernumber" type="text" style="width:60px" />
                  </th>
                  <th>
                    <button id="cs_check_save_borrowernumber_button" class="btn btn-default btn-xs">Check & save</button>
                  </th>
                </tr>
              </thead>
              <tbody id="cs_settings_table_body">

              </tbody>
            </table>
          </div>
        </div>
        <div id="cs_show_account_lines_wrapper">
          <div class="table-responsive-sm">
          <table id="cs_account_lines_table" style="width:100%" class="table borderless">
            <thead id="cs_account_lines_table_thead">
              <tr>
                <th scope="col">Timestamp</th>
                <th scope="col">Description</th>
                <th scope="col">Amount</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>

            <tbody id="cs_account_lines_table_body">

            </tbody>

            <tfoot id="cs_account_lines_table_footer">
              <tr id="cs_tfoot_total_outstanding_row">
                <th scope="col" colspan="2">
                    Outstanding amount
                </th>
                <th scope="col">
                  <span id="cs_tfoot_total_outstanding"></span>
                </th>
                <th scope="col"></th>
              </tr>
              <tr id="cs_tfoot_credit_row">
                <td scope="col" colspan="2">
                  Credit <span id="cs_credit_amount_applied"></span> applied
                </td>
                <td scope="col">
                  <span id="cs_tfoot_outstanding_credits"></span>
                </td>
                <td scope="col"></td>
              </tr>
            </tfoot>

          </table>
        </div>
        </div>
      </div>
      <div class="modal-footer">
        <button id="cs_apply_credit_button" type="button" class="btn btn-default btn-toggle-disable">
        </button>

        <button id="cs_pay_all_button" type="button" class="btn btn-success btn-toggle-disable">
          Pay all
        </button>

        <!-- <button id="cs_writeoff_all_button" type="button" class="btn btn-default">
          Write off all
        </button> -->

        <button id="cs_close_cash_sale_modal_button" type="button" class="btn btn-default deny btn-toggle-disable" data-dismiss="modal">
          <i class="fa fa-times"></i> Finish
        </button>
      </div>
    </div>
  </div>
</div>

<!-- CS Refresh Modal -->
<div class="modal fade" id="cash_sale_page_refresh_modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-body">
        <h4 class="text-center">Page refreshing <i class="fa fa-spinner fa-spin"></i></h4>
      </div>
    </div>
  </div>
</div>
