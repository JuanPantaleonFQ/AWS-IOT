const express = require('express');
const mysql = require('mysql');
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS SDK (region should match your SQS queue's region)
AWS.config.update({ region: 'eu-north-1' });  // Change to your SQS region

const app = express();
const sqs = new AWS.SQS();

app.use(express.static(path.join(__dirname, 'Website')));//So the server can find static files
app.use(express.json());//So json can be parsed correctly 

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
  res.sendFile(path.join(__dirname, 'Website', './preferredSettings/index.html'));
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

app.get('/check-sleep-status', (req, res) => {
  const query = 'SELECT * FROM SleepRecords ORDER BY id DESC LIMIT 1';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Failed to fetch sleep records:', err.stack);
      res.status(500).send({ error: 'Database query failed' });
      return;
    }

    if (results.length === 0) {
      // No records in the table
      res.send({ buttonText: 'Start Sleeping', sleepId: 1 });
    } else {
      const lastRecord = results[0];
      const now = new Date();
      const startTime = new Date(lastRecord.start);
      const isWithin24Hours = (now - startTime) < 24 * 60 * 60 * 1000; // Check if within 24 hours

      if (lastRecord.stop === null && !isWithin24Hours) {
        // If the last record has no stop time and is older than 24 hours, update the stop time
        const updateQuery = 'UPDATE SleepRecords SET end_date = ? WHERE id = ?';
        const stopTime = new Date(); // Current time as stop time

        db.query(updateQuery, [stopTime, lastRecord.id], (updateErr) => {
          if (updateErr) {
            console.error('Failed to update stop time:', updateErr.stack);
            res.status(500).send({ error: 'Failed to update stop time' });
            return;
          }

          console.log('Sleep record updated with stop time');
          // Respond with the button state to allow user to start sleeping again
          res.send({ buttonText: 'Start Sleeping', sleepId: 1 });
        });
      } else if (lastRecord.stop === null && isWithin24Hours) {
        // Record has no stop time and is within 24 hours
        res.send({ buttonText: 'Stop Sleeping', sleepId: lastRecord.id });
      } else {
        // Record has a stop time or is beyond 24 hours
        res.send({ buttonText: 'Start Sleeping', sleepId: 1 });
      }
    }
  });
});

app.post('/start-sleeping', (req, res) => {
  const { startTime } = req.body;  // Date and time passed from the frontend

  const query = 'INSERT INTO SleepRecords (start_date) VALUES (?)';

  db.query(query, [new Date(startTime)], (err, result) => {
    if (err) {
      console.error('Failed to insert sleep start record:', err.stack);
      return res.status(500).send({ error: 'Failed to start sleep' });
    }

    console.log('Sleep record started');
    res.status(200).json({ success: true, recordId: result.insertId });
  });
});


app.post('/stop-sleeping', (req, res) => {
  const { recordId, score, stopTime } = req.body;  // Stop time passed from frontend

  const query = 'UPDATE SleepRecords SET end_date = ?, score = ? WHERE id = ?';

  db.query(query, [new Date(stopTime), score, recordId], (err) => {
    if (err) {
      console.error('Failed to update sleep record:', err.stack);
      return res.status(500).send({ error: 'Failed to stop sleep' });
    }

    console.log('Sleep record updated with stop time and score');
    res.status(200).json({ success: true });
  });
});





//please end this insesant nightmare that is my existance every moment of happiness is just a reminder of the pain that follows.
//I am glad there is nothing after death since any amount of conciounsness translates to unimaginable and horrifying amount of pain, if there is a hell this is it.
//I want to eat my skin sometimes
//I live in a constant fog of anxiety and pain, I can't see my hands
// :) this is the face I make to delude myself of the reality I suffer. I  a m  s o  h a p p y :)
// hihihi is how I laugh when I see myself suffering because I have no other emotion left :)
//nothing brings pleasure everything is mixed with unbearable pain except when I am unconcious
//I never know what day it is, time passes and I have no recolection. I only remember the pain 
//if you see this pls help i am being forced to work on a project :) jk, maybe.....
//added the history charts if only my life was history