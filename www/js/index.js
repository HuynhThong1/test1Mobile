// Create or Open Database.
var db = window.openDatabase("FGW", "1.0", "FGW", 20000);

// To detect whether users use mobile phones horizontally or vertically.
$(window).on("orientationchange", onOrientationChange);

function onOrientationChange(e) {
  if (e.orientation == "portrait") {
    console.log("Portrait.");
  } else {
    console.log("Landscape.");
  }
}

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
  $(document).on("deviceready", onDeviceReady);
} else {
  onDeviceReady();
}

// Display errors when executing SQL queries.
function transactionError(tx, error) {
  console.log(
    `[${new Date().toUTCString()}] Errors when executing SQL query. [Code: ${
      error.code
    }] [Message: ${error.message}]`
  );
}

// Run this function after starting the application.
function onDeviceReady() {
  // Logging.
  console.log(`[${new Date().toUTCString()}] Device is ready.`);

  db.transaction(function (tx) {
    // Create a query.
    var query = `CREATE TABLE IF NOT EXISTS Account (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         Username TEXT NOT NULL UNIQUE,
                                                         Password TEXT NOT NULL)`;

    // Execute a query.
    tx.executeSql(query, [], transactionSuccess, transactionError);

    function transactionSuccess(tx, result) {
      // Logging.
      console.log(
        `[${new Date().toUTCString()}] Create table 'Account' successfully.`
      );
    }
  });
}

// Submit a form to register a new account.
$(document).on("submit", "#frm-register", registerAccount);

function registerAccount(e) {
  e.preventDefault();

  // Get user's input.
  var username = $("#username").val();
  var password = $("#password").val();
  var password_confirm = $("#password-confirm").val();

  if (password != password_confirm) {
    $("#password-confirm")[0].setCustomValidity("Password mismatch.");
  } else {
    db.transaction(function (tx) {
      var query = "INSERT INTO Account (Username, Password) VALUES (?, ?)";
      tx.executeSql(
        query,
        [username, password],
        transactionSuccess,
        transactionError
      );

      function transactionSuccess(tx, result) {
        // Logging.
        console.log(
          `[${new Date().toUTCString()}] Create a username '${username}' successfully.`
        );

        // Reset the form.
        $("#frm-register").trigger("reset");
        $("#username").focus();
      }
    });
  }
}

$(document).on("pagebeforeshow", "#page-03", refreshList);

// Display Account List.
function refreshList() {
  db.transaction(function (tx) {
    var query = "SELECT Id, Username  FROM Account";
    tx.executeSql(query, [], transactionSuccess, transactionError);

    function transactionSuccess(tx, result) {
      // Prepare the list of accounts.
      var listAccount = `<ul id='list-account' data-inset='true' data-role='listview' data-filter='true'>`;
      for (let account of result.rows) {
        listAccount += `
                                    <li>
                                        <a data-details='{"Id": ${account.Id}}'>
                                        <img src='img/bruno.jpg' alt='bruno' height='87%' style='margin-top: 5px; margin-left: 5px'/>
                                            <h3>ID: ${account.Id} </h3>
                                            <h4>Username: ${account.Username}</h4>
                                        </a>
                                    </li>
                                `;
      }
      listAccount += "</ul>";

      // Add list to UI.
      $("#list-account").empty();
      $("#list-account")
        .append(listAccount)
        .listview("refresh")
        .trigger("create");
    }
  });
}
//click on browser
//tap on mobile

//vclick on both
$(document).on("vclick", "#list-account li a", function (e) {
  e.preventDefault();
  var id = $(this).data("details").Id;

  localStorage.setItem("currentAccountId", id);

  $.mobile.navigate("#page-05");
});

$(document).on("pagebeforeshow", "#page-05", showDetail);

function showDetail() {
  var id = localStorage.getItem("currentAccountId");

  db.transaction(function (tx) {
    var query = "SELECT * FROM Account WHERE Id = ?";
    tx.executeSql(query, [id], transactionSuccess, transactionError);

    function transactionSuccess(tx, result) {
      var error = "Account not found.";
      var username = error;
      var password = error;

      if (result.rows[0] != null) {
        username = result.rows[0].Username;
        password = result.rows[0].Password;
      } else {
        console.log(error);
      }

      $("#page-05 #id").text(id);
      $("#page-05 #username").text(username);
      $("#page-05 #password").text(password);
    }
  });
}

$(document).on("vclick", "#page-05 #btn-delete", deleteAccount);

function deleteAccount() {
  var id = localStorage.getItem("currentAccountId");

  db.transaction(function (tx) {
    var query = "DELETE FROM Account WHERE Id = ?";
    tx.executeSql(query, [id], transactionSuccess, transactionError);

    function transactionSuccess(tx, result) {
      console.log(`Delete Successfully Account with ${id}`);

      $.mobile.navigate("#page-03");
    }
  });
}

$(document).on("vclick", "#page-05 #btn-update", function () {
  $.mobile.navigate("#page-06");

  var id = localStorage.getItem("currentAccountId");

  db.transaction(function (tx) {
    var query = "SELECT * FROM Account WHERE Id = ?";
    tx.executeSql(query, [id], transactionSuccess, transactionError);

    function transactionSuccess(tx, result) {
      var error = "Account not found.";
      var username = error;
      var password = error;

      if (result.rows[0] != null) {
        username = result.rows[0].Username;
        password = result.rows[0].Password;
      } else {
        console.log(error);
      }

      $("#page-06 #username").val(username);
      $("#page-06 #password").val(password);
    }
  });
});

$(document).on("submit", "#frm-update", updateAccount);

function updateAccount(e) {
  e.preventDefault();

  var id = localStorage.getItem("currentAccountId");

  var username = $("#page-06 #username").val();
  var password = $("#page-06 #password").val();
  var password_confirm = $("#page-06 #password-confirm").val();
  

  console.log(username);
  console.log(password);

  if (password != password_confirm) {
    $("#password-confirm")[0].setCustomValidity("Password mismatch.");
  } else {
    db.transaction(function (tx) {
      var query =
        "UPDATE Account SET Username = ?, Password = ?  WHERE Id = ?";
      tx.executeSql(
        query,
        [username, password, id],
        transactionSuccess,
        transactionError
      );

      function transactionSuccess(tx, result) {
        console.log(
          `[${new Date().toUTCString()}] Update a username '${username}' successfully.`
        );

        $.mobile.navigate("#page-03");
      }
    });
  }
}

//CRUD: CREATE READ DELETE UPDATE
