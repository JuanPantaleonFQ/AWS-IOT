$(document).ready(function () {
    var startX, startY, currentX, currentY, endX, endY;
    var currentTranslateX = 0; // Tracks the current X position of the content
    var currentTranslateY = 0; // Tracks the current Y position of the content
    var isSwiping = false;
    var swipeDirection = null; // "horizontal" or "vertical"

    $('body').on('touchstart', function (e) {
        var touchStart = e.originalEvent.touches[0];
        startX = touchStart.pageX;
        startY = touchStart.pageY;
        isSwiping = true;
        swipeDirection = null; // Reset swipe direction
        currentX = startX;
        currentY = startY;
    });

    $('body').on('touchmove', function (e) {
        if (!isSwiping) return;

        var touchMove = e.originalEvent.touches[0];
        currentX = touchMove.pageX;
        currentY = touchMove.pageY;

        // Calculate the distance moved
        var diffX = currentX - startX;
        var diffY = currentY - startY;

        if (!swipeDirection) {
            // Determine swipe direction on first significant move
            if (Math.abs(diffX) > Math.abs(diffY)) {
                swipeDirection = "horizontal";
            } else if (diffY < 0 || (diffY > 0 && currentTranslateY !== 0)) {
                // Allow upward swipes or downward swipes only if not at the original position
                swipeDirection = "vertical";
            } else {
                // Prevent downward swipe from the original position
                swipeDirection = null;
                return;
            }
        }

        if (swipeDirection === "horizontal") {
            e.preventDefault(); // Prevent scrolling during horizontal swipe
            $("content").css("transform", `translateX(${currentTranslateX + diffX}px)`);
        } else if (swipeDirection === "vertical") {
            e.preventDefault(); // Prevent scrolling during vertical swipe
            var newTranslateY = currentTranslateY + diffY;
            if (newTranslateY <= 0 && newTranslateY >= -$(window).height()) {
                // Constrain vertical movement to between 0 and -1 screen height
                $("content").css("transform", `translateY(${newTranslateY}px)`);
            }
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

        var snapThresholdX = pageWidth / 5;
        var snapThresholdY = pageHeight / 4;

        if (swipeDirection === "horizontal" && Math.abs(diffX) > snapThresholdX) {
            if (diffX > 0) {
                currentTranslateX = Math.min(currentTranslateX + pageWidth, pageWidth); // Swipe right, limit to +1 screen
            } else {
                currentTranslateX = Math.max(currentTranslateX - pageWidth, -pageWidth); // Swipe left, limit to -1 screen
            }
            currentTranslateY = 0; // Reset Y to prevent diagonal movement
        } else if (swipeDirection === "vertical" && Math.abs(diffY) > snapThresholdY) {
            if (diffY < 0) {
                // Upward swipe
                currentTranslateY = Math.max(currentTranslateY - pageHeight, -pageHeight); // Limit to -1 screen
            } else if (currentTranslateY < 0) {
                // Downward swipe only if currently above original position
                currentTranslateY = Math.min(currentTranslateY + pageHeight, 0); // Limit to 0
            }
            currentTranslateX = 0; // Reset X to prevent diagonal movement
        }

        // Apply the updated position with snapping
        $("content").css({
            "transition": "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)", // Smooth snap animation
            "transform": `translate(${currentTranslateX}px, ${currentTranslateY}px)`
        });

        setTimeout(() => {
            $("content").css("transition", ""); // Remove transition for the next swipe
        }, 300);
    });
});
