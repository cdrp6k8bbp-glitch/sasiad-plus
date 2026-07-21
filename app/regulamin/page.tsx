import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
  legalListClassName,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Regulamin | Sąsiad+",
  description: "Regulamin korzystania z platformy Sąsiad+.",
};

export default function RegulaminPage() {
  return (
    <LegalPage
      eyebrow="Wersja 1.0 · obowiązuje od 21 lipca 2026 r."
      title="Regulamin platformy Sąsiad+"
      intro="Ten dokument określa zasady bezpłatnego korzystania z platformy, publikowania ogłoszeń i kontaktowania się z innymi użytkownikami."
    >
      <LegalSection title="1. Usługodawca i kontakt">
        <p>
          Platformę Sąsiad+ prowadzi Magda Korcz, ul. Lotnicza 6/73, 76-200
          Redzikowo (dalej: „Usługodawca”).
        </p>
        <p>
          Kontakt, reklamacje oraz zgłoszenia dotyczące działania platformy lub
          treści: <a className="font-bold text-green-700 underline" href="mailto:korczm8@gmail.com">korczm8@gmail.com</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Czym jest Sąsiad+">
        <p>
          Sąsiad+ jest platformą umożliwiającą użytkownikom publikowanie i
          wyszukiwanie ogłoszeń dotyczących rzeczy oraz pomocy sąsiedzkiej,
          prowadzenie rozmów, składanie i obsługę rezerwacji, zapisywanie
          ulubionych ofert, wystawianie opinii po zakończonej rezerwacji oraz
          zgłaszanie niewłaściwych ogłoszeń.
        </p>
        <p>
          Korzystanie z platformy jest obecnie bezpłatne. Sąsiad+ nie pobiera
          prowizji, nie obsługuje płatności i nie jest stroną umów zawieranych
          pomiędzy użytkownikami. Warunki wydania rzeczy, wykonania usługi,
          płatności i odpowiedzialności ustalają bezpośrednio użytkownicy.
        </p>
      </LegalSection>

      <LegalSection title="3. Konto i wiek użytkownika">
        <ul className={legalListClassName}>
          <li>Konto może założyć osoba, która ukończyła 16 lat.</li>
          <li>
            Użytkownik w wieku 16–17 lat może korzystać z platformy wyłącznie za
            zgodą swojego przedstawiciela ustawowego.
          </li>
          <li>
            Podane dane muszą być prawdziwe i aktualne. Jedna osoba nie powinna
            podszywać się pod inną osobę ani udostępniać konta osobom trzecim.
          </li>
          <li>
            Adres e-mail musi zostać potwierdzony. Użytkownik odpowiada za
            poufność hasła i działania wykonane z jego konta.
          </li>
        </ul>
        <p>
          Użytkownik może usunąć konto samodzielnie w sekcji „Bezpieczeństwo”
          albo wysłać prośbę na adres kontaktowy. Przed usunięciem konta
          Usługodawca może poprosić o potwierdzenie tożsamości właściciela konta.
        </p>
      </LegalSection>

      <LegalSection title="4. Zasady publikowania treści">
        <p>Użytkownik może publikować wyłącznie treści, do których ma prawa i które są zgodne z prawem. Zabronione są w szczególności:</p>
        <ul className={legalListClassName}>
          <li>oszustwa, spam, treści wprowadzające w błąd i podszywanie się pod inne osoby;</li>
          <li>treści nawołujące do przemocy lub nienawiści, pornograficzne albo naruszające dobra osobiste;</li>
          <li>oferty rzeczy pochodzących z przestępstwa, broni, narkotyków, niebezpiecznych substancji oraz innych przedmiotów lub usług, których obrót jest zakazany;</li>
          <li>publikowanie danych osobowych innych osób bez podstawy prawnej oraz naruszanie praw autorskich.</li>
        </ul>
        <p>
          Użytkownik zachowuje prawa do swoich treści i udziela Usługodawcy
          niewyłącznej, bezpłatnej licencji na ich techniczne przechowywanie,
          wyświetlanie i przetwarzanie w zakresie potrzebnym do działania
          platformy.
        </p>
      </LegalSection>

      <LegalSection title="5. Ogłoszenia, wyszukiwanie i opinie">
        <p>
          Użytkownik publikujący ogłoszenie odpowiada za jego prawdziwość,
          kompletność, zdjęcia, cenę i zgodność oferowanego przedmiotu lub
          usługi z prawem. Wyniki są prezentowane przede wszystkim według daty
          dodania, od najnowszych, z uwzględnieniem wyszukiwanego hasła,
          kategorii i lokalizacji. Sąsiad+ nie oferuje płatnego promowania.
        </p>
        <p>
          Opinie może wystawić użytkownik po zakończonej rezerwacji. Opinie nie
          są sponsorowane. Zabronione jest manipulowanie ocenami i publikowanie
          opinii niezwiązanych z rzeczywistą współpracą.
        </p>
      </LegalSection>

      <LegalSection title="6. Bezpieczeństwo transakcji">
        <p>
          Użytkownicy samodzielnie oceniają wiarygodność drugiej strony i
          ustalają warunki współpracy. Nie należy przesyłać w wiadomościach
          haseł, kodów dostępu, danych kart ani skanów dokumentów tożsamości.
          Osoby niepełnoletnie powinny uzgadniać spotkania i transakcje z
          opiekunem.
        </p>
        <p>
          Usługodawca nie gwarantuje dostępności, jakości ani legalności ofert i
          nie odpowiada za niewykonanie ustaleń między użytkownikami, chyba że
          odpowiedzialności nie można wyłączyć na podstawie obowiązujących
          przepisów.
        </p>
      </LegalSection>

      <LegalSection title="7. Zgłoszenia i moderacja">
        <p>
          Ogłoszenie można zgłosić przyciskiem dostępnym na jego stronie.
          Zawiadomienie o treści uznawanej za nielegalną może też wysłać każda
          osoba na adres kontaktowy, wskazując dokładny adres ogłoszenia,
          uzasadnienie i — jeśli to potrzebne — dowody.
        </p>
        <p>
          Usługodawca rozpatruje zgłoszenia indywidualnie i może ograniczyć
          widoczność, zarchiwizować albo usunąć treść, ostrzec użytkownika,
          ograniczyć funkcje lub zablokować konto. Decyzja uwzględnia charakter
          naruszenia, jego skutki, powtarzalność i wcześniejsze ostrzeżenia. Nie
          stosujemy automatycznego podejmowania decyzji moderacyjnych.
        </p>
        <p>
          Użytkownik może odwołać się od decyzji moderacyjnej przez e-mail w
          ciągu 14 dni od otrzymania informacji o decyzji. Zgłoszenia oczywiście
          bezzasadne albo składane wielokrotnie w złej wierze mogą skutkować
          czasowym ograniczeniem możliwości zgłaszania, po uprzednim ostrzeżeniu.
        </p>
      </LegalSection>

      <LegalSection title="8. Wymagania techniczne i dostępność">
        <p>
          Do korzystania z platformy potrzebne są urządzenie z dostępem do
          Internetu, aktualna przeglądarka obsługująca JavaScript i pliki cookie
          oraz aktywny adres e-mail. Usługodawca może prowadzić prace techniczne
          i nie gwarantuje nieprzerwanej dostępności platformy.
        </p>
      </LegalSection>

      <LegalSection title="9. Reklamacje">
        <p>
          Reklamację dotyczącą usług platformy można wysłać na adres
          kontaktowy. Powinna zawierać opis problemu, datę jego wystąpienia i
          dane pozwalające udzielić odpowiedzi. Usługodawca odpowie bez zbędnej
          zwłoki, nie później niż w ciągu 14 dni, o ile sprawa nie wymaga
          dodatkowych informacji.
        </p>
      </LegalSection>

      <LegalSection title="10. Zmiany regulaminu">
        <p>
          Istotne zmiany regulaminu będą ogłaszane na platformie, a użytkownicy
          posiadający konto otrzymają informację z odpowiednim wyprzedzeniem,
          jeżeli zmiana wpływa na ich prawa lub obowiązki. Do działań wykonanych
          przed zmianą stosuje się wersję obowiązującą w chwili ich wykonania.
          Użytkownik, który nie akceptuje zmian, może zrezygnować z konta.
        </p>
        <p>
          W sprawach nieuregulowanych stosuje się prawo polskie. Postanowienia
          regulaminu nie ograniczają praw, których nie można wyłączyć umową.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
