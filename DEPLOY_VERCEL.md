# Deploy Flow Lab Connect (GitHub -> Vercel)

## 1) Push code to GitHub

1. Initialize git (skip if already initialized):
   - `git init`
2. Add remote:
   - `git remote add origin https://github.com/<your-username>/<your-repo>.git`
3. Commit and push:
   - `git add .`
   - `git commit -m "chore: fix scripts and prepare deployment"`
   - `git branch -M main`
   - `git push -u origin main`

## 2) Connect GitHub repo to Vercel

1. Sign in at Vercel and click **Add New Project**.
2. Import your GitHub repository.
3. Configure project:
   - If this is a Vite app source repo, set:
     - **Build Command**: `npm run build` (or `bun run build`)
     - **Output Directory**: `dist`
   - If you are deploying prebuilt static files only, set output to `dist` and no build command.
4. Add environment variables in Vercel Project Settings:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
5. Deploy.

## 3) Supabase safety notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` only for backend/admin scripts.
- Never put service role key in frontend source code.
- Rotate the service role key in Supabase if it was ever committed before.

## 4) Re-deploy flow

- Push to `main` on GitHub.
- Vercel auto-deploys new commits.
