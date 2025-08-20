-- Run in Supabase SQL editor
create table if not exists leaderboard (
  id text primary key,
  title text,
  thumbnail text,
  plays bigint default 0 not null
);

-- Optional RPC to increment safely
create or replace function inc_play(gid text) returns void as $$
begin
  insert into leaderboard(id, plays) values (gid, 1)
  on conflict(id) do update set plays = leaderboard.plays + 1;
end; $$ language plpgsql;
