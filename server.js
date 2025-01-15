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
      res.send({ buttonText: 'Start sleeping', sleepId: 1 });
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
          res.send({ buttonText: 'Start sleeping', sleepId: 1 });
        });
      } else if (lastRecord.stop === null && isWithin24Hours) {
        // Record has no stop time and is within 24 hours
        res.send({ buttonText: 'Stop sleeping', sleepId: lastRecord.id });
      } else {
        // Record has a stop time or is beyond 24 hours
        res.send({ buttonText: 'Start sleeping', sleepId: 1 });
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
  const { score, stopTime } = req.body;  // Stop time and score passed from frontend

  // Query to get the most recent active sleep record (not stopped)
  const getLastActiveRecordQuery = 'SELECT id FROM SleepRecords WHERE end_date IS NULL ORDER BY start_date DESC LIMIT 1';

  db.query(getLastActiveRecordQuery, (err, result) => {
    if (err) {
      console.error('Failed to fetch the last active sleep record:', err.stack);
      return res.status(500).send({ error: 'Failed to fetch the last active sleep record' });
    }

    if (result.length === 0) {
      // If no active sleep record is found
      return res.status(400).send({ error: 'No active sleep session found' });
    }

    const recordId = result[0].id;  // Get the ID of the most recent active sleep record

    // Update the sleep record with the stop time and score
    const updateQuery = 'UPDATE SleepRecords SET end_date = ?, score = ? WHERE id = ?';

    db.query(updateQuery, [new Date(stopTime), score, recordId], (err) => {
      if (err) {
        console.error('Failed to update sleep record:', err.stack);
        return res.status(500).send({ error: 'Failed to stop sleep' });
      }

      console.log('Sleep record updated with stop time and score');
      res.status(200).json({ success: true });
    });
  });
});

app.post('/get-realtime-metrics', (req, res) => {
  const { datetime, period } = req.body;  // Datetime and period (in minutes) from the frontend

  if (!datetime || !period) {
    return res.status(400).send({ error: 'Datetime and period are required' });
  }

  // Convert the datetime string to a Date object
  const endDatetime = new Date(datetime);
  
  // Calculate the end datetime based on the period (period in minutes)
  const startDatetime = new Date(endDatetime.getTime() - period * 60 * 1000); // period in minutes
  
  // Query to get data from the sensor_data table between startDatetime and endDatetime
  const query = `
    SELECT 
      temperature,
      humidity,
      lux,
      motion,
      timestamp
    FROM sensor_data
    WHERE timestamp BETWEEN ? AND ?`;


  db.query(query, [startDatetime, endDatetime], (err, results) => {
    if (err) {
      console.error('Failed to fetch real-time metrics:', err.stack);
      return res.status(500).send({ error: 'Failed to fetch real-time metrics' });
    }


    // If no data was found in the given period
    if (results.length === 0) {
      return res.status(200).json({ message: 'No data available for the specified period' });
    }

    // Calculate average values and total motion
    let totalTemperature = 0, totalHumidity = 0, totalLux = 0, motionCount = 0;

    results.forEach(row => {
      totalTemperature += row.temperature;
      totalHumidity += row.humidity;
      if (row.lux !== null) totalLux += row.lux; // Handle null lux values
      if (row.motion === 1) motionCount++;  // Count motion events (assuming motion is 1 for detected)
    });

    // Calculate averages
    const avgTemperature = totalTemperature / results.length;
    const avgHumidity = totalHumidity / results.length;
    const avgLux = totalLux / results.filter(row => row.lux !== null).length; // Only average non-null lux
    const totalMotion = motionCount;

    // Return aggregated results in a single JSON object
    res.status(200).json({
      datetime: datetime,
      averageTemperature: avgTemperature,
      averageHumidity: avgHumidity,
      averageLux: avgLux,
      totalMotion: totalMotion
    });
  });
});

app.post('/get-last-sleep-records', (req, res) => {
  const { limit } = req.body;  // Read 'limit' from the request body

  if (!limit || isNaN(limit) || limit <= 0) {
    return res.status(400).send({ error: 'Invalid number of records requested' });
  }

  const query = 'SELECT * FROM SleepRecords ORDER BY id DESC LIMIT ?';

  // Using 'limit' as the limit for the number of records
  db.query(query, [parseInt(limit)], (err, results) => {
    if (err) {
      console.error('Failed to fetch sleep records:', err.stack);
      return res.status(500).send({ error: 'Database query failed' });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'No sleep records found' });
    }

    // Send the records as the response
    res.status(200).json(results);
  });
});

app.post('/calculate-sleeping-score', (req, res) => {
    const { start_date, end_date, score, w1, w2, w3 } = req.body;
  
    // Validate input
    if (!start_date || !end_date || !score || !w1 || !w2 || !w3) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
  
    // Calculate the total sleep time in hours from the provided start and end dates
    const startTime = new Date(start_date);
    const endTime = new Date(end_date);
    const totalSleepTime = (endTime - startTime) / (1000 * 60 * 60); // Convert milliseconds to hours
  
    // Query to fetch data between start_date and end_date
    const query = `
      SELECT * FROM sensor_data
      WHERE timestamp BETWEEN ? AND ?
    `;
  
    db.query(query, [start_date, end_date], (err, rows) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).json({ error: 'Failed to fetch data from the database' });
      }
  
      let totalMovementIntervals = 0;
      let intervalStart = null;
      let motionCount = 0;
  
      // Process data
      rows.forEach(row => {
        // Filter rows with motion values of 0 or 1
        if (row.motion === 1 || row.motion === 0) {
          // Group by 30-minute intervals based on timestamp
          let currentInterval = Math.floor(new Date(row.timestamp).getTime() / (30 * 60 * 1000));
  
          // Initialize intervalStart for the first iteration
          if (intervalStart === null) {
            intervalStart = currentInterval;
          }
  
          // If the interval has changed (new 30-minute window)
          if (currentInterval !== intervalStart) {
            if (motionCount > 6) {
              totalMovementIntervals += 1;  // Count the previous interval if motion > 6
            }
  
            // Reset motion count for the new interval
            motionCount = 0;
            intervalStart = currentInterval;  // Update to the new interval
          }
  
          // Increment motion count if there's motion detected
          if (row.motion > 0) {
            motionCount += 1;
          }
        }
      });
  
      // Final check for the last interval in case the loop ends before an interval is counted
      if (motionCount > 6) {
        totalMovementIntervals += 1;
      }
      const movementPenalty = (totalMovementIntervals / 2) * 100 / totalSleepTime;

      console.log(totalSleepTime, movementPenalty, score);
      // Calculate the total score using the provided formula
      const totalScore = (totalSleepTime / 8) * w1 + (100 - movementPenalty) * w2 + score * w3;
  
      // Send response with the calculated total score
      res.json({ totalScore });
    });
});

app.post('/calculate-sleep-regularity-score', (req, res) => {
  const { sleepId, currentSleepStart, currentSleepStop } = req.body;

  // Validate inputs
  if (!sleepId || !currentSleepStart || !currentSleepStop) {
    return res.status(400).json({ error: 'Missing sleepId, start, or stop datetime' });
  }

  // Convert provided timestamps to Date objects
  const currentSleepStartTime = new Date(currentSleepStart);
  const currentSleepStopTime = new Date(currentSleepStop);

  // Query to fetch the previous sleep session from the database using the provided sleepId
  const query = `
    SELECT start_date, end_date
    FROM SleepRecords
    WHERE id = (SELECT MAX(id) FROM SleepRecords WHERE id < ?)
  `;

  db.query(query, [sleepId], (err, results) => {
    if (err) {
      console.error('Error fetching the previous sleep record:', err.stack);
      return res.status(500).json({ error: 'Failed to fetch the previous sleep record' });
    }

    // If no previous sleep session is found, return a score of 100
    if (results.length === 0) {
      console.log('No previous sleep session found, returning score of 100');
      return res.json({ score: 100 });
    }

    // If a previous sleep session is found, use its start and stop times
    const lastSleepStartTime = new Date(results[0].start_date);
    const lastSleepStopTime = new Date(results[0].end_date);

    // Calculate the time difference between the last stop and the current start time
    const timeDifference = (currentSleepStartTime - lastSleepStopTime) / (1000 * 60 * 60); // in hours

    let score = 0;

    if (timeDifference >= 24) {
      score = 0;
    } else if (timeDifference === 16) {
      score = 100;
    } else if (timeDifference < 16) {
      // Normalize score between 0 and 100 based on the difference from 16 hours
      score = Math.max(0, 100 - Math.abs(16 - timeDifference) * 6.25);
    }

    // Send the calculated score as a response
    res.json({ score });
  });
});

app.post('/get-records-by-filter', (req, res) => {
  const { column, operand, value } = req.body;

  // Validate inputs
  if (!column || !operand || typeof value === 'undefined') {
      return res.status(400).json({ error: 'Missing filter parameters' });
  }

  // Parse the value and check if it is a valid number
  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue)) {
      return res.status(400).json({ error: 'Value must be a valid number' });
  }

  // Validate that operand is one of the allowed operators
  const allowedOperands = ['=', '>', '<', '>=', '<=', '<>', 'LIKE'];
  if (!allowedOperands.includes(operand)) {
      return res.status(400).json({ error: 'Invalid operand' });
  }

  // Prepare the query using sanitized column
  const safeColumn = db.escapeId(column);
  const safeValue = db.escape(parsedValue);  // Escape the parsed value to prevent injection

  const sqlQuery = `SELECT * FROM sensor_data WHERE ${safeColumn} ${operand} ${safeValue} ORDER BY ${safeColumn}`;
  console.log(sqlQuery);

  // Execute the query
  db.query(sqlQuery, (err, results) => {
      if (err) {
          console.error('Error fetching records:', err.stack);
          return res.status(500).json({ error: 'Failed to fetch records' });
      }

      // If no records found, return an empty array
      if (results.length === 0) {
          return res.status(404).json({ message: 'No matching records found' });
      }

      // Return the records as the response
      res.json(results);
  });
});




