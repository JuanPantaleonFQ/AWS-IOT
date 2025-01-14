const express = require('express');
const mysql = require('mysql');
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS SDK (region should match your SQS queue's region)
AWS.config.update({ region: 'eu-north-1' });  // Change to your SQS region

const app = express();
const sqs = new AWS.SQS();

app.use(express.static(path.join(__dirname, 'Website')));//So the server can find static files

// Define the URL of your SQS queue
const queueURL = 'https://sqs.eu-north-1.amazonaws.com/559050216884/QueueForIOT';  // Replace with your queue URL

var lastUpdate;

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
            lastUpdate = payload;

            const query = 'INSERT INTO sensor_data (temperature, humidity, motion, lux, timestamp) VALUES (?, ?, ?, ?, ?)';
            const values = [payload.temperature, payload.humidity, payload.motion, payload.lux, new Date()];

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
  res.sendFile(path.join(__dirname, 'Website', 'index.html'));
});
app.get('/prefferedSettings', (req, res) => {
  res.sendFile(path.join(__dirname, 'Website', './prefferedSettings/index.html'));
});
app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, 'Website', './history/index.html'));
});

const port = 80;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get('/get-from-sqs', (req, res) => {
  const params = {
    QueueUrl: queueURL,
    MaxNumberOfMessages: 1, // Adjust as needed
    WaitTimeSeconds: 10     // Use long polling to reduce unnecessary requests
  };
  if(lastUpdate){
    res.send(lastUpdate);
  }else{
    res.send({ message: 'No messages available.' });
  }
});

//please end this insesant nightmare that is my existance every moment of happiness is just a reminder of the pain that follows.
//I am glad there is nothing after death since any amount of conciounsness translates to unimaginable and horrifying amount of pain, if there is a hell this is it.