-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  -- Personal Info
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  city text,
  zip text,
  country text,
  -- Company Info
  company_name text,
  company_logo text,
  signature text,
  business_type text,
  tax_number text,
  -- Banking Info
  bank_name text,
  account_name text,
  account_number text,
  swift_code text,
  iban text,
  preferred_currency text,
  -- Metadata
  is_profile_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint profiles_user_id_key unique (user_id)
);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create the trigger
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Enable RLS
alter table public.profiles enable row level security;

-- Create RLS policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id); 