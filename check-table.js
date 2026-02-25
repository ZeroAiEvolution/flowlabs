
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env');
let envConfig = {};
try {
    envConfig = dotenv.parse(fs.readFileSync(envPath));
} catch (error) {
    console.error('Could not read .env file');
    process.exit(1);
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing required .env values: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function check() {
    console.log('Checking community_partners table...');
    const { count, error } = await supabase
        .from('community_partners')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Table exists. Count:', count ?? 0);
    }
}

check().catch((error) => {
    console.error('Unexpected error while checking table:', error);
    process.exit(1);
});
