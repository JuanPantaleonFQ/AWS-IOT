function setLuxMode(){
    var lux = parseFloat($("#lux").text().trim());

    if (lux > 400) {
        $('body').removeAttr('data-theme'); // Revert to light mode
    } 
    else {
        $('body').attr('data-theme', 'dark'); // Switch to dark mode
    }

}
setLuxMode();