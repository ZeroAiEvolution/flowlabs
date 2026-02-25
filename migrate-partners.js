
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (error) {
    console.error('Could not read .env file');
    process.exit(1);
}
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        env[key] = value;
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const partners = [
    {
        name: 'Marwadi University',
        logoPath: 'src/assets/partners/marwadi-university.png',
        url: 'https://www.marwadiuniversity.ac.in/'
    },
    {
        name: 'Robotics Club',
        logoPath: 'src/assets/partners/robotics-club.png',
        url: 'https://murobotics.marwadiuniversity.ac.in/'
    },
    {
        name: 'Mind Lab',
        logoPath: 'src/assets/partners/mind-lab.png',
        url: null
    },
    {
        name: 'Intellify',
        logoPath: 'src/assets/partners/intellify.png',
        url: 'https://www.intellify.marwadiuniversity.ac.in/'
    },
];

async function migrate() {
    console.log('Starting migration...');

    for (const [index, partner] of partners.entries()) {
        console.log(`Processing ${partner.name}...`);

        try {
            // 1. Read file
            const filePath = path.resolve(process.cwd(), partner.logoPath);
            if (!fs.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                continue;
            }
            const fileBuffer = fs.readFileSync(filePath);
            const fileName = `partner-${Date.now()}-${index}.png`;

            // 2. Upload to Storage (bucket: 'banners' which we are reusing)
            // Note: We are using 'banners' bucket because creating new buckets via SDK is restricted usually
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('banners')
                .upload(fileName, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // 3. Get Public URL
            const { data: urlData } = supabase.storage
                .from('banners')
                .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;

            // 4. Insert into DB
            const { error: insertError } = await supabase
                .from('community_partners')
                .insert({
                    name: partner.name,
                    logo_url: publicUrl,
                    website_url: partner.url,
                    is_active: true,
                    display_order: index
                });

            if (insertError) {
                throw new Error(`DB Insert failed: ${insertError.message}`);
            }

            console.log(`✅ Migrated: ${partner.name}`);

        } catch (err) {
            console.error(`❌ Failed to migrate ${partner.name}:`, err.message);
        }
    }
}

migrate().catch((error) => {
    console.error('Unexpected migration error:', error);
    process.exit(1);
});
