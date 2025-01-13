async function fetchDataFromSQS() {
    try {
      const response = await fetch('/get-from-sqs');
      const data = await response.json();
  
      if (response.ok) {
        console.log('Received data from SQS:', data);
  
        // Do something with the data, e.g., update the UI
        document.getElementById('output').innerText = JSON.stringify(data, null, 2);
      } else {
        console.error('Failed to fetch data:', data.error);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }
  