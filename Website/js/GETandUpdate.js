async function fetchDataFromSQS() {
    try {
      const response = await fetch('/get-from-sqs');
      const data = await response.json();
  
      if (response.ok) {
        console.log('Received data from SQS:', data);
        $("temperature").text(`${data.temperature}°C`);
        $("humidity").text(`${data.humidity}%`);
        $("lux").text(`${data.lux}`);
        
      } else {
        console.error('Failed to fetch data:', data.error);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  setInterval(fetchDataFromSQS(), 1000);