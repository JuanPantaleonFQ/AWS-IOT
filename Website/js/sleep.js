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