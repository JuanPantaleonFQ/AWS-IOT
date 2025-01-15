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
    let currentRecordId = null;  // Variable to store the current record's ID
  
    // When the "Start Sleeping" button is clicked
    $('#sleepButton').on('click', function () {
      if ($(this).text() === "Start sleeping") {
        // Create a new sleep record (start sleeping)
        $.ajax({
          url: '/start-sleeping',
          method: 'POST',
          success: function (response) {
            if (response.success) {
              currentRecordId = response.recordId;  // Store the record ID
              $(this).text('Stop sleeping');
              $("#bed").css("visibility", "visible");
            }
          },
          error: function () {
            alert('Error starting sleep');
          }
        });
      } 
      else if ($(this).text() === "Stop sleeping") {
        // Hide the button and show the icons
        $('#iconContainer').removeClass('hidden');
        $('#sleepButton').addClass('hidden');
        $("#bed").css("visibility", "hidden");
      }
    });
  
    // When an icon is clicked (1-5 scale)
    $('.sleep-icon').on('click', function () {
      const score = $(this).data('score');  // Get the score value from data attribute
  
      // Update the sleep record with stop time and score
      $.ajax({
        url: '/stop-sleeping',
        method: 'POST',
        data: { recordId: currentRecordId, score: score },
        success: function (response) {
          if (response.success) {
            // Hide the icons and show the "Start Sleeping" button
            $('#iconContainer').addClass('hidden');
            $('#sleepButton').removeClass('hidden').text('Start sleeping');
          }
        },
        error: function () {
          alert('Error stopping sleep');
        }
      });
    });
  });