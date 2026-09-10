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

`assets/logos/` holds 30 marks, about 34 KB in total. Most are SVGs from Simple
Icons, which publishes them under CC0 in each brand's own colour. Codex and
VS Code are WebP built from files in `public/images/`, because their owners had
them removed from that set.

Visual Studio 2022 and MS Access are WebP too, built the same way from files
in `public/images/`.

OpenAI and DeepSeek were added for the home board's AI card. Grok has no mark:
xAI publishes none under an open licence, so that row uses a glyph.

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

## Palette

The page ground is white. `--cream` keeps its name for continuity but now holds
`#FFFFFF`; `--cream-2` is `#F1F3F7`, the light silver used for the small
surfaces that sit *on* a white card and would otherwise disappear — the AI and
FAQ pills, the plate behind the About photo, the flow window's chrome. The two
border tokens moved from warm beige to a cool grey (`#E4E7EC` / `#C7CDD8`),
because beige rules read yellow against white.

Every text pair was re-checked against the new ground and all clear AA; most
improved, since white is a brighter backdrop than cream. The tightest are
`--muted` on white at 6.08:1 and the green finish label at 5.02:1.

The Services flow window has a brushed-silver title bar: a three-stop vertical
gradient with a white highlight along the top edge, so it reads as window
chrome rather than a flat grey block.

## The right-hand edge

`.main` has symmetric page padding — about 60px each side — so the board stops
short of both screen edges by the same amount. That gutter is intended.

What was not intended was a visible line down it. The hero's decorative blob is
meant to bleed off the right of the screen, but `overflow-x: clip` sat on
`.section--hero`, so the blob was cut dead at the section's content box: tinted
to one pixel, pure white the next, straight down the page. The clip now sits on
`html`, so the cut lands at the viewport edge where it cannot be seen.

`clip` rather than `hidden` on purpose: it provides no scrolling mechanism, so
nothing can be scrolled sideways to reach what was cut, and it does not create a
scroll container, so the sticky mobile top bar keeps working. Note that
`documentElement.scrollWidth` still reports the blob's overflow under `clip` —
the only meaningful test is whether the page can actually be scrolled sideways,
which it cannot at any width from 420px up.

## Column width

`.main` is capped at `96rem`. It was `86rem`, which on a 1900px screen stopped
the content about 77px short of the right edge and left a dead strip there. The
cap still exists so text does not run edge to edge on an ultra-wide display,
but it no longer bites at ordinary desktop widths.

## No footer in the main column

The main column has no footer and no back-to-top button. One rule remains, at
the foot of the sidebar, and `--footer-h` now describes only that — it is what
the accessibility circle and panel are positioned against.

Two consequences the layout has to answer for:

- **Each view now centres in the whole screen** rather than in the space above
  a footer. `.js .main` still fills the viewport and `.js .main > .section`
  still uses `justify-content: safe center`.
- **A view that scrolls has no visual stop at the end.** The section's own
  bottom padding is that stop, and it is deliberately symmetric with the top:
  a centred view stays balanced, and a scrolling one ends with the same gap it
  began with.

At 1892x940, without the footer:

| View | Content | |
| --- | --- | --- |
| Home | 844 | fits, 96px spare |
| Projects | 590 | fits, 350px spare |
| FAQs / Contact | 805 | fits, 135px spare |
| About | 1359 | scrolls |
| Services | 1717 | scrolls |

Projects had the most room to give back, so its tiles went from 4:3 to 5:4 and
the board's padding and gaps grew with them.

## Projects: the row under the tiles

Two cards sit under the three project tiles, inside the same board.

**How I know it works** carries the quality story — the QA internship and the
QA lead role on Gourmet Gamble — and four practices applied across the three
projects. It ends in a rail of the artifacts: the thesis paper, the demo video
and GitHub. Those links existed before but only inside the TIDE-Y modal, which
meant a full undergraduate paper and a video of the robot were the hardest
things on the site to reach. They are on the page now.

**What each one taught me** is one line per project. Those lines are a draft
written from what the modals already say, not something Arbien dictated —
worth rereading before they go live.

Together they take the view from 590px to 811px in an 856px viewport, so the
page fills the screen with substance rather than padding. It fits from 1280px
wide up.

## Home: the bento board

Six cards on one tray, four columns wide. Projects and Booking process each
span two, which is what gives the board its stagger:

| Row | Cards |
| --- | --- |
| 1 | Projects (x2), About, AI tools proficiency |
| 2 | FAQs, Services, Booking process (x2) |

Each card is a link into the view it previews, so the board doubles as a second
navigation. Below 1200px it drops to two columns and below 760px to one.

**Projects deck.** The three thumbnails share one 6s animation, each with a
negative delay a third of a cycle apart, and the animation is `paused` until the
card is hovered or focused. Because hover only flips `animation-play-state`, the
deck resumes where it stopped instead of snapping back to the first shot.

The keyframes are pulled in two directions. The fade-out has to finish before
33.3%, because the other two shots are parked on exactly 33.3% and 66.7% while
paused — a crossfade still running there leaves a second shot half-visible at
rest. But the fade-in has to start early, at 87%, or the outgoing shot is gone
before the incoming one arrives and the deck dips to a third brightness
mid-handover. So: long fade in, short fade out. Both failure modes were found by
sampling the cycle at 24 points and checking the brightest shot at each.

**Booking process.** The card shows a miniature of the Services flow rather
than a list of the same words: two rows of stages wired together, the same
running dots, the same orange decision node and green finish. It is built in
CSS rather than being a screenshot, so it themes, scales, and cannot go stale
when the real diagram changes.

The dashed wrap between the rows stretches to fill whatever gap the card
leaves, capped at 3.2rem. Without the cap a tall card turned it into a large
empty box with the two rows pinned to the edges; without the stretch it floated
as a dashed line joined to nothing.

**AI tools.** Claude, ChatGPT, Gemini, DeepSeek and Grok, each with a three-dot
meter. The levels are a first guess — change them in `index.html`. Logos are
Simple Icons except Grok: xAI publishes no openly licensed mark, so that row
uses a glyph. Drop a file in `public/images/` if you want the real one.

**What was removed.** The hero statistics ("15+ projects built", "300+ bugs
caught", "100% responsive") were placeholders written before there was real
content, and the bento board took their place. The count-up code in
`js/script.js` went with them.

**The call to action.** `.home__cta` follows the reference's spec — a pill,
`flex-shrink: 0`, 8px gap — sized up from it: 54px tall on `0 26px` padding at
15px/600, because 46px read as too small on the page. It sits on `--navy`
rather than the accent, which means it flips to a light button with dark text
in dark mode with no second rule, since both tokens invert.

**Filling the screen.** `.js #home .bento` is `flex: 1 0 auto`, so the board
takes whatever height the hero and marquee leave instead of the view floating
in the middle of the screen with empty bands above and below it. `.bento` then
uses `grid-auto-rows: minmax(0, 1fr)` so its two rows split that height, and
each card's list (`.ailist`, `.qlist`, `.slist`, `.blist`) does the same with
its own rows. Growing the rows is the point: an earlier version used
`align-content: space-between`, which only moved the empty space in between
them.

`flex-shrink` stays 0 deliberately. Letting the board compress would squeeze
the cards under their content and clip them, since every card is
`overflow: hidden`. On a screen too short for the board the page scrolls
instead — verified down to 760px with no clipping.

**Fitting one screen.** Home fits from about 1500px wide up, at any of the
heights a desktop browser produces. Width matters as much as height here: the
narrower the cards, the more lines the copy in them wraps to, and the taller
the board becomes. Below about 1440px it scrolls.

Two things were wrong when this was first measured only at 1892px wide:

- The card lists used `grid-auto-rows: minmax(0, 1fr)` while sitting inside a
  `.bento` whose own rows were also `1fr`. Nested indefinite `fr` sizing
  inflated the outer row to 366px against a min-content of 275. The lists now
  use `auto` rows and rely on the grid's default stretch, which fills the card
  the same way without the feedback.
- The FAQ and Services rows, and several card descriptions, wrapped to two
  lines on narrower cards and doubled the height of their block. Those labels
  are now short enough to hold one line at the widths the four-column board is
  used.

The marquee and the board are separated by about 46px, so the board reads as
its own block rather than as part of the toolbar.

Measure it with the section height plus the footer height, not
`documentElement.scrollHeight`: `main` carries `min-height: 100vh`, so
scrollHeight can never report less than the viewport and always looks like a
perfect fit. That floor hid a 23px overflow at 940px for a while.

The margins are tight to make this work, so adding a row to any card list will
push it over.

## Services layout

The whole section sits on one board (`.sboard`) — the method panel, the five
service cards and the booking flow — using the same gradient tray Projects and
About use, so the three views read as one system.

The section carries `section--compact`, which is what keeps the heading on a
single line and starts the board high instead of leaving a dead column beside a
wrapped title. Inside the board every block runs tighter than it does
standalone: the tray's own padding already supplies the breathing room they
used to add themselves.

**The first screen ends at the cards.** The header, the method panel and the
five service cards run to about 755px, so all of it lands on one screen and the
booking flow (which starts at 784px) is what you scroll for. Getting there took
about 160px out of that block: the section header and board padding, the method
panel's padding, and — the largest single win — shortening four of the service
card descriptions so the text block is two lines rather than three. The
`min-height` on `.card--service .card__text` came down from `4.5em` to `2.8em`
with it.

**The booking flow never peeks.** `.js .sboard__top` — the wrapper around the
panel, the mid-title and the cards — carries
`min-height: calc(100vh - 7rem)`. The `7rem` is deliberately *smaller* than the
real distance from the top of the screen to that block, so its bottom always
lands a little past the fold and the flow underneath stays off-screen.

That min-height creates slack, and where it lands matters. Left alone it all
collected under the cards as one large gap. Most of it now goes between the
panel and the mid-title instead, via a `margin-top` on the mid-title, with
`margin-bottom: auto` on the grid taking whatever is left.

The block also starts a little lower, which turns headroom the cards were not
using into space above the panel rather than a dead band below them. Both gaps
are capped, because every pixel above the cards is a pixel of headroom they
lose at the bottom of the screen:

```css
.mid-title { margin-top: clamp(0px, min(7vh, (100vw - 1400px) / 3), 4.5rem); }
.panel     { margin-top: clamp(0px, min(8vh, (100vw - 1520px) / 4), 5rem); }
```

Width drives both because width decides how many lines the card copy wraps to
and therefore how tall the cards are. The panel's push starts higher, at
1520px, because between about 1440 and 1500 the cards are tall enough to need
every pixel. Both rules sit inside `@media (min-height: 840px)`; on a shorter
screen there is no headroom to spend and the gaps close entirely.

At 1569x856 that lands as 12px above the panel, 69px between the two blocks and
64px under the cards, where it used to be 0 / 69 / 89.

### Keeping the five cards aligned

Three things hold the badges on one row and the ticks on three shared rows, and
all three are load-bearing:

- `.card--service .card__text` is `flex: 1 1 auto`. A `min-height` alone was
  only a floor: on a narrower card the copy wrapped to a third line, that card
  grew, and its badge dropped below the others. Letting the block flex means
  the card's spare height collects there instead.
- The badge is `white-space: nowrap` with tightened letter-spacing. A wrapped
  badge is a line taller, which lifted its own top out of the row.
- `min-height` on `.checks li` allots two lines per tick. It is expressed in
  `em` against that element's own line-height, so changing one means changing
  the other.

None of that survives copy that is too long for the card, so the descriptions,
the badge labels and the tick text are all kept short enough to fit their
allotted lines at the narrowest width the five-column grid is used. That width
is now 1330px rather than 1250px — below it one line always spilled, so the
grid drops to three columns first.

Checked from 1340px to 1892px wide: badges and ticks aligned on every row, and
the booking flow off-screen at every one.

### Hover

Every card that reacts to a pointer takes the same orange edge: a single pixel
of `--accent-line` (`#F18A55`), a lighter orange than the brand `--accent`.
Only the colour changes on hover, never the width, so nothing reflows.

Five families carry it — the home bento cards, the project tiles, the service
cards, the About skill cards, and the method stages. The stages are the odd one
out: they have no border of their own, only an inset ring, so theirs is
`inset 0 0 0 1px var(--accent-line)` instead.

`--accent-line` is its own token rather than a literal so it inverts with the
theme (`#FFA278` on dark, and it collapses to the single strong orange under
high contrast). It sits at 2.5:1 on white — deliberately softer than a text
colour, since the lift and the shadow carry the affordance alongside it.


Every card in the section answers to a pointer, and each piece carries its own
transition rather than one shared shorthand:

- **Method stages** lift, warm their edge to orange, brighten the number, and
  raise their chips on a 50ms stagger. The icon tile already runs the
  `step-lit` loop, so hover pauses that and moves the glyph *inside* the tile
  instead — animating the tile's own transform here would fight the keyframes
  and win only until the next iteration.
- **Service cards** fan their three logo plates out (outer two rotate, middle
  one rises), warm the title, pop the badge, and slide the ticks right on a
  45ms stagger.
- **Flow nodes** lift and ring in their own state colour: orange for a normal
  step, green for `Finish project`, amber for `Proposal revised`. The state
  rules carry one more class than the plain one, so they outrank it.

All of it is cancelled under `prefers-reduced-motion` and `[data-motion="reduced"]`.

## Booking workflow diagram

The window's title bar is a three-column grid — `1fr auto 1fr` — with the
traffic lights in the first column and the third left empty to balance them.
Laying it out as a flex row instead centred the label in the space *beside* the
lights rather than on the bar, which put it about 27px right of centre.


The Services section ends with a flow diagram of the booking process. Nodes,
straight runs and redirections all live in the same percentage space (columns
at 8/24/40/56/72/88%, row one at 6%, row two at 60%, with a rail at 44%), so
they stay locked together at any width with no JavaScript.

Two rules carry the meaning:

- **Solid line, orange dot running along it** — the main path. Every dot is its
  own element sized to the exact gap it crosses, so it travels 0% to 100% of
  that run. Delays are staggered inline with `--d` to read as one cycle.
- **Dashed orange** — a redirection: `Meeting rescheduled` doubling back under
  row one, and `Proposal not accepted` dropping to `Proposal revised`.

Node states are colour-coded: peach for the entry, orange ring for the
decision, green for the finish, amber for the alternate outcome.

Below 1080px the diagram cannot stay legible, so the wires are hidden and the
nodes become a plain two-column list.


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
3. **Check the AI proficiency levels** on the home board. Daily / Often /
   Trying and the dot meters are a first guess, not something you told me.
4. GitHub and LinkedIn are live in the sidebar, the contact section and the
   JSON-LD `sameAs` array. Add other profiles to all three places if you want
   them listed.
5. The sidebar photo is `assets/profile.jpg`, a 400x400 square crop (19 KB)
   generated from `public/images/profile avatar.jpg` (3 MB, kept as the
   original). Regenerate the crop if you change the source photo. Never link
   the 3 MB original from the page.
6. Link previews currently reuse the profile photo. For a richer card, add a
   1200x630 image and point `og:image` and `twitter:image` at it.
