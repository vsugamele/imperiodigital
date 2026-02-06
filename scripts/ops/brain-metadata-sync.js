const fs = require('fs');
const path = require('path');

/**
 * 🧠 BRAIN METADATA SYNC
 * Consolidates all intelligence data (Gurus, Workers, Profiles, Platforms)
 * into a single JSON for the Command Center.
 */

const { WORKERS_DATA, GURUS_DATA } = require('./minds-api');

const PROFILES_DATA = {
    teo: { project: 'igaming', status: 'active', platform: 'instagram' },
    jonathan: { project: 'igaming', status: 'active', platform: 'instagram' },
    pedro: { project: 'igaming', status: 'active', platform: 'instagram' },
    laise: { project: 'igaming', status: 'active', platform: 'instagram' },
    petselect: { project: 'igaming', status: 'setting_up', platform: 'instagram' },
    refugiodivinos: { project: 'religion', status: 'active', platform: 'instagram' }
};

const PLATFORMS_AUDIT = {
    instagram: { support: 'full', priority: 1, potential: 'maximized' },
    tiktok: { support: 'pending', priority: 1, potential: 'massive' },
    youtube_shorts: { support: 'pending', priority: 2, potential: 'high' },
    threads: { support: 'none', priority: 3, potential: 'medium' }
};

async function sync() {
    console.log('🧠 [BRAIN] Sincronizando metadados de inteligência...');

    const brainData = {
        updatedAt: new Date().toISOString(),
        version: '1.2.0',
        minds: {
            workers: WORKERS_DATA,
            gurus: GURUS_DATA
        },
        profiles: PROFILES_DATA,
        platforms: PLATFORMS_AUDIT,
        systemHealth: {
            hubConnected: true,
            watchdogActive: true,
            alertingConfigured: true
        }
    };

    const outputPath = path.join(__dirname, '..', '..', 'ops-dashboard', 'data', 'brain-intelligence.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(brainData, null, 2));

    console.log(`✅ [BRAIN] Metadados salvos em: ${path.basename(outputPath)}`);
}

if (require.main === module) {
    sync().catch(console.error);
}

module.exports = { sync };
