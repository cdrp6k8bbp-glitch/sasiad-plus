# Procedura reagowania na naruszenie ochrony danych

Wersja: 1.0  
Obowiązuje od: 26 lipca 2026 r.  
Osoba odpowiedzialna: Magda Korcz  
Kontakt: sasiadpluskontakt@wp.pl

## 1. Cel

Procedura opisuje działania po wykryciu utraty, nieuprawnionego ujawnienia,
zmiany, usunięcia albo niedostępności danych osobowych w Sąsiad+.

## 2. Natychmiastowe działania

1. Zapisz datę i godzinę wykrycia oraz osobę lub system, który wykrył zdarzenie.
2. Ogranicz skutki bez niszczenia dowodów, np. unieważnij klucz, zakończ sesje,
   wyłącz wadliwą funkcję albo przywróć poprawną wersję aplikacji.
3. Zabezpiecz logi Cloudflare, historię wdrożeń, kopię bazy i korespondencję.
4. Nie wysyłaj danych osobowych w zwykłej wiadomości ani na publicznym kanale.
5. Załóż wpis w `rejestr-naruszen.md`, również gdy zdarzenie nie wymaga
   zgłoszenia do organu nadzorczego.

## 3. Ocena ryzyka

Ustal:

- jakie dane i ilu użytkowników dotyczy zdarzenie;
- czy dane były zaszyfrowane lub możliwe do odczytania;
- czy obejmują hasła, tokeny, wiadomości, adresy, treści zgłoszeń lub dane dzieci;
- czy możliwe są kradzież tożsamości, oszustwo, dyskryminacja, utrata poufności,
  szkoda finansowa albo reputacyjna;
- czy naruszenie trwa i czy dane można odzyskać.

Wpisz wynik oceny, podjęte środki i uzasadnienie decyzji do rejestru.

## 4. Zgłoszenie i poinformowanie osób

- Jeżeli naruszenie może powodować ryzyko dla praw lub wolności osób, zgłoś je
  Prezesowi UODO bez zbędnej zwłoki, w miarę możliwości w ciągu 72 godzin od
  stwierdzenia naruszenia.
- Jeżeli zgłoszenie nastąpi później, dołącz uzasadnienie opóźnienia.
- Jeżeli ryzyko jest wysokie, przekaż osobom, których dane dotyczą, jasny opis
  zdarzenia, możliwe skutki, zastosowane środki i zalecane działania.
- Jeżeli ryzyko jest mało prawdopodobne, zapisz dokładne uzasadnienie braku
  zgłoszenia.

## 5. Współpraca z dostawcami

W przypadku zdarzenia dotyczącego Cloudflare albo Resend:

1. otwórz zgłoszenie u dostawcy;
2. poproś o czas zdarzenia, zakres danych, zastosowane środki i aktualizacje;
3. zachowaj numer sprawy oraz całą korespondencję;
4. nie czekaj z własną oceną 72-godzinnego terminu na końcowy raport dostawcy.

## 6. Zamknięcie zdarzenia

Po opanowaniu sytuacji:

- potwierdź usunięcie przyczyny i przywrócenie bezpiecznego działania;
- udokumentuj zawiadomienia, decyzje i dowody;
- określ działania naprawcze, właściciela i termin;
- sprawdź skuteczność działań;
- zaktualizuj zabezpieczenia, procedury i szkolenie.

## 7. Minimalna lista kontaktów

- Administrator: Magda Korcz — sasiadpluskontakt@wp.pl
- Prezes Urzędu Ochrony Danych Osobowych — formularze i informacje na uodo.gov.pl
- Cloudflare Support — panel konta Cloudflare
- Resend Support — panel konta Resend
