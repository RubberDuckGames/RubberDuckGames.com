-- Applied 10 Nov to the RubberDuckGames Supabase project (hybjirpyeyomedhluvvl)
-- as migration `shared_matches_for_all_games`. Kept here so the database can be
-- rebuilt and every game sees the same shape.
--
-- One shared set of tables for every Rubber Duck game, not a table per game.
-- `matches` is any online game in progress, tagged with which game it is.
-- Later top-level tables (families with a parent sign-in, player profiles
-- every game can use, saves) go beside it, so a kid sets things up once.

create table public.matches (
  id text primary key,
  game text not null check (game ~ '^[a-z0-9-]{1,40}$'),
  state jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index matches_game_idx on public.matches (game);
alter table public.matches enable row level security;
revoke all on table public.matches from anon, authenticated;

-- The match id is the secret in its link: no accounts, and no way to list
-- matches. Browsers only use these three functions.
create function public.match_create(p_game text, p_state jsonb) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare v_id text;
begin
  if pg_column_size(p_state) > 400000 then raise exception 'too big'; end if;
  v_id := encode(extensions.gen_random_bytes(8), 'hex');
  insert into public.matches (id, game, state) values (v_id, p_game, p_state);
  return v_id;
end $$;

create function public.match_get(p_id text) returns table (game text, state jsonb, version integer)
language sql stable security definer set search_path = public as $$
  select m.game, m.state, m.version from public.matches m where m.id = p_id;
$$;

-- Saves only if nobody saved since this browser loaded it.
create function public.match_save(p_id text, p_state jsonb, p_version integer) returns integer
language plpgsql security definer set search_path = public as $$
declare v integer;
begin
  if pg_column_size(p_state) > 400000 then raise exception 'too big'; end if;
  update public.matches set state = p_state, version = version + 1, updated_at = now()
    where id = p_id and version = p_version returning version into v;
  if v is null then raise exception 'stale'; end if;
  return v;
end $$;

revoke all on function public.match_create(text, jsonb), public.match_get(text), public.match_save(text, jsonb, integer) from public;
grant execute on function public.match_create(text, jsonb), public.match_get(text), public.match_save(text, jsonb, integer) to anon, authenticated;
