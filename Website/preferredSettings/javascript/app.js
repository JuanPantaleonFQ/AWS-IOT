// Initialize Lucide icons
lucide.createIcons();

// State
let preferences = {
  temperature: 2,
  humidity: 45,
  light: 150
};

let isDarkMode = true;

// DOM Elements
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const settingsButton = document.getElementById('settingsButton');
const settingsPanel = document.getElementById('settingsPanel');
const settingsForm = document.getElementById('settingsForm');
const closeButton = document.querySelector('.close-button');

// Theme Toggle
themeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  body.classList.toggle('dark');
  themeToggle.innerHTML = `<i data-lucide="${isDarkMode ? 'sun' : 'moon'}"></i>`;
  lucide.createIcons();
  updateChart();
});

// Settings Panel
settingsButton.addEventListener('click', () => {
  settingsPanel.classList.remove('hidden');
});

closeButton.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  preferences = {
    temperature: Number(document.getElementById('temperature').value),
    humidity: Number(document.getElementById('humidity').value),
    light: Number(document.getElementById('light').value)
  };
  updateMetrics();
  settingsPanel.classList.add('hidden');
});

// Update Metrics Display
function updateMetrics() {
  document.querySelector('.temperature').textContent = `${preferences.temperature}°C`;
  const secondaryMetrics = document.querySelector('.secondary-metrics');
  secondaryMetrics.innerHTML = `
    <span><i data-lucide="droplets"></i>${preferences.humidity}%</span>
    <span><i data-lucide="sun"></i>${preferences.light}</span>
  `;
  lucide.createIcons();
}

// Chart
const ctx = document.getElementById('metricsChart').getContext('2d');
let metricsChart;

function createChart() {
  const data = {
    labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
             '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
    datasets: [
      {
        type: 'line',
        label: 'Temperature (°C)',
        data: [2, 1.8, 1.5, 1.2, 1, 0.8, 0.5, 0.2, 0, 0.5, 1, 1.5, 2, 2.5, 3, 2.8, 2.5, 2.2, 2, 1.8, 1.5, 1.2, 1, 0.8],
        borderColor: '#00ffcc',
        backgroundColor: 'rgba(0, 255, 204, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y-metrics',
      },
      {
        type: 'line',
        label: 'Humidity (%)',
        data: [45, 46, 47, 48, 48, 49, 47, 45, 42, 44, 46, 48, 50, 49, 48, 47, 45, 44, 43, 42, 43, 44, 45, 46],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y-metrics',
      },
      {
        type: 'line',
        label: 'Light (lux)',
        data: [150, 140, 130, 120, 100, 90, 110, 140, 200, 190, 185, 180, 180, 175, 170, 165, 160, 155, 140, 130, 120, 110, 100, 90],
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y-metrics',
      },
      {
        type: 'bar',
        label: 'Movement',
        data: [2, 1, 0, 1, 0, 0, 1, 3, 5, 4, 3, 2, 4, 5, 6, 4, 3, 2, 1, 2, 1, 0, 1, 0],
        backgroundColor: 'rgba(236, 72, 153, 0.7)',
        borderColor: '#ec4899',
        borderWidth: 1,
        yAxisID: 'y-movement',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? 'white' : 'black',
        },
      },
    },
    scales: {
      'y-metrics': {
        type: 'linear',
        position: 'left',
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? 'white' : 'black',
        },
      },
      'y-movement': {
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: isDarkMode ? 'white' : 'black',
          stepSize: 1,
          max: 10,
        },
        title: {
          display: true,
          text: 'Movements per hour',
          color: isDarkMode ? 'white' : 'black',
        },
      },
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? 'white' : 'black',
        },
      },
    },
  };

  metricsChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
  });
}

function updateChart() {
  if (metricsChart) {
    metricsChart.destroy();
  }
  createChart();
}

// Initialize
createChart();
updateMetrics();