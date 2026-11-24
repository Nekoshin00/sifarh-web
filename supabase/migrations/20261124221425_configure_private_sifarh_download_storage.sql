insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'sifarh-downloads',
  'sifarh-downloads',
  false,
  536870912,
  array['application/zip', 'application/x-zip-compressed']::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Licensed users can download SIFARH releases"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'sifarh-downloads'
    and exists (
      select 1
      from public.purchases as p
      join public.licenses as l
        on l.purchase_id = p.id and l.user_id = p.user_id
      where p.user_id = (select auth.uid())
        and p.status = 'paid'
        and l.status = 'active'
    )
  );
