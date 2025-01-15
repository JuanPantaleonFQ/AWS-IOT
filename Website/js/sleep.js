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
/*
// Fetch sleep status when the page loads
$.get('/check-sleep-status', function (data) {
    $('#sleepButton').text(data.buttonText).attr('data-sleepId', data.sleepId);
}).fail(function () {
    console.error('Failed to fetch sleep status.');
});
*/
$(document).ready(function () {
    // When the "Start Sleeping" button is clicked
    $('#sleepButton').on('click', function () {
        if ($(this).text() === "Start sleeping") {
            const startTime = new Date().toISOString();  // Capture the current time in ISO format

            // Send start time to the backend to start a new sleep session
            $.ajax({
                url: '/start-sleeping',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ startTime }),  // Pass start time as part of the request body
                success: function(response) {
                    console.log('Sleep started successfully');
                    $('#sleepButton').text('Stop sleeping');  // Change button text to "Stop Sleeping"
                },
                error: function(err) {
                    console.error('Failed to start sleeping:', err);
                }
            });
        } 
        else if ($(this).text() === "Stop sleeping") {
            // When the stop button is clicked, hide the button and show score selection
            $('#sleepButton').hide();  // Hide the "Stop Sleeping" button
            $('#iconContainer').removeClass('hidden');  // Show icons (for score selection)
        }
    });

    // When an icon (score) is clicked, it should submit the score and stop the session
    $('.sleep-icon').on('click', function () {
        const score = $(this).data('score');  // Get the score from the clicked icon (1-5)
        const stopTime = new Date().toISOString();  // Capture the stop time
        const sleepId = $('#sleepButton').data('sleepId');  // Get the sleep session ID from the button

        // Send stop time and score to the backend to update the sleep record
        $.ajax({
            url: '/stop-sleeping',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ recordId: sleepId, stopTime, score }),  // Send stop time, score, and recordId
            success: function(response) {
                console.log('Sleep stopped and scored successfully');
                $('#scoreSelection').hide();  // Hide score selection after submitting
                $('#sleepButton').text('Start sleeping').show();  // Reset button text to "Start Sleeping" and show it
                $('#iconContainer').addClass('hidden');  // Hide icons after stopping the session
            },
            error: function(err) {
                console.error('Failed to stop sleeping:', err);
            }
        });
    });
});

