
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env file manually
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
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

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Error: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function findAuthUserByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    let page = 1;
    const perPage = 200;

    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
        if (error) {
            throw new Error(`Error listing users: ${error.message}`);
        }

        const users = data?.users ?? [];
        const foundUser = users.find((u) => (u.email || '').toLowerCase() === normalizedEmail);
        if (foundUser) {
            return foundUser;
        }

        if (users.length < perPage) {
            return null;
        }

        page += 1;
    }
}

async function fixAdminProfile() {
    console.log('Fixing Admin Profile...');

    const MAIN_EMAIL = env.MAIN_ADMIN_EMAIL || 'admin@flowlab.connect';

    try {
        // 1. Get Main Admin ID
        const mainAdmin = await findAuthUserByEmail(MAIN_EMAIL);

        if (!mainAdmin) {
            console.error(`Main admin (${MAIN_EMAIL}) not found!`);
            return;
        }

        const userId = mainAdmin.id;
        console.log(`Main Admin ID: ${userId}`);

        // 2. Check/Create Profile
        const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (profileError) {
            console.error('Error reading profile:', profileError.message);
            return;
        }

        if (!existingProfile) {
            console.log('Profile missing. Creating...');
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    user_id: userId,
                    full_name: 'Main Admin',
                    profession: 'professional',
                    bio: 'System Administrator'
                });

            if (insertError) console.error('Error creating profile:', insertError);
            else console.log('✅ Profile created successfully.');
        } else {
            console.log('Profile exists. Updating name...');
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ full_name: 'Main Admin' })
                .eq('user_id', userId);

            if (updateError) console.error('Error updating profile:', updateError);
            else console.log('✅ Profile name updated to "Main Admin".');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

fixAdminProfile().catch((error) => {
    console.error('Unexpected error while fixing admin profile:', error);
    process.exit(1);
});
