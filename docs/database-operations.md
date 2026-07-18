# Obsługa bazy D1

## Zasady bezpieczeństwa

- Produkcja używa bazy `sasiad-plus-db` i magazynu `sasiad-plus-images`.
- Staging używa oddzielnej bazy `sasiad-plus-db-staging` i magazynu `sasiad-plus-images-staging`.
- Nowe migracje najpierw uruchamiamy na stagingu. Produkcję aktualizujemy dopiero po udanym teście.
- Przed każdą migracją produkcyjną tworzymy eksport SQL i zapisujemy bieżący bookmark Time Travel.
- Folder `backups/` jest lokalny i celowo ignorowany przez Git.

## Najczęstsze polecenia

Zaloguj się do Cloudflare, a następnie wykonuj polecenia z głównego folderu projektu.

```bash
npm run db:backup
npm run db:migrations:list
npm run db:staging:migrations:apply
npm run deploy:staging
```

Po sprawdzeniu stagingu migrację produkcyjną można wykonać poleceniem:

```bash
npm run db:migrations:apply
```

## Przywracanie awaryjne

Najpierw sprawdź dostępne bookmarki:

```bash
npx wrangler d1 time-travel info sasiad-plus-db
```

Przywrócenie do wcześniejszego bookmarka zmienia produkcyjną bazę. Wykonuj je tylko po potwierdzeniu zakresu utraconych zmian:

```bash
npx wrangler d1 time-travel restore sasiad-plus-db --bookmark <BOOKMARK>
```

Plik `scripts/sql/reconcile-d1-migrations.sql` służy wyłącznie do jednorazowego uzgodnienia historycznego rejestru migracji. Nie jest zwykłą migracją aplikacji.
