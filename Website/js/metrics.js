var datetime = "now";
var period = 5;

const ctx = document.getElementById('metricsChart').getContext('2d');
let metricsChart;
let chartData = {
  labels: [],  // Initially empty
  datasets: [
    {
      type: 'line',
      label: 'Temperature (°C)',
      data: [],
      borderColor: '#00ffcc',
      backgroundColor: 'rgba(0, 255, 204, 0.1)',
      fill: true,
      tension: 0.4,
      yAxisID: 'y-metrics',
    },
    {
      type: 'line',
      label: 'Humidity (%)',
      data: [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      yAxisID: 'y-metrics',
    },
    {
      type: 'line',
      label: 'Light (lux)',
      data: [],
      borderColor: '#eab308',
      backgroundColor: 'rgba(234, 179, 8, 0.1)',
      fill: true,
      tension: 0.4,
      yAxisID: 'y-metrics',
    },
    {
      type: 'bar',
      label: 'Movement',
      data: [],
      backgroundColor: 'rgba(236, 72, 153, 0.7)',
      borderColor: '#ec4899',
      borderWidth: 1,
      yAxisID: 'y-movement',
    },
  ]
};

function createChart() {
  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      'y-metrics': {
        type: 'linear',
        position: 'left',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
      'y-movement': {
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'white',
          stepSize: 1,
          max: 10,
        },
        title: {
          display: true,
          text: 'Movements per hour',
          color: 'white',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
    },
  };

  metricsChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: options
  });
}
// Initialize
createChart();

setInterval(function() {
  getRealTimeMetrics("now", 5, function(data) {
    // Extract the relevant data from the response
    const newLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Get current time (HH:MM)
    const newTemperature = data.averageTemperature;
    const newHumidity = data.averageHumidity;
    const newLux = data.averageLux;
    const newMotion = data.totalMotion;

    // Add new data point to the chart
    chartData.labels.push(newLabel);  // Add time label
    chartData.datasets[0].data.push(newTemperature);  // Add temperature
    chartData.datasets[1].data.push(newHumidity);  // Add humidity
    chartData.datasets[2].data.push(newLux);  // Add light (lux)
    chartData.datasets[3].data.push(newMotion);  // Add movement

    // Update the chart with the new data
    metricsChart.update();
  });
}, period * 60 * 1000);

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


// Function to fetch sleep records using $.ajax wrapped in a Promise
function getLastSleepRecords(x, callback) {
    $.ajax({
      url: '/get-last-sleep-records',  // Adjusted endpoint
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ limit: x }), // Send the number of records you want
      success: function(data) {
        if (data && Array.isArray(data)) {
          callback(null, data);  // Call the callback with the data
        } else {
          alert('No sleep records found');
          callback(null, null);  // Call with null if no data
        }
      },
      error: function(error) {
        console.error('Error fetching sleep records:', error);
        callback(error, null);  // Call the callback with the error
      }
    });
  }
  
  // Function to call backend and get real-time metrics
  function getRealTimeMetrics(datetime, period, callback) {
    if(datetime == "now")datetime = new Date().toISOString().slice(0, 16);
    $.ajax({
      url: '/get-realtime-metrics',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        datetime: datetime,
        period: period
      }),
      success: function(response) {
        console.log(response);
        callback(null, response);  // Call the callback with the response data
      },
      error: function(error) {
        callback(error, null);  // Call the callback with the error
      }
    });
  }
  
  // Function to populate the graph with average data
function populateGraphWithAverage(x) {
    getLastSleepRecords(x, function(error, sleepRecords) {
      if (error) {
        console.error('Error fetching sleep records:', error);
        return;
      }
  
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
        // Call the getRealTimeMetrics function without async/await
        getRealTimeMetrics(currentDatetime.toISOString(), evaluationPeriod, function(metricsError, metrics) {
          if (metricsError) {
            console.error('Error fetching real-time metrics:', metricsError);
            return;
          }
  
          // Update the graph with the received data
          updateGraph(currentDatetime, metrics);
  
          // Move to the next period (advance by evaluationPeriod minutes)
          currentDatetime.setMinutes(currentDatetime.getMinutes() + evaluationPeriod);
        });
      }
  
      console.log('Graph populated with average metrics.');
    });
}
  
  // Function to update the graph with new data
  function updateGraph(datetime, metrics) {
    // Example update function, you can implement your graph update logic here
    console.log('Updating graph with data for:', datetime);
    console.log('Metrics:', metrics);
    // Update the chart here (e.g., using a chart library)
  }
  
  // Call the function to populate the graph with the most recent sleep data
  if(!sleeping){
    //populateGraphWithAverage(1);
  }
  