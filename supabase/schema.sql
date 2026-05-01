create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  description text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size_ml integer not null check (size_ml in (1, 3, 5, 10)),
  price numeric(10, 2) not null check (price > 0),
  unique (product_id, size_ml)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null,
  governorate text not null,
  district_city text not null,
  address_details text not null,
  landmark text not null,
  payment_method text not null check (payment_method in ('COD', 'WISH')),
  shipping_price numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'shipped', 'delivered')),
  created_at timestamptz not null default now()
);

-- Migration for existing databases created before the finalized Lebanese checkout fields.
alter table public.orders add column if not exists full_name text;
alter table public.orders add column if not exists phone_number text;
alter table public.orders add column if not exists governorate text;
alter table public.orders add column if not exists district_city text;
alter table public.orders add column if not exists address_details text;
alter table public.orders add column if not exists landmark text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'customer_name'
  ) then
    execute 'update public.orders set full_name = coalesce(full_name, customer_name) where full_name is null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'phone'
  ) then
    execute 'update public.orders set phone_number = coalesce(phone_number, phone) where phone_number is null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'customer_name'
  ) then
    alter table public.orders alter column customer_name drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'phone'
  ) then
    alter table public.orders alter column phone drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'address'
  ) then
    alter table public.orders alter column address drop not null;
  end if;
end $$;

notify pgrst, 'reload schema';

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0)
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  shipping_price numeric(10, 2) not null default 3
);

insert into public.settings (id, shipping_price)
values ('00000000-0000-0000-0000-000000000001', 3)
on conflict (id) do nothing;

create index if not exists products_brand_idx on public.products (brand);
create index if not exists product_variants_product_id_idx on public.product_variants (product_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;

create policy "Public products are readable"
on public.products for select
using (true);

create policy "Public variants are readable"
on public.product_variants for select
using (true);

create policy "Public settings are readable"
on public.settings for select
using (true);
