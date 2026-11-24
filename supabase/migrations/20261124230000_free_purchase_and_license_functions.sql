alter table public.purchases drop constraint purchases_amount_cents_check;
alter table public.purchases add constraint purchases_amount_cents_check check (amount_cents >= 0);
alter table public.products drop constraint products_amount_cents_check;
alter table public.products add constraint products_amount_cents_check check (amount_cents >= 0);

update public.products set amount_cents = 0 where slug = 'sifarh';

delete from public.purchases where payment_provider = 'demo';

create unique index purchases_one_free_per_user_product_idx
  on public.purchases (user_id, product_id)
  where payment_provider = 'free';

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'license_encryption_key') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'license_encryption_key',
      'Key used to encrypt SIFARH license keys'
    );
  end if;
end $$;

create or replace function public.claim_free_purchase(p_product_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_product public.products%rowtype;
  v_purchase_id uuid;
  v_key text;
  v_secret text;
begin
  if v_user is null then
    raise exception 'Debes iniciar sesión para obtener el programa.' using errcode = '28000';
  end if;

  select * into v_product from public.products
  where slug = p_product_slug and active = true;

  if not found then
    raise exception 'Producto no disponible.' using errcode = 'P0002';
  end if;

  if v_product.amount_cents <> 0 then
    raise exception 'Este producto requiere pago.' using errcode = '42501';
  end if;

  select id into v_purchase_id from public.purchases
  where user_id = v_user and product_id = v_product.id and payment_provider = 'free';

  if v_purchase_id is not null then
    return v_purchase_id;
  end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets
  where name = 'license_encryption_key';

  insert into public.purchases (user_id, product_id, status, amount_cents, currency, payment_provider, paid_at)
  values (v_user, v_product.id, 'paid', 0, v_product.currency, 'free', now())
  on conflict do nothing
  returning id into v_purchase_id;

  if v_purchase_id is null then
    select id into v_purchase_id from public.purchases
    where user_id = v_user and product_id = v_product.id and payment_provider = 'free';
    return v_purchase_id;
  end if;

  v_key := 'SIFARH-' || upper(encode(extensions.gen_random_bytes(8), 'hex'));
  v_key := substr(v_key, 1, 7) || substr(v_key, 8, 4) || '-' || substr(v_key, 12, 4)
           || '-' || substr(v_key, 16, 4) || '-' || substr(v_key, 20, 4);

  insert into public.licenses (purchase_id, user_id, encrypted_key, key_last4)
  values (
    v_purchase_id,
    v_user,
    encode(extensions.pgp_sym_encrypt(v_key, v_secret), 'base64'),
    right(v_key, 4)
  );

  return v_purchase_id;
end;
$$;

create or replace function public.get_license_key(p_purchase_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_encrypted text;
  v_secret text;
begin
  if v_user is null then
    raise exception 'Debes iniciar sesión.' using errcode = '28000';
  end if;

  select l.encrypted_key into v_encrypted
  from public.licenses l
  join public.purchases p on p.id = l.purchase_id and p.user_id = l.user_id
  where l.purchase_id = p_purchase_id
    and l.user_id = v_user
    and l.status = 'active'
    and p.status = 'paid';

  if v_encrypted is null then
    return null;
  end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets
  where name = 'license_encryption_key';

  return extensions.pgp_sym_decrypt(decode(v_encrypted, 'base64'), v_secret);
end;
$$;

revoke all on function public.claim_free_purchase(text) from public, anon, authenticated;
revoke all on function public.get_license_key(uuid) from public, anon, authenticated;
grant execute on function public.claim_free_purchase(text) to authenticated;
grant execute on function public.get_license_key(uuid) to authenticated;
