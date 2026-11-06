# ADR 0006: FullScreenFlow — a multi-step takeover on `Dialog variant="fullscreen"`

Date: 2026-11-06
Status: proposed

## Context

The consuming app needs a full-screen, multi-step flow for first-run setup: a header with the flow's name, chaptered progress and a close button; a rail listing every step on wide screens; one step at a time in a scrolling area, with direction-aware motion between steps; a pinned footer with Back and Continue. Leaving part-way asks first ("Leave setup for now?"). The flow was prototyped and approved before this ADR; this records how it maps onto the system.

`Dialog` already covers the hard parts of a modal surface through Base UI (focus trap, inert and `aria-hidden` background, scroll lock, Esc, focus return), with `variant: 'dialog' | 'sheet'` capped at 720px. A takeover is more than another width: it needs layout regions, step transitions and its own focus and announcement rules.

## Decision

1. **Two layers.** `Dialog.Content` gains `variant="fullscreen"`: the surface only (covers the viewport, inset 16px with a rounded edge and the backdrop showing from 900px, safe-area padding, slides in from the inline end with the motion tokens, a crossfade under reduced motion, `Dialog.Body` scrolls between a pinned title and actions). `FullScreenFlow` is a separate composition on that surface: `Root`, `Header`, `Progress`, `Body`, `Rail` › `RailGroup` › `RailItem`, `Viewport` › `Step`, `Footer`. A plain full-screen editor uses the Dialog variant alone.
2. **Closing is the app's call.** `Dialog.Root` gains `onRequestClose(reason)`. When it is set, Esc, a backdrop press and every `Dialog.Close` cancel Base UI's close and call it instead; the app closes by setting `open` to `false`. `dismissible={false}` still swallows Esc and backdrop presses first. `FullScreenFlow.Root` requires `onRequestClose` and drops `outside-press` (a stray click in the 16px margin should not ask to leave). The leave confirmation is an ordinary nested `Dialog` rendered inside the flow: Base UI gives it the top of the focus stack, and Esc closes only it.
3. **The app owns the state.** The flow does not know the step list, guards or persistence. The app passes the current step as the `key` of the single `Step` inside `Viewport`, and `direction` (`forward` | `back`). This fits a state machine or a URL-driven step (`?step=roles`) equally.
4. **Transitions: CSS runs the motion, React keeps the leaving step.** When the key changes, `Viewport` derives the leaving frame during render (React's "store information from previous renders") and renders both frames, keyed by step, in one grid cell. CSS animates them from the motion tokens (`slower`/`enter` in, `base`/`exit` out; `base`/`fast` crossfades under reduced motion), flipped for `back` and for RTL. The leaving frame is `inert`; it unmounts when `getAnimations()` settles, or at once where nothing animates (jsdom, no stylesheet). No animation library, no timers matching durations by hand.
5. **Focus and announcements on step change.** The new step's `<h2>` (`tabindex="-1"`) takes focus with `preventScroll`, the viewport scrolls to the top, and a polite, atomic live region in `Root` (inside the popup, so it is not hidden by the modal) says `announcement` ("Step 4 of 10, Roles"), cleared first so a repeat is read again. On open, Base UI's `initialFocus` goes to the step title. The first step does not animate; the surface's own entrance covers it.
6. **Keyboard shortcuts are opt-in.** With `onNext`/`onBack` on `Root`, Enter continues unless focus is in a textarea, button, link, select, summary, combobox or `[data-flow-keys="local"]`, and the arrow keys move between steps unless focus is in a form control or a composite widget (radio group, listbox, tabs, menu, grid, slider). The forward arrow follows the writing direction. Keys from a nested dialog (portalled outside the popup) are ignored.
7. **Progress semantics.** `Progress` is an `<ol>` with one `<li>` per chapter, the chapter label visually hidden, `aria-current="step"` on the chapter holding the current step; the visible line ("Step 4 of 10 · Roles") is the app's `label`. The rail's `RailItem` is a button with `aria-current="step"` for the current step, a check plus a hidden ", done" for finished ones, and `disabled` for steps not reached. Footer buttons are at least 44px in both axes, on any density.
8. **No `Stepper` primitive yet.** The rail and the segmented progress share a shape (a list of steps with done, current and upcoming), and the app has a second stepper (an application's status). Extracting one now would be designed from one use; the backlog records it for when the second use moves into the system.

## Consequences

- `FullScreenFlow` imports `Dialog` and `IconButton`; an app using it takes Base UI's dialog code, as every Dialog user already does.
- Headers and footers are `div`s, not `header`/`footer`, so the flow adds no banner or contentinfo landmark inside the dialog.
- **Known limits.** A nested confirmation does not dim the flow behind it (Base UI renders a backdrop only for the outermost dialog unless forced; the backlog's "`Dialog` nested" item). Strings ("Close", "Progress", "Steps", "done") are English defaults with props for each. The checks below ran in Chromium only.

## Verification

Vitest (jsdom): labelled modal and initial focus, Esc and × to `onRequestClose` while staying open, focus and announcement on step change, the leaving step held `inert` until its animation finishes, segment fills, rail states, Enter and arrow handling inside and outside controls, a nested confirmation taking Esc alone, axe. Chromium (Storybook, Playwright): both frames animate with the token durations and the leaving one is removed afterwards; reduced motion swaps to 200ms/100ms crossfades; the 390px layout puts progress on its own row; Esc in the confirmation returns focus to the step title.
