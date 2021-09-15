document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() { }


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
            else{
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



$(document).on('vclick', '#btn-take-picture', takeQRCode);


function takePicture(){

    let cameraOptions = {
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: true,
    }

    navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);


    function cameraSuccess(imageData){
        alert(imageData);

        $('#img-test').attr('src', "data:image/jpeg;base64," + imageData)
    }

    function cameraError(error){
        alert(error)
    }

    //cordova plugin add cordova-plugin-barcodescanner
    //QR CODE

}

function takeQRCode(){
    cordova.plugins.barcodeScanner.scan(successCallback, errorCallback);

    function successCallback(result){
        alert(`Text: ${result.text}
               Type: ${result.format}`);
    }

    function errorCallback(error){
        alert(error);
    }
}