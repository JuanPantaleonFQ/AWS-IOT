function toggleSleep(){
    var sleeping = ($("#bed").css("visibility") == "visible");

    if(sleeping){
        $("#bed").css("visibility", "hidden");
        $('#sleepButton').text("Start sleeping");
    }
    else{
        $("#bed").css("visibility", "visible");
        $('#sleepButton').text("Stop sleeping");
    }
}

// Fetch sleep status when the page loads
$.get('/check-sleep-status', function (data) {
    $('#sleepButton').text(data.buttonText).attr('data-sleepId', data.sleepId);
}).fail(function () {
    console.error('Failed to fetch sleep status.');
});