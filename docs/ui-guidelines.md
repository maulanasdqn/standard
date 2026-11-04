# UI guidelines

Two rules every screen in `apps/web` and `apps/landing` follows: anything that waits shows a loading
state shaped like what it is waiting for, and a screen carries only the text a person needs to act.
The building blocks live in `@app/components`, so a new screen reuses them rather than inventing its
own.

## Loading states

Pick the state by what is waiting, not by taste.

| What is waiting | Show | Built from |
|---|---|---|
| The web app starting, before React has rendered (the session check) | A centered spinner, written as static markup inside `#root` in `apps/web/index.html`, which the first render replaces | Plain HTML with Tailwind classes, no inline style or script |
| A route loading its data | A skeleton with the page's real layout: header, toolbar, table or form | `pendingComponent` with `ListPageSkeleton`, `FormPageSkeleton` or a page's own skeleton |
| A navigation, a filter, a search or a page change | The thin progress bar under the app header, until the skeleton takes over | `RouteProgress`, which reads the router's `isLoading` |
| A card or section loading on its own query | A skeleton the size of the content it replaces | `Skeleton` from `@app/components/ui/skeleton` |
| A submit or any other button that starts a request | A spinner inside the button, which is disabled and `aria-busy` while it waits | `<Button pending={mutation.isPending}>` |
| A row action (delete, deactivate) | A spinner on that row's actions trigger, its items disabled | `pending` on the `TRowAction` |
| An item being removed from a list or grid | The item stays in place, dimmed, with a spinner on its own control | `aria-busy` on the item, `pending` on its button |
| A file upload | A skeleton tile per file in flight, next to the items already stored | `useIsMutating` on the upload mutation key |
| A value inside a card that is still being fetched | A short inline skeleton in place of the value, never a placeholder word such as "unknown" | `Skeleton` with `inline-block` |

Rules that apply to all of them:

- A skeleton mirrors the final layout. When a description line or a column leaves the page, it
  leaves the skeleton too, so the content does not jump when it arrives
- A button that is pending keeps its label (or swaps it for the "-ing" form from `@app/messages`)
  and hides its leading icon behind the spinner; it never grows or shrinks
- A pending control is disabled, so a second click cannot send the request twice
- Only the thing that is busy shows it. Revoking one session spins that session's button, not every
  button on the card
- The landing page has no React, so its form sets `aria-busy="true"` on the submit button and the
  stylesheet draws the spinner. No inline style or script, because of the Content-Security-Policy

### Processes that take longer than a minute

A spinner is for seconds. Work that can run past a minute (an export, an import, a bulk update, a
report) is a job, not a request, and the screen treats it that way:

1. The request only enqueues the job and returns its id at once. The work runs in the worker
   (`moon run api:worker`) off the queue, not inside the HTTP request
2. The backend streams progress for that id. oRPC supports this with an event iterator: the
   contract declares the output with `eventIterator(schema)` from `@orpc/contract`, the handler is
   an async generator that yields progress events, and the client receives them over server-sent
   events. On the web, `@orpc/tanstack-query` exposes it as `streamedOptions` (each event is
   appended to the query data) or `experimental_liveOptions` (the query data is the latest event)
3. The screen shows real progress from those events: a determinate progress bar with the step name
   and the count done ("120 of 900"), not an endless spinner
4. The person can leave the page. The job keeps running, and a toast (or a notification on the next
   visit) reports the result, with a link to it when there is one
5. A failure says which step failed and offers a retry from that step when the job supports it

Until a screen has such a job, nothing in the codebase implements this pattern; the list above is
the shape a first one takes.

## Keep text to what is needed

A screen is scanned, not read. Before adding a sentence, try these in order:

1. **Remove it.** A heading, a label and a sensible empty state usually say enough. A sentence that
   repeats the heading in more words goes
2. **Turn it into a UI element.** A state is a badge (active, pending, on, off), a count is a badge
   (`3 / 10`), a limit is a chip (`PNG, JPEG, WebP and GIF`, `5 MB`), a time is a relative label,
   a kind of thing is an icon
3. **Move it behind an info icon.** Explanations that help the first time and get in the way after
   that sit behind an ⓘ next to the heading or label, shown on hover, focus or tap
4. **Keep it visible** only when the person cannot act safely without reading it

What stays visible on purpose:

- The description in a confirmation dialog, because it says what cannot be undone
- Validation and server errors, next to the field or form they belong to
- Empty states, which say why the space is empty
- The auth screens' one-line headings and the result screens (check your email, verified), which
  are the whole content of those pages
- Marketing copy on the landing page, where the text is the product

The building blocks:

| Need | Use |
|---|---|
| A card title with an explanation | `<CardHeading info={...}>` from `@app/components/ui/card-heading` instead of `CardTitle` plus `CardDescription` |
| A page title with an explanation | `<PageTitle info={...}>` in `apps/web/src/routes/_authenticated/_components/page-title.tsx`, which `FormPage` uses for its `description` |
| A field hint | The `info` prop on `Field`, not `description` |
| Anything else | `InfoTooltip` from `@app/components/ui/info-tooltip` |

`InfoTooltip` opens on hover and keyboard focus, and on a tap, because a touch screen has no hover.
Its content is short: one or two sentences, never a list or a link the person has to reach.

All copy, including what an info icon shows, still lives in `@app/messages`.
