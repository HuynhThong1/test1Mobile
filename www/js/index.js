var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);

$(window).on('orientationchange', onOrientationChange);


function onOrientationChange(e) {

    if(e.orientation == 'portrait') {
        console.log('Portrait.')
    }
    else{
        console.log('Landscape.')
    }
}


if(navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry)/)) {
    console.log('Mobile Phone');
    $(document).on('deviceready', onDeviceReady);
}else{
    console.log('Browser')
    onDeviceReady();
}

function transactionError(error){
    console.log('Error: '+ error.code);
}

//transaction execute
function onDeviceReady() {
    console.log('Application is ready.');

    db.transaction(function (tx) {
        // Create query.
        var query = 'CREATE TABLE IF NOT EXISTS Account (Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                                                        'Username TEXT NOT NULL UNIQUE, ' +  
                                                        'Password TEXT NOT NULL)';
        // Execute query.

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(){
            //different contents.          
            console.log('Create TABLE Account successfully.')
            
        }
    });
}


$(document).on('submit', '#frm-register', createAccount);


function createAccount(e){
    e.preventDefault();
    var username = $('#username').val();
    var password = $('#password').val();
    var password_confirm = $('#password-confirm').val();


    db.transaction(function (tx) {
        var query = 'INSERT INTO Account (Username, Password) VALUES (?, ?)';
        
        tx.executeSql(query, [username, password], transactionSuccess, transactionError);

        function transactionSuccess(){
            //different contents.          
            console.log(`Create Account ${username} successfully.`)
            $('#frm-register').trigger('reset');
            $('#username').focus();
            
            refreshList();
        }
    });
}


function refreshList(){
    


    db.transaction(function (tx) {
        var query = 'SELECT * FROM Account';
        
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result){
            $('#list').empty();

            var list = '';
            $.each(result.rows, function(i, item){

                list += `<ul>
                    <li>${item.Id}</li>
                    <li>${item.Username}</li>
                    <li>${item.Password}</li>
                </ul>`;
            });

            $('#list').append(list);
        }
    });
}




