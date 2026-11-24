alter table public.licenses add column key_hash text;

update public.licenses l
set key_hash = encode(extensions.digest(
  extensions.pgp_sym_decrypt(
    decode(l.encrypted_key, 'base64'),
    (select decrypted_secret from vault.decrypted_secrets where name = 'license_encryption_key')
  ), 'sha256'), 'hex')
where key_hash is null;

alter table public.licenses alter column key_hash set not null;
create unique index licenses_key_hash_idx on public.licenses (key_hash);

create or replace function public.verify_license(p_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.licenses l
    join public.purchases p on p.id = l.purchase_id and p.user_id = l.user_id
    where l.key_hash = encode(extensions.digest(upper(trim(p_key)), 'sha256'), 'hex')
      and l.status = 'active'
      and p.status = 'paid'
  );
$$;

revoke all on function public.verify_license(text) from public, anon, authenticated;
grant execute on function public.verify_license(text) to anon, authenticated;

-- claim_free_purchase was also redefined to store key_hash; see the previous
-- migration for the base definition (the only change is the key_hash column).
