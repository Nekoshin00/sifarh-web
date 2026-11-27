create or replace function public.record_pixelpay_sandbox_purchase(
  p_user_id uuid,
  p_payment_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
  v_purchase_id uuid;
  v_key text;
  v_secret text;
begin
  if p_user_id is null or p_payment_id is null or p_payment_id = '' then
    raise exception 'Datos de la compra de prueba incompletos.';
  end if;

  select id into v_product_id from public.products
  where slug = 'sifarh' and active = true;
  if v_product_id is null then
    raise exception 'Producto no disponible.';
  end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets
  where name = 'license_encryption_key';
  if v_secret is null then
    raise exception 'El secreto de licencia no está configurado.';
  end if;

  insert into public.purchases (
    user_id, product_id, status, amount_cents, currency,
    payment_provider, provider_payment_id, paid_at
  ) values (
    p_user_id, v_product_id, 'paid', 100, 'USD',
    'pixelpay_sandbox', p_payment_id, now()
  )
  on conflict (payment_provider, provider_payment_id)
    where provider_payment_id is not null
    do nothing
  returning id into v_purchase_id;

  if v_purchase_id is null then
    select id into v_purchase_id from public.purchases
    where payment_provider = 'pixelpay_sandbox'
      and provider_payment_id = p_payment_id
      and user_id = p_user_id;
    if v_purchase_id is null then
      raise exception 'El identificador del pago ya está asociado a otra cuenta.';
    end if;
    return v_purchase_id;
  end if;

  v_key := 'SIFARH-' || upper(encode(extensions.gen_random_bytes(8), 'hex'));
  v_key := substr(v_key, 1, 7) || substr(v_key, 8, 4) || '-' || substr(v_key, 12, 4)
           || '-' || substr(v_key, 16, 4) || '-' || substr(v_key, 20, 4);

  insert into public.licenses (purchase_id, user_id, encrypted_key, key_hash, key_last4)
  values (
    v_purchase_id, p_user_id,
    encode(extensions.pgp_sym_encrypt(v_key, v_secret), 'base64'),
    encode(extensions.digest(v_key, 'sha256'), 'hex'),
    right(v_key, 4)
  );
  return v_purchase_id;
end;
$$;
