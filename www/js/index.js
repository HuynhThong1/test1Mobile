var db = window.openDatabase('Plugin1', '1.0', 'Plugin1', 20000);

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {

    $(document).on('ready', onDeviceReady);
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

        //phải có foreign key khi có image table trong bài của mình
        var query = `CREATE TABLE IF NOT EXISTS Image (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                       Image BLOB)`;

        // Execute a query.
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            // Logging.
            log(`Create table 'Image' successfully.`);
        }

    });
}


window.addEventListener("batterystatus", onBatteryStatus, false);

function onBatteryStatus(status) {
    alert("Level: " + status.level + " isPlugged: " + status.isPlugged);
}


window.addEventListener("batterylow", onBatteryLow, false);

function onBatteryLow(status) {
    alert("Battery Level Low " + status.level + "%");
}

window.addEventListener("batterycritical", onBatteryCritical, false);

function onBatteryCritical(status) {
    alert("Battery Level Critical " + status.level + "%\nRecharge Soon!");
}


$(document).on('vclick', '#btn-js-alert', jsAlert);
$(document).on('vclick', '#btn-cordova-alert', cordovaAlert);
$(document).on('vclick', '#btn-cordova-confirm', cordovaConfirm);
$(document).on('vclick', '#btn-cordova-prompt', cordovaPrompt);
$(document).on('vclick', '#btn-cordova-beep', cordovaBeep);
$(document).on('vclick', '#btn-cordova-vibration', cordovaVibration);


function jsAlert() {
    alert("this is JS Alert");
}

function cordovaAlert() {

    let message = 'This is Cordova Alert'
    let title = 'ALERT'
    let btnAlert = 'CLOSE'

    navigator.notification.alert(message, callback, title, btnAlert);

    function callback() {
        alert('U la troi')
    }
}

function cordovaConfirm() {
    let message = 'This is Cordova Confirm';
    let title = 'CONFIRM';
    let btnConfirm = 'Button2,Button1';

    navigator.notification.confirm(message, confirmCallback, title, btnConfirm)

    function confirmCallback(btnIndex) {
        if (btnIndex === 0) {
            alert('Cordova Confirm is dismissed.');
        }
        else if (btnIndex === 1) {
            alert('Button 2')
        } else if (btnIndex === 2) {
            alert('Button 1')
        }
    }
}

function cordovaPrompt() {

    let message = 'Please type "Delete confirm" to delete this object';
    let title = 'PROMPT';
    let btnLabel = 'Delete,Cancel';

    let defaultText = ''

    navigator.notification.prompt(message, callback, title, btnLabel, defaultText)

    function callback(result) {
        if (result.buttonIndex === 0) {
            alert('Cordova Confirm is dismissed.');
        }
        else if (result.buttonIndex === 1) {
            if (result.input1 == 'delete confirm') {
                alert('This object is deleted. ');
            }
            else {
                alert('This object is NOT deleted.')
            }
        } else if (result.buttonIndex === 2) {
            alert('Cancel')
        }
    }
}

function cordovaBeep() {
    navigator.notification.beep(2);
}

function cordovaVibration() {
    navigator.vibrate(1000, 1000, 3000, 3000, 3000, 1000, 1000, 1000)
}



$(document).on('vclick', '#btn-take-picture', takePicture);


function takePicture() {

    let cameraOptions = {
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: true,
    }

    navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);


    function cameraSuccess(imageData) {
        db.transaction(function (tx) {
            var query = 'INSERT INTO Image (Image) VALUES (?)';
            tx.executeSql(query, [imageData], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                alert('Successfully stored in database');
            }
        });
    }

    function cameraError(error) {
        alert(error)
    }

    //cordova plugin add cordova-plugin-barcodescanner
    //QR CODE

}

$(document).on('pagebeforeshow', '#page-gallery', listImage)

function listImage() {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Image';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            $('#page-gallery #gallery').empty()

            for (let image of result.rows) {
                $('#page-gallery #gallery').append(`<img src='data:image/jpeg;base64,${image.Image}' width='50%'>`)
            }
        }
    });
}



function takeQRCode() {
    cordova.plugins.barcodeScanner.scan(successCallback, errorCallback);

    function successCallback(result) {
        alert(`Text: ${result.text}
               Type: ${result.format}`);
    }

    function errorCallback(error) {
        alert(error);
    }
}

