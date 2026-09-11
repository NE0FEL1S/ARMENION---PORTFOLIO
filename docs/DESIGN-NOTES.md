# Design & implementation notes

Working notes for this repository: why the layout is built the way it is, the
constraints each decision was made under, and the measurements behind them.
Kept out of the README so that stays readable for visitors.

These are the notes that stop a future change from quietly breaking something —
most of them record a trade-off that is not visible in the CSS itself.

---

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

## Background field

A WebGL shader behind the page: a faint 48px grid plus thin contour lines
drawn from 2D simplex noise, drifting slowly (`js/script.js`, section 7).

Ported from the TopoField effect, which ships as a React component wrapping a
sandboxed iframe. The iframe only existed to isolate a demo page from the
effect, so none of that machinery is here — the fragment shader is the whole
thing, and it is framework-agnostic.

**Straight alpha, not a baked background.** The shader outputs
`vec4(ink, lines)` onto a transparent canvas with `premultipliedAlpha: false`,
so the page's own colour shows through and light and dark need no separate
build. The ink is navy on light, white on dark, switched per frame from
`data-theme`.

**The sidebar joins the same ground.** Neither `.main` nor `.sidebar` paints a
background, so the field runs unbroken across the full width instead of
stopping at the sidebar's edge. The sidebar gets its fill back under 900px,
where it becomes a drawer sliding over the page and has to be opaque.

`body` is transparent and the page ground lives on `html`, so the canvas can
sit at `z-index: -1` — under body's content, above html's background.

It stops for `prefers-reduced-motion`, for the reading-options motion switch
(watched with a `MutationObserver`), when the tab is hidden, and for print. If
the shader fails to compile or link, or WebGL is unavailable, the canvas is
left blank and the page carries on.

**Testing it.** Headless needs `--enable-unsafe-swiftshader --use-gl=angle
--use-angle=swiftshader` or there is no WebGL at all. `requestAnimationFrame`
is unreliable under `--virtual-time-budget`, so reading the canvas from script
shows a frozen image; diff whole screenshots taken at two budgets instead —
5s against 13s changes about 5% of pixels.

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

**The two calls to action.** "Get in touch" switches to the contact view;
"View resume" opens the Google Drive file in a new tab with
`rel="noopener noreferrer"` and a visually hidden "(opens in a new tab)" note,
since the icon alone cannot say that. The second is an outlined pill so the
navy one stays what the eye goes to first.

Adding it cost the hero copy about 200px of width, which turned the lede from
two lines into three — about 20px. That came back out of the board's padding
rather than out of the intro copy. `.hero__ctas` is `flex: 0 1 auto` with
`min-width: 0` so the pair can narrow and wrap; left at `flex: none` it held
its max-content width and overflowed a 375px screen by a pixel.

**The primary call to action.** `.home__cta` follows the reference's spec — a pill,
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
using into space above the panel rather than a dead band below them.

The gap between the panel and the mid-title is deliberately small — about 27px
at 1569x856. A larger one read as a void rather than as rhythm, so the space it
was holding went into the content instead: the mid-title moved up to `--fs-xl`,
and above 1520px wide the service cards take a step up in size (title to
`--fs-base`, copy and ticks to `--fs-xs`). That threshold exists because below
it the cards are narrow enough that the larger copy gains a line and pushes the
grid off the screen. Each of those `min-height` values moves with its
line-height, since together they are what hold the badges on one row and the
ticks on three.

The method panel kept its original sizes: its intro column is 34ch and its
stage columns are about 200px, so larger body text there buys whole extra lines
rather than presence — raising it added 83px to the panel and cost the cards
their place on the first screen.

Both gaps are capped, because every pixel above the cards is a pixel of
headroom they lose at the bottom of the screen:

```css
.mid-title { margin-top: clamp(0px, min((100vh - 820px)/3, (100vw - 1400px)/10), 6rem); }
.panel     { margin-top: clamp(0px, min((100vh - 820px)/3, (100vw - 1520px)/4),  6rem); }
```

Both terms matter. Width decides whether the card copy gains a line; height
decides whether there is any room to give. Drop the width term and 1500px and
1340px clip; drop the height term and a tall screen keeps the gaps at their
caps and dumps every spare pixel into one dead band under the cards, because
the cards are anchored to the top while the block's bottom follows the fold.

Above 920px tall the width cap is lifted — it exists to protect a short screen
and a tall one has the room regardless:

```css
@media (min-width: 901px) and (min-height: 920px) {
  .mid-title, .panel { margin-top: clamp(0px, calc((100vh - 830px) / 2.2), 8rem); }
}
```

Two more things set the gap above the booking label. `min-height` subtracts
`8.35rem`, which is the largest constant that still leaves the block ending
below the fold at every width — a bigger one and the flow starts peeking, a
smaller one and the block overshoots and the overshoot is empty. And
`.sboard .flowwrap` keeps only a small top margin, since the slack above it is
already doing that job.

The gap cannot go to zero: it is `(100vh + overshoot) - cards_bottom`, so
closing it means pushing the cards nearer the fold, and some clearance has to
stay. Measured from the cards to the label it now runs 28-50px at ordinary
sizes (42px at 1569x856), rising to about 110px only on a screen both wide and
tall, where the cards finish well above the fold.

The booking block's own heading runs at `--fs-3xl` with a `--fs-lg` sub — it
opens a section of its own, so it outranks the mid-title above it (38px against
23px).

Width drives both because width decides how many lines the card copy wraps to
and therefore how tall the cards are. The panel's push starts higher, at
1520px, because between about 1440 and 1500 the cards are tall enough to need
every pixel. Both rules sit inside `@media (min-height: 840px)`; on a shorter
screen there is no headroom to spend and the gaps close entirely.

Checked from 1340px to 1892px wide: the cards stay on the first screen, the
booking flow stays hidden, and the badges and ticks stay on their shared rows
at every width.

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

The Services card's rows go a step further: a bare orange glyph at rest, a
filled tile on hover. The fill is `--accent-tile` (`#EE6A22`) rather than the
lighter `--accent-line` used for the card edges, because a white glyph needs
3:1 against its own tile and `#F18A55` only reaches 2.47. `#EE6A22` is the
lightest orange that clears it, at 3.12, and it is already the tile colour
every other icon on the site uses.


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


## Mobile

Audited at iPhone SE (375), iPhone 14 (390), Pixel 7 (412), phone landscape
(844x390) and iPad portrait (768), across all five views.

The layout itself was already sound: nothing scrolls sideways, the sidebar goes
off-canvas behind a 54px menu button, project modals fit inside the screen with
a 47px close button, the booking diagram falls back to a stacked list below
1080px, and every grid steps down to fewer columns in the right order.

Four things needed fixing:

- **Form fields were 15.94px.** iOS Safari zooms the whole page in on a focused
  field under 16px and leaves the visitor scrolled sideways. They are now
  `max(16px, var(--fs-sm))`, which holds the floor without breaking the
  reading-options scale.
- **The Projects artifact links were 32px tall**, and FAQ summary rows 43px.
  Both are 44px from the 900px breakpoint down.
- **Nothing guarded the hover styles for touch.** A tap fires `:hover` and it
  latches until the next tap elsewhere, so cards sat lifted with an orange edge
  long after you had moved on. `@media (hover: none)` now resets every hover
  transform and colour, and hides the "hover to flip through" hint on the
  Projects card, since a deck that cycles on hover cannot cycle without a
  pointer.

A note on testing this: screenshots taken by pointing the headless browser
straight at a 390px window render the text clipped mid-word, which is an
artifact of that capture mode rather than the page. Measuring the boxes
(`.display` scrollWidth 349 against clientWidth 349) and rendering the page in
a visible frame both show it wrapping correctly. Trust the measurements.

## Sidebar

Three parts, separated by rules: the portrait and socials, the navigation, and
the copyright. The footer already carried a rule; the one above the nav
matches it.

The navigation is the site's primary one and has the room, so it runs two
points above body copy (`calc(var(--fs-base) + 2px)`) with generous row
spacing. The rules are 2px of `--border-strong`, not a hairline of `--border`:
the sidebar is transparent over the background field now, and a faint line
disappeared into the texture.

**The height ladder.** The accessibility circle is `position: fixed` against
the *bottom* of the viewport while the navigation is anchored to the top, so on
a short screen they meet — and enlarging the portrait and the type makes that
worse. Four height queries step the portrait down (and, under 790px, the social
buttons and the row spacing), since the portrait is the largest thing above the
nav and should be what gives ground:

| Viewport height | Portrait |
| --- | --- |
| above 940 | 10.6rem |
| 940 | 9.4rem |
| 880 | 8.6rem |
| 830 | 7rem |
| 790 | 5.8rem |

`assets/profile.jpg` is a 400x400 crop, which still covers the largest of those
(180px at 2x device pixels) — replace the crop before going any bigger.

Measured clearance between the last nav link and the circle runs 149 / 101 /
117 / 77 / 40 / 74 / 61px across 1028 down to 780 — never touching. Those
queries carry `min-width: 901px` so they never reach the mobile drawer.

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


---

## Maintenance notes

Things that are a deliberate choice or an open question rather than a bug, kept
here so a later change does not undo them by accident.

1. **The "View resume" button** points at a Google Drive file, and anyone with
   the link can open it. Check the sharing setting is what you intend, and
   update the URL in `index.html` when you revise the document.
2. **The AI proficiency levels** on the home board started as a first guess and
   have since been set deliberately: Claude and ChatGPT at Daily, Gemini,
   DeepSeek and Grok at Often. The label and the dot meter have to move together
   — three dots for Daily, two for Often — or a row says one thing and shows
   another. Grok is drawn as a glyph rather than a logo, because xAI publishes
   no openly licensed mark.
3. **The three "what each project taught me" lines** are drafted, not dictated.
   They read as the author's own words and should be checked against what he
   would actually say.
4. **Link previews reuse the profile photo.** For a richer card, add a 1200x630
   image and point `og:image` and `twitter:image` at it.
5. **The profile photo** is `assets/profile.jpg`, a 400x400 square crop (19 KB)
   generated from `public/images/profile avatar.jpg` (3 MB, kept as the
   original). Regenerate the crop if the source changes, and never link the
   3 MB original from the page.
6. **Social profiles** are listed in three places — the sidebar, the contact
   section and the JSON-LD `sameAs` array. Add any new one to all three.
7. **The `?v=` stamps** on the stylesheet and script links in `index.html` are
   the cache-buster. Bump them whenever `css/style.css` or `js/script.js`
   changes, or a returning visitor keeps the old file.

## Fitting the one-screen views

The three one-screen views used to be held to the fold by hand-fitted constants:
`min-height: calc(100vh - 8.35rem)` on the Services board, a `min-height: 100vh`
main column, and spacing ladders gated at `min-height: 840px` and `920px`. Each
of those numbers was measured against a single viewport, roughly 1600x900.

That is only ever correct on one machine. A browser viewport is a good deal
shorter than the screen it sits on — the tab strip, address bar and taskbar take
90-140px between them — so a 1920x1080 display at 125% scaling gives about
1520x760 to work with. At that size every ladder landed in a different branch
than the one it was tuned for, and all three views overflowed: home by 93px,
Services by 82px, About by 159px. The accessibility button overlapped the last
nav link on anything shorter than ~700px.

Two things were making it worse than it looked:

- **The scrollbar fed back into the layout.** Every headless measurement ran
  with `--hide-scrollbars`. In a real browser the scrollbar takes ~15px of
  width, which narrows the cards, which wraps the copy to another line, which
  makes the view taller, which keeps the scrollbar. `scrollbar-gutter: stable`
  on `html` holds the gutter open whether or not one is showing, so the layout
  width stops depending on the content height.
- **The measurement harness was lying.** `.js .reveal` parks every revealed
  block at `translateY(22px)` until its IntersectionObserver fires, and an
  off-screen iframe never intersects anything. `getBoundingClientRect` includes
  transforms, so every reading was inflated by 22px of overflow that did not
  exist. Any harness that measures this page must settle the reveals first —
  `data-motion="reduced"` on the root is the cheapest way.

The fix replaces prediction with derivation:

- Root type scales with the viewport's own height on desktop,
  `clamp(13px, 2.0833vh - 2px, 17px)` — about 1px of root per 48px of height,
  held between 13px and the 17px the design was drawn at. Because the views are
  sized in rem, one dial moves all of them together and the proportions hold on
  a short window. Gated to `min-width: 901px`; below that the views scroll and
  there is nothing to fit.
- The bento tray's gap, margin and padding are capped against the height as well
  as the width. They are the board's only reserve, because the board itself
  cannot shrink — the cards are `overflow: hidden` and would clip.
- The Services slack is distributed by three `auto` margins instead of two
  hand-fitted formulas, so whatever headroom the screen leaves is split between
  the space above the panel, the gap under it, and the room beneath the cards,
  rather than collecting as one dead band below the grid. The mid-title keeps no
  gap under it; it labels the grid and has to stay attached to it.

Measured after the change, with scrollbars showing and reveals settled, all
three views fit from 1600x900 down to 1280x720, and the Services board clears
the fold by the 8-10px that keeps the booking flow out of sight.

### The sidebar was shrinking twice

Making the root size follow the viewport height had a consequence that was not
obvious until it shipped: the sidebar is sized in rem too, so it started
shrinking along with the main column - on top of a four-step `max-height`
ladder (940, 880, 830, 790px) that was already stepping the portrait, the
padding, the nav gaps and the link height down.

That ladder was written when the root was pinned at 17px and the sidebar had no
other way to survive a short window. With the root scaling, the two compounded.
At 760px tall the portrait came out at **80px** against a designed 180px - while
174px of space sat unused between the last nav link and the accessibility
button. A component was shrinking hard to clear a limit it was nowhere near.

Deleting the ladder fixed it: the root scale alone shrinks the sidebar
proportionally and keeps the designed relationships intact. At 760px the
portrait went back to 147px and the dead space fell to 23px.

Three steps remain, at 719, 690 and 645px tall, and they earn their place for a
reason the old ladder did not: below about 720px the root hits its 13px floor
and stops scaling, so from there down the sidebar genuinely cannot shrink itself
out of trouble and the portrait has to give. Measured across 620-1040px tall,
the clearance under the nav now stays between 14 and 141px and never goes
negative.

The general lesson is worth keeping: when a global scale is introduced, any
component that already had its own size ladder now has two, and they multiply.
Search for `max-height` media queries before changing a root size.

## Cursor ring

An open ring that runs after the pointer, opening wider over anything a visitor
can act on. It is hollow in every state — nothing is ever painted inside it, so
text and images it passes over stay readable through the middle.

It sits **on top of** the system cursor rather than replacing it. Hiding the
real arrow is the usual way to build this, and it is the wrong trade: the arrow
is what tells a visitor whether they are over text, a link or a resize edge, and
a custom cursor that lags — or fails to load — leaves them with nothing.

Leaving the arrow visible is also what frees the ring to lag as far behind as it
does. The arrow already marks the exact point, so the ring carries no positional
duty at all: it is decoration and a hover cue, and is allowed to take most of a
second to catch up. An earlier version paired it with a small dot pinned to the
pointer; the dot was doing the arrow's job twice over, and filled the middle of
the ring whenever the pointer came to rest.

- The ring closes `0.04` of the remaining distance each frame on a `rAF` loop.
  Because the step is a fraction of what is left, it starts fast and settles
  slowly, which is what makes it read as something running after the pointer
  rather than pinned to it. It closes 95% of a long flick in about 73 frames,
  a little over a second — a long trail by the standards of the effect, and
  deliberately so. The value has come down three times: `0.18` tracked so
  closely it was not noticeable, then `0.08`, then `0.055`, each still reading
  as attached to the pointer. Only the visible arrow makes this affordable; the
  ring carries no positional duty, so it can take as long as it likes.
- Both are moved by a `transform` reading two custom properties, so the work
  stays on the compositor and never touches layout. The element is
  `position: fixed` with `pointer-events: none`, so it adds no scrollable area
  and cannot intercept a click.
- `background: none` in every state, including hover. An earlier version washed
  the middle with 12% of the ink over links, which is exactly the thing that
  stops a ring reading as an outline.
- Colour comes from a `--cursor-ink` token rather than the brand accent:
  **black on a light page**, where orange-on-orange would disappear over the
  hero copy and the accent chips, and the accent in dark mode, where black
  would vanish instead. High contrast takes black as well.
- `aria-hidden` — it is decoration, and assistive technology should never
  announce it.
- It refuses to start without a fine pointer (`hover: hover and pointer: fine`),
  ignores any event whose `pointerType` is not `mouse`, and stops when the tab
  is hidden or motion is reduced. CSS repeats each of those guards, so the
  reading options can switch it off mid-session.
- The ring's position is written once directly on the first pointer move rather
  than left to the loop. Until the first frame runs it has no coordinates at
  all, and would paint once in the top-left corner before snapping into place.

### Testing it headlessly

`requestAnimationFrame` runs at **1 fps** under headless Edge, against 60 in a
real browser. Anything driven by a rAF loop or a CSS transition therefore looks
stalled: a `.22s` transition never finishes, and an eased value advances by a
single step. Two things make the behaviour testable anyway — assert on one
easing step rather than on convergence (`80 + 0.18 * 350 = 143` exactly), and
inject `transition: none !important` so each state can be measured at its end
value instead of mid-ease.

Worse, the rAF loop is not merely slow but **unreliable**: in an iframe parked
off-screen it is suspended outright, and even on-screen it can decline to run
for many seconds together. A single timed sample is a coin flip. Where the
runtime value matters, drive the assertion off one observed step rather than off
convergence, and be ready to fall back to checking the constant in the file the
browser is actually served.

The transition trap is worth spelling out, because it reads exactly like a
broken stylesheet: `--cursor-ink` resolved correctly to `#000000` under
`data-theme="light"` while the ring's *computed* `border-color` stayed on the
previous theme's orange. Nothing was wrong — `border-color` is transitioned over
`.22s`, and at 1fps that transition had not advanced a single step. Always probe
the custom property and the computed value together; when they disagree, suspect
the transition before the cascade.
