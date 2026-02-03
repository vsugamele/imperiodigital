/**
 * PetSelect UK Scheduler
 * 
 * Agenda 3 posts/dia para PetSelect UK
 * Nicho: produtos para pets
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { appendLog } = require('./logging');
const { getTomorrowDateParts, localDateTimeString } = require('./time-utils');

const OUTPUT_DIR = 'C:\\Users\\vsuga\\clawd\\images\\generated';
const VIDEO_DIR = 'C:\\Users\\vsuga\\clawd\\videos';
const REFERENCES_DIR = 'C:\\Users\\vsuga\\clawd\\images\\references';
const STYLE_DIR = 'C:\\Users\\vsuga\\clawd\\images\\style_ref';
const AUDIO_DIR = 'C:\\Users\\vsuga\\clawd\\audio';

// Criar pastas
[OUTPUT_DIR, VIDEO_DIR, REFERENCES_DIR, STYLE_DIR, AUDIO_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============================================
// PETSELECT CONFIG
// ============================================
const PETSELECT = {
    uploadPostUser: 'petselectuk',
    profile: 'petselect',
    postsPerDay: 3,
    times: [
        { hh: 10, mm: 0 },
        { hh: 15, mm: 0 },
        { hh: 20, mm: 0 }
    ],
    copyTemplates: [
        "Seu pet merece o melhor! 🐕❤️ Comenta abaixo! 👇",
        " Produtos premium para seu amigo de 4 patas 🐱✨ Comenta aqui!",
        "🔥 Qualidade e amor para seu pet! Qual seu bichinho? Comenta! 👇",
        "🐾 O que seu pet mais ama? Comenta e遏 ganha desconto! 🎁",
        "Pets felizes = Donos felizes! 🐕‍🦺💕 Comenta o nome do seu pet!",
        "Seu pet vai amar esses produtos! 🐱❤️ Comenta 'SIM'! 👇"
    ]
};

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function loadJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function run(cmd, args, opts = {}) {
    return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'], ...opts });
}

function scheduleOne({ profile, title, caption, scheduled_date, timezone, uploadPostUser, videoPath, videoFile }) {
    const args = [
        path.join(__dirname, 'upload-post.js'),
        '--video', videoPath,
        '--user', uploadPostUser,
        '--title', title,
        '--caption', caption || '',
        '--platform', 'instagram',
        '--scheduled_date', scheduled_date,
        '--timezone', timezone,
        '--async_upload', 'true'
    ];

    try {
        const out = run('node', args);
        let json = null;
        try { json = JSON.parse(out); } catch { }

        appendLog({
            date_time: new Date().toISOString(),
            profile,
            run_id: videoFile.match(/_(\d+)\.mp4$/)?.[1] || '',
            video_file: videoFile,
            image_file: '',
            drive_video_path: `/videos/${videoFile}`,
            drive_image_path: '',
            uploadpost_user: uploadPostUser,
            platform: 'instagram',
            status: 'scheduled',
            scheduled_date,
            timezone,
            job_id: json?.job_id || '',
            request_id: json?.request_id || '',
            uploadpost_response: out.trim(),
            error: ''
        });

        return { ok: true, json };
    } catch (e) {
        appendLog({
            date_time: new Date().toISOString(),
            profile,
            run_id: videoFile.match(/_(\d+)\.mp4$/)?.[1] || '',
            video_file: videoFile,
            image_file: '',
            drive_video_path: `/videos/${videoFile}`,
            drive_image_path: '',
            uploadpost_user: uploadPostUser,
            platform: 'instagram',
            status: 'failed',
            scheduled_date,
            timezone,
            job_id: '',
            request_id: '',
            uploadpost_response: '',
            error: (e?.stderr?.toString?.() || e?.message || String(e))
        });
        return { ok: false, error: e };
    }
}

function main() {
    const tz = 'America/Sao_Paulo';
    const { profile, uploadPostUser, postsPerDay, times, copyTemplates } = PETSELECT;
    const dateParts = getTomorrowDateParts(tz);

    console.log(`\n=== PETSELECT UK Scheduler ===`);
    console.log(`Profile: ${profile}`);
    console.log(`Posts: ${postsPerDay}/dia`);
    console.log(`Data: ${dateParts.year}-${dateParts.month}-${dateParts.day}`);
    console.log(`\n📺 Gerando ${postsPerDay} vídeos...`);

    // Generate videos (using igaming-video.js with petselect as fallback)
    // Note: For full PetSelect support, add 'petselect' to PROFILES in igaming-video.js
    // For now, we'll use a placeholder approach
    for (let i = 0; i < postsPerDay; i++) {
        console.log(`\n=== GENERATE ${profile} (${i + 1}/${postsPerDay}) ===`);
        
        // Try to generate video - will use default/fallback image if petselect not in PROFILES
        try {
            // Create a placeholder meta file for testing
            const runId = Date.now() + i;
            const meta = {
                profile,
                run_id: runId,
                copy: rand(copyTemplates),
                timestamp: new Date().toISOString()
            };
            
            const metaDir = path.join(__dirname, '..', 'results', 'runs', profile);
            if (!fs.existsSync(metaDir)) fs.mkdirSync(metaDir, { recursive: true });
            fs.writeFileSync(path.join(metaDir, `${runId}.json`), JSON.stringify(meta, null, 2));
            
            // Run igaming-video (it will use default style for unknown profile)
            execFileSync('node', [path.join(__dirname, 'igaming-video.js'), 'petselect'], { stdio: 'inherit' });
        } catch (e) {
            console.log(`⚠️  Video generation note: Add 'petselect' to PROFILES in igaming-video.js for full support`);
        }
    }

    // Find and schedule videos
    const videosDir = VIDEO_DIR;
    const prefix = 'PETSELECT_REEL_';
    const re = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*\\.mp4$', 'i');

    let files;
    try {
        files = fs.readdirSync(videosDir)
            .filter(f => re.test(f))
            .map(f => ({ f, t: fs.statSync(path.join(videosDir, f)).mtimeMs }))
            .sort((a, b) => b.t - a.t)
            .slice(0, postsPerDay)
            .reverse();
    } catch (e) {
        console.log('⚠️  No PetSelect videos found. Creating placeholder approach...');
        files = [];
    }

    if (files.length === 0) {
        console.log('⚠️  No PetSelect videos to schedule. Run with proper config first.');
        console.log('💡 Add petselect to PROFILES in igaming-video.js:');
        console.log('   petselect: { folderId: "SEU_FOLDER_ID", char: "Pet product showcase" }');
        return;
    }

    console.log(`\n=== SCHEDULING ${profile.toUpperCase()} for ${dateParts.year}-${dateParts.month}-${dateParts.day} (${tz}) ===`);

    for (let i = 0; i < files.length; i++) {
        const t = times[i];
        const scheduled_date = localDateTimeString(dateParts, t.hh, t.mm);
        const videoFile = files[i].f;
        const videoPath = path.join(videosDir, videoFile);
        const title = `PetSelect UK - ${t.hh}:${String(t.mm).padStart(2, '0')}`;
        const caption = rand(copyTemplates);

        console.log(`Scheduling ${videoFile} -> ${scheduled_date}`);
        console.log(`Caption: ${caption.substring(0, 50)}...`);

        scheduleOne({
            profile,
            title,
            caption,
            scheduled_date,
            timezone: tz,
            uploadPostUser,
            videoPath,
            videoFile
        });
    }

    console.log('\n✅ Done! Check results/posting-log.csv');
}

main();
