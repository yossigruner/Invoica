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
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a trigger to update the updated_at column
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

-- Create RLS (Row Level Security) policies
alter table public.profiles enable row level security;

-- Allow users to read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

-- Allow users to insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Create invoices table
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  invoice_number text not null,
  customer_id uuid references public.customers(id),
  issue_date date not null,
  due_date date not null,
  status text not null default 'draft',
  currency text not null default 'USD',
  subtotal numeric(10,2) not null default 0,
  tax_rate numeric(5,2),
  tax_amount numeric(10,2),
  discount_rate numeric(5,2),
  discount_amount numeric(10,2),
  shipping_amount numeric(10,2),
  total_amount numeric(10,2) not null default 0,
  notes text,
  payment_terms text,
  payment_method text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create invoice_items table
create table if not exists public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  amount numeric(10,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create triggers for updated_at
create trigger set_invoices_updated_at
  before update on public.invoices
  for each row
  execute function public.handle_updated_at();

create trigger set_invoice_items_updated_at
  before update on public.invoice_items
  for each row
  execute function public.handle_updated_at();

-- Create RLS policies for invoices
alter table public.invoices enable row level security;

create policy "Users can view own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);

-- Create RLS policies for invoice_items
alter table public.invoice_items enable row level security;

create policy "Users can view own invoice items"
  on public.invoice_items for select
  using (
    exists (
      select 1 from public.invoices
      where id = invoice_items.invoice_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert own invoice items"
  on public.invoice_items for insert
  with check (
    exists (
      select 1 from public.invoices
      where id = invoice_items.invoice_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update own invoice items"
  on public.invoice_items for update
  using (
    exists (
      select 1 from public.invoices
      where id = invoice_items.invoice_id
      and user_id = auth.uid()
    )
  );

create policy "Users can delete own invoice items"
  on public.invoice_items for delete
  using (
    exists (
      select 1 from public.invoices
      where id = invoice_items.invoice_id
      and user_id = auth.uid()
    )
  ); 