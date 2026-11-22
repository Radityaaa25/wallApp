create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_name text,
  message text,
  image_url text,
  created_at timestamptz
);

alter table public.posts
  add column if not exists author_name text,
  add column if not exists message text,
  add column if not exists image_url text,
  add column if not exists created_at timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posts'
      and column_name = 'body'
  ) then
    execute 'update public.posts set message = body where message is null and body is not null';
  end if;
end
$$;

update public.posts
set author_name = 'Anonymous'
where author_name is null or char_length(btrim(author_name)) = 0;

update public.posts
set created_at = now()
where created_at is null;

alter table public.posts
  alter column author_name set default 'Anonymous',
  alter column author_name set not null,
  alter column message set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.posts'::regclass
      and conname = 'posts_message_check'
  ) then
    alter table public.posts
      add constraint posts_message_check
      check (char_length(message) between 1 and 280);
  end if;
end
$$;

create index if not exists posts_created_at_desc_idx
  on public.posts (created_at desc);

alter table public.posts enable row level security;

drop policy if exists "Anyone can read posts" on public.posts;
create policy "Anyone can read posts"
  on public.posts for select
  to anon
  using (true);

drop policy if exists "Anyone can insert posts" on public.posts;
create policy "Anyone can insert posts"
  on public.posts for insert
  to anon
  with check (
    char_length(message) between 1 and 280
    and char_length(author_name) between 1 and 60
  );

grant usage on schema public to anon;
revoke all on table public.posts from anon;
grant select, insert on table public.posts to anon;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;
end
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wall-photos',
  'wall-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Wall photos are publicly readable" on storage.objects;
create policy "Wall photos are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'wall-photos');

drop policy if exists "Anyone can upload wall photos" on storage.objects;
create policy "Anyone can upload wall photos"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'wall-photos');
