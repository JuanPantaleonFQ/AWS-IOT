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
	certPath: './certs/284f0c547a585301d92eff206db0ca50354c59b8f15a1d9e33d4b7742146910b-certificate.pem.crt', // Path to certificate
	caPath: './certs/AmazonRootCA1.pem', // Path to CA root
	clientId: 'iotconsole-e6d4c225-2112-400f-8b0f-7936ba8f38e6', // Unique client ID
	host: 'a3cxdpguroquo1-ats.iot.eu-north-1.amazonaws.com' // AWS IoT Core endpoint
  });

// RDS Database connection configuration
const db = mysql.createConnection({
  host: 'ec2-db.crgkwmuay2gt.eu-north-1.rds.amazonaws.com', // RDS endpoint
  user: 'admin', // Database username
  password: '1234', // Database password
  database: 'ec2-db' // Database name
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


