# The Wall

A small, nostalgic 2008-style social wall built as a full-stack job-application demo. Visitors can post a message and optional photo without logging in; Supabase stores the posts and streams new ones to connected browsers.

## Features

- Latest 50 posts, newest first, persisted in Supabase.
- Live post updates through Supabase Realtime, with duplicate protection.
- Editable author name remembered in the browser.
- 280-character message limit in the interface and database.
- Optional JPG, PNG, WEBP, or GIF upload (up to 5 MB) with preview.
- Loading skeleton, empty state, submit feedback, and relative timestamps.
- Responsive two-column nostalgic wall layout.

## Stack

- Next.js 15 App Router, React 19, TypeScript (strict)
- Tailwind CSS 4
- Supabase Postgres, Realtime, and Storage
- Vercel deployment target

## Supabase setup

1. Create a Supabase project at [supabase.com](https://supabase.com/).
2. In the project dashboard, open **SQL Editor**, create a query, paste in [`supabase/schema.sql`](./supabase/schema.sql), and run it.
3. Open **Database → Publications** (or **Database → Replication**, depending on the dashboard version) and verify `posts` is enabled in the `supabase_realtime` publication. The schema adds it automatically. If it is already present and the SQL reports a duplicate membership, verify the table is listed and skip that one statement when rerunning the script.
4. Open **Storage** and verify a public bucket named `wall-photos` exists. Its file limit is 5 MB and its allowed types are JPG, PNG, WEBP, and GIF. Check the bucket's public setting.
5. In **Project Settings → API** (sometimes shown as **Data API**), copy the **Project URL** and the **anon / publishable public key**. Do not use a `service_role` or secret key in this browser app.

The schema grants only anonymous `SELECT` and `INSERT` access for posts, plus public photo reads and anonymous inserts scoped to `wall-photos`. There are intentionally no post update/delete policies.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values from the Supabase API settings:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

`.env.local` is ignored by Git. Never place a service-role key in a `NEXT_PUBLIC_` variable or commit real credentials.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A configured Supabase project is required to load or post. Before submitting changes, run:

```bash
npm run lint
npm run build
```

Replace [`public/profile-placeholder.svg`](./public/profile-placeholder.svg) with a profile image of your choice. The placeholder is local and can be swapped without code changes.

## Publish on GitHub and deploy on Vercel

1. Create a **public** repository on GitHub (leave it empty if you already initialized Git here). In a terminal at the project folder, add the repository remote and push:

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git branch -M main
   git push -u origin main
   ```

2. In Vercel, choose **Add New → Project**, import the public GitHub repository, and keep the detected Next.js settings.
3. In the import/deployment settings, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` using the Project URL and anon public key from Supabase. Add them to **Production** (and Preview/Development if you want those deployments connected too).
4. Deploy. If you added the environment variables after the initial deployment, open **Deployments**, choose the latest production deployment's menu, and select **Redeploy**. Environment changes only apply to new deployments.
5. To find the public production URL, open the Vercel project's **Overview** or **Domains** page and copy the domain marked **Production** (usually `https://<project-name>.vercel.app`). Do not submit a Preview deployment URL.

## Troubleshooting

- **Posts are not saving:** Confirm both environment variables are set, then rerun the posts section of `schema.sql` and check that the `anon` insert policy is enabled on `public.posts`. Browser requests must use only the anon/public key.
- **Realtime is not updating:** Confirm `public.posts` is included in `supabase_realtime` under Database Publications/Replication. Check the browser console and project Realtime status; reload the page after enabling it.
- **Photo upload fails:** Verify the bucket is named exactly `wall-photos`, is public, and has the anonymous insert policy on `storage.objects` scoped to `bucket_id = 'wall-photos'`. Files must be JPG/PNG/WEBP/GIF and no larger than 5 MB.
- **Vercel reports missing env vars:** Set both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under Project Settings → Environment Variables, enable them for Production, then redeploy.
- **Schema complains about Realtime table membership on rerun:** Verify `posts` is already listed in the `supabase_realtime` publication. PostgreSQL may reject adding the same table twice; if so, omit only the `alter publication` statement on subsequent runs.

## Project links

- Live production URL: **[Add production URL]**
- Public GitHub repository: **[Add repository URL]**
- Screenshots: **[Add screenshot links, including a posted message]**
- Optional demo video: **[Add video link]**

## Final submission checklist

- [ ] Live production URL (not a Vercel preview URL)
- [ ] Public GitHub repository URL
- [ ] Screenshots of the wall, including a successfully posted message
- [ ] Optional short demo video
- [ ] Confirm a post remains after refresh and a second browser receives it live
- [ ] Confirm the character limit and photo upload work

### Draft reviewer notes

I built this wall with AI tools as part of the implementation and validation process. It saves posts to Supabase and uses Realtime to show new messages without refreshing. The composer enforces a 280-character limit in both the UI and database. Visitors can also attach an image, with client-side type and size validation and a preview before upload.
