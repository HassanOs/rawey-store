create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  brand_slug text,
  description text not null,
  image_url text not null,
  slug text,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists brand_slug text;
alter table public.products add column if not exists slug text;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size_ml integer not null check (size_ml in (3, 5, 10)),
  price numeric(10, 2) not null check (price > 0),
  unique (product_id, size_ml)
);

delete from public.product_variants where size_ml = 1;

alter table public.product_variants drop constraint if exists product_variants_size_ml_check;
alter table public.product_variants add constraint product_variants_size_ml_check check (size_ml in (3, 5, 10));

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
alter table public.products drop constraint if exists products_slug_key;
drop index if exists products_slug_key;
drop index if exists products_slug_idx;
drop table if exists public.product_slug_redirects;
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_brand_name_idx on public.products (brand, name);
create index if not exists products_brand_slug_idx on public.products (brand_slug);
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create index if not exists products_brand_trgm_idx on public.products using gin (brand gin_trgm_ops);
create index if not exists product_variants_product_id_idx on public.product_variants (product_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_created_at_idx on public.orders (status, created_at desc);
create index if not exists orders_payment_created_at_idx on public.orders (payment_method, created_at desc);
create index if not exists orders_full_name_trgm_idx on public.orders using gin (full_name gin_trgm_ops);
create index if not exists orders_phone_number_trgm_idx on public.orders using gin (phone_number gin_trgm_ops);
create index if not exists orders_governorate_trgm_idx on public.orders using gin (governorate gin_trgm_ops);
create index if not exists orders_district_city_trgm_idx on public.orders using gin (district_city gin_trgm_ops);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);
create index if not exists order_items_variant_id_idx on public.order_items (variant_id);

create or replace function public.rawey_slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'), '-+', '-', 'g'));
$$;

do $$
declare
  product_record record;
  brand_slug_base text;
  slug_base text;
  candidate text;
  suffix integer;
begin
  for product_record in
    select id, name, brand
    from public.products
    order by brand, created_at, id
  loop
    brand_slug_base := public.rawey_slugify(product_record.brand);
    if brand_slug_base = '' then
      brand_slug_base := 'brand';
    end if;

    slug_base := public.rawey_slugify(product_record.name);
    if slug_base = '' then
      slug_base := public.rawey_slugify(product_record.brand || ' ' || product_record.name);
    end if;
    if slug_base = '' then
      slug_base := 'product';
    end if;

    candidate := slug_base;
    suffix := 2;

    while exists (
      select 1
      from public.products
      where brand_slug = brand_slug_base
        and slug = candidate
        and id <> product_record.id
    ) loop
      candidate := slug_base || '-' || suffix;
      suffix := suffix + 1;
    end loop;

    update public.products
    set brand_slug = brand_slug_base,
        slug = candidate
    where id = product_record.id;
  end loop;
end $$;

alter table public.products alter column brand_slug set not null;
alter table public.products alter column slug set not null;
create unique index if not exists products_brand_slug_product_slug_idx on public.products (brand_slug, slug);

create or replace function public.set_product_slug()
returns trigger
language plpgsql
as $$
declare
  brand_slug_base text;
  slug_base text;
  candidate text;
  suffix integer;
begin
  if new.brand_slug is null or new.brand_slug = '' then
    brand_slug_base := public.rawey_slugify(new.brand);
  else
    brand_slug_base := public.rawey_slugify(new.brand_slug);
  end if;

  if brand_slug_base = '' then
    brand_slug_base := 'brand';
  end if;

  if new.slug is null or new.slug = '' then
    slug_base := public.rawey_slugify(new.name);
  else
    slug_base := public.rawey_slugify(new.slug);
  end if;

  if slug_base = '' then
    slug_base := public.rawey_slugify(new.brand || ' ' || new.name);
  end if;
  if slug_base = '' then
    slug_base := 'product';
  end if;

  candidate := slug_base;
  suffix := 2;

  while exists (
    select 1
    from public.products
    where brand_slug = brand_slug_base
      and slug = candidate
      and id <> new.id
  ) loop
    candidate := slug_base || '-' || suffix;
    suffix := suffix + 1;
  end loop;

  new.brand_slug := brand_slug_base;
  new.slug := candidate;
  return new;
end;
$$;

drop trigger if exists products_set_slug on public.products;
create trigger products_set_slug
before insert or update of name, brand, brand_slug, slug on public.products
for each row
execute function public.set_product_slug();

create or replace function public.get_admin_overview_stats()
returns table (
  total_orders bigint,
  total_revenue numeric,
  pending_orders bigint,
  delivered_orders bigint,
  product_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.orders) as total_orders,
    coalesce((select sum(total_price) from public.orders), 0) as total_revenue,
    (select count(*) from public.orders where status = 'pending') as pending_orders,
    (select count(*) from public.orders where status = 'delivered') as delivered_orders,
    (select count(*) from public.products) as product_count;
$$;

revoke all on function public.get_admin_overview_stats() from public;
grant execute on function public.get_admin_overview_stats() to service_role;

create or replace function public.get_admin_revenue_series(range_days integer default 30)
returns table (
  day date,
  total_orders bigint,
  total_revenue numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with safe_range as (
    select case
      when range_days = 7 then 7
      when range_days = 90 then 90
      else 30
    end as days
  ),
  calendar as (
    select generate_series(
      (current_date - ((select days from safe_range) - 1))::date,
      current_date,
      interval '1 day'
    )::date as day
  )
  select
    calendar.day,
    count(orders.id) as total_orders,
    coalesce(sum(orders.total_price), 0) as total_revenue
  from calendar
  left join public.orders
    on orders.created_at >= calendar.day
    and orders.created_at < calendar.day + interval '1 day'
  group by calendar.day
  order by calendar.day;
$$;

create or replace function public.get_admin_status_breakdown(range_days integer default 30)
returns table (
  status text,
  total_orders bigint,
  total_revenue numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with safe_range as (
    select case
      when range_days = 7 then 7
      when range_days = 90 then 90
      else 30
    end as days
  ),
  statuses(status) as (
    values ('pending'), ('shipped'), ('delivered')
  )
  select
    statuses.status,
    count(orders.id) as total_orders,
    coalesce(sum(orders.total_price), 0) as total_revenue
  from statuses
  left join public.orders
    on orders.status = statuses.status
    and orders.created_at >= now() - (((select days from safe_range) - 1) * interval '1 day')
  group by statuses.status
  order by array_position(array['pending', 'shipped', 'delivered'], statuses.status);
$$;

create or replace function public.get_admin_payment_breakdown(range_days integer default 30)
returns table (
  payment_method text,
  total_orders bigint,
  total_revenue numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with safe_range as (
    select case
      when range_days = 7 then 7
      when range_days = 90 then 90
      else 30
    end as days
  ),
  methods(payment_method) as (
    values ('COD'), ('WISH')
  )
  select
    methods.payment_method,
    count(orders.id) as total_orders,
    coalesce(sum(orders.total_price), 0) as total_revenue
  from methods
  left join public.orders
    on orders.payment_method = methods.payment_method
    and orders.created_at >= now() - (((select days from safe_range) - 1) * interval '1 day')
  group by methods.payment_method
  order by array_position(array['COD', 'WISH'], methods.payment_method);
$$;

create or replace function public.get_admin_top_products(range_days integer default 30, result_limit integer default 5)
returns table (
  product_id uuid,
  name text,
  brand text,
  brand_slug text,
  image_url text,
  slug text,
  units_sold bigint,
  revenue numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with safe_args as (
    select
      case
        when range_days = 7 then 7
        when range_days = 90 then 90
        else 30
      end as days,
      least(greatest(result_limit, 1), 12) as limit_count
  )
  select
    products.id as product_id,
    products.name,
    products.brand,
    products.brand_slug,
    products.image_url,
    products.slug,
    coalesce(sum(order_items.quantity), 0)::bigint as units_sold,
    coalesce(sum(order_items.price * order_items.quantity), 0) as revenue
  from public.order_items
  join public.orders on orders.id = order_items.order_id
  join public.products on products.id = order_items.product_id
  where orders.created_at >= now() - (((select days from safe_args) - 1) * interval '1 day')
  group by products.id, products.name, products.brand, products.brand_slug, products.image_url, products.slug
  order by revenue desc, units_sold desc
  limit (select limit_count from safe_args);
$$;

revoke all on function public.get_admin_revenue_series(integer) from public;
revoke all on function public.get_admin_status_breakdown(integer) from public;
revoke all on function public.get_admin_payment_breakdown(integer) from public;
revoke all on function public.get_admin_top_products(integer, integer) from public;
grant execute on function public.get_admin_revenue_series(integer) to service_role;
grant execute on function public.get_admin_status_breakdown(integer) to service_role;
grant execute on function public.get_admin_payment_breakdown(integer) to service_role;
grant execute on function public.get_admin_top_products(integer, integer) to service_role;

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;

create policy "Public products are readable"
on public.products for select
using (true);

drop policy if exists "Users can read their own profile"
on public.profiles;

create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Public variants are readable"
on public.product_variants for select
using (true);

create policy "Public settings are readable"
on public.settings for select
using (true);
