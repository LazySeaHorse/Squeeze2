# Squeeze — Comprehensive Specification

## 1. Vision

**One sentence:** Pinch-to-zoom, but for meaning.

**The thesis:** Information density should be a physical, continuous control — like volume. You squeeze to compress text into its essence. You spread to expand into detail. You rotate to shift tone. The interaction is so intuitive it needs no explanation.

**Cultural hook:** We're drowning in text. Squeeze is the primitive that lets you control how much you consume, at the gesture level.

---

## 2. Core Interaction Model

### 2.1 The Two Gestures

| Gesture | Function | Visual Feedback |
|---------|----------|-----------------|
| **Pinch/Spread** | Control semantic compression level (-1 to 3) | Text physically squeezes/expands with particle animation |
| **Two-finger Rotate** | Switch tone preset | Radial dial appears, rotates with fingers |

### 2.2 Input Mapping

| Platform | Compression | Tone |
|----------|-------------|------|
| **Mobile/Tablet** | Pinch gesture | Two-finger rotate |
| **Desktop (trackpad)** | Pinch gesture (captured via ctrlKey + wheel) | — |
| **Desktop (mouse)** | Shift + Scroll | Ctrl + Shift + Scroll |
| **Desktop (keyboard)** | Arrow Up/Down (when focused) | Arrow Left/Right (when focused) |

### 2.3 Gesture Capture

All native browser zoom/scroll behaviors must be intercepted and suppressed within the interaction zone. The app owns these gestures completely.

---

## 3. Compression System

### 3.1 Levels

Five discrete levels on a continuous gesture input:

| Level | Name | Description | Example (for a news article) |
|-------|------|-------------|------------------------------|
| **-1** | Expanded | Original + additional facts, explanations, context, sources | Full article + "Related context: ...", inline citations, explanatory asides |
| **0** | Original | The source text as-is | Full article |
| **1** | Summary | Paragraph-level compression | 3-4 sentence summary |
| **2** | Brief | Sentence-level compression | 1-2 sentences |
| **3** | Keywords | Maximum compression | 3-5 keywords or a phrase |

### 3.2 Level Transition Behavior

- Gesture input is **continuous** (analog)
- Display is **discrete** (5 levels)
- Thresholds define snap points
- When gesture crosses a threshold → trigger transition animation → display new level
- **Momentum:** If gesture releases mid-transition, snap to nearest level
- **Lock:** Tap/click anywhere on compressed text to "lock" at current level. Gesture then has no effect until unlocked (tap/click again).

### 3.3 Level Indicator

A minimal, non-intrusive indicator shows current compression level. Appears during gesture, fades after 1.5s of inactivity. Shows: `-1` `0` `1` `2` `3` with current level highlighted. Positioned at edge of content area.

---

## 4. Tone System

### 4.1 Presets

Four tone modes that modify how compression output is generated:

| Preset | System Prompt Modifier | Icon Concept |
|--------|----------------------|--------------|
| **Normal** | Default, neutral tone | — |
| **ELI5** | Explain like I'm 5; simple words, analogies | Child/simple icon |
| **No Jargon** | Remove technical/scientific terminology | Plain language icon |
| **Bullet Points** | Structured, scannable list format | List icon |

### 4.2 Dial Behavior

- **Appears:** On two-finger rotate start (mobile) or Ctrl+Shift+Scroll start (desktop)
- **Visual:** Radial dial with 4 quadrants/stops, current selection highlighted
- **Rotation:** Dial rotates with gesture, snaps to nearest preset on release
- **Disappears:** Fades out 1s after gesture ends
- **Position:** Center of viewport, semi-transparent, doesn't obstruct text

### 4.3 Tone + Compression Interaction

Tone affects ALL compression levels (except Level 0, which is always original). Changing tone while at Level 2 immediately re-renders Level 2 in the new tone. If content is precomputed, all tone variants for all levels must be precomputed. If real-time (Notes), changing tone triggers regeneration.

---

## 5. Application Structure

### 5.1 Navigation

Top-level horizontal tab bar with seven sections:
- Browser
- Code
- News
- Social
- Chat
- Notes
- Settings

One tab active at a time. Switching tabs resets compression to Level 0.

---

### 5.2 Browser Tab

**Purpose:** Demonstrate Squeeze on any iframe-compatible webpage.

**Behavior:**
- URL input bar at top
- Content area loads webpage in iframe
- Squeeze gesture activates an overlay extraction mode:
  - On first gesture, main text content is extracted from the page and displayed as an overlay
  - Overlay is what gets compressed/expanded
  - User can dismiss overlay to return to raw webpage
- Extracted content is sent to AI for compression (real-time)
- Show loading state during extraction/compression
- Cache results for that URL/tone combination

**Limitations to communicate:**
- Many sites block iframes (show friendly error)
- Extraction quality varies by page structure

---

### 5.3 Code Tab

**Purpose:** Demonstrate Squeeze on source code with syntax highlighting.

**Content:** Preloaded code sample (choose something recognizable — a React component, a Python function, etc.)

**Compression behavior:**

| Level | Output |
|-------|--------|
| -1 | Original code + inline comments explaining each section |
| 0 | Original code |
| 1 | Code with implementation details removed, core logic preserved |
| 2 | Pseudocode summary |
| 3 | One-line description of what the code does |

**Tone modifiers:**
- Normal: Technical pseudocode
- ELI5: "This code is like a recipe that..."
- No Jargon: Plain English, no CS terms
- Bullet Points: Step-by-step what it does

**Data:** Fully precomputed (all 5 levels × 4 tones = 20 variants per code sample).

---

### 5.4 News Tab

**Purpose:** Demonstrate Squeeze on news articles.

**Content:** 3-5 preloaded news articles. User can switch between them (simple selector).

**Compression behavior:**

| Level | Output |
|-------|--------|
| -1 | Full article + background context, related events, source citations |
| 0 | Full article |
| 1 | Multi-paragraph summary |
| 2 | 1-2 sentence summary |
| 3 | Headline-level phrase or keywords |

**Data:** Fully precomputed.

---

### 5.5 Social Tab

**Purpose:** Demonstrate Squeeze on a social media thread/post.

**Content:** Preloaded mock social thread (think: Twitter/X thread or Reddit post with comments).

**Compression behavior:**

| Level | Output |
|-------|--------|
| -1 | Original + context about participants, background info, related threads |
| 0 | Full thread/post |
| 1 | Main post + summarized replies |
| 2 | Core argument/point of thread |
| 3 | Topic + sentiment (e.g., "AI debate — heated, split opinions") |

**Data:** Fully precomputed.

---

### 5.6 Chat Tab

**Purpose:** Demonstrate Squeeze on a messaging conversation.

**Content:** Preloaded mock chat conversation (back-and-forth between 2-3 people, substantial length).

**Compression behavior:**

| Level | Output |
|-------|--------|
| -1 | Full chat + inferred context, relationship dynamics, suggested replies |
| 0 | Full chat |
| 1 | Key messages only, filler removed |
| 2 | Summary of what was discussed |
| 3 | Outcome/decision in one line (e.g., "Agreed to meet Thursday 6pm") |

**Data:** Fully precomputed.

---

### 5.7 Notes Tab

**Purpose:** User-provided content. This is the "real" working prototype.

**Behavior:**
- Large text input area
- User can delete placeholder text and paste/type their own
- On first gesture:
  - If not yet processed: trigger AI generation for ALL levels and current tone
  - Show loading state with progress indication
  - Cache results
- Subsequent gestures: instant (cached)
- Changing tone: regenerate all levels for new tone, show loading

**AI Generation Strategy:**
- On gesture trigger, immediately request all 5 levels in parallel (or single structured request)
- Stream Level 1 first for quick feedback, then populate others
- Preload toggle in Settings: if enabled, generate all 4 tones × 5 levels upfront after first processing

**Empty state:** Instructional placeholder text (which itself is compressible as a demo).

---

### 5.8 Settings Tab

**Purpose:** Configuration.

**Fields:**

| Setting | Type | Description |
|---------|------|-------------|
| OpenRouter API Key | Text input (password masked) | For model access |
| Groq API Key | Text input (password masked) | For fast inference |
| Model Selection | Dropdown | Choose model (e.g., Llama 3, Claude, GPT-4o, etc.) |
| Preload | Toggle | When enabled, precompute all tones after initial processing in Notes |
| Animation Speed | Slider | Adjust transition speed (for accessibility/preference) |
| Show Level Indicator | Toggle | Show/hide the compression level indicator |

**Persistence:** Settings saved to localStorage. Keys are never logged or transmitted except to the respective API endpoints.

---

## 6. Animation Specification

This is the most critical section. The animation must feel physical, satisfying, and magical.

### 6.1 The Compression Animation (Level N → Level N+1)

**Phase 1: Squeeze (200ms)**
- Entire text block scales vertically: `scaleY: 1 → 0.85`
- Horizontal compression begins: `scaleX: 1 → 0.95`
- Slight blur: `filter: blur(0px) → blur(2px)`
- Text opacity dims slightly: `opacity: 1 → 0.7`

**Phase 2: Particle Dispersion (150ms, overlapping with Phase 1 at 100ms)**
- Words that will "disappear" in the next level:
  - Break into individual characters
  - Characters drift toward surviving neighbor words
  - Motion: horizontal collapse toward nearest "anchor" word
  - Fade: `opacity: 1 → 0` during drift
  - Scale: `scale: 1 → 0.5` during drift
- Use spring physics (slight overshoot, settle)

**Phase 3: Content Swap (instant, at peak of squeeze)**
- At `scaleY: 0.85`, swap text content to new level
- New content starts at same squeezed state

**Phase 4: Release (300ms)**
- Spring back: `scaleY: 0.85 → 1`, `scaleX: 0.95 → 1`
- Blur clears: `blur(2px) → blur(0px)`
- Opacity restores: `0.7 → 1`
- Use spring with slight bounce (overshoot to 1.02, settle to 1)

**Easing:** Spring physics throughout. Config: `{ tension: 300, friction: 20 }` (adjust in testing).

### 6.2 The Expansion Animation (Level N → Level N-1)

Reverse of compression:

**Phase 1: Stretch (200ms)**
- Text block scales up slightly: `scaleY: 1 → 1.1`, `scaleX: 1 → 1.03`
- Subtle blur: `blur(0px) → blur(1.5px)`

**Phase 2: Particle Emergence (150ms, overlapping)**
- New words that will appear:
  - Start as invisible particles positioned at their origin anchor word
  - Drift outward to their final position
  - Fade in: `opacity: 0 → 1`
  - Scale up: `scale: 0.5 → 1`

**Phase 3: Content Swap**
- At peak stretch, swap to new level content

**Phase 4: Settle (300ms)**
- Spring settle to `scaleY: 1`, `scaleX: 1`
- Slight undershoot (0.98) before settling

### 6.3 Continuous Gesture Feedback

While user is actively gesturing (pinch held):
- Text block responds in real-time to gesture scale
- `scaleY` and `scaleX` follow gesture input (damped)
- Creates feeling of "holding" the text in compressed state
- Release triggers snap to nearest level + full animation

### 6.4 Tone Dial Animation

**Appear:**
- Scale from center: `scale: 0 → 1` (200ms, ease-out)
- Fade in: `opacity: 0 → 1` (150ms)
- Slight blur clear: background blur increases to focus attention on dial

**Rotate:**
- Dial graphic rotates to follow gesture
- Current preset highlights as dial passes over it
- Haptic feedback on preset snap (if supported)

**Disappear:**
- Fade out: `opacity: 1 → 0` (300ms, ease-in)
- Scale down slightly: `scale: 1 → 0.95`

### 6.5 Loading State Animation

For Notes/Browser when AI is generating:
- Text becomes "liquid" / shimmer effect
- Subtle wave distortion passes through text
- Particles subtly float/drift to indicate processing
- Avoid spinners — maintain the physical metaphor

### 6.6 Tab Transition Animation

When switching tabs:
- Current content compresses to Level 3 (fast, 200ms)
- Slide out in direction of tab change
- New content slides in at Level 3
- Expands to Level 0 (300ms)

---

## 7. Gesture & Input Handling

### 7.1 Gesture Capture Requirements

**Viewport meta tag:**
```
user-scalable=no, maximum-scale=1
```

**CSS on interaction zone:**
```
touch-action: none
```

**Event prevention:**
- Intercept `wheel` events with `ctrlKey` (trackpad pinch)
- Intercept `gesturestart`, `gesturechange`, `gestureend` (Safari)
- Prevent default on all captured gestures

### 7.2 Pinch Gesture Mapping

| Gesture Scale | Effect |
|---------------|--------|
| `< 0.7` | Level 3 (max compression) |
| `0.7 - 0.85` | Level 2 |
| `0.85 - 1.0` | Level 1 |
| `1.0` (neutral) | Level 0 |
| `> 1.0 - 1.3` | Level -1 (expanded) |

Thresholds are relative to gesture start. Reset baseline on gesture end.

### 7.3 Rotate Gesture Mapping

Divide 360° into 4 quadrants:
- 315° - 45°: Normal
- 45° - 135°: ELI5
- 135° - 225°: No Jargon
- 225° - 315°: Bullet Points

Current rotation angle determines which quadrant is "active." Snap to quadrant center on release.

### 7.4 Desktop Scroll Mapping

**Shift + Scroll:**
- Scroll up → compress (increase level)
- Scroll down → expand (decrease level)
- Debounce to prevent skipping levels: one level change per scroll "event" (150ms cooldown)

**Ctrl + Shift + Scroll:**
- Scroll cycles through tones
- Scroll up → next tone
- Scroll down → previous tone
- Tone dial appears during scroll, fades after

### 7.5 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` | Compress one level |
| `↓` | Expand one level |
| `←` | Previous tone |
| `→` | Next tone |
| `Space` | Lock/unlock current level |
| `0` | Reset to original (Level 0) |
| `1-5` | Jump to specific level (-1, 0, 1, 2, 3) |

---

## 8. State Architecture

### 8.1 Global State

```
{
  // Navigation
  activeTab: 'browser' | 'code' | 'news' | 'social' | 'chat' | 'notes' | 'settings',
  
  // Compression
  currentLevel: -1 | 0 | 1 | 2 | 3,
  isLocked: boolean,
  isTransitioning: boolean,
  
  // Tone
  currentTone: 'normal' | 'eli5' | 'noJargon' | 'bullets',
  isDialVisible: boolean,
  
  // Gesture
  gestureActive: boolean,
  gestureScale: number,
  gestureRotation: number,
  
  // Settings
  settings: {
    openRouterKey: string,
    groqKey: string,
    selectedModel: string,
    preloadEnabled: boolean,
    animationSpeed: number,
    showLevelIndicator: boolean,
  }
}
```

### 8.2 Per-Tab Content State

```
{
  // Source content
  originalContent: string,
  
  // Computed compressions (keyed by tone)
  compressions: {
    normal: { '-1': string, '0': string, '1': string, '2': string, '3': string },
    eli5: { ... },
    noJargon: { ... },
    bullets: { ... },
  },
  
  // Loading states
  isGenerating: boolean,
  generationProgress: { level: number, tone: string } | null,
  
  // For Browser tab
  extractedContent: string | null,
  currentUrl: string,
  iframeError: string | null,
}
```

### 8.3 State Persistence

- Settings: localStorage
- Tab content/compressions: session only (not persisted)
- Precomputed demo content: bundled with app

---

## 9. AI Integration

### 9.1 Provider Architecture

Support two providers:
- **Groq:** Preferred for speed (use for Notes real-time generation)
- **OpenRouter:** Fallback, broader model selection

### 9.2 Prompt Structure

**System prompt base:**
```
You are a text compression/expansion engine. Given source text and a target compression level, output ONLY the transformed text. No explanations, no preamble.

Compression levels:
-1 (Expanded): Add context, explanations, background info, sources
0 (Original): Return unchanged
1 (Summary): Paragraph-level summary
2 (Brief): 1-2 sentences
3 (Keywords): 3-5 keywords or single phrase

Current level: {level}
```

**Tone modifier appended:**
```
Tone: {ELI5 | Normal | No Jargon | Bullet Points}
{Additional tone-specific instructions}
```

### 9.3 Request Strategy

**For Notes (real-time):**

Option A — Parallel requests:
- Fire 5 requests simultaneously (one per level)
- Render each as it completes
- Best responsiveness for current level

Option B — Single structured request:
- Request all levels in one call with structured output
- Parse response into levels
- Fewer API calls, but slower first result

**Recommendation:** Option A with priority. Request current level ± 1 first, then others.

### 9.4 Error Handling

| Error | User Feedback |
|-------|---------------|
| Invalid API key | Settings redirect with error message |
| Rate limit | "Slow down" message, retry with backoff |
| Generation failed | Keep previous level, show subtle error indicator |
| Timeout | Fallback to simpler compression (substring) with error note |

---

## 10. Content Specifications

### 10.1 Precomputed Content Requirements

For Code, News, Social, and Chat tabs:

**Per content item:**
- 5 levels × 4 tones = 20 text variants
- Each variant: pre-written, polished, demonstrates clear compression

**Content selection criteria:**
- Recognizable (judges should "get it" immediately)
- Sufficient length at Level -1 and 0 to feel substantial
- Clear semantic hierarchy (compresses well)
- Demonstrates tone differences clearly

### 10.2 Suggested Demo Content

**Code:**
```
A React component for a todo list (canonical, everyone knows it)
~80 lines at Level 0
```

**News:**
```
3 articles on varied topics:
- Tech (AI/startup news)
- Science (space/climate)
- Culture (music/film)
Each ~500 words at Level 0
```

**Social:**
```
Mock Twitter/X thread about a polarizing but safe topic
~15 posts in thread
Clear argument arc
```

**Chat:**
```
Group chat planning an event
~40 messages
Has decision points and outcomes
```

---

## 11. Edge Cases & Error States

### 11.1 Content Edge Cases

| Case | Handling |
|------|----------|
| Already at max compression (Level 3) | Gesture feedback still works, but no transition. Subtle "limit" feedback (slight bounce back). |
| Already at max expansion (Level -1) | Same as above. |
| Empty text in Notes | Show placeholder, gesture does nothing meaningful. |
| Very short text (< 50 chars) | All compression levels might be similar. That's okay — demonstrate gracefully. |
| Very long text (> 10,000 chars) | Truncate for processing, indicate truncation in Level -1. |

### 11.2 Gesture Edge Cases

| Case | Handling |
|------|----------|
| Pinch + Rotate simultaneously | Prioritize the gesture that started first. Ignore the other until first gesture ends. |
| Gesture interrupted (e.g., phone call) | Snap to nearest level on gesture cancel. |
| Very fast gesture | Debounce level changes. Minimum 100ms between transitions. |
| Gesture outside content area | No effect. Only active within text zone. |

### 11.3 Browser Tab Edge Cases

| Case | Handling |
|------|----------|
| Site blocks iframe (X-Frame-Options) | Show friendly error: "This site can't be embedded. Try a different URL." |
| Site has no extractable text | Show error: "Couldn't extract text from this page." |
| Very slow loading | Timeout after 10s, show error. |

---

## 12. Performance Requirements

### 12.1 Animation Performance

- All animations must run at **60fps**
- Use `transform` and `opacity` only (GPU accelerated)
- Avoid layout thrashing during transitions
- Particle count: max 50 concurrent particles (LOD reduction for longer text)

### 12.2 Gesture Latency

- Gesture → visual feedback: **< 16ms** (one frame)
- Level transition trigger → animation start: **< 50ms**
- Total transition duration: **~600ms** (feel snappy but readable)

### 12.3 AI Latency (Notes tab)

- First level render: **< 2s** (use Groq)
- All levels cached: **< 5s**
- Cached retrieval: **instant**

---

## 13. Accessibility Notes

### 13.1 Non-Gesture Alternatives

All functionality accessible via:
- Keyboard shortcuts
- On-screen controls (level buttons, tone selector) available in a toolbar
- Controls can be hidden for clean demo, revealed on hover/focus

### 13.2 Reduced Motion

If user prefers reduced motion:
- Disable particle effects
- Instant content swap (no squeeze animation)
- Fade transitions only

### 13.3 Screen Reader

- Current level announced on change
- Tone announced on change
- Content changes announced

---

## 14. Success Criteria

The prototype succeeds if:

1. **First pinch moment:** Judge pinches, feels text physically respond, immediately understands the concept.

2. **"Why doesn't this exist?" reaction:** The interaction feels so obvious and natural that its absence from current software feels like a gap.

3. **Smooth and delightful:** Animation quality is high enough to be satisfying, not distracting.

4. **Versatility demonstration:** Seeing it work on code, news, chat, etc. sells the "this is a primitive, not an app" thesis.

5. **Real functionality:** Notes tab proves it works with arbitrary content, not just pre-baked demos.

---

## 15. Libraries & Dependencies

| Package | Purpose |
|---------|---------|
| `@use-gesture` | Pinch, rotate, scroll gesture detection |
| `framer-motion` | Spring animations, layout transitions |
| `zustand` | Global state management |
| `groq-sdk` | Groq API client |
| `openai` | OpenRouter API client (compatible) |
| `prism-react-renderer` | Code syntax highlighting |
| `react-hotkeys-hook` | Keyboard shortcut handling |
| `clsx` | Conditional classnames |

---

## 16. File Structure Suggestion

```
src/
├── components/
│   ├── TextBlock/          # The core compressible text component
│   ├── ToneDial/           # Rotary tone selector
│   ├── LevelIndicator/     # Compression level display
│   ├── ParticleText/       # Animated text with particles
│   ├── Tabs/               # Tab navigation
│   └── Settings/           # Settings form
├── hooks/
│   ├── useCompression.ts   # Compression level management
│   ├── useTone.ts          # Tone state management
│   ├── useGestures.ts      # Gesture binding
│   └── useAI.ts            # AI generation
├── stores/
│   └── appStore.ts         # Zustand store
├── content/
│   ├── code.ts             # Precomputed code samples
│   ├── news.ts             # Precomputed news
│   ├── social.ts           # Precomputed social
│   └── chat.ts             # Precomputed chat
├── lib/
│   ├── prompts.ts          # AI prompt templates
│   └── textExtract.ts      # Browser content extraction
└── tabs/
    ├── Browser.tsx
    ├── Code.tsx
    ├── News.tsx
    ├── Social.tsx
    ├── Chat.tsx
    ├── Notes.tsx
    └── Settings.tsx
```

---

## 17. Summary

**What we're building:** A gesture-driven text compression prototype that turns pinch-to-zoom into pinch-to-understand.

**What sells it:**
- One gesture, instantly understood
- Reimagines an iconic interaction
- Universal applicability (any text, any app)
- Buttery animation that feels physical
- Working AI integration proves it's real

**What to nail:**
- The squeeze animation with particle dispersion
- The spring physics on release
- The dial appearance/disappearance
- Responsiveness (feels instant)

---

End of specification.