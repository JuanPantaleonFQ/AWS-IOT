async function createChartForSleepAnalysis(n, date) {
    // Select the container where the charts will be added
    const container = document.querySelector('#right');

    if (!container) {
        console.error('Container #content-right not found');
        return;
    }
    

    // Create a card with a canvas element for the chart
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h2');
    title.textContent = date;

    const canvas = document.createElement('canvas');
    canvas.id = 'nightlyChart' + n;
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
    charts[n] = new Chart(ctx, {
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

    return charts[n];
}

async function getRecoredsByFilter() {
    try {
        column = $("#column").val();
        operand = $("#symbol").val();
        value = $("#value").val();

        if (value == "") {
            return sleepRecords = await getLastSleepRecords(5);
        }

        const response = await $.ajax({
            url: '/get-records-by-filter',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ column, operand, value }),
        });

        if (response && Array.isArray(response)) {
            console.log(response)
            return response;
        } else {
            throw new Error('No matching records found');
        }
    } catch (error) {
        console.error('Error fetching records:', error);
        throw error;
    }
}

function search(){
    populateGraphWithAverage(null, 10, true);
}

