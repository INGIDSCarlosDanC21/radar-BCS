-- Radar BCS: perfiles de usuario para Supabase Auth.
-- Cómo correrlo: en el panel de Supabase abre "SQL Editor", pega todo este
-- archivo y pulsa "Run". Es seguro repetirlo (usa "if not exists" / "or replace").

create table if not exists public.perfiles (
  id uuid primary key references auth.users on delete cascade,
  nombre_completo text,
  creado timestamptz default now()
);

alter table public.perfiles enable row level security;

drop policy if exists "perfiles_select_propio" on public.perfiles;
create policy "perfiles_select_propio" on public.perfiles
  for select using (auth.uid() = id);

drop policy if exists "perfiles_update_propio" on public.perfiles;
create policy "perfiles_update_propio" on public.perfiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre_completo)
  values (new.id, new.raw_user_meta_data->>'nombre_completo');
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();
