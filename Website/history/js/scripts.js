// Store chart instances globally
let charts = {};

// Generate mock data for historical trends
function generateHistoricalData(days) {
    return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000),
        quality: 70 + Math.random() * 20,
        regularity: 75 + Math.random() * 15
    }));
}

// Generate mock data for nightly analysis
function generateNightlyData() {
    const hours = Array.from({length: 8}, (_, i) => `${22 + Math.floor(i/2)}:${i % 2 ? '30' : '00'}`);
    return {
        hours,
        movements: hours.map(() => Math.floor(Math.random() * 10)),
        humidity: hours.map(() => 40 + Math.random() * 20),
        light: hours.map(() => Math.random() * 15),
        temperature: hours.map(() => 18 + Math.random() * 5)
    };
}

// Generate mock data for sleep stages
function generateSleepStages() {
    return [
        { name: 'Deep Sleep', value: 20 + Math.random() * 10 },
        { name: 'REM Sleep', value: 15 + Math.random() * 10 },
        { name: 'Light Sleep', value: 45 + Math.random() * 10 }
    ];
}

// Create nightly analysis chart
function createNightlyChart() {
    const ctx = document.getElementById('nightlyChart');
    const data = generateNightlyData();
    
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
    const data = generateHistoricalData(30);
    
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
    const data = generateHistoricalData(30);
    
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

// Create sleep stages chart
function createStagesChart() {
    const ctx = document.getElementById('stagesChart');
    const data = generateSleepStages();
    
    if (charts.stages) {
        charts.stages.destroy();
    }

    charts.stages = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.name),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: ['#60a5fa', '#34d399', '#fbbf24']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
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
    createStagesChart();
}

// Initialize charts on load
document.addEventListener('DOMContentLoaded', initializeCharts);