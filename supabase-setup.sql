-- ============================================================
-- UHA SHOP — Supabase Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- 1. Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  telegram text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, telegram)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'telegram'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: auto-create profile after signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null default '[]',
  total numeric not null default 0,
  status text not null default 'pending',
  promo_code text,
  discount numeric default 0,
  shipping_address jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

-- Users can view their own orders
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Users can create orders
create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- 3. Wishlist table
create table if not exists public.wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_slug text not null,
  created_at timestamptz default now(),
  unique(user_id, product_slug)
);

alter table public.wishlists enable row level security;

create policy "Users can manage own wishlist"
  on public.wishlists for all
  using (auth.uid() = user_id);
