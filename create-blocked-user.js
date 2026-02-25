
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

async function createBlockedUser() {
    console.log('Creating User (Bypassing Rate Limit)...');

    const email = env.BLOCKED_USER_EMAIL;
    const password = env.BLOCKED_USER_PASSWORD;
    const fullName = env.BLOCKED_USER_FULL_NAME || 'Blocked User';
    const profession = env.BLOCKED_USER_PROFESSION || 'student';

    if (!email || !password) {
        console.error('Error: Set BLOCKED_USER_EMAIL and BLOCKED_USER_PASSWORD in .env');
        process.exit(1);
    }

    try {
        // 1. Check if user exists
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
            console.error('Error listing users:', listError.message);
            return;
        }

        let existingUser = users.find(u => u.email === email);

        if (existingUser) {
            console.log('User already exists. Updating/Confirming...');
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                {
                    password: password,
                    email_confirm: true,
                    user_metadata: { full_name: fullName, profession: profession }
                }
            );

            if (updateError) {
                console.error('Error updating user:', updateError.message);
            } else {
                console.log('✅ User updated & confirmed!');
            }

            // Ensure profile exists
            await ensureProfile(existingUser.id, fullName, profession);

        } else {
            console.log('Creating new user...');
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName, profession: profession }
            });

            if (createError) {
                console.error('Error creating user:', createError.message);
                return;
            }

            console.log('✅ User created & confirmed!');
            // Profile is usually created by trigger, but we can double check
            if (newUser.user) {
                await ensureProfile(newUser.user.id, fullName, profession);
            }
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

async function ensureProfile(userId, fullName, profession) {
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (profileError) {
        console.error('Error checking profile:', profileError.message);
        return;
    }

    if (!profile) {
        console.log('Creating profile record...');
        const { error: insertError } = await supabase.from('profiles').insert({
            id: userId,
            user_id: userId,
            full_name: fullName,
            profession: profession
        });

        if (insertError) {
            console.error('Error creating profile:', insertError.message);
        }
    } else {
        console.log('Profile already exists.');
    }
}

createBlockedUser().catch((error) => {
    console.error('Unexpected error while creating blocked user:', error);
    process.exit(1);
});
