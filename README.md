# 58. Phoenix Group — klanový web

Nový web klanu 58. Phoenix Group (Arma 3 MILSIM komunita).
**Motto:** Rise Up To Fire

## Štruktúra

```
index.html                       → verejná "Coming soon" stránka (krok 1)
assets/                          → logá a patche tímov
supabase_01_ciselniky_seed.sql   → SQL skript pre Supabase (krok 2)
```

## Krok 1 — nasadenie webu

1. Nahraj obsah tohto priečinka do GitHub repozitára
2. Prepoj repozitár s Cloudflare Pages (alebo GitHub Pages)
3. Over: web beží na verejnej adrese
4. Over: zmena v kóde + push = web sa sám aktualizuje

## Krok 2 — Supabase (databáza)

1. Založ projekt na supabase.com (free tier)
2. SQL Editor → New query → vlož obsah `supabase_01_ciselniky_seed.sql` → Run
3. Vytvorí sa: 16 hodností, 6 etáp základného výcviku, 3 veliteľské
   kurzy, 15 zameraní, 7 tímov (4 aktívne + 3 záloha), 3 typy misií
4. Zapni Discord ako Auth provider (návod príde v ďalšom kroku)

## Doplniť neskôr

- [ ] Typové zaradenie tímov Wolf, Grizzly, Duch (stĺpec `typ` v tabuľke `timy`)
- [ ] Linky na Google Docs výcvikové materiály (stĺpec `docs_link` v `vycviky`)
- [ ] Patch tímu Nomad a Rosnička (ak existujú)
