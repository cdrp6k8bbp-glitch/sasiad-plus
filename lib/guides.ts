export type GuideSection = {
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

export type Guide = {
  slug: string;
  title: string;
  cardTitle: string;
  description: string;
  intro: string;
  icon: string;
  readingTime: string;
  publishedAt: string;
  updatedAt: string;
  categoryLabel: string;
  categoryHref: string;
  categoryCta: string;
  keywords: readonly string[];
  sections: readonly GuideSection[];
};

export const GUIDES: readonly Guide[] = [
  {
    slug: "gdzie-wypozyczyc-narzedzia-w-slupsku",
    title: "Gdzie wypożyczyć narzędzia w Słupsku?",
    cardTitle: "Gdzie wypożyczyć narzędzia w Słupsku?",
    description:
      "Sprawdź, jak znaleźć wiertarkę, drabinę, myjkę lub inne narzędzia do wynajęcia w Słupsku i bezpiecznie ustalić warunki odbioru.",
    intro:
      "Do pojedynczego remontu, montażu półki czy porządków po przeprowadzce często nie opłaca się kupować urządzenia na własność. Lokalne wypożyczenie pozwala znaleźć potrzebny sprzęt blisko domu, ustalić krótki termin i ograniczyć koszty oraz zbędne zakupy.",
    icon: "🛠️",
    readingTime: "5 min czytania",
    publishedAt: "2026-09-05",
    updatedAt: "2026-09-05",
    categoryLabel: "sprzęt i narzędzia w Słupsku",
    categoryHref: "/sprzet?location=Słupsk",
    categoryCta: "Zobacz sprzęt dostępny w Słupsku",
    keywords: [
      "wypożyczalnia sprzętu Słupsk",
      "wynajem narzędzi Słupsk",
      "wiertarka Słupsk",
      "lokalne ogłoszenia Słupsk",
    ],
    sections: [
      {
        heading: "Zacznij od określenia zadania",
        paragraphs: [
          "Najpierw zapisz, co dokładnie chcesz wykonać i na jakim materiale. Do wiercenia w drewnie wystarczy inne urządzenie niż do żelbetu, a do prania tapicerki potrzebny będzie odpowiedni odkurzacz i środek czyszczący. Dzięki temu łatwiej wybrać właściwą ofertę i uniknąć dodatkowego odbioru akcesoriów.",
          "W wyszukiwarce Sąsiad+ możesz podać nazwę sprzętu oraz Słupsk jako miejscowość. Warto sprawdzić także podobne określenia, na przykład wiertarka i młotowiertarka albo myjka i myjka ciśnieniowa.",
        ],
      },
      {
        heading: "Co ustalić przed wypożyczeniem?",
        paragraphs: [
          "Przed potwierdzeniem terminu napisz do właściciela i ustal pełne warunki. Sama cena nie mówi jeszcze, czy w zestawie znajdują się końcówki, przewód, ładowarka, bateria albo instrukcja. Zapytaj też, kiedy sprzęt można odebrać i w jakim stanie powinien wrócić.",
        ],
        bullets: [
          "dokładny model, przeznaczenie i sposób zasilania urządzenia",
          "wyposażenie zestawu oraz elementy eksploatacyjne",
          "czas wypożyczenia, cena, odbiór i termin zwrotu",
          "zasady odpowiedzialności za uszkodzenie lub zgubienie akcesoriów",
          "krótka instrukcja bezpiecznego uruchomienia sprzętu",
        ],
      },
      {
        heading: "Sprawdzenie przy odbiorze",
        paragraphs: [
          "Obejrzyj obudowę, przewód, wtyczkę, osłony i ruchome części. Poproś o krótkie uruchomienie urządzenia, a stan oraz komplet akcesoriów zapiszcie w wiadomości. Jeśli nie znasz danego narzędzia, poproś właściciela o pokazanie podstawowej obsługi. Nie używaj sprzętu z widocznym uszkodzeniem ani niezgodnie z przeznaczeniem.",
          "Po zakończeniu pracy oczyść urządzenie w sposób zalecony przez właściciela. Oddaj cały zestaw o ustalonej porze i od razu poinformuj o każdej usterce. Taka prosta procedura buduje zaufanie i ułatwia kolejne sąsiedzkie wypożyczenia.",
        ],
      },
      {
        heading: "Jak znaleźć ofertę blisko domu?",
        paragraphs: [
          "Najwygodniejsza oferta nie zawsze jest najtańsza — znaczenie ma odległość, dostępny termin, komplet wyposażenia i łatwy kontakt. Porównaj kilka lokalnych ogłoszeń. Jeżeli nie ma dokładnie takiego sprzętu, jakiego potrzebujesz, zapytaj właściciela podobnej oferty lub dodaj własne ogłoszenie z informacją, czego szukasz.",
        ],
      },
    ],
  },
  {
    slug: "ile-kosztuje-opieka-nad-psem-podczas-urlopu",
    title: "Ile kosztuje opieka nad psem podczas urlopu?",
    cardTitle: "Ile kosztuje opieka nad psem podczas urlopu?",
    description:
      "Dowiedz się, od czego zależy koszt opieki nad psem, jakie formy opieki porównać i co ustalić z opiekunem przed wyjazdem.",
    intro:
      "Koszt opieki nad psem nie ma jednej stałej wartości. Zależy od formy opieki, liczby dni i wizyt, potrzeb zwierzęcia, lokalizacji oraz doświadczenia opiekuna. Najlepiej porównywać nie tylko cenę, ale cały zakres pomocy.",
    icon: "🐕",
    readingTime: "6 min czytania",
    publishedAt: "2026-09-05",
    updatedAt: "2026-09-05",
    categoryLabel: "opieka nad zwierzętami",
    categoryHref: "/kategoria/zwierzeta?location=Słupsk",
    categoryCta: "Sprawdź ogłoszenia opieki nad zwierzętami",
    keywords: [
      "opieka nad psem Słupsk",
      "opieka nad psem podczas urlopu",
      "petsitter Słupsk",
      "wyprowadzanie psa",
    ],
    sections: [
      {
        heading: "Najczęstsze sposoby rozliczenia opieki",
        paragraphs: [
          "Opiekun może rozliczać pojedynczy spacer lub wizytę, pełną dobę pobytu psa, nocleg w domu właściciela albo cały ustalony okres. Dlatego przed porównaniem ofert sprawdź, co obejmuje podana cena. Dwie podobnie nazwane usługi mogą różnić się liczbą spacerów, długością wizyt, karmieniem czy opieką nocną.",
          "Aktualne stawki najlepiej sprawdzić bezpośrednio w lokalnych ogłoszeniach, ponieważ zmieniają się w zależności od terminu, miejscowości i zakresu. W okresach świątecznych i wakacyjnych dostępność może być mniejsza, dlatego szukanie opiekuna warto rozpocząć wcześniej.",
        ],
      },
      {
        heading: "Co wpływa na końcowy koszt?",
        paragraphs: [
          "Znaczenie ma nie tylko długość urlopu. Opieka nad spokojnym dorosłym psem może wymagać innego nakładu czasu niż opieka nad szczeniakiem, seniorem albo zwierzęciem przyjmującym leki. Dodatkowe dojazdy, kilka spacerów dziennie lub stała obecność również wpływają na warunki.",
        ],
        bullets: [
          "liczba i długość spacerów lub wizyt w ciągu dnia",
          "pobyt u opiekuna albo opieka w domu psa",
          "podawanie leków i inne szczególne potrzeby",
          "opieka nad więcej niż jednym zwierzęciem",
          "dojazd, termin świąteczny oraz pilna rezerwacja",
        ],
      },
      {
        heading: "Jak dobrze porównać oferty?",
        paragraphs: [
          "Poproś o jedną łączną kwotę za cały pobyt i listę czynności w cenie. Ustal godziny przekazania i odbioru psa, częstotliwość kontaktu oraz sposób informowania o samopoczuciu zwierzęcia. Warto wcześniej umówić krótkie spotkanie zapoznawcze, zwłaszcza gdy pies zostaje z nową osobą po raz pierwszy.",
          "Najniższa cena nie powinna być jedynym kryterium. Liczą się doświadczenie opiekuna, warunki pobytu, podejście do zwierzęcia i jasna komunikacja. Jeśli pies ma problemy zdrowotne lub behawioralne, powiedz o nich przed zawarciem ustaleń.",
        ],
      },
      {
        heading: "Lista informacji dla opiekuna",
        paragraphs: [
          "Przygotuj karmę, smycz, szelki, legowisko lub ulubiony koc oraz książeczkę zdrowia, jeśli może być potrzebna. Zostaw numer telefonu do siebie, osoby zapasowej i lecznicy. Opisz pory karmienia, zwyczaje na spacerach, reakcje na psy i ludzi oraz to, czego należy unikać. Dzięki temu opiekun może rzetelnie ocenić zakres pracy jeszcze przed potwierdzeniem ceny.",
        ],
      },
    ],
  },
  {
    slug: "co-mozna-bezpiecznie-pozyczyc-od-sasiada",
    title: "Co można bezpiecznie pożyczyć od sąsiada?",
    cardTitle: "Co można bezpiecznie pożyczyć od sąsiada?",
    description:
      "Praktyczna lista rzeczy, które warto pożyczać lokalnie, oraz zasady bezpiecznego odbioru, użytkowania i zwrotu.",
    intro:
      "Pożyczanie rzeczy używanych tylko od czasu do czasu oszczędza miejsce i ogranicza niepotrzebne zakupy. Najlepiej sprawdzają się przedmioty łatwe do obejrzenia, proste w obsłudze i możliwe do zwrócenia w niezmienionym stanie.",
    icon: "🤝",
    readingTime: "5 min czytania",
    publishedAt: "2026-09-05",
    updatedAt: "2026-09-05",
    categoryLabel: "lokalne ogłoszenia",
    categoryHref: "/sprzet",
    categoryCta: "Zobacz rzeczy dostępne w okolicy",
    keywords: [
      "co pożyczyć od sąsiada",
      "bezpieczne wypożyczanie",
      "lokalne wypożyczanie sprzętu",
      "ekonomia współdzielenia",
    ],
    sections: [
      {
        heading: "Rzeczy dobre do lokalnego pożyczania",
        paragraphs: [
          "Najwięcej sensu ma udostępnianie sprzętu, który przez większość czasu leży nieużywany. Mogą to być narzędzia do drobnych napraw, drabina, odkurzacz piorący, projektor, namiot, akcesoria turystyczne albo sezonowy sprzęt ogrodowy. Przedmiot powinien być sprawny, kompletny i zgodny z opisem.",
        ],
        bullets: [
          "proste narzędzia ręczne i urządzenia do prac domowych",
          "sprzęt do sprzątania, ogrodu i okazjonalnych remontów",
          "namioty, śpiwory, bagażniki i bezpieczne akcesoria turystyczne",
          "stoły, krzesła, projektory i wyposażenie na wydarzenia",
          "rzeczy dziecięce bez funkcji ochronnej, po dokładnym sprawdzeniu stanu",
        ],
      },
      {
        heading: "Przy czym zachować szczególną ostrożność?",
        paragraphs: [
          "Nie pożyczaj przedmiotu, którego stanu nie potrafisz ocenić lub obsługi nie znasz. Szczególnej ostrożności wymagają urządzenia tnące, sprzęt pracujący pod dużym obciążeniem, instalacje gazowe i elektryczne oraz wyposażenie ochronne. Jeśli bezpieczeństwo zależy od historii użytkowania lub profesjonalnego przeglądu, lepszym wyborem może być wyspecjalizowana wypożyczalnia.",
          "Nie udostępniaj leków, dokumentów, kont, haseł ani przedmiotów, których przekazanie jest zabronione prawem. Rzeczy osobiste i higieniczne powinny pozostać poza zwykłym obiegiem sąsiedzkim.",
        ],
      },
      {
        heading: "Pięć zasad bezpiecznego pożyczania",
        paragraphs: [
          "Jasne ustalenia chronią obie strony. Zapiszcie w wiadomości, co dokładnie jest przekazywane, na jaki czas i w jakiej cenie. Przy odbiorze obejrzyjcie przedmiot oraz krótko sprawdźcie jego działanie. Właściciel powinien wskazać podstawowe zasady użytkowania, a osoba wypożyczająca zgłosić każdą usterkę.",
        ],
        bullets: [
          "sprawdź profil, opis i zgodność przedmiotu ze zdjęciami",
          "ustal cenę, termin, komplet akcesoriów i miejsce zwrotu",
          "zrób zdjęcie stanu przy przekazaniu, jeśli przedmiot ma większą wartość",
          "używaj rzeczy wyłącznie zgodnie z przeznaczeniem",
          "oddaj ją czystą, kompletną i o uzgodnionej godzinie",
        ],
      },
      {
        heading: "Co zrobić, gdy coś się zepsuje?",
        paragraphs: [
          "Przerwij używanie, zabezpiecz przedmiot i jak najszybciej napisz do właściciela. Nie próbuj samodzielnej naprawy bez jego zgody. Spokojnie ustalcie przyczynę i dalsze kroki na podstawie wcześniejszych wiadomości oraz stanu sprzętu przy odbiorze.",
        ],
      },
    ],
  },
  {
    slug: "jak-przygotowac-sprzet-do-wypozyczenia",
    title: "Jak przygotować sprzęt do wypożyczenia?",
    cardTitle: "Jak przygotować sprzęt do wypożyczenia?",
    description:
      "Lista kroków dla właściciela: kontrola stanu, dobre zdjęcia, opis wyposażenia, zasady przekazania i bezpieczny zwrot sprzętu.",
    intro:
      "Dobrze przygotowany sprzęt łatwiej wypożyczyć, a jasny opis ogranicza nieporozumienia. Przed publikacją ogłoszenia sprawdź działanie urządzenia, zgromadź wszystkie elementy i opisz zasady prostym językiem.",
    icon: "📋",
    readingTime: "6 min czytania",
    publishedAt: "2026-09-05",
    updatedAt: "2026-09-05",
    categoryLabel: "dodawanie ogłoszenia",
    categoryHref: "/dodaj",
    categoryCta: "Dodaj przygotowane ogłoszenie",
    keywords: [
      "jak przygotować sprzęt do wynajmu",
      "ogłoszenie wynajmu sprzętu",
      "bezpieczne wypożyczanie sprzętu",
      "wynajem sprzętu od sąsiada",
    ],
    sections: [
      {
        heading: "Sprawdź stan i kompletność",
        paragraphs: [
          "Uruchom sprzęt i sprawdź wszystkie podstawowe funkcje. Obejrzyj przewody, wtyczki, osłony, uchwyty, akumulatory i elementy robocze. Jeśli urządzenie wymaga przeglądu lub naprawy, wykonaj ją przed dodaniem ogłoszenia. Nie udostępniaj rzeczy, która może stwarzać zagrożenie.",
          "Przygotuj listę elementów zestawu: ładowarkę, baterie, końcówki, klucze, walizkę, instrukcję lub dodatkowe przewody. Oznacz drobne części i przechowuj je razem, aby łatwo sprawdzić komplet przy zwrocie.",
        ],
      },
      {
        heading: "Zrób czytelne zdjęcia i uczciwy opis",
        paragraphs: [
          "Fotografuj w dobrym świetle na spokojnym tle. Pokaż cały przedmiot, tabliczkę z modelem, wyposażenie oraz istniejące ślady używania. Zdjęcia powinny przedstawiać rzeczywisty egzemplarz. W tytule wpisz konkretną nazwę, a w opisie przeznaczenie, najważniejsze parametry i ograniczenia.",
        ],
        bullets: [
          "marka, model i rodzaj zasilania",
          "zastosowanie oraz niezbędne materiały eksploatacyjne",
          "dokładna zawartość zestawu",
          "znane rysy, zużycie lub inne cechy stanu",
          "lokalizacja, cena i dostępne terminy odbioru",
        ],
      },
      {
        heading: "Ustal zasady przed przekazaniem",
        paragraphs: [
          "Napisz, czy cena dotyczy godziny, dnia czy całego okresu. Ustal godzinę odbioru i zwrotu, sposób czyszczenia, dopuszczalne zastosowanie oraz postępowanie w razie awarii. Najważniejsze informacje potwierdźcie w wiadomości, aby obie strony miały do nich dostęp.",
          "Przy odbiorze pokaż, jak bezpiecznie uruchomić i zatrzymać urządzenie. Wspólnie sprawdźcie stan oraz komplet akcesoriów. Jeśli sprzęt wymaga doświadczenia, środków ochronnych lub szczególnych warunków pracy, wyraźnie o tym powiedz.",
        ],
      },
      {
        heading: "Odbiór po wypożyczeniu",
        paragraphs: [
          "Po zwrocie sprawdź urządzenie w obecności osoby wypożyczającej. Policz elementy zestawu, obejrzyj obudowę i uruchom podstawową funkcję. Drobne naturalne zużycie odróżnij od uszkodzenia. Jeśli pojawił się problem, omówcie go spokojnie, odnosząc się do stanu zapisanego przy przekazaniu.",
          "Na koniec oczyść i wysusz sprzęt, naładuj akumulator i zaktualizuj dostępność w ogłoszeniu. Regularne przygotowanie sprawia, że następna osoba otrzyma bezpieczny i kompletny zestaw.",
        ],
      },
    ],
  },
] as const;

export const GUIDE_SLUGS = GUIDES.map((guide) => guide.slug);

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
