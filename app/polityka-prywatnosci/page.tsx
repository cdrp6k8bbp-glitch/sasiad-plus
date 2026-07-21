import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
  legalListClassName,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Polityka prywatności | Sąsiad+",
  description: "Informacje o przetwarzaniu danych osobowych w Sąsiad+.",
};

export default function PolitykaPrywatnosciPage() {
  return (
    <LegalPage
      eyebrow="Wersja 1.0 · obowiązuje od 21 lipca 2026 r."
      title="Polityka prywatności"
      intro="Poniżej wyjaśniamy, jakie dane przetwarzamy, dlaczego są potrzebne i jakie prawa przysługują użytkownikom Sąsiad+."
    >
      <LegalSection title="1. Administrator danych">
        <p>
          Administratorem danych osobowych jest Magda Korcz, ul. Lotnicza 6/73,
          76-200 Redzikowo.
        </p>
        <p>
          W sprawach dotyczących prywatności można napisać na
          <a className="ml-1 font-bold text-green-700 underline" href="mailto:korczm8@gmail.com">korczm8@gmail.com</a>.
          Administrator nie wyznaczył inspektora ochrony danych.
        </p>
      </LegalSection>

      <LegalSection title="2. Jakie dane przetwarzamy">
        <ul className={legalListClassName}>
          <li>dane konta: imię i nazwisko lub nazwa profilu, adres e-mail, zaszyfrowane hasło i informacja o potwierdzeniu e-maila;</li>
          <li>dane profilu: miejscowość, opis i data dołączenia;</li>
          <li>treści użytkownika: ogłoszenia, zdjęcia, lokalizacja oferty, wiadomości, rezerwacje, ulubione oferty, opinie i zgłoszenia moderacyjne;</li>
          <li>dane techniczne i bezpieczeństwa: adres IP, typ przeglądarki i urządzenia, identyfikator i czas sesji, znaczniki czasu oraz liczniki prób logowania;</li>
          <li>dane korespondencji prowadzonej z administratorem.</li>
        </ul>
        <p>
          Dane otrzymujemy bezpośrednio od użytkownika oraz automatycznie od
          jego urządzenia podczas korzystania z platformy. Prosimy nie
          publikować danych szczególnych kategorii, numerów dokumentów, danych
          kart ani informacji o innych osobach bez odpowiedniej podstawy.
        </p>
      </LegalSection>

      <LegalSection title="3. Cele i podstawy prawne">
        <ul className={legalListClassName}>
          <li>
            założenie i obsługa konta, publikowanie ofert, wiadomości,
            rezerwacje i opinie — wykonanie umowy o korzystanie z platformy
            (art. 6 ust. 1 lit. b RODO);
          </li>
          <li>
            potwierdzanie adresu, reset hasła, zabezpieczenie kont i
            przeciwdziałanie nadużyciom — wykonanie umowy oraz prawnie
            uzasadniony interes administratora polegający na zapewnieniu
            bezpieczeństwa (art. 6 ust. 1 lit. b i f RODO);
          </li>
          <li>
            obsługa zgłoszeń, moderacja i ochrona praw użytkowników — obowiązki
            prawne oraz prawnie uzasadniony interes w utrzymaniu bezpiecznej
            platformy (art. 6 ust. 1 lit. c i f RODO);
          </li>
          <li>
            reklamacje, korespondencja oraz ustalenie, dochodzenie lub obrona
            roszczeń — art. 6 ust. 1 lit. b, c lub f RODO, zależnie od sprawy.
          </li>
        </ul>
        <p>
          Podanie danych oznaczonych jako wymagane jest potrzebne do założenia
          konta lub skorzystania z danej funkcji. Dane profilu oznaczone jako
          opcjonalne można pominąć.
        </p>
      </LegalSection>

      <LegalSection title="4. Kto otrzymuje dane">
        <p>Dane mogą być przekazywane wyłącznie w niezbędnym zakresie:</p>
        <ul className={legalListClassName}>
          <li>
            Cloudflare, Inc. — hosting aplikacji, baza danych, przechowywanie
            zdjęć, bezpieczeństwo sieci i dzienniki techniczne;
          </li>
          <li>
            Plus Five Five, Inc. (Resend) — wysyłanie wiadomości dotyczących
            potwierdzenia konta i resetu hasła;
          </li>
          <li>
            organom publicznym, gdy obowiązek przekazania wynika z prawa;
          </li>
          <li>
            innym użytkownikom: publiczne są nazwa profilu, podstawowe dane
            profilu, ogłoszenia i opinie; wiadomości i szczegóły rezerwacji są
            dostępne tylko uczestnikom danej rozmowy lub rezerwacji.
          </li>
        </ul>
        <p>Danych osobowych nie sprzedajemy i nie wykorzystujemy do reklam behawioralnych.</p>
      </LegalSection>

      <LegalSection title="5. Przekazywanie danych poza EOG">
        <p>
          Dostawcy Cloudflare i Resend są podmiotami amerykańskimi, dlatego dane
          mogą być przetwarzane także poza Europejskim Obszarem Gospodarczym.
          Przekazanie odbywa się z zastosowaniem mechanizmów przewidzianych w
          RODO, w szczególności decyzji stwierdzającej odpowiedni stopień
          ochrony — gdy ma zastosowanie — lub standardowych klauzul umownych
          Komisji Europejskiej i dodatkowych zabezpieczeń.
        </p>
        <p>
          Informacje o zabezpieczeniach są dostępne w dokumentach dotyczących
          prywatności i przetwarzania danych Cloudflare oraz Resend.
        </p>
      </LegalSection>

      <LegalSection title="6. Jak długo przechowujemy dane">
        <ul className={legalListClassName}>
          <li>
            dane konta, profilu i treści — przez czas posiadania konta; po
            użyciu funkcji usunięcia konta usuwamy je od razu, a po przyjęciu
            żądania przesłanego e-mailem — co do zasady w ciągu 30 dni;
          </li>
          <li>
            dane potrzebne do rozpatrywania sporów, reklamacji, zgłoszeń i
            obrony roszczeń — maksymalnie przez 3 lata od zakończenia sprawy,
            chyba że przepis wymaga dłuższego okresu;
          </li>
          <li>
            linki potwierdzające e-mail i resetujące hasło — są ważne przez
            godzinę; aktywna sesja wygasa najpóźniej po 7 dniach, chyba że
            użytkownik wcześniej się wyloguje lub zmieni hasło;
          </li>
          <li>
            dane techniczne i liczniki bezpieczeństwa — co do zasady nie dłużej
            niż 12 miesięcy, a dane związane z incydentem przez okres potrzebny
            do jego wyjaśnienia i obrony roszczeń;
          </li>
          <li>
            korespondencja niezwiązana ze sporem — do 12 miesięcy od zakończenia
            sprawy.
          </li>
        </ul>
        <p>
          Niektóre dane mogą zostać usunięte wcześniej, gdy przestaną być
          potrzebne. Kopie techniczne mogą być usuwane z opóźnieniem wynikającym
          z cyklu ich nadpisywania.
        </p>
      </LegalSection>

      <LegalSection title="7. Prawa użytkownika">
        <p>Na zasadach określonych w RODO użytkownik ma prawo do:</p>
        <ul className={legalListClassName}>
          <li>dostępu do danych i otrzymania ich kopii;</li>
          <li>sprostowania, usunięcia lub ograniczenia przetwarzania;</li>
          <li>przenoszenia danych przetwarzanych na podstawie umowy;</li>
          <li>sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie;</li>
          <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</li>
        </ul>
        <p>
          Wniosek można wysłać na adres kontaktowy. Dla ochrony konta możemy
          poprosić o potwierdzenie tożsamości. Usunięcie danych może być
          ograniczone, jeśli dalsze przechowywanie jest wymagane prawem albo
          potrzebne do ustalenia, dochodzenia lub obrony roszczeń.
        </p>
      </LegalSection>

      <LegalSection title="8. Pliki cookie i podobne technologie">
        <p>
          Platforma używa wyłącznie technicznie niezbędnych plików cookie, w
          szczególności do utrzymania bezpiecznej sesji zalogowanego użytkownika.
          Bez nich logowanie i funkcje konta nie działają prawidłowo. Nie używamy
          marketingowych plików cookie ani narzędzi śledzących użytkownika do
          celów reklamowych, dlatego nie wyświetlamy banera zgody marketingowej.
        </p>
      </LegalSection>

      <LegalSection title="9. Osoby w wieku 16–17 lat">
        <p>
          Platforma jest dostępna od ukończenia 16 lat. Osoby w wieku 16–17 lat
          mogą korzystać z niej za zgodą przedstawiciela ustawowego. Jeśli
          dowiemy się, że konto założyła osoba młodsza, podejmiemy działania w
          celu jego zablokowania i usunięcia danych, chyba że ich zachowanie jest
          wymagane przez prawo.
        </p>
      </LegalSection>

      <LegalSection title="10. Automatyczne decyzje i zmiany polityki">
        <p>
          Nie podejmujemy wobec użytkowników decyzji wywołujących skutki prawne
          wyłącznie w sposób zautomatyzowany i nie profilujemy ich. Automatyczne
          mechanizmy mogą ograniczać nadmierną liczbę prób logowania. Oferty są
          porządkowane głównie chronologicznie i według kryteriów wyszukiwania.
        </p>
        <p>
          O istotnych zmianach polityki poinformujemy na platformie, a gdy
          będzie to wymagane lub uzasadnione — także e-mailem. Przy każdej
          wersji podajemy datę rozpoczęcia jej obowiązywania.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
