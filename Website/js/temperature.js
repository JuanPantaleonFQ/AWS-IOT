
function tempAndLux() {
    var temp = parseFloat($("#temperature").text().trim());
    var lux = parseFloat($("#lux").text().trim());
    // Normalize the temperature to a value between 0 and 1
    let normalizedTemp = temp / 50;
    let normalizedLux = 800 - 700;

    // Interpolate colors based on the temperature
    let r = Math.min(255, Math.floor(255 * normalizedTemp)); // Red increases with temp
    let g = Math.min(255, Math.floor(255 * (1 - normalizedTemp))); // Green decreases with temp
    let b = 255 - r; // Blue decreases as Red increases

    $("#loadBar").css('box-shadow',`0 0 100px 10px rgb(${r}, ${g}, ${b}, 0.8)`)
}

tempAndLux()