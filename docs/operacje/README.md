# Monitoring, alarmy i kopie bezpieczeństwa

## Co działa automatycznie

- Cloudflare zapisuje wszystkie wywołania, logi aplikacji i wyjątki Workera.
- Co godzinę Worker sprawdza:
  - ostatnie uruchomienie retencji danych,
  - błędy, odbicia, skargi spamowe i wstrzymane wiadomości e-mail,
  - wiadomości bez końcowego statusu przez ponad dwie godziny.
- Nowy problem wysyła alarm na adres skonfigurowany jako `ALERT_EMAIL`.
- GitHub Actions co godzinę sprawdza publiczny endpoint `/api/health`.
- GitHub Actions codziennie eksportuje produkcyjną bazę D1, szyfruje ją przed
  wysłaniem i przechowuje zaszyfrowany artefakt przez 30 dni.
- Cloudflare D1 Time Travel zapewnia dodatkową automatyczną historię bazy:
  7 dni na planie Free albo 30 dni na planie Workers Paid.

Administrator widzi podsumowanie pod adresem `/admin/operacje`.

## Podłączenie statusów Resend

W panelu Resend utwórz dwa webhooki:

1. `https://sasiad-plus-staging.t4pzthwd6z.workers.dev/api/webhooks/resend`
2. `https://sasiad-plus.com/api/webhooks/resend`

Dla obu wybierz zdarzenia:

- `email.sent`
- `email.delivered`
- `email.delivery_delayed`
- `email.bounced`
- `email.complained`
- `email.failed`
- `email.suppressed`
- `email.opened`
- `email.clicked`

Każdy endpoint otrzyma własny sekret zaczynający się od `whsec_`. Zapisz
właściwy sekret jako `RESEND_WEBHOOK_SECRET` odpowiednio dla stagingu i
produkcji. Aplikacja sprawdza podpis na surowym żądaniu, odrzuca podrobione
zdarzenia i bezpiecznie ignoruje duplikaty.

## Sekrety GitHub Actions

W ustawieniach repozytorium GitHub, w `Settings → Secrets and variables →
Actions`, potrzebne są:

- `CLOUDFLARE_API_TOKEN` — token ograniczony do odczytu i eksportu produkcyjnej
  bazy D1,
- `CLOUDFLARE_ACCOUNT_ID` — identyfikator konta Cloudflare,
- `BACKUP_ENCRYPTION_PASSWORD` — długie, losowe hasło używane wyłącznie do
  szyfrowania kopii.

Plik SQL nigdy nie jest zapisywany jako artefakt. GitHub otrzymuje wyłącznie
zaszyfrowany plik `.enc` i jego sumę SHA-256.

## Próbne odtworzenie

Kopia jawna:

```bash
npm run db:restore:rehearsal -- backups/NAZWA-PLIKU.sql
```

Kopia zaszyfrowana:

```bash
export BACKUP_ENCRYPTION_PASSWORD='hasło użyte do kopii'
npm run db:restore:rehearsal -- pobrana-kopia.sql.enc
unset BACKUP_ENCRYPTION_PASSWORD
```

Próba odtwarza dane wyłącznie do tymczasowej lokalnej bazy SQLite, wykonuje
kontrolę integralności i usuwa pliki tymczasowe. Nie dotyka stagingu ani
produkcji.

## Reakcja na alarm

1. Otwórz `/admin/operacje` i sprawdź, którego obszaru dotyczy problem.
2. Dla awarii aplikacji sprawdź `Cloudflare → Workers & Pages → sasiad-plus →
   Observability`.
3. Dla problemu e-mail sprawdź `Resend → Emails` i konkretny identyfikator
   wiadomości.
4. Dla błędu kopii sprawdź `GitHub → Actions → Operational checks and encrypted
   backup`.
5. Jeśli baza wymaga odtworzenia, najpierw wykonaj próbę na pobranej kopii.
   Produkcyjne Time Travel uruchamiaj dopiero po zapisaniu bieżącego bookmarka
   i osobnej kopii eksportowej.
