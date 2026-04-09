# Jobinator

A career discovery app for students aged 16–22. Answer up to 20 yes/no questions and find out which of 60+ careers suits you best. Built with React, Vite, TypeScript, Tailwind CSS, and Supabase.

**Live demo:** https://mochmouri.github.io/Jobinator/

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/mochmouri/jobinator.git
cd jobinator
npm install
```

### 2. Create the Supabase project

Log in at https://supabase.com and create a new project. Run the following SQL in the SQL editor:

```sql
-- Professions
create table professions (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text not null,
  traits           jsonb not null default '[]',
  related_ids      uuid[] default '{}',
  feedback_score   int default 0,
  created_at       timestamptz default now()
);

-- Decision tree nodes
create table questions (
  id             uuid primary key default gen_random_uuid(),
  text           text not null,
  yes_next       uuid references questions(id),
  no_next        uuid references questions(id),
  profession_id  uuid references professions(id),
  is_root        boolean default false,
  created_at     timestamptz default now()
);

-- User-submitted improvement suggestions
create table suggestions (
  id                    uuid primary key default gen_random_uuid(),
  suggestion_text       text not null,
  shown_profession_id   uuid references professions(id),
  created_at            timestamptz default now()
);

-- RLS
alter table professions  enable row level security;
alter table questions    enable row level security;
alter table suggestions  enable row level security;

create policy "Public read professions"  on professions  for select using (true);
create policy "Public read questions"    on questions    for select using (true);
create policy "Public insert suggestions" on suggestions for insert with check (true);
create policy "Public feedback update"   on professions
  for update using (true) with check (true);
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in your Supabase project URL, anon key, and service role key in `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The anon key is used by the app at runtime. The service role key is used only by the seed script (it bypasses RLS to insert data) and never shipped to the browser.

Find both keys in your Supabase dashboard under **Project Settings → API**.

### 4. Seed the database

Make sure `professions.json` is in the project root, then run from inside the project directory:

```bash
npm run seed
```

This inserts all 60+ professions and the full decision tree.

### 5. Start the dev server

```bash
npm run dev
```

---

## Deploy

```bash
npm run deploy
```

Builds the app and pushes to the `gh-pages` branch. Make sure GitHub Pages is enabled on that branch in your repository settings (**Settings → Pages → Source: gh-pages branch**).

---

## How the decision tree works

The app fetches the root question node from Supabase on load. Each node has a `yes_next` and `no_next` UUID pointing to the next question. When a traversal reaches a node with a `profession_id`, the game ends and the matched profession is shown. The tree covers 60+ professions in at most 15 steps, progressing from broad domain to specific role differentiators.

---

## Reviewing suggestions

Open the Supabase dashboard, navigate to the `suggestions` table, and review entries. Each row contains the free-text suggestion and the `shown_profession_id` of the profession the user was shown — useful for identifying gaps in the decision tree.
