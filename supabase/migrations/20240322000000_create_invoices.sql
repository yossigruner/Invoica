-- Create invoices table
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  customer_id uuid references public.customers(id),
  invoice_number text not null,
  issue_date timestamp with time zone not null,
  due_date timestamp with time zone,
  currency text not null,
  payment_method text,
  payment_terms text,
  additional_notes text,
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  -- Billing Info
  billing_name text not null,
  billing_email text,
  billing_phone text,
  billing_address text,
  billing_city text,
  billing_zip text,
  billing_country text,
  -- Adjustments
  discount_value numeric(10,2) default 0,
  discount_type text check (discount_type in ('amount', 'percentage')),
  tax_value numeric(10,2) default 0,
  tax_type text check (tax_type in ('amount', 'percentage')),
  shipping_value numeric(10,2) default 0,
  shipping_type text check (shipping_type in ('amount', 'percentage')),
  -- Totals
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create invoice_items table
create table if not exists public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  name text not null,
  description text,
  quantity numeric(10,2) not null,
  rate numeric(10,2) not null,
  amount numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger for invoices
create trigger set_invoices_updated_at
  before update on public.invoices
  for each row
  execute function public.handle_updated_at();

-- Create updated_at trigger for invoice_items
create trigger set_invoice_items_updated_at
  before update on public.invoice_items
  for each row
  execute function public.handle_updated_at();

-- Enable RLS
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- Create RLS policies for invoices
create policy "Users can view own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "Users can create own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);

-- Create RLS policies for invoice_items
create policy "Users can view own invoice items"
  on public.invoice_items for select
  using (
    exists (
      select 1 from public.invoices
      where id = invoice_id
      and user_id = auth.uid()
    )
  );

create policy "Users can create own invoice items"
  on public.invoice_items for insert
  with check (
    exists (
      select 1 from public.invoices
      where id = invoice_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update own invoice items"
  on public.invoice_items for update
  using (
    exists (
      select 1 from public.invoices
      where id = invoice_id
      and user_id = auth.uid()
    )
  );

create policy "Users can delete own invoice items"
  on public.invoice_items for delete
  using (
    exists (
      select 1 from public.invoices
      where id = invoice_id
      and user_id = auth.uid()
    )
  ); 