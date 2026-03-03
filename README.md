# Squeeze 2.0

**Built in under 48 hours with [Figma Make](https://www.figma.com/make/) for the [Contra x Figma Make-a-thon](https://contra.com/).**

Squeeze is an interactive text compression demo that lets you physically *feel* information density change. Pinch, swipe, or scroll through 4 compression levels and watch words rearrange themselves in real time with smooth spring-physics animations.

---

## What it does

Pick a tab -- news articles, social threads, chat conversations, source code, or your own notes -- and squeeze. Each compression level roughly halves the word count:

| Level | Label | Behavior |
|-------|----------|--------------------------------------------------------------|
| 0 | Original | Full-length text (~800 words for news) |
| 1 | Summary | Key details preserved (~400 words) |
| 2 | Brief | Core facts only (~200 words) |
| 3 | Keywords | Single-paragraph distillation (~100 words) |

Every transition plays a **word-level diff animation** -- entering words fade/scale/rise in with staggered springs, exiting words drift out. You see exactly what changed, not just "before and after."

## Tabs

- **News** -- Three feature-length articles with pre-written compressions at every level. Squeeze to watch 800 words melt into 100.
- **Social** -- Reddit/Twitter-style thread feed. Compression groups nearby posts into per-author summary cards with colored borders and "Summary" badges instead of collapsing to a text block.
- **Chat** -- Messaging UI with conversation sidebar. Same structural summarization as Social -- message bubbles get grouped into per-person summary bubbles at higher compression levels.
- **Code** -- A React TodoList component with a meaningful compression progression: clean code (L0) -> JSDoc docstrings added (L1) -> function bodies replaced with pseudocode (L2) -> summary docblock only (L3). Syntax-highlighted with per-token coloring.
- **Notes** -- Write your own text, then squeeze it. Preview mode fires 3 parallel AI calls (levels 1-3) on open, cached per content hash. A 3-phase animated transition cross-fades between rendered markdown and the word-level diff layer. Manual AI summarize button works independently.
- **Settings** -- API key config (OpenRouter / Groq), model selection, theme toggle, level indicator visibility.

## Interaction

| Input | Action |
|-------------------------------|--------------------------------------|
| **Shift + Scroll** | Change compression level |
| **Two-finger vertical swipe** | Change compression level (mobile) |
| **Pinch in / out** | Compress / decompress (mobile) |
| **Dot indicator** | Click to jump to any level |

Touch gestures use passive listeners with a 120px swipe threshold and 400ms cooldown. Safari gesture events are unconditionally prevented. Viewport is locked to `maximum-scale=1, user-scalable=no` to avoid conflicts with pinch-to-zoom.

## Onboarding

First visit shows a fake "Terms of Cognitive Service" wall of text. Scroll to the bottom, hit Squeeze, and watch a **stepped compression cascade** -- each level transition (0 -> 1 -> 2 -> 3) fully plays its diff animation with generous pauses for reading before the text box dismisses and reveals the feature grid.

## Tech

| Layer | Stack |
|-----------------|--------------------------------------------------------------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 + full `--sq-*` CSS custom property system |
| Components | ~47 shadcn/ui primitives (Radix-based) |
| Animation | Motion (framer-motion v12) -- spring/inertia only, 2-keyframe constraint |
| State | Zustand |
| Diff engine | Custom hash-map accelerated greedy LCS (`useTextDiff.ts`) |
| AI | OpenRouter / Groq API integration with markdown-formatted responses |

### Architecture highlights

- **`useTextDiff`** -- Self-contained tokenizer splits text into `\S+` and `\s+` tokens, runs a greedy LCS diff, and exposes an `isNew` flag per token. Hash-map accelerated for O(n) average case.
- **`AnimatedText` / `AnimatedCode`** -- Reusable components using `AnimatePresence mode="popLayout"` with `initial={false}`. Persisted tokens get instant-enter variants (zero spring work) but retain full exit animations. New tokens get soft spring enter (stiffness 220, damping 18). Sequential linear stagger kicks in above 200 tokens to prevent GPU clustering.
- **Structural summarization** -- Chat and Social tabs keep their native UI at all compression levels. Instead of collapsing to a text block, nearby messages get grouped into per-person summary bubbles with staggered list-level animations.
- **No gradients anywhere** -- Design constraint enforced across all components.
- **Theme system** -- `--sq-*` tokens in both dark and light mode, bridged to shadcn's token system. Semi-transparent `--sq-surface` for layered elements, opaque `--sq-bg` for positioned overlays.

### Color palette

| Color | Hex | Usage |
|----------------|-----------|----------------------------------------------|
| Vivid orange | `#FF6D00` | Danger/error, upvotes, bookmarks |
| Amber | `#FF9E00` | Success, warnings, online status, reposts |
| Deep purple | `#240046` | Avatar accents, secondary depth |
| Medium purple | `#9D4EDD` | Primary accent -- buttons, links, badges |

## Project structure

```
src/app/
  App.tsx                    # Root -- theme sync, viewport lock, onboarding gate
  stores/appStore.ts         # Zustand store -- tabs, levels, settings, theme
  hooks/
    useTextDiff.ts           # Hash-map LCS diff engine with isNew flag
    useGestureCapture.ts     # Two-finger swipe + pinch detection
    useKeyboardControls.ts   # Shift+scroll, arrow keys
  components/
    AnimatedText.tsx          # Word-level diff animation (prose)
    AnimatedCode.tsx          # Word-level diff animation (syntax-highlighted)
    LevelIndicator.tsx        # Floating dot indicator
    ToneDial.tsx              # Tone selector (disabled, code preserved)
    Onboarding.tsx            # TOS cascade + feature grid
    TabBar.tsx                # Tab navigation
    TabContent.tsx            # Tab router + level/lock badges
    tabs/
      NewsTab.tsx             # 3 articles x 4 levels
      SocialTab.tsx           # Thread feed with structural summarization
      ChatTab.tsx             # Messaging UI with conversation sidebar
      CodeTab.tsx             # TodoList.tsx compression progression
      NotesTab.tsx            # Write + preview with AI compression
      SettingsTab.tsx         # API keys, model, theme, preferences
  content/
    news.ts                  # 3 articles, 4 compression levels each
    social.ts                # ~37 posts + pre-computed per-person summaries
    chat.ts                  # ~56 messages + per-person summaries per level
    code.ts                  # TodoList.tsx at 4 compression stages
  lib/
    constants.ts             # Levels, spring configs, step helpers
    ai.ts                    # OpenRouter/Groq API, prompt builder, fallbacks
```

## Running locally

```bash
pnpm install
pnpm run build
# or use Vite dev server
pnpm exec vite
```

## License

MIT
