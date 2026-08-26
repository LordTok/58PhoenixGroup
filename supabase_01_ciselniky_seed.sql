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
  poradie int not null unique,   -- 1 = najnizsia
  insignia text                   -- cesta k obrazku insignie
);

insert into hodnosti (nazov, kategoria, poradie, insignia) values
  ('Vojak 1. stupňa',      'Mužstvo',           1,  'assets/hodnosti/01-vojak-1-stupna.png'),
  ('Vojak 2. stupňa',      'Mužstvo',           2,  'assets/hodnosti/02-vojak-2-stupna.png'),
  ('Slobodník',            'Mužstvo',           3,  'assets/hodnosti/03-slobodnik.png'),
  ('Desiatnik',            'Mužstvo',           4,  'assets/hodnosti/04-desiatnik.png'),
  ('Čatár',                'Poddôstojníci',     5,  'assets/hodnosti/05-catar.png'),
  ('Rotný',                'Poddôstojníci',     6,  'assets/hodnosti/06-rotny.png'),
  ('Rotmajster',           'Poddôstojníci',     7,  'assets/hodnosti/07-rotmajster.png'),
  ('Nadrotmajster',        'Poddôstojníci',     8,  'assets/hodnosti/08-nadrotmajster.png'),
  ('Štábny nadrotmajster', 'Poddôstojníci',     9,  'assets/hodnosti/09-stabny-nadrotmajster.png'),
  ('Podpráporčík',         'Práporčíci',       10,  'assets/hodnosti/10-podpraporcik.png'),
  ('Práporčík',            'Práporčíci',       11,  'assets/hodnosti/11-praporcik.png'),
  ('Nadpráporčík',         'Práporčíci',       12,  'assets/hodnosti/12-nadpraporcik.png'),
  ('Poručík',              'Nižší dôstojníci', 13,  'assets/hodnosti/13-porucik.png'),
  ('Nadporučík',           'Nižší dôstojníci', 14,  'assets/hodnosti/14-nadporucik.png'),
  ('Kapitán',              'Nižší dôstojníci', 15,  'assets/hodnosti/15-kapitan.png'),
  ('Major',                'Vyšší dôstojníci', 16,  'assets/hodnosti/16-major.png'),
  ('Podplukovník',         'Vyšší dôstojníci', 17,  'assets/hodnosti/17-podplukovnik.png'),
  ('Plukovník',            'Vyšší dôstojníci', 18,  'assets/hodnosti/18-plukovnik.png');


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


-- ---------- ABSOLVOVANE VYCVIKY CLENOV ----------
-- Evidencia: kto, kedy, u koho a NA AKU UROVEN vycvik absolvoval.
-- clen_id / instruktor_id sa prepoja na tabulku clenov v kroku 2 (Supabase Auth).
create table if not exists vycviky_clena (
  id serial primary key,
  clen_id uuid,
  vycvik_id int not null references vycviky(id),
  uroven text not null default 'bronz' check (uroven in ('bronz','striebro','zlato')),
  datum date not null default current_date,
  instruktor_id uuid
);

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


-- ---------- XP SYSTEM (veterancia) ----------
-- Dve vrstvy: trvaly sluzobny zaznam (odznaky, stuzky) vs. ziva
-- veterancia (XP bar + stupen, pri neaktivite klesa).
-- XP NIKDY samo nepovysuje — prah len ticho signalizuje veleniu.

-- Stupne veterancie (nazvy su navrhove, doladi klan)
create table if not exists veterancia_stupne (
  id serial primary key,
  nazov text not null unique,
  min_xp int not null unique,
  poradie int not null unique
);
insert into veterancia_stupne (nazov, min_xp, poradie) values
  ('Nováčik',            0,    1),
  ('Vojak kampane',      300,  2),
  ('Skúsený operátor',   800,  3),
  ('Veterán',            1600, 4),
  ('Legenda Vardaku',    2600, 5);  -- ciel: ~rok pravidelneho hrania

-- XP zaznamy (kazde pridelenie XP, kvoli auditu a decay vypoctu)
create table if not exists xp_zaznamy (
  id serial primary key,
  clen_id uuid,
  zdroj text not null check (zdroj in ('misia','vycvik','pochvala','ine')),
  body int not null,
  popis text,
  datum date not null default current_date
);

-- Stuzky (ciselnik trvalych vyznamenani za pochvaly)
create table if not exists stuzky (
  id serial primary key,
  nazov text not null unique,
  popis text,
  farby text  -- napr. "#9C9C74,#8A5F44" pre CSS vykreslenie stuzky
);

-- Udelene pochvaly: trvala stuzka + bonusove XP (XP ide do xp_zaznamy)
create table if not exists pochvaly (
  id serial primary key,
  clen_id uuid,
  stuzka_id int not null references stuzky(id),
  udelil_id uuid,
  poznamka text,
  datum date not null default current_date
);

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
