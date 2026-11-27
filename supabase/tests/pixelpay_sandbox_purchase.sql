begin;

do $$
declare
  v_user_id uuid;
  v_payment_id text := 'test-' || gen_random_uuid()::text;
  v_purchase_id uuid;
  v_key text;
begin
  if has_function_privilege('anon', 'public.record_pixelpay_sandbox_purchase(uuid,text)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.record_pixelpay_sandbox_purchase(uuid,text)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.record_pixelpay_sandbox_purchase(uuid,text)', 'EXECUTE') then
    raise exception 'Permisos incorrectos para la función de sandbox.';
  end if;

  select id into v_user_id from auth.users limit 1;
  if v_user_id is null then
    raise exception 'La prueba requiere un usuario existente.';
  end if;

  v_purchase_id := public.record_pixelpay_sandbox_purchase(v_user_id, v_payment_id);
  if v_purchase_id <> public.record_pixelpay_sandbox_purchase(v_user_id, v_payment_id) then
    raise exception 'La compra de prueba no es idempotente.';
  end if;

  if not exists (
    select 1 from public.purchases p join public.licenses l on l.purchase_id = p.id
    where p.id = v_purchase_id and p.user_id = v_user_id
      and p.payment_provider = 'pixelpay_sandbox'
      and p.amount_cents = 100 and p.currency = 'USD'
      and p.status = 'paid' and l.status = 'active'
  ) then
    raise exception 'La compra o la licencia no se registró correctamente.';
  end if;

  select extensions.pgp_sym_decrypt(
    decode(l.encrypted_key, 'base64'),
    (select decrypted_secret from vault.decrypted_secrets where name = 'license_encryption_key')
  ) into v_key from public.licenses l where l.purchase_id = v_purchase_id;
  if not public.verify_license(v_key) then
    raise exception 'La licencia de prueba no se puede verificar.';
  end if;
end;
$$;

rollback;
