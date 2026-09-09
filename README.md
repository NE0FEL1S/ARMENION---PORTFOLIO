# Arbien M. Armenion — Portfolio

A hand-built portfolio for a web developer with quality assurance experience.
No frameworks, no build step, no dependencies to install.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Markup | Semantic HTML5 | Every word is in the source, so crawlers index it instantly |
| Styling | CSS3 with custom properties | Theming, dark mode and text scaling with no preprocessor |
| Behaviour | Vanilla JavaScript | About 14 KB unminified, no runtime to download |
| Font | Poppins (Google Fonts) | Requested; loaded with `preconnect` and `display=swap` |
| Icons | Phosphor Icons (CDN) | Requested; icon font, tree of styles loaded on demand |

A framework would add a build pipeline and a hydration cost to a site that is
pure static content. Plain files load faster and deploy anywhere.

## Run it locally

Any static server works. From the project folder:

```bash
# Python (already on most machines)
python -m http.server 5173

# or Node
npx serve .
```

**Caching while you edit.** `python -m http.server` sends only `Last-Modified`
and no `Cache-Control`, so a browser can keep serving an old `style.css` after
you change it, and the page renders with stale rules. The `?v=` stamps on the
stylesheet and script links in `index.html` handle this: bump them whenever you
edit those files. If a change still does not show, hard reload with
`Ctrl` + `Shift` + `R`.

Then open <http://localhost:5173>.

Opening `index.html` directly with `file://` also works, but a server is closer
to production and keeps relative paths honest.

## Structure

```
index.html        all page content and SEO metadata
css/style.css     design tokens, layout, components, responsive rules
js/script.js      theme, navigation, scroll spy, animations, reading options
assets/           favicon
robots.txt        crawler rules
sitemap.xml       sitemap for search engines
```

## Logos

`assets/logos/` holds 28 marks, about 31 KB in total. Most are SVGs from Simple
Icons, which publishes them under CC0 in each brand's own colour. Codex and
VS Code are WebP built from files in `public/images/`, because their owners had
them removed from that set.

Visual Studio 2022 and MS Access are WebP too, built the same way from files
in `public/images/`.

SQL, test cases and bug reports use glyphs on purpose. They are not brands.

Two helper classes handle legibility, since the cards are white in light mode
and dark in dark mode: `--dim` flips a near-black mark to white in dark mode
(GitHub, Next.js, CSS, .NET), and `--pale` outlines a very light one so it
reads on white (JavaScript, React).

## Demo video

The TIDE-Y card shows a poster image with a play button. Clicking it swaps in a
`youtube-nocookie.com` iframe, so none of YouTube's scripts or cookies load
unless a visitor asks to watch. The video id lives in one place, the
`data-video` attribute on the play button in `index.html`.


## About page layout

Two boards, each on the same gradient tray used by Projects and FAQs. The upper
one holds the summary, the timeline and the quote; the lower one holds the four
"What I work with" cards.

Hovering a skill card runs several coordinated moves rather than one: the card
lifts and its border warms, the icon tips and grows, the title changes colour,
the numbers warm, and the rows slide right one after another on a 35ms stagger.
All of it is cancelled under `[data-motion="reduced"]` and
`prefers-reduced-motion`.

About is the one view that does not fit a single screen. With both boards it
runs about 330px past a 1028px-tall window, so this view scrolls.


Two tokens carry the board look: `--tray-edge` draws the border that makes a
board read as a card rather than a background wash, and `--accent-tile` is the
lighter orange used behind a card's icon. The tile is lighter than
`--accent-fill` on purpose, and stops at #EE6A22 because a white glyph on it
measures 3.12:1, just past the 3:1 floor for a graphical object.

## Accessibility

Built for visitors who are older or have low vision.

- Base and body text are **16px** at a 1.65 line height. Card copy is 14px and
  small uppercase labels are 13px.
- A floating **reading options** panel scales the whole type system up to
  **175%** (28px body text), turns on high contrast, and reduces motion.
  Choices are remembered per browser.
- The type scale is a deliberate trade-off: it is sized for looks by default,
  and readers who need larger text raise it themselves and keep that setting.
- Every colour pair meets WCAG AA contrast; high-contrast mode pushes past AAA.
- Full keyboard support, a skip link, visible focus rings, ARIA landmarks, and
  interactive targets of at least 44px.
- `prefers-reduced-motion` and `prefers-color-scheme` are both respected.

## SEO

Title and meta description, canonical URL, Open Graph and Twitter Card tags,
JSON-LD `Person` and `WebSite` structured data, one `h1` with a clean heading
hierarchy, descriptive link text, `robots.txt` and `sitemap.xml`.

## Before you deploy

1. Replace `https://arbienarmenion.com/` in `index.html`, `robots.txt` and
   `sitemap.xml` with your real domain.
2. The Projects section holds three real entries, all complete: Sagip Pilipinas,
   Gourmet Gamble and the Project TIDE-Y thesis. Card images live in
   `assets/projects/` at 960x540 WebP, about 214 KB for all three. Gourmet
   Gamble lists feature chips rather than a tech stack, which was never
   specified.
3. **Check the hero statistics.** "15+ projects built", "300+ bugs caught" and
   "100% responsive" were placeholders written before there was any real
   content. Replace them with figures you can stand behind, or drop the block.
4. GitHub and LinkedIn are live in the sidebar, the contact section and the
   JSON-LD `sameAs` array. Add other profiles to all three places if you want
   them listed.
5. The sidebar photo is `assets/profile.jpg`, a 400x400 square crop (19 KB)
   generated from `public/images/profile avatar.jpg` (3 MB, kept as the
   original). Regenerate the crop if you change the source photo. Never link
   the 3 MB original from the page.
6. Link previews currently reuse the profile photo. For a richer card, add a
   1200x630 image and point `og:image` and `twitter:image` at it.
