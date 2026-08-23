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

-- ---------- VYCVIKY / ZAMERANIA ----------
-- typ: 'zaklad'        = etapy zakladneho vycviku (1-6)
--      'specializacia' = zamerania (MED, MG, ...)
--      'velenie'       = veliteľské kurzy (PL, SL, TL)
--      'pokrocily'     = pokrocile vycviky (doplnite podla potreby)
create table if not exists vycviky (
  id serial primary key,
  skratka text unique,
  nazov text not null,
  typ text not null check (typ in ('zaklad','specializacia','velenie','pokrocily')),
  docs_link text  -- odkaz na Google Docs material, doplni sa neskor
);

-- Zakladny vycvik: 6 etap
insert into vycviky (skratka, nazov, typ) values
  ('Z1', 'Základný výcvik — etapa 1', 'zaklad'),
  ('Z2', 'Základný výcvik — etapa 2', 'zaklad'),
  ('Z3', 'Základný výcvik — etapa 3', 'zaklad'),
  ('Z4', 'Základný výcvik — etapa 4', 'zaklad'),
  ('Z5', 'Základný výcvik — etapa 5', 'zaklad'),
  ('Z6', 'Základný výcvik — etapa 6', 'zaklad');

-- Veliteľské kurzy
insert into vycviky (skratka, nazov, typ) values
  ('PL', 'Platoon Leader',  'velenie'),
  ('SL', 'Section Leader',  'velenie'),
  ('TL', 'Team Leader',     'velenie');

-- Zamerania / specializacie
insert into vycviky (skratka, nazov, typ) values
  ('RTO',   'Radio Tower Operator',              'specializacia'),
  ('MED',   'Medic',                             'specializacia'),
  ('CLS',   'Combat Life Saver',                 'specializacia'),
  ('MG',    'Machinegunner',                     'specializacia'),
  ('AR',    'Automatic Rifleman',                'specializacia'),
  ('GL',    'Grenade Launcher',                  'specializacia'),
  ('R',     'Rifleman',                          'specializacia'),
  ('SS',    'Sharpshooter',                      'specializacia'),
  ('SN',    'Sniper',                            'specializacia'),
  ('IFV-O', 'Infantry Fighting Vehicle Operátor','specializacia'),
  ('AB',    'Ammo Bearer',                       'specializacia'),
  ('BR',    'Breacher',                          'specializacia'),
  ('HW',    'Heavy Weapon',                      'specializacia'),
  ('EOD',   'Explosive Ordnance Disposal',       'specializacia'),
  ('UAV',   'Unmanned Aerial Vehicle',           'specializacia');

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
