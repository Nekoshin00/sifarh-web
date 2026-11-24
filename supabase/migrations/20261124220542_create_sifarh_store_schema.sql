create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.products (slug, name, amount_cents, currency, active)
values ('sifarh', 'SIFARH', 5000, 'USD', true)
on conflict (slug) do update
set name = excluded.name,
    amount_cents = excluded.amount_cents,
    currency = excluded.currency,
    active = excluded.active;

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  payment_provider text not null,
  provider_checkout_id text,
  provider_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index purchases_provider_checkout_id_idx
  on public.purchases (payment_provider, provider_checkout_id)
  where provider_checkout_id is not null;

create unique index purchases_provider_payment_id_idx
  on public.purchases (payment_provider, provider_payment_id)
  where provider_payment_id is not null;

create index purchases_user_created_idx
  on public.purchases (user_id, created_at desc);

create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null unique,
  user_id uuid not null,
  encrypted_key text not null,
  key_last4 text not null check (length(key_last4) = 4),
  status text not null default 'active'
    check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  foreign key (purchase_id, user_id)
    references public.purchases (id, user_id) on delete restrict
);

create index licenses_user_created_idx
  on public.licenses (user_id, created_at desc);

alter table public.products enable row level security;
alter table public.purchases enable row level security;
alter table public.licenses enable row level security;

revoke all on public.products from public, anon, authenticated;
revoke all on public.purchases from public, anon, authenticated;
revoke all on public.licenses from public, anon, authenticated;

grant select on public.products to anon, authenticated;
create policy "Anyone can view active products"
  on public.products for select to anon, authenticated
  using (active = true);

grant select on public.purchases to authenticated;
create policy "Users can view their own purchases"
  on public.purchases for select to authenticated
  using (user_id = (select auth.uid()));

grant select (id, purchase_id, user_id, key_last4, status, created_at)
  on public.licenses to authenticated;
create policy "Users can view their own license metadata"
  on public.licenses for select to authenticated
  using (user_id = (select auth.uid()));
