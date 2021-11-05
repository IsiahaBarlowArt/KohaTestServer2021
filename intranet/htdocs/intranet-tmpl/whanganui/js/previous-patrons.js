/**
 * Isiaha Barlow 2019 - Whanganui District Library
 * Part of Previous Patron List Custom Mod
 */

$(document).ready(function () {
  // main function
  function setPatronsList() {
    // Make sure there is localStorage avaliable and RECENT_BORROWER_NUMBER is defined
    if (typeof localStorage !== 'undefined' &&
        typeof PREVIOUS_PATRON_BORROWERNUMBER !== 'undefined') {

      var borrowernumber = PREVIOUS_PATRON_BORROWERNUMBER,
        firstname = PREVIOUS_PATRON_FIRSTNAME,
        surname = PREVIOUS_PATRON_SURNAME,
        cardnumber = PREVIOUS_PATRON_CARDNUMBER,
        logtime = new Date(),
        limit = 10,
        borrowerObj = {
          "sort": 0,
          "borrower": borrowernumber,
          "firstname": firstname,
          "surname": surname,
          "cardnumber": cardnumber,
          "logtime": logtime.toString()
        },
        borrowerChecked = checkPatron(borrowernumber, firstname, surname);
      // Check stored patron list
      if (checkStorageForPreviousPatronsList()) {
        var oldObj = JSON.parse(localStorage.getItem("previousPatronsList")),
          newArr = [],
          resetArr = [];
        // If patron exists in list, remove and reset to the top of the list
        // stop the list from being completely populated by the same patron
        if (checkPatronExists(oldObj, borrowernumber) !== false && borrowerChecked) {
          oldObj.unshift(borrowerObj);
          newArr = resetNewArray(oldObj, limit);
        } else {
          resetArr = resetCurrentPatron(oldObj, borrowerObj, borrowernumber);
          newArr = resetNewArray(resetArr, limit);
        }
        // Check patron and then store reset array
        if (borrowerChecked) {
          localStorage.setItem("previousPatronsList", JSON.stringify(newArr));
        }
      } else {
        // Handle initial local store where patron is valid
        if (borrowerChecked) {
          localStorage.setItem("previousPatronsList", JSON.stringify([borrowerObj]));
        }
      }
      // Build patron list
      showStoredPatronsList();
    } else {
      // Remove previous patron dropdown menu if no localStorage
      // or defined VARS are not set
      $("#prevpatrons_dropdown").remove();
    }
  }
  // Checks localStorage for previousPatronsList
  function checkStorageForPreviousPatronsList() {
    if(localStorage.hasOwnProperty("previousPatronsList") &&
       localStorage.getItem("previousPatronsList") !== '') {
      return true;
    } else {
      return false;
    }
  }
  // Check to see if patron is valid
  function checkPatron(borrowernumber, firstname, surname) {
    if ((borrowernumber !== "0") &&
        (firstname !== "0" || surname !== "0")) {
      return true;
    } else {
      return false;
    }
  }
  // Reset, sort and limit patron array for patron list
  function resetNewArray(arr, limit) {
    var nArr = [];

    for (var i = 0, len = arr.length; i < len && i < limit; i++) {
      arr[i].sort = i;
      nArr[i] = arr[i];
    }
    return nArr;
  }
  // Check patron is in array by borrowernumber
  function checkPatronExists(obj, num) {
    for (var i = 0, len = obj.length; i < len; i++) {
      var nObj = obj[i];

      if (nObj.borrower === num) {
        return false;
      }
    }
  }
  // Reset patron and reposition at top of array
  function resetCurrentPatron(oObj, nObj, num) {
    var nArr = [];

    for (var i = 0, len = oObj.length; i < len; i++) {
      if (oObj[i].borrower == num) {
        nArr.unshift(nObj);
      } else {
        nArr.push(oObj[i]);
      }
    }

    return nArr;
  }
  // Listener for clear previous patrons list
  $("#clear_prevpatrons").on('click', function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (checkStorageForPreviousPatronsList) {
      localStorage.setItem("previousPatronsList", "");

      $(".prevpatrons_item").remove();
    }

    setPatronsList();
  });
  // Render patron list to html
  function renderPreviousPatronList(storedPatronsList) {
    for (var i = 0; i < storedPatronsList.length; i++) {
      var bObj = storedPatronsList[i], d = new Date(bObj.logtime);

      $("ul#prevpatrons").append(
        "<li class=\"prevpatrons_item ddropdown\">" +
        "<a href=\"/cgi-bin/koha/circ/circulation.pl?borrowernumber=" +
        bObj.borrower  + "\">" +
        bObj.firstname + " " +
        bObj.surname + " " +
        "(" + bObj.cardnumber + ") " +
        "<small class=\"text-muted\">" +
        d.toLocaleTimeString() + " " +
        d.toLocaleDateString() + "</small></a></li>");
    }
  }
  // Show list and list elements
  function showStoredPatronsList() {
    if (checkStorageForPreviousPatronsList()) {
      var storedPatronsList = JSON.parse(localStorage.getItem("previousPatronsList"));
      // Build list and render to screen
      renderPreviousPatronList(storedPatronsList);

      $("#clear_prevpatrons_wrapper").show();
      $("#prevpatrons_divider").show();
      $("#prevpatrons_message_wrapper").hide();
    } else {

      $("#clear_prevpatrons_wrapper").hide();
      $("#prevpatrons_divider").hide();
      $("#prevpatrons_message_wrapper").show();
    }
  }

  // Boot up
  setPatronsList();

});
