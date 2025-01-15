
const $path = $('#loadBar path'); // Select the path inside the #loadBar SVG
const length = $path.get(0).getTotalLength(); // Circumference of the circle

// Set the initial path style using jQuery
$path.css({
  'stroke-dasharray': length,
  'stroke-dashoffset': length
});

function updateLoadbar(){
  var humidity = $('#humidity').text().trim();

  let progress = parseFloat(humidity); // Get the progress value (0-100)
  if (isNaN(progress) || progress < 0) progress = 0; // Clamp to 0 if invalid
  if (progress > 100) progress = 100; // Clamp to 100 if too large
  const offset = length - (length * progress) / 100; // Calculate offset

  // Apply the offset update with jQuery
  $path.css('stroke-dashoffset', offset);
}

updateLoadbar();