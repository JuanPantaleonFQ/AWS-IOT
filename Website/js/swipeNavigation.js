$(document).ready(function() {
    var startX, startY, endX, endY;
    
    $('body').on('touchstart', function(e) {
        var touchStart = e.originalEvent.touches[0];
        startX = touchStart.pageX;
        startY = touchStart.pageY;
    });

    $('body').on('touchmove', function(e) {
        // Prevent scrolling during swipe (optional)
        e.preventDefault();
    });

    $('body').on('touchend', function(e) {
        var touchEnd = e.originalEvent.changedTouches[0];
        endX = touchEnd.pageX;
        endY = touchEnd.pageY;

        var diffX = endX - startX;
        var diffY = endY - startY;

        // Detect horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                $("content").css("transform",`translateX(100%)`)
                
            } else {
                $("content").css("transform",`translateX(-100%)`)
            }
        } 
        // Detect vertical swipe
        else {
            if (diffY > 0) {
                console.log('Swiped Down');
            } else {
                $("content").css("transform",`translateY(100%)`)
            }
        }
    });
});
