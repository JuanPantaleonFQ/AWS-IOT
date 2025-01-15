var datetime = "now";
var period = 60;

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

function getRealTimeMetrics(datetime, period) {
  if(datetime == "now")datetime = new Date().toISOString().slice(0, 16);
  $.ajax({
    url: '/get-realtime-metrics',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ datetime: datetime, period: period }),
    success: function(data) {
      if (data.error || data.message) {
        alert('Error: ' + (data.error || data.message));
      } else {
        console.log(data);

        // Extract the relevant data from the response
        const newLabel = datetime.slice(11, 16);  // Extract time (HH:MM) as label
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
      }
    },
    error: function(error) {
      console.error('Error fetching metrics:', error);
      alert('Failed to fetch metrics. Please try again.');
    }
  });
}

// Initialize
createChart();

setInterval(function() {
  getRealTimeMetrics("now", 5); // Call with "now" for real-time data and 5-minute period
}, 300000); 