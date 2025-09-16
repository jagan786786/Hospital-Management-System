-- Utility: update_updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- Patients table
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  phone text,
  email text,
  date_of_birth date,
  gender text,
  blood_group text,
  address text,
  medical_history text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_patients_updated_at
before update on public.patients
for each row execute function public.update_updated_at_column();

alter table public.patients enable row level security;

-- Policies: public access (no auth for now)
create policy "Public can read patients"
  on public.patients for select
  to anon
  using (true);
create policy "Public can insert patients"
  on public.patients for insert
  to anon
  with check (true);
create policy "Public can update patients"
  on public.patients for update
  to anon
  using (true);
create policy "Public can delete patients"
  on public.patients for delete
  to anon
  using (true);

-- Medicine inventory table
create table if not exists public.medicine_inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  generic_name text,
  strength text,
  form text,
  manufacturer text,
  stock_quantity integer not null default 0,
  expiry_date date,
  batch_number text,
  common_complaints text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_medicine_inventory_updated_at
before update on public.medicine_inventory
for each row execute function public.update_updated_at_column();

alter table public.medicine_inventory enable row level security;

create policy "Public can read inventory"
  on public.medicine_inventory for select
  to anon
  using (true);
create policy "Public can insert inventory"
  on public.medicine_inventory for insert
  to anon
  with check (true);
create policy "Public can update inventory"
  on public.medicine_inventory for update
  to anon
  using (true);
create policy "Public can delete inventory"
  on public.medicine_inventory for delete
  to anon
  using (true);

-- Inventory transactions table
create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references public.medicine_inventory(id) on delete cascade,
  type text not null check (type in ('in','out','adjust')),
  quantity integer not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.inventory_transactions enable row level security;

create policy "Public can read inventory transactions"
  on public.inventory_transactions for select
  to anon
  using (true);
create policy "Public can insert inventory transactions"
  on public.inventory_transactions for insert
  to anon
  with check (true);

-- Realtime configuration
alter table public.medicine_inventory replica identity full;
alter table public.inventory_transactions replica identity full;

-- Add tables to realtime publication if not already added
alter publication supabase_realtime add table public.medicine_inventory;
alter publication supabase_realtime add table public.inventory_transactions;