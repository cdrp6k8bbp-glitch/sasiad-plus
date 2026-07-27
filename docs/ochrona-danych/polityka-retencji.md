# Polityka retencji i usuwania danych

Wersja: 1.0  
Obowiązuje od: 26 lipca 2026 r.

## Harmonogram

| Dane | Okres | Sposób usuwania |
|---|---:|---|
| Wygasłe sesje | po wygaśnięciu, maks. 7 dni aktywności | codzienne usuwanie z D1 |
| Tokeny weryfikacji i resetu | 1 godzina | codzienne usuwanie wygasłych rekordów z D1 |
| Liczniki logowania Better Auth | do 24 godzin | codzienne usuwanie z D1 |
| Liczniki antyspamowe aplikacji | do 48 godzin | codzienne usuwanie z D1 |
| Rozstrzygnięte zgłoszenia i decyzje moderacyjne | 3 lata | codzienne usuwanie z D1 po upływie okresu |
| Oczekujące zgłoszenia | do rozstrzygnięcia | nie są usuwane automatycznie |
| Konto, profil, ogłoszenia, wiadomości, rezerwacje, opinie i zdjęcia | do usunięcia konta lub treści | usunięcie w aplikacji i z D1/R2 |
| Zwykła korespondencja | do 12 miesięcy | ręczny kwartalny przegląd skrzynki |
| Korespondencja sporna i dotycząca roszczeń | do 3 lat od zamknięcia | ręczny kwartalny przegląd skrzynki |
| Kopie bazy | okres określony w procedurze kopii zapasowych | rotacja plików kopii |

## Automatyzacja

Worker uruchamia porządkowanie raz dziennie. Produkcja działa o 02:17 UTC, a
staging o 02:47 UTC. Każde uruchomienie zapisuje wyłącznie techniczne
podsumowanie liczby usuniętych rekordów w tabeli `data_retention_runs`.

## Kontrola

Raz w miesiącu administrator sprawdza ostatni wpis w `data_retention_runs`.
Raz na kwartał sprawdza korespondencję i lokalne kopie bazy. Nieudane
uruchomienie automatyzacji wymaga wyjaśnienia i ponownego wykonania po usunięciu
przyczyny.

## Wyjątki

Usunięcie może zostać wstrzymane w zakresie niezbędnym do ustalenia, dochodzenia
lub obrony roszczeń albo wykonania obowiązku prawnego. Powód, zakres i termin
ponownego przeglądu należy zapisać.
