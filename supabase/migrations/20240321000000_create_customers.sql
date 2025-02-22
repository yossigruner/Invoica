-- Create customers table
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  -- Customer Info
  name text,
  email text,
  phone text,
  address text,
  city text,
  province text,
  zip text,
  country text,
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create the trigger for customers
create trigger set_customers_updated_at
  before update on public.customers
  for each row
  execute function public.handle_updated_at();

-- Enable RLS
alter table public.customers enable row level security;

-- Create RLS policies
create policy "Users can view own customers"
  on public.customers for select
  using (auth.uid() = user_id);

create policy "Users can create own customers"
  on public.customers for insert
  with check (auth.uid() = user_id);

create policy "Users can update own customers"
  on public.customers for update
  using (auth.uid() = user_id);

create policy "Users can delete own customers"
  on public.customers for delete
  using (auth.uid() = user_id); 