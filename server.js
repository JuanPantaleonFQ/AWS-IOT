// const express = require('express');
// const app = express();
// const port = 80;

// app.get('/', (req, res) => {
// 	res.send('Hello juan and lucas!');

// });

// app.listen(port, () => {
// 	console.log(`Server running  at http://localhost:${port}`);
// });
const express = require('express');
const awsIot = require('aws-iot-device-sdk');
const mysql = require('mysql');

const app = express();
const port = 80;

// AWS IoT Device configuration
const device = awsIot.device({
  keyPath: './certs/private.pem.key', // Path to private key
  certPath: './certs/certificate.pem.crt', // Path to certificate
  caPath: './certs/AmazonRootCA1.pem', // Path to CA root
  clientId: 'YourClientId', // Unique client ID
  host: 'a3cxdpguroquo1-ats.iot.eu-north-1.amazonaws.com' // AWS IoT Core endpoint
});

// RDS Database connection configuration
const db = mysql.createConnection({
  host: 'your-rds-endpoint', // RDS endpoint
  user: 'your-username', // Database username
  password: 'your-password', // Database password
  database: 'your-database-name' // Database name
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
device.on('connect', () => {
  console.log('Connected to AWS IoT Core.');
  device.subscribe('home/sensor_data'); // Topic from your Arduino script
});

device.on('message', (topic, payload) => {
  const data = JSON.parse(payload.toString());
  console.log(`Received data on topic ${topic}:`, data);

  // Insert data into the RDS database
  const query = 'INSERT INTO sensor_data (temperature, humidity, motion, analog_sensor, timestamp) VALUES (?, ?, ?, ?, ?)';
  const values = [data.temperature, data.humidity, data.motion, data.analog_sensor, new Date()];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Failed to insert data:', err.stack);
    } else {
      console.log('Data inserted successfully:', result.insertId);
    }
  });
});

// Handle errors
device.on('error', (error) => {
  console.error('AWS IoT Error:', error);
});

db.on('error', (error) => {
  console.error('Database Error:', error);
});

// Express server setup
app.get('/', (req, res) => {
  res.send('Hello juan and lucas!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

//end :)


