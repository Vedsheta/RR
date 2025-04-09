const processes = [];

document.getElementById('addProcess').addEventListener('click', () => {
    const processName = document.getElementById('processName').value;
    const arrivalTime = document.getElementById('arrivalTime').value;
    const burstTime = document.getElementById('burstTime').value;

    if (processName && arrivalTime >= 0 && burstTime > 0) {
        processes.push({
            name: processName,
            arrival: parseInt(arrivalTime),
            burst: parseInt(burstTime),
        });
        updateProcessList();
    }
});

document.getElementById('calculateSchedule').addEventListener('click', () => {
    const timeQuantum = prompt("Enter Time Quantum:");
    if (timeQuantum && timeQuantum > 0) {
        const result = roundRobinScheduling(processes, parseInt(timeQuantum));
        displaySchedule(result);
    }
});

function updateProcessList() {
    const list = document.getElementById('processList');
    list.innerHTML = processes.map(
        p => `<li>${p.name} - Arrival: ${p.arrival}, Burst Time: ${p.burst}</li>`
    ).join('');
}

function roundRobinScheduling(processes, timeQuantum) {
    let time = 0;
    const n = processes.length;

    const procInfo = processes.map(p => ({
        name: p.name,
        arrival: p.arrival,
        burst: p.burst,
        remainingBurst: p.burst,
        completion: 0,
        turnaround: 0,
        waiting: 0,
        response: null,
    }));

    const queue = [];
    let idx = 0;

    procInfo.sort((a, b) => a.arrival - b.arrival);

    while (idx < n && procInfo[idx].arrival <= time) {
        queue.push(procInfo[idx]);
        idx++;
    }

    while (queue.length > 0 || idx < n) {
        if (queue.length === 0) {
            time = procInfo[idx].arrival;
            while (idx < n && procInfo[idx].arrival <= time) {
                queue.push(procInfo[idx]);
                idx++;
            }
        }

        const current = queue.shift();

        if (current.response === null) {
            current.response = time - current.arrival;
        }

        const execTime = Math.min(current.remainingBurst, timeQuantum);
        time += execTime;
        current.remainingBurst -= execTime;

        while (idx < n && procInfo[idx].arrival <= time) {
            queue.push(procInfo[idx]);
            idx++;
        }

        if (current.remainingBurst > 0) {
            queue.push(current);
        } else {
            current.completion = time;
            current.turnaround = current.completion - current.arrival;
            current.waiting = current.turnaround - current.burst;
        }
    }

    return procInfo;
}

function displaySchedule(schedule) {
    const output = document.getElementById('scheduleOutput');

    const avgWaiting = (schedule.reduce((sum, p) => sum + p.waiting, 0) / schedule.length).toFixed(2);
    const avgTurnaround = (schedule.reduce((sum, p) => sum + p.turnaround, 0) / schedule.length).toFixed(2);
    const avgResponse = (schedule.reduce((sum, p) => sum + p.response, 0) / schedule.length).toFixed(2);

    output.innerHTML = `
        <h3>Schedule:</h3>
        <table>
            <thead>
                <tr>
                    <th>Process</th>
                    <th>Arrival</th>
                    <th>Burst</th>
                    <th>Completion</th>
                    <th>Turnaround</th>
                    <th>Waiting</th>
                    <th>Response</th>
                </tr>
            </thead>
            <tbody>
                ${schedule.map(
                    s => `
                        <tr>
                            <td>${s.name}</td>
                            <td>${s.arrival}</td>
                            <td>${s.burst}</td>
                            <td>${s.completion}</td>
                            <td>${s.turnaround}</td>
                            <td>${s.waiting}</td>
                            <td>${s.response}</td>
                        </tr>
                    `
                ).join('')}
            </tbody>
        </table>
        <div class="averages">
            <p><strong>Average Waiting Time:</strong> ${avgWaiting}</p>
            <p><strong>Average Turnaround Time:</strong> ${avgTurnaround}</p>
            <p><strong>Average Response Time:</strong> ${avgResponse}</p>
        </div>
    `;
}
