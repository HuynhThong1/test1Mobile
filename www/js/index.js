// Create or Open Database.
var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);

// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        console.log('Portrait.');
    }
    else {
        console.log('Landscape.');
    }
}

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    onDeviceReady();
}

// Display messages in the console.
function log(message) {
    console.log(`[${new Date()}] ${message}`);
}

// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`Errors when executing SQL query. [Code: ${error.code}] [Message: ${error.message}]`);
}

// Run this function after starting the application.
function onDeviceReady() {
    // Logging.
    log(`Device is ready.`);

    db.transaction(function (tx) {
        // Create a query.
        var query = `CREATE TABLE IF NOT EXISTS Account (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         Username TEXT NOT NULL UNIQUE,
                                                         Age INTEGER NOT NULL,
                                                         Password TEXT NOT NULL)`;

        // Execute a query.
        tx.executeSql(query, [], transactionSuccess_Account, transactionError);

        function transactionSuccess_Account(tx, result) {
            // Logging.
            log(`Create table 'Account' successfully.`);
        }

        var query = `CREATE TABLE IF NOT EXISTS Comment (Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Comment TEXT NOT NULL,
            Datetime DATE NOT NULL,
            AccountId INTEGER NOT NULL,
            FOREIGN KEY (AccountId) REFERENCES Account(Id))`;
        tx.executeSql(query, [], transactionSuccess_Comment, transactionError);

        function transactionSuccess_Comment(tx, result) {

            // Logging.
            log(`Create table 'Comment' successfully.`);
        }
    });
}

// Submit a form to register a new account.
$(document).on('submit', '#frm-register', confirmAccount);

function confirmAccount(e) {
    e.preventDefault();

    // Get user's input.
    var username = $('#page-create #frm-register #username').val();
    var password = $('#page-create #frm-register #password').val();
    var password_confirm = $('#page-create #frm-register #password-confirm').val();

    if (password != password_confirm) {
        $('#password-confirm')[0].setCustomValidity('Password mismatch.');
    }

    else {

        db.transaction(function (tx) {
            var query = 'SELECT Id FROM Account WHERE Username = ?';
            tx.executeSql(query, [username], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                if (result.rows[0] == null) {
                    $('#page-create #popup-register-confirm #username').text(username);
                    $('#page-create #popup-register-confirm #password').text(password);
                    $('#page-create #popup-register-confirm').popup('open');
                }
                else {
                    alert('Account exists.')
                }

            }
        });




    }
}


$(document).on('vclick', '#page-create #popup-register-confirm #btn-confirm', registerAccount);

function registerAccount(e) {
    e.preventDefault();

    var username = $('#page-create #popup-register-confirm #username').text();
    var password = $('#page-create #popup-register-confirm #password').text();


    db.transaction(function (tx) {
        var query = 'INSERT INTO Account (Username, Password) VALUES (?, ?)';
        tx.executeSql(query, [username, password], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            // Logging.
            log(`Create a username '${username}' successfully.`);

            // Reset the form.
            $('#frm-register').trigger('reset');
            $('#username').focus();

            $('#page-create #popup-register-confirm').popup('close');
        }
    });


}


// Display Account List.
$(document).on('pagebeforeshow', '#page-list', showList);

function showList() {
    db.transaction(function (tx) {
        var query = 'SELECT Id, Username FROM Account';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Show list of accounts successfully.`);

            // Prepare the list of accounts.
            var listAccount = `<ul id='list-account' data-role='listview' data-filter='true' data-filter-placeholder='Search accounts...'
                                                     data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let account of result.rows) {
                listAccount += `<li><a data-details='{"Id" : ${account.Id}}'>
                                    <img src='img/boyscout_logo.jpg'>
                                    <h3>Username: ${account.Username}</h3>
                                    <p>ID: ${account.Id}</p>
                                </a></li>`;
            }
            listAccount += `</ul>`;

            // Add list to UI.
            $('#page-list #list-account').empty().append(listAccount).listview('refresh').trigger('create');
        }
    });
}

// Save Account Id.
$(document).on('vclick', '#list-account li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentAccountId', id);

    $.mobile.navigate('#page-detail', { transition: 'none' });
});

// Show Account Details.
$(document).on('pagebeforeshow', '#page-detail', showDetail);

function showDetail() {
    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Account WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Account not found.';
            var username = errorMessage;
            var password = errorMessage;

            if (result.rows[0] != null) {
                username = result.rows[0].Username;
                password = result.rows[0].Password;
            }
            else {
                log(errorMessage);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }

            $('#page-detail #id').text(id);
            $('#page-detail #username').text(username);
            $('#page-detail #password').text(password);

            showComment();
        }
    });


}

// Delete Account.
$(document).on('vclick', '#page-detail #btn-delete', deleteAccount);

function deleteAccount() {
    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Account WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete account '${id}' successfully.`);

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}

//Load data form sql to update-form
$(document).on("vclick", "#page-detail #btn-update", function () {
    $.mobile.navigate("#page-update");

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

            $("#page-update #username").val(username);
            $("#page-update #password").val(password);
        }
    });
});

//Update Account

$(document).on("submit", "#frm-update", updateAccount);

function updateAccount(e) {
    e.preventDefault();

    var id = localStorage.getItem("currentAccountId");

    var username = $("#page-update #username").val();
    var password = $("#page-update #password").val();
    var password_confirm = $("#page-update #password-confirm").val();


    console.log(username);
    console.log(password);

    if (password != password_confirm) {
        $("#page-update #password-confirm")[0].setCustomValidity("Password mismatch.");
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

                $.mobile.navigate("#page-list");
            }
        });
    }
}




// comment Account.
$(document).on('vclick', '#page-detail #popup-comment #btn-comment', addComment);

function addComment() {
    var accountId = localStorage.getItem('currentAccountId');
    var comment = $('#page-detail #popup-comment #comment').val();

    var date = new Date();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Comment (Comment, Datetime, AccountId) VALUES (?,?,?)';
        tx.executeSql(query, [comment, date, accountId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {

            document.querySelector('#comment').value = '';

            showComment()

            log(`add Comment to account '${accountId}' successfully.`);

            $('#popup-comment').popup('close');

        }
    });
}



function showComment() {
    var accountId = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Comment WHERE AccountId = ?';
        tx.executeSql(query, [accountId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {

            log(`show list of comments successfully.`);

            var listComment = `<ul id='list-comment' data-role='listview'`;
            for (let comment of result.rows) {
                listComment += `<li>
                                    <h3>${comment.Comment}</h3>
                                    <p>${comment.Datetime}</p>
                                </li>`;
            }
            listComment += `</ul>`;

            // Add list to UI.
            $('#list-comment').empty().append(listComment).listview('refresh').trigger('create');

        }
    });
}


$(document).on('submit', '#page-search #frm-search', search);

function search(e) {
    e.preventDefault();

    var id = $('#page-search #frm-search #id').val();
    var username = $('#page-search #frm-search #username').val();

    db.transaction(function (tx) {
        var query = `SELECT Id, Username FROM Account WHERE`;

        if (id) {
            query += ` Id > ${id}   AND`;
        }

        if (username) {
            query += ` Username LIKE "%${username}%"   ANĐ`; // = tìm giống = "${valueSearch}", LIKE tìm gần giống LIKE "%${valueSearch}%"
        }

        query = query.substr(0, query.length - 6);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Show list of accounts successfully.`);

            // Prepare the list of accounts.
            var listAccount = `<ul id='list-account' data-role='listview' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let account of result.rows) {
                listAccount += `<li><a data-details='{"Id" : ${account.Id}}'>
                                    <img src='img/boyscout_logo.jpg'>
                                    <h3>Username: ${account.Username}</h3>
                                    <p>ID: ${account.Id}</p>
                                </a></li>`;
            }
            listAccount += `</ul>`;

            // Add list to UI.
            $('#page-search #list-account').empty().append(listAccount).listview('refresh').trigger('create');
        }
    });
}