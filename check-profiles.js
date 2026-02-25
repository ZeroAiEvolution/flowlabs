
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
const anonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !serviceKey || !anonKey) {
    console.error('Missing required .env values: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_PUBLISHABLE_KEY');
    process.exit(1);
}

async function checkProfiles() {
    console.log('--- Checking Profiles ---');

    // 1. Check with Service Role (Bypasses RLS)
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: allProfiles, error: adminError } = await adminClient
        .from('profiles')
        .select('id, full_name, user_id');

    if (adminError) console.error('Admin fetch error:', adminError);
    console.log(`Total Profiles (Service Role): ${allProfiles?.length || 0}`);
    if (allProfiles) console.table(allProfiles);

    // 2. Check with Anon Key (Respects RLS) - simulating unauthenticated view
    // Note: RLS 'true' should allow this.
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: visibleProfiles, error: anonError } = await anonClient
        .from('profiles')
        .select('id, full_name');

    if (anonError) console.error('Anon fetch error:', anonError);
    console.log(`Visible Profiles (Anon/RLS): ${visibleProfiles?.length || 0}`);
}

checkProfiles().catch((error) => {
    console.error('Unexpected error while checking profiles:', error);
    process.exit(1);
});
