const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const STATUS_FILE = path.join(__dirname, '../memory/alex-status.json');

async function processBacklog() {
    console.log('--- Checking Backlog for [AUTO] tasks ---');

    // 1. Get the "Backlog" column ID
    const { data: cols } = await supabase
        .from('columns')
        .select('id, title')
        .eq('title', 'Backlog')
        .single();

    if (!cols) {
        console.error('Backlog column not found.');
        return;
    }

    // 2. Find cards starting with [AUTO]
    const { data: cards } = await supabase
        .from('cards')
        .select('id, title, description')
        .eq('column_id', cols.id)
        .ilike('title', '[AUTO]%');

    if (!cards || cards.length === 0) {
        console.log('No [AUTO] tasks found in Backlog.');
        return;
    }

    const task = cards[0];
    console.log(`Processing: ${task.title}`);

    // 3. Move to "Doing"
    const { data: doingCol } = await supabase
        .from('columns')
        .select('id')
        .eq('title', 'Doing')
        .single();

    if (doingCol) {
        await supabase.from('cards').update({ column_id: doingCol.id }).eq('id', task.id);
    }

    // 4. Update Status File
    updateAlexStatus(`Iniciando tarefa automática: ${task.title}`);

    console.log('Task moved to Doing.');
}

function updateAlexStatus(note) {
    try {
        let current = {};
        if (fs.existsSync(STATUS_FILE)) {
            current = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
        }

        current.state = 'working';
        current.updatedAtMs = Date.now();
        current.note = note;

        // Add to activity history
        if (!current.activity) current.activity = [];
        current.activity.push({
            time: new Date().toISOString(),
            action: note,
            result: 'in_progress'
        });

        // Keep last 10
        if (current.activity.length > 10) current.activity.shift();

        fs.writeFileSync(STATUS_FILE, JSON.stringify(current, null, 2));
    } catch (e) {
        console.error('Failed to update status file', e);
    }
}

// Run once (usually called by cron or pm2 interval)
processBacklog().catch(console.error);
