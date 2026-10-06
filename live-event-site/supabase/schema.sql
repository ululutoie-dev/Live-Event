-- Supabase の SQL Editor に貼って Run します。
-- 先に、下の YOUR-ADMIN-EMAIL を管理者のメールアドレスに書き換えてください(1か所だけ)。

create function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'YOUR-ADMIN-EMAIL'
$$;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  event_date date not null,
  open_time text, start_time text,
  venue text, address text, map_url text, ticket text,
  notes text[] default '{}',
  flyer_url text,
  contact_email text,
  theme_color text default 'dusk',
  theme_font text default 'mincho',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.bands (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  position int not null default 0,
  name text not null,
  description text,
  image_url text,
  youtube_url text,
  links jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.bands enable row level security;

-- 誰でも「公開済み」だけ読める / 管理者はすべて読み書きできる
create policy "events read" on public.events for select using (published or public.is_admin());
create policy "events write" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "bands read" on public.bands for select using (
  exists (select 1 from public.events e where e.id = event_id and (e.published or public.is_admin()))
);
create policy "bands write" on public.bands for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 画像保存用バケット(公開読み取り、書き込みは管理者のみ)
insert into storage.buckets (id, name, public) values ('event-images', 'event-images', true)
on conflict (id) do nothing;
create policy "images insert" on storage.objects for insert to authenticated with check (bucket_id = 'event-images' and public.is_admin());
create policy "images update" on storage.objects for update to authenticated using (bucket_id = 'event-images' and public.is_admin());
create policy "images delete" on storage.objects for delete to authenticated using (bucket_id = 'event-images' and public.is_admin());
