// Store chart instances globally
let charts = {};

// Create nightly analysis chart
function createNightlyChart() {
    const ctx = document.getElementById('nightlyChart');
    const data = [];
    
    if (charts.nightly) {
        charts.nightly.destroy();
    }
    
    charts.nightly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.hours,
            datasets: [
                {
                    type: 'bar',
                    label: 'Movements',
                    data: data.movements,
                    backgroundColor: '#60a5fa',
                    yAxisID: 'movements'
                },
                {
                    type: 'line',
                    label: 'Humidity (%)',
                    data: data.humidity,
                    borderColor: '#34d399',
                    tension: 0.4,
                    yAxisID: 'environment'
                },
                {
                    type: 'line',
                    label: 'Light (lux)',
                    data: data.light,
                    borderColor: '#fbbf24',
                    tension: 0.4,
                    yAxisID: 'environment'
                },
                {
                    type: 'line',
                    label: 'Temperature (°C)',
                    data: data.temperature,
                    borderColor: '#f87171',
                    tension: 0.4,
                    yAxisID: 'temperature'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                movements: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Movement Count',
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    },
                    ticks: { color: '#94a3b8' }
                },
                environment: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity & Light',
                        color: '#94a3b8'
                    },
                    grid: {
                        display: false
                    },
                    ticks: { color: '#94a3b8' }
                },
                temperature: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: '#94a3b8'
                    },
                    grid: {
                        display: false
                    },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: {
                        color: '#334155'
                    },
                    ticks: { color: '#94a3b8' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#94a3b8' }
                }
            }
        }
    });
}

// Create quality trend chart
function createQualityChart() {
    const ctx = document.getElementById('qualityChart');
    const data = [];
    
    if (charts.quality) {
        charts.quality.destroy();
    }

    charts.quality = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date.toLocaleDateString()),
            datasets: [{
                label: 'Sleep Quality',
                data: data.map(d => d.quality),
                borderColor: '#60a5fa',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(96, 165, 250, 0.1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#94a3b8' }
                }
            }
        }
    });
}

// Create regularity chart
function createRegularityChart() {
    const ctx = document.getElementById('regularityChart');
    const data = [];
    
    if (charts.regularity) {
        charts.regularity.destroy();
    }

    charts.regularity = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date.toLocaleDateString()),
            datasets: [{
                label: 'Sleep Regularity',
                data: data.map(d => d.regularity),
                borderColor: '#34d399',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(52, 211, 153, 0.1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#94a3b8' }
                }
            }
        }
    });
}

// Initialize all charts
function initializeCharts() {
    createNightlyChart();
    createQualityChart();
    createRegularityChart();
}

// Initialize charts on load
document.addEventListener('DOMContentLoaded', initializeCharts);

async function getLastSleepRecords(x) {
    try {
        const response = await $.ajax({
            url: '/get-last-sleep-records',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ limit: x }), // Send the number of records you want
        });
        if (response && Array.isArray(response)) {
            return response; 
        } 
        else {
            throw new Error('No sleep records found');
        }
    } 
    catch (error) {
        console.error('Error fetching sleep records:', error);
        throw error;  // Throw the error so it can be caught by the caller
    }
}
  

async function populateGraphWithAverage(x) {
    try {
      // Use a promise-based approach to fetch sleep records
      const sleepRecords = await getLastSleepRecords(x);
  
      if (!sleepRecords || sleepRecords.length === 0) {
        console.error('No sleep records found');
        return;
      }
  
      const lastSleepRecord = sleepRecords[0];
      const startDate = new Date(lastSleepRecord.start_date);
      const endDate = lastSleepRecord.end_date ? new Date(lastSleepRecord.end_date) : new Date(); // Use current time if no end_date
  
      // Calculate the number of minutes slept
      const periodInMinutes = Math.floor((endDate - startDate) / (1000 * 60)); // Period in minutes
      let currentDatetime = startDate;
  
      // Loop through each period and fetch the real-time metrics
      for (let i = 0; i <= periodInMinutes; i += evaluationPeriod) {
        try {
          // Await the real-time metrics for the current period
          const data = await getRealTimeMetrics(currentDatetime.toISOString(), evaluationPeriod);
          
          // Update the graph with the received data
          updateGraph(currentDatetime, data);
  
          // Move to the next period (advance by evaluationPeriod minutes)
          currentDatetime.setMinutes(currentDatetime.getMinutes() + evaluationPeriod);
        } catch (error) {
          console.error('Error fetching real-time metrics for period starting at ' + currentDatetime.toISOString(), error);
        }
      }
  
      console.log('Graph populated with average metrics.');
    } catch (error) {
      console.error('Error populating graph with average metrics:', error);
    }
  }
  
  
  // Function to update the graph with new data
  function updateGraph(datetime, metrics) {
    // Example update function, you can implement your graph update logic here
    console.log('Updating graph with data for:', datetime);
    console.log('Metrics:', metrics);
    // Update the chart here (e.g., using a chart library)
  }
 
$(document).ready(function () {   
  // Call the function to populate the graph with the most recent sleep data
  if(!sleeping){
    populateGraphWithAverage(1);
  }
}); 
