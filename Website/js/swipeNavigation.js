$(document).ready(function () {
    var startX, startY, currentX, currentY, endX, endY;
    var currentTranslateX = 0; // Tracks the current X position of the content
    var currentTranslateY = 0; // Tracks the current Y position of the content
    var isSwiping = false;

    $('body').on('touchstart', function (e) {
        var touchStart = e.originalEvent.touches[0];
        startX = touchStart.pageX;
        startY = touchStart.pageY;
        isSwiping = true;
        // Reset current positions
        currentX = startX;
        currentY = startY;
    });

    $('body').on('touchmove', function (e) {
        if (!isSwiping) return;
        e.preventDefault(); // Optional: Prevent scrolling during swipe

        var touchMove = e.originalEvent.touches[0];
        currentX = touchMove.pageX;
        currentY = touchMove.pageY;

        // Calculate the distance moved
        var diffX = currentX - startX;
        var diffY = currentY - startY;

        // Update content position to follow the finger
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            $("content").css("transform", `translateX(${currentTranslateX + diffX}px)`);
        } else {
            // Vertical swipe (inverted)
            $("content").css("transform", `translateY(${currentTranslateY + diffY}px)`);
        }
    });

    $('body').on('touchend', function (e) {
        if (!isSwiping) return;
        isSwiping = false;

        var touchEnd = e.originalEvent.changedTouches[0];
        endX = touchEnd.pageX;
        endY = touchEnd.pageY;

        var diffX = endX - startX;
        var diffY = endY - startY;

        var pageWidth = $(window).width();
        var pageHeight = $(window).height();

        // Snap thresholds
        var snapThresholdX = pageWidth / 4;
        var snapThresholdY = pageWidth / 4;

        // Determine whether the swipe is significant enough
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (Math.abs(diffX) > snapThresholdX) {
                if (diffX > 0) {
                    currentTranslateX += pageWidth; // Swipe right
                } else {
                    currentTranslateX -= pageWidth; // Swipe left
                }
            }
        } else {
            // Vertical swipe (inverted)
            if (Math.abs(diffY) > snapThresholdY) {
                if (diffY > 0) {
                    currentTranslateY += pageHeight; // Swipe down
                } else {
                    currentTranslateY -= pageHeight; // Swipe up
                }
            }
        }

        // Ensure content snaps back if the swipe is too short
        if (currentTranslateX > 0) currentTranslateX = 0; // Prevent going beyond the left boundary
        if (currentTranslateX < -pageWidth) currentTranslateX = -pageWidth; // Prevent going beyond the right boundary

        $("content").css({
            "transition": "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)", // Smooth curved snapping animation
            "transform": `translate(${currentTranslateX}px, ${currentTranslateY}px)`
        });

        setTimeout(() => {
            $("content").css("transition", ""); // Remove transition for the next swipe
        }, 300);
    });
});
