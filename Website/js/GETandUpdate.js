async function fetchDataFromSQS() {
    try {
      const response = await fetch('/get-from-sqs');
      const data = await response.json();
  
      if (response.ok) {
        console.log('Received data from SQS:', data);
        $("#temperature").html(`${data.temperature}°C`);
        $("#humidity").html(`<i class="fas fa-tint"></i>${data.humidity}%`);
        $("#lux").html(`<i class="fas fa-sun"></i>${data.lux}`);

        setLuxMode();
        updateLoadbar();
        tempAndLux();

        
      } else {
        console.log('Failed to fetch data:', data.error);
      }
    } catch (err) {
      console.log('Error fetching data:', err);
    }
  }

  setInterval(fetchDataFromSQS, 1000);