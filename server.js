const express = require('express');
const mysql = require('mysql');
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS SDK (region should match your SQS queue's region)
AWS.config.update({ region: 'eu-north-1' });  // Change to your SQS region

const app = express();
const sqs = new AWS.SQS();

// Define the URL of your SQS queue
const queueURL = 'https://sqs.eu-north-1.amazonaws.com/559050216884/QueueForIOT';  // Replace with your queue URL

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

// Function to continuously poll SQS and log messages
function startSQSPolling() {
  console.log('Starting SQS polling...');

  const pollMessages = () => {
    const params = {
      QueueUrl: queueURL,
      MaxNumberOfMessages: 1,  // Number of messages to receive
      WaitTimeSeconds: 10      // Long polling time (in seconds)
    };

    sqs.receiveMessage(params, (err, data) => {
      if (err) {
        console.error('Error receiving message:', err);
      } else {
        if (data.Messages && data.Messages.length > 0) {
          const message = data.Messages[0];
          try {
            const payload = JSON.parse(message.Body);
            console.log('Received message:', payload);

            const query = 'INSERT INTO sensor_data (temperature, humidity, motion, analog_sensor, timestamp) VALUES (?, ?, ?, ?, ?)';
            const values = [payload.temperature, payload.humidity, payload.motion, payload.analog_sensor, new Date()];

            db.query(query, values, (err, result) => {
              if (err) {
                console.error('Failed to insert data:', err.stack);
              } else {
                console.log('Data inserted successfully:', result.insertId);
              }
            });

            const deleteParams = {
              QueueUrl: queueURL,
              ReceiptHandle: message.ReceiptHandle
            };

            sqs.deleteMessage(deleteParams, (deleteErr, deleteData) => {
              if (deleteErr) {
                console.error('Error deleting message:', deleteErr);
              } else {
                console.log('Message deleted:', deleteData);
              }
            });

          } catch (err) {
            console.error('Failed to parse message payload:', err);
          }
        } else {
          console.log('No messages in the queue.');
        }
      }
      setTimeout(pollMessages, 1000); // Poll every 1 second
    });
  };

  pollMessages();
}

// Start polling when the server starts
startSQSPolling();

app.get('/', (req, res) => {
  /*
  const query = 'SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 10'; // Fetch the 10 most recent entries
  db.query(query, (err, results) => {
    if (err) {
      console.error('Failed to fetch data:', err.stack);
      res.send('Error fetching data from the database.');
      return;
    }

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
    */  
  res.sendFile(path.join(__dirname, 'Website', 'index.html'));
});

const port = 80;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});


