async function createChartForSleepAnalysis() {
    // Select the container where the charts will be added
    const container = document.querySelector('#content-right');

    if (!container) {
        console.error('Container #content-right not found');
        return;
    }

    // Create a card with a canvas element for the chart
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h2');
    title.textContent = 'Last Night Sleep Analysis';

    const canvas = document.createElement('canvas');
    canvas.id = 'nightlyChart';
    canvas.style.display = 'block';
    canvas.style.boxSizing = 'border-box';
    canvas.style.height = '162px';
    canvas.style.width = '324px';
    canvas.width = 648;
    canvas.height = 324;

    card.appendChild(title);
    card.appendChild(canvas);
    container.appendChild(card);

    // Initialize the chart
    const ctx = canvas.getContext('2d');
    const graph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],  // Time labels
            datasets: [
                {
                    label: 'Movements',
                    data: [],
                    borderColor: 'blue',
                    fill: false,
                },
                {
                    label: 'Humidity',
                    data: [],
                    borderColor: 'green',
                    fill: false,
                },
                {
                    label: 'Light',
                    data: [],
                    borderColor: 'yellow',
                    fill: false,
                },
                {
                    label: 'Temperature',
                    data: [],
                    borderColor: 'red',
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Hours)',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Metrics',
                    },
                },
            },
        },
    });

    // Populate the chart with data
    const x = 10; // Set the number of sleep records to fetch
    await populateGraphWithAverage(graph, x, true);
}