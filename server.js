const express = require('express');
const awsIot = require('aws-iot-device-sdk');
const mysql = require('mysql');

const app = express();
const port = 80;

// AWS IoT Device configuration
//!Comprobar si tengo que poner los certificados de rapsberri o de iot core o de que
const device = awsIot.device({
	keyPath: './certs/private.pem.key', // Path to private key
	certPath: './certs/284f0c547a585301d92eff206db0ca50354c59b8f15a1d9e33d4b7742146910b-certificate.pem.crt', // Path to certificate
	caPath: './certs/AmazonRootCA1.pem', // Path to CA root
	clientId: 'iotconsole-e6d4c225-2112-400f-8b0f-7936ba8f38e6', // Unique client ID
	host: 'a3cxdpguroquo1-ats.iot.eu-north-1.amazonaws.com' // AWS IoT Core endpoint
});

// RDS Database connection configuration
const db = mysql.createConnection({
  host: 'ec2-db.crgkwmuay2gt.eu-north-1.rds.amazonaws.com', // RDS endpoint
  user: 'admin', // Database username
  password: '1234master', // Database password
  database: 'sensor_data' // Database name
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});



// Subscribe to the topic
let isSubscribed = false;

device.on('connect', () => {
  if (!isSubscribed) {
    console.log('Connected to AWS IoT Core.');
    device.subscribe('home/sensor_data', (err, granted) => {
      if (err) {
        console.error('Failed to subscribe:', err);
      } else {
        console.log('Successfully subscribed ', granted);
        device.publish('test','Hello mqtt');
        isSubscribed = true; // Prevent further subscriptions
      }
    });
  }
});


device.on('disconnect', (reason) => {
  console.log('Device disconnected AWS IoT Core. Reason:', reason);
});

device.on('message', (topic, payload) => {
  console.log(message,topic, payload);
  try {
    const data = JSON.parse(payload.toString());
    console.log(`Received data on ${topic}:`, data);

    const query = 'INSERT INTO sensor_data (temperature, humidity, motion, analog_sensor, timestamp) VALUES (?, ?, ?, ?, ?)';
    const values = [data.temperature, data.humidity, data.motion, data.analog_sensor, new Date()];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Failed to insert data:', err.stack);
      } else {
        console.log('Data inserted successfully:', result.insertId);
      }
    });
  } catch (err) {
    console.error('Failed to parse message payload:', err);
  }
});


// Handle errors
device.on('error', (error) => {
  console.error('AWS IoT Error:', error);
});

db.on('error', (error) => {
  console.error('Database Error:', error);
});

// Express server setup
// app.get('/', (req, res) => {
//   res.send(`
//     <html>
//       <head>
//         <title>IOT AWS DEVICE</title>
//       </head>
//       <body>
//         <h1>Hello Juan and Lucas!</h1>
//         <p>The page will refresh every 10 seconds.</p>
//         <script>
//           setInterval(function(){
//             location.reload();
//           }, 10000); // Refresh every 10 seconds
//         </script>
//       </body>
//     </html>
//   `);
// });
app.get('/', (req, res) => {
  // Query the database to get the latest sensor data
  const query = 'SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 10'; // Fetch the 10 most recent entries
  db.query(query, (err, results) => {
    if (err) {
      console.error('Failed to fetch data:', err.stack);
      res.send('Error fetching data from the database.');
      return;
    }

    // Build an HTML table to display the data
    let tableRows = '';
    results.forEach(row => {
      tableRows += `
        <tr>
          <td>${row.timestamp}</td>
          <td>${row.temperature}</td>
          <td>${row.humidity}</td>
          <td>${row.motion}</td>
          <td>${row.analog_sensor}</td>
        </tr>
      `;
    });

    res.send(`
      <html>
        <head>
          <title>IOT AWS DEVICE</title>
        </head>
        <body>
          <h1>Hello Juan and Lucas!</h1>
          <p>The data will refresh every 10 seconds.</p>
          <table border="1">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>Motion</th>
                <th>Analog Sensor</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            setInterval(function(){
              location.reload();
            }, 10000); // Refresh every 10 seconds
          </script>
        </body>
      </html>
    `);
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

//end :)
