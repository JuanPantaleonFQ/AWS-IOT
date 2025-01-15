// Store chart instances globally
let charts = {};
var evaluationPeriod = 60;

var w1 = 0.3,w2 = 0.2, w3 = 0.5;

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
                },
                {
                    type: 'bar',
                    label: 'Movements',
                    data: data.movements,
                    backgroundColor: '#60a5fa',
                    yAxisID: 'movements'
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
                data: data.quality,
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
    const data = {
        consistency: [], // to hold labels
        regularity: []   // to hold sleep regularity scores
    };

    if (charts.regularity) {
        charts.regularity.destroy(); // Destroy existing chart before creating a new one
    }

    charts.regularity = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.consistency, // This will hold the labels (dates)
            datasets: [{
                label: 'Sleep Regularity',
                data: data.regularity, // This will hold the scores
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
  

async function populateGraphWithAverage(graph, x, dynamic) {
    try {
        if(dynamic){
            $("#right").children().not("#statusBar").remove();
            var sleepRecords = await getRecoredsByFilter() 
        }
        else{
            var sleepRecords = await getLastSleepRecords(x);
        }

        if (!sleepRecords || sleepRecords.length === 0) {
            console.error('No sleep records found');
            return;
        }

        // Loop through all sleep records
        for (var n = 0; n < sleepRecords.length; n++) {
            let record =  sleepRecords[n];
            const startDate = new Date(record.start_date);
            const endDate = record.end_date ? new Date(record.end_date) : new Date(); // Use current time if no end_date

            if (dynamic) {
                graph = await createChartForSleepAnalysis(n,`${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}/${startDate.getFullYear().toString().slice(-2)}`);
            }

            // Calculate the number of minutes slept for the current sleep record
            const periodInMinutes = Math.floor((endDate - startDate) / (1000 * 60)); // Period in minutes
            let currentDatetime = startDate;

            // Loop through each period and fetch the real-time metrics for this sleep record
            for (let i = 0; i <= periodInMinutes; i += evaluationPeriod) {
                try {
                    // Await the real-time metrics for the current period
                    const data = await getRealTimeMetrics(currentDatetime.toISOString(), evaluationPeriod);

                    // Update the graph with the received data
                    updateQualityGraph(graph, currentDatetime, data);

                    // Move to the next period (advance by evaluationPeriod minutes)
                    currentDatetime.setMinutes(currentDatetime.getMinutes() + evaluationPeriod);
                } catch (error) {
                    console.error('Error fetching real-time metrics for period starting at ' + currentDatetime.toISOString(), error);
                }
            }
        }

    } catch (error) {
        console.error('Error populating graph with average metrics:', error);
    }
}


function updateQualityGraph(graph, datetime, metrics) {
    // Add the new data to the chart data arrays
    const hour = new Date(datetime).getHours();  // Extract the hour from datetime
    graph.data.labels.push(`${hour}:00`);

    graph.data.datasets[0].data.push(metrics.totalMotion);  // Movements
    graph.data.datasets[1].data.push(metrics.averageHumidity);  // Humidity
    graph.data.datasets[2].data.push(metrics.averageLux);  // Light
    graph.data.datasets[3].data.push(metrics.averageTemperature);  // Temperature

    // Update the chart
    graph.update();
}

async function populateGraphWithScore(nDays){ 
    const sleepRecords = await getLastSleepRecords(nDays);

    for (let i = 0; i < sleepRecords.length; i++) {
        const sleepDay = {
            start_date: new Date(sleepRecords[i].start_date),
            end_date: new Date(sleepRecords[i].end_date),
            score: sleepRecords[i].score,
            w1: w1,
            w2: w2,
            w3: w3
        };
        
        try {
            // Using await to ensure that each AJAX call is completed before moving on
            const response = await $.ajax({
                url: '/calculate-sleeping-score',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(sleepDay)
            });
            charts.quality.data.datasets[0].data.push(response.totalScore);
            charts.quality.data.labels.push(new Date(sleepDay.start_date).toLocaleDateString());  // Update labels too
        } catch (error) {
            console.error('Error calculating score:', error);
            alert('An error occurred while calculating the score. Please try again.');
        }
    }

    // After the loop finishes, update the chart once
    charts.quality.update();
}

async function populateSleepConcistency(nDays) {
    const sleepRecords = await getLastSleepRecords(nDays);
    console.log(sleepRecords);
    
    // Loop through each record to calculate the sleep regularity score
    for (let i = sleepRecords.length - 1; i >= 0 ; i--) {
        const sleepDay = {
            sleepId: sleepRecords[i].id,
            currentSleepStart: new Date(sleepRecords[i].start_date),
            currentSleepStop: new Date(sleepRecords[i].end_date)
        };
        
        try {
            // Sending the sleep data to the server and getting the score back
            const response = await $.ajax({
                url: '/calculate-sleep-regularity-score',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(sleepDay)
            });

            console.log(response);

            // Push the new score to the chart's data
            charts.regularity.data.labels.push(new Date(sleepRecords[i].start_date).toLocaleDateString()); // Adding date to the labels
            charts.regularity.data.datasets[0].data.push(response.score); // Adding score to the chart data

            // Update the chart immediately after each push
            charts.regularity.update();

        } catch (error) {
            console.error('Error calculating score:', error);
            alert('An error occurred while calculating the score for day ' + (i + 1) + '. Please try again.');
        }
    }
}


$(document).ready(function () {   
  // Call the function to populate the graph with the most recent sleep data
  if(!sleeping){
    populateGraphWithAverage(charts.nightly, 1);
    populateGraphWithScore(15);
    populateSleepConcistency(15);
    populateGraphWithAverage(null, 15, true);
  }
}); 
