-- ============================================================
-- 58. Phoenix Group — klanovy web
-- Krok 1: Ciselniky (hodnosti, vycviky/zamerania, timy)
-- Spustit v Supabase: SQL Editor -> New query -> vlozit -> Run
-- ============================================================

-- ---------- HODNOSTI ----------
create table if not exists hodnosti (
  id serial primary key,
  nazov text not null unique,
  kategoria text not null,
  poradie int not null unique  -- 1 = najnizsia, sluzi na triedenie ORBATu
);

insert into hodnosti (nazov, kategoria, poradie) values
  ('Vojak 2. stupňa',        'Mužstvo',           1),
  ('Vojak 1. stupňa',        'Mužstvo',           2),
  ('Slobodník',              'Mužstvo',           3),
  ('Desiatnik',              'Mužstvo',           4),
  ('Čatár',                  'Poddôstojníci',     5),
  ('Rotný',                  'Poddôstojníci',     6),
  ('Rotmajster',             'Poddôstojníci',     7),
  ('Nadrotmajster',          'Poddôstojníci',     8),
  ('Štábny nadrotmajster',   'Poddôstojníci',     9),
  ('Podpráporčík',           'Práporčíci',       10),
  ('Práporčík',              'Práporčíci',       11),
  ('Nadpráporčík',           'Práporčíci',       12),
  ('Poručík',                'Nižší dôstojníci', 13),
  ('Nadporučík',             'Nižší dôstojníci', 14),
  ('Kapitán',                'Nižší dôstojníci', 15),
  ('Major',                  'Vyšší dôstojníci', 16);

-- ---------- VYCVIKY ----------
-- druh: 'training' = komplexna instruktaz s viacerymi praktickymi vycvikmi
--       'course'   = kratka uvodna instruktaz s jednym praktickym vycvikom
-- typ:  'zaklad'   = etapy zakladneho prijimacieho vycviku (ZaV, 1-6)
--       'velenie'  = velitelska priprava
--       'odborny'  = specializovane vycviky a kurzy
create table if not exists vycviky (
  id serial primary key,
  skratka text unique,
  nazov text not null,
  typ text not null check (typ in ('zaklad','velenie','odborny')),
  druh text check (druh in ('training','course')),
  docs_link text  -- odkaz na Google Docs material, doplni sa neskor
);

-- Zakladny prijimaci vycvik (ZaV): 6 etap
insert into vycviky (skratka, nazov, typ, druh) values
  ('ZaV-1', 'Základný prijímací výcvik — etapa 1', 'zaklad', 'training'),
  ('ZaV-2', 'Základný prijímací výcvik — etapa 2', 'zaklad', 'training'),
  ('ZaV-3', 'Základný prijímací výcvik — etapa 3', 'zaklad', 'training'),
  ('ZaV-4', 'Základný prijímací výcvik — etapa 4', 'zaklad', 'training'),
  ('ZaV-5', 'Základný prijímací výcvik — etapa 5', 'zaklad', 'training'),
  ('ZaV-6', 'Základný prijímací výcvik — etapa 6', 'zaklad', 'training');

-- Trainingy
insert into vycviky (skratka, nazov, typ, druh) values
  ('CMD-T',    'Command training',              'velenie', 'training'),
  ('RTO-T',    'Radio tower operator training', 'odborny', 'training'),
  ('M-T',      'Medical training',              'odborny', 'training'),
  ('SS/SN-T',  'Sharpshooter/Sniper training',  'odborny', 'training'),
  ('SP/ENG-T', 'Sapper/Engineer training',      'odborny', 'training'),
  ('MO-T',     'Mechanized operator training',  'odborny', 'training'),
  ('UAV-T',    'UAV operator training',         'odborny', 'training'),
  ('P-T',      'Pilot training',                'odborny', 'training'),
  ('TM-T',     'Tactical movement training',    'odborny', 'training'),
  ('CQC-T',    'Close Quarters Combat training','odborny', 'training');

-- Kurzy
insert into vycviky (skratka, nazov, typ, druh) values
  ('AT-C', 'Anti-tank course',        'odborny', 'course'),
  ('AA-C', 'Anti-air course',         'odborny', 'course'),
  ('MG-C', 'Machine gunner course',   'odborny', 'course'),
  ('GL-C', 'Grenade launcher course', 'odborny', 'course');

-- ---------- TIMY ----------
create table if not exists timy (
  id serial primary key,
  nazov text not null unique,
  typ text,                 -- typove zaradenie (pechota, vrtulniky...)
  aktivny boolean not null default true,
  patch_url text,           -- cesta k patchu v Supabase Storage, doplni sa
  velitel_id uuid           -- FK na clenov, prepoji sa v kroku 2
);

-- Aktivne timy
insert into timy (nazov, typ, aktivny) values
  ('Líška',   'Prieskumný tím',                       true),
  ('Vlk',     'Podporná jednotka — ťažké zbrane',     true),
  ('Grizzly', 'Mechanizovaný tím',                    true),
  ('Duch',    'Hĺbkový prieskum a špeciálne nasadenia', true),
  ('Hotel',   'Vrtuľníkové krídlo',                   true),
  ('Alžbeta', 'Operačné veliteľstvo',                 true);

-- Zalozne timy
insert into timy (nazov, typ, aktivny) values
  ('Rosnička', 'Špeciálne jednotky',       false);

-- ---------- TYPY MISII (pre kalendar) ----------
create table if not exists typy_misii (
  id serial primary key,
  kod text not null unique,
  nazov text not null,
  farba text not null  -- hex farba stitku v kalendari
);

insert into typy_misii (kod, nazov, farba) values
  ('interna',  'Interná misia', '#4A6741'),
  ('jointops', 'Joint Ops',     '#8B5E3C'),
  ('vycvik',   'Výcviková',     '#5E7C8B');
