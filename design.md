# Piotr Bąk — Bio · Dokumentacja projektu

Strona typu **link-in-bio** dla Piotra Bąka (solo founder, generalista AI).
Statyczna strona WWW — czysty HTML/CSS/JS, bez frameworków i bez procesu
budowania. Gotowa do dalszej pracy w Antigravity i do wdrożenia na dowolnym
hostingu statycznym.

---

## 1. Struktura plików

```
piotr-bak-bio/
├── index.html              # cała treść strony (semantyczny HTML)
├── css/
│   ├── tokens.css          # DESIGN SYSTEM — zmienne (kolory, typografia, spacing…)
│   └── style.css           # style specyficzne dla tej strony (layout, komponenty)
├── js/
│   └── main.js             # ikony SVG (inline) + paralaksa kursora + „soczewka”
├── assets/
│   └── avatar-placeholder.svg   # ZASTĘPCZE zdjęcie profilowe — podmień na własne
└── design.md               # ten plik
```

Zależność: `index.html` ładuje **najpierw** `tokens.css` (zmienne), **potem**
`style.css` (który z tych zmiennych korzysta). `main.js` ładowany na końcu `<body>`.

### Co podmienić, żeby skończyć projekt
1. **Zdjęcie** — zastąp `assets/avatar-placeholder.svg` prawdziwym zdjęciem
   (np. `assets/piotr.jpg`) i zaktualizuj `src` w `<img class="avatar">`.
2. **Linki projektów** — w sekcji „Projekty" trzy karty mają `href="#"`
   (AI Ready, Smart Pixel, Wyszukiwarka NoCode, Zina). Wstaw docelowe adresy.
3. **Newsletter** — przycisk „Zapisz się" ma `href="#"`; podłącz do formularza
   zapisu (np. MailerLite, ConvertKit).
4. **Formularz kontaktowy** — działa przez `mailto:`. Dla produkcji warto
   podłączyć backend / usługę (Formspree, własny endpoint).

---

## 2. Identyfikacja wizualna — „Aurora"

Motyw przewodni marki to **gradient Aurora**: czerń → fiolet → magenta →
pomarańcz. Powierzchnia jest **ciemna** (dark-first). Gradient pojawia się jako
animowane tło (rozmyte „bloby"), jako akcent na chipach/dzielnikach oraz jako
wypełnienie tekstu (statystyki, eyebrow).

### Kolory (zmienne w `tokens.css`)

| Token | Wartość | Zastosowanie |
|---|---|---|
| `--ink` | `#0E0E10` | tło główne |
| `--ink-2` | `#19191B` | karty / powierzchnie wypukłe |
| `--ink-3` | `#26262A` | hover powierzchni |
| `--violet` | `#6B1DC9` | spektrum Aurora |
| `--magenta` | `#C8338A` | spektrum Aurora / akcent 2 |
| `--pink` | `#E91E63` | spektrum Aurora / danger |
| `--orange` | `#FF6B35` | **akcent główny** (CTA, linki) |
| `--fg-1` | `#FFFFFF` | tekst główny |
| `--fg-2` | `rgba(255,255,255,.72)` | tekst drugorzędny |
| `--fg-3` | `rgba(255,255,255,.50)` | podpisy / captions |
| `--line-1` | `rgba(255,255,255,.08)` | cienkie dzielniki |
| `--line-2` | `rgba(255,255,255,.16)` | obramowania / hover |

**Gradienty:** `--aurora` (radialny, pełne spektrum) i `--aurora-band`
(liniowy pasek do akcentów). `--glow-aurora` to charakterystyczna poświata pod
przyciskami CTA.

### Typografia

| Rola | Font | Token |
|---|---|---|
| Nagłówki / display | **Sora** (700/800) | `--font-display` |
| Tekst / UI | **Plus Jakarta Sans** (400–800) | `--font-body` |
| Mono / etykiety / kod | **JetBrains Mono** (400/600) | `--font-mono` |

Fonty z Google Fonts (import na górze `tokens.css`). Skala rozmiarów: modularna
1.25, zakotwiczona na 16 px (`--text-xs` … `--text-display`). Nagłówki używają
`clamp()` dla responsywności. `letter-spacing` ujemny na dużych nagłówkach
(`--tracking-tight: -0.02em`).

### Spacing, promienie, cienie
- **Spacing:** skala 4 px — `--s-1` (4px) … `--s-32` (128px).
- **Promienie:** `--r-xs` (6px) … `--r-2xl` (40px), `--r-pill` (999px).
- **Cienie:** `--shadow-1/2/3` (głębia) + `--glow-aurora` / `--glow-aurora-strong`
  (kolorowa poświata pod CTA).
- **Focus:** `--ring-focus` — podwójny halo (pomarańcz + magenta) na
  `:focus-visible`. Zachowaj dla dostępności.

### Ruch (motion)
- Easingi: `--ease-out`, `--ease-in`, `--ease-in-out`.
- Czasy: `--dur-fast` 120ms, `--dur-base` 200ms, `--dur-slow` 320ms.
- Animacje tła (`hue-cycle`, `drift-*`, `shimmer`) oraz wejścia sekcji (`.rise`).
- **Reduced motion:** wszystkie animacje są wyłączane przy
  `prefers-reduced-motion: reduce` (patrz koniec `tokens.css`).

---

## 3. Komponenty na stronie

| Komponent | Klasa CSS | Opis |
|---|---|---|
| Tło Aurora | `.aurora-bg`, `.blob`, `.horizon`, `.lens` | animowane, sterowane też przez `js/main.js` |
| Hero | `.hero`, `.avatar-ring`, `.ala` | zdjęcie w ramce-gradiencie, eyebrow, chipy ALA |
| Social | `.socials a` | okrągłe przyciski 46px (≥44px = dostępny target) |
| Statystyki | `.stats`, `.stat` | 3 kolumny, liczby w gradiencie Aurora |
| Karta flagowa | `.card-flagship` | wyróżniony projekt z poświatą |
| Karty linków | `.link-card`, `.link-emoji` | lista projektów |
| Newsletter | `.card-news`, `.btn-primary` | CTA z gradientowym przyciskiem |
| Kontakt | `.card-contact`, `.field` | formularz (mailto) |
| Stopka | `footer`, `.band` | pasek gradientu + copyright |

### Ikony
Ikony social/CTA to puste `<svg data-lucide="nazwa">` w HTML — `js/main.js`
wstrzykuje ścieżki (zestaw Lucide/Feather). Aby dodać nową ikonę: dopisz parę
`'nazwa': '<path…>'` do obiektu `ICONS` w `main.js` i użyj
`<svg data-lucide="nazwa"></svg>`.

---

## 4. Interakcje (`js/main.js`)

1. **Wstrzykiwanie ikon** — wypełnia `<svg data-lucide>` ścieżkami (brak
   zależności od CDN).
2. **Paralaksa kursora** — warstwy `.plx` przesuwają się względem kursora wg
   `data-depth`. Działa tylko przy `pointer: fine` i bez reduced-motion.
3. **Soczewka (`.lens`)** — szklane koło śledzące kursor (`backdrop-filter`),
   rozciągające się z prędkością ruchu; znika po bezruchu.

Wszystko degraduje się łagodnie: na dotyku / przy reduced-motion strona jest
statyczna, ale w pełni czytelna.

---

## 5. Uwagi techniczne / wdrożenie

- **Bez build-stepa.** Wystarczy serwować folder statycznie (Netlify, Vercel,
  GitHub Pages, zwykły hosting). Otwarcie `index.html` z dysku też działa,
  ale fonty Google i `backdrop-filter` najlepiej testować przez serwer HTTP.
- **Język:** `<html lang="pl">`. Treść po polsku.
- **SEO/Social:** w `<head>` są meta `description` i Open Graph — uzupełnij
  `og:image` i `og:url` przed publikacją.
- **Dostępność:** kontrast tekstu wysoki, focus-ring widoczny, `aria-label`
  na nawigacji i przyciskach, targety dotykowe ≥44px. Zachowaj te atrybuty.
- **Czego NIE ma w tej wersji:** w stosunku do prototypu usunięto panel
  „Tweaks" (React/Babel) oraz komponent `image-slot` z zapisem do sidecaru —
  to były narzędzia trybu projektowego, nie część produkcyjnej strony. Wartości
  domyślne (akcent `#FF6B35`, intensywność tła `--aurora-intensity: 1.05`) są
  zapisane na stałe w `tokens.css`. Aby zmienić akcent globalnie — edytuj
  `--accent` / `--link` w `tokens.css`.
