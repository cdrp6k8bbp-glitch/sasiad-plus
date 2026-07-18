# Sąsiad+

[![Quality checks](https://github.com/cdrp6k8bbp-glitch/sasiad-plus/actions/workflows/quality.yml/badge.svg)](https://github.com/cdrp6k8bbp-glitch/sasiad-plus/actions/workflows/quality.yml)

Sąsiad+ to lokalna platforma wymiany usług i sprzętu między sąsiadami. Użytkownicy mogą publikować ogłoszenia, dodawać zdjęcia, wysyłać wiadomości, rezerwować terminy, zapisywać ulubione oferty i wystawiać oceny po zakończonej rezerwacji.

## Środowiska

- Produkcja: [sasiad-plus.t4pzthwd6z.workers.dev](https://sasiad-plus.t4pzthwd6z.workers.dev)
- Staging: [sasiad-plus-staging.t4pzthwd6z.workers.dev](https://sasiad-plus-staging.t4pzthwd6z.workers.dev)

Staging ma oddzielną bazę D1, magazyn zdjęć R2 i sekret uwierzytelniania. Dane testowe nie trafiają do produkcji.

## Praca lokalna

Projekt wymaga Node.js 22.

```bash
npm ci
npm run dev
```

Aplikacja będzie dostępna pod adresem [localhost:3000](http://localhost:3000).

## Kontrola jakości

Pełny zestaw kontroli można uruchomić jednym poleceniem:

```bash
npm run check
```

Kontrola obejmuje ESLint, TypeScript, kompilację aplikacji oraz uruchomienie wszystkich migracji na nowej, tymczasowej lokalnej bazie D1. GitHub Actions wykonuje te same kroki automatycznie dla każdej zmiany kierowanej do gałęzi `main`.

## Cloudflare

Wdrożenie środowiska testowego:

```bash
npm run db:staging:migrations:apply
npm run deploy:staging
```

Wdrożenie produkcyjne:

```bash
npm run db:backup
npm run db:migrations:apply
npm run deploy
```

Szczegółowa procedura bezpieczeństwa bazy znajduje się w [docs/database-operations.md](docs/database-operations.md).
