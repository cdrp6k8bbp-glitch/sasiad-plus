# Rejestr czynności przetwarzania

Administrator: Magda Korcz, Lotnicza 6/73, 76-200 Redzikowo  
Kontakt: sasiadpluskontakt@wp.pl  
Wersja: 1.0, 26 lipca 2026 r.

## 1. Konta i bezpieczeństwo logowania

- Cel: utworzenie konta, logowanie, potwierdzenie adresu, odzyskanie hasła,
  ochrona przed nadużyciami.
- Osoby: użytkownicy i osoby próbujące się zarejestrować lub zalogować.
- Dane: imię/nazwa profilu, e-mail, skrót hasła, sesje, adres IP, agent
  przeglądarki, znaczniki czasu, liczniki bezpieczeństwa, wersja zaakceptowanych
  dokumentów.
- Odbiorcy/podmioty przetwarzające: Cloudflare; Resend dla e-maili
  transakcyjnych.
- Retencja: konto i dane konta do usunięcia konta; sesja maksymalnie 7 dni;
  tokeny weryfikacji i resetu 1 godzina; liczniki blokad technicznych 1–2 dni.
- Zabezpieczenia: Turnstile, limity prób, bezpieczne cookies, szyfrowanie
  transmisji, tajne klucze w Cloudflare Secrets.

## 2. Ogłoszenia, profile, rezerwacje i opinie

- Cel: publikacja ofert, kontakt sąsiedzki, obsługa rezerwacji i reputacji.
- Osoby: wystawiający, rezerwujący i autorzy opinii.
- Dane: profil, miasto, opis, zdjęcia, treść ogłoszenia, terminy, statusy
  rezerwacji, opinie i znaczniki czasu.
- Odbiorcy: inni użytkownicy w zakresie publicznej treści; Cloudflare.
- Retencja: przez okres istnienia konta lub do samodzielnego usunięcia treści,
  z wyjątkami dla zgłoszeń, sporów i roszczeń.
- Zabezpieczenia: kontrola dostępu właściciela, walidacja po stronie serwera,
  osobne środowisko testowe i produkcyjne, kopie bazy.

## 3. Wiadomości i powiadomienia

- Cel: umożliwienie kontaktu związanego z ogłoszeniem i przekazywanie informacji
  o rezerwacjach, bezpieczeństwie oraz moderacji.
- Osoby: nadawcy i odbiorcy.
- Dane: treść wiadomości, uczestnicy rozmowy, znaczniki czasu, status
  przeczytania, dane subskrypcji powiadomień.
- Odbiorcy: uczestnicy rozmowy; Cloudflare; Resend dla e-maili.
- Retencja: do usunięcia konta, chyba że dane są potrzebne do obsługi zgłoszenia,
  sporu lub roszczeń.
- Zabezpieczenia: autoryzacja uczestników, blokowanie użytkowników, zgłaszanie
  wiadomości, limity antyspamowe.

## 4. Zgłoszenia bezpieczeństwa i moderacja

- Cel: przyjmowanie zgłoszeń, ochrona użytkowników, dokumentowanie decyzji i
  obrona przed roszczeniami.
- Osoby: zgłaszający, zgłoszeni, moderatorzy i osoby widoczne w treści.
- Dane: powód, opis, migawka treści, identyfikatory kont i treści, uzasadnienie
  decyzji, status i znaczniki czasu.
- Odbiorcy: administrator i upoważnieni moderatorzy; Cloudflare.
- Retencja: sprawy oczekujące do rozstrzygnięcia; rozstrzygnięte zgłoszenia i
  decyzje do 3 lat od ostatniej aktualizacji lub decyzji.
- Zabezpieczenia: dostęp administratora, historia decyzji, powiadomienia obu
  stron, limity zgłoszeń.

## 5. Korespondencja i realizacja praw

- Cel: pomoc, skargi, żądania dostępu, sprostowania, usunięcia i ograniczenia.
- Osoby: osoby kontaktujące się z Sąsiad+.
- Dane: adres e-mail, treść korespondencji, dane potrzebne do identyfikacji
  sprawy i udzielenia odpowiedzi.
- Odbiorcy: operator skrzynki pocztowej oraz, zależnie od sprawy, Cloudflare lub
  Resend.
- Retencja: zwykła korespondencja do 12 miesięcy; sprawy sporne lub dotyczące
  roszczeń do 3 lat od zamknięcia.
- Zabezpieczenia: ograniczony dostęp do skrzynki, uwierzytelnianie konta,
  minimalizacja danych w korespondencji.

## Transfery poza EOG

Cloudflare i Resend mogą angażować podmioty spoza EOG. Podstawy i mechanizmy
transferu należy sprawdzać w aktualnych umowach powierzenia, standardowych
klauzulach umownych i wykazach podwykonawców dostawców.

## Przegląd

Rejestr należy aktualizować przy nowej funkcji, nowej kategorii danych, nowym
dostawcy, zmianie retencji lub zmianie zabezpieczeń.
