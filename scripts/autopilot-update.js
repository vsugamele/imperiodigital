const fs = require('fs');

const tasksPath = 'ops-dashboard/tasks.json';
const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));

// Find B7 task and move to doing
const b7Task = tasks.tasks.find(t => t.id === 'B7');
if (b7Task && b7Task.status === 'backlog') {
    b7Task.status = 'doing';
    b7Task.updatedAt = new Date().toISOString();
    b7Task.notes = 'DOING: Started integration research. Need Mercado Pago API credentials.';
}

tasks.updatedAt = new Date().toISOString();
fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
console.log('✅ B7 moved to DOING');
