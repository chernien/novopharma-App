# Performance Improvements - Novopharma

Date: 2026-04-10  
Target: Ionic + Angular + Capacitor (Android/Web)

## Priority 1 - Fastest Wins

### 1) Reduce OCR bundle impact (`tesseract.js`)

Current issue:
- Build warns that `marque.page.ts` depends on CommonJS `tesseract.js`.
- This increases bundle size and can slow startup.

Action:
- Load OCR code only when user triggers scan feature (dynamic import).
- Keep OCR logic out of initial route/module load.

Example approach:
```ts
async startOcr(image: Blob) {
  const Tesseract = await import('tesseract.js');
  const result = await Tesseract.recognize(image, 'eng');
  return result.data.text;
}
```

Expected gain:
- Smaller initial JS payload.
- Faster first load and faster navigation to non-OCR pages.

---

### 2) Fix oversized page styles

Current issue:
- `articles.page.scss`, `pharamcie.page.scss`, and `recommande.page.scss` exceed style budgets.

Action:
- Remove repeated selectors.
- Extract shared styles to `src/theme/variables.scss` or a shared partial.
- Prefer utility classes and avoid deep nested selectors.

Expected gain:
- Smaller CSS and faster style parse/recalc.

---

### 3) Enable strict list rendering patterns

Action:
- For all `*ngFor`, add `trackBy`.
- Avoid template methods that execute each change detection cycle.

Example:
```html
<ion-item *ngFor="let item of products; trackBy: trackById">
```

```ts
trackById(_: number, item: { id: number | string }) {
  return item.id;
}
```

Expected gain:
- Less DOM re-creation and smoother scrolling.

## Priority 2 - Rendering and Change Detection

### 4) Use `ChangeDetectionStrategy.OnPush` in heavy components

Action:
- Apply `OnPush` for large pages (`articles`, `cart`, `pharamcie`, `recommande`).
- Ensure inputs are immutable and use RxJS streams where possible.

Expected gain:
- Reduced unnecessary change detection cycles.

---

### 5) Virtualize large lists

Action:
- For long product/article lists, use paginated loading and virtual scrolling pattern (or segmented rendering).
- Render batches (e.g., 20-40 items) instead of full list.

Expected gain:
- Lower memory usage and better FPS on Android mid-range devices.

## Priority 3 - Data, Assets, and Network

### 6) Optimize images

Action:
- Convert heavy PNG/JPG assets to WebP where possible.
- Add image dimensions explicitly in templates.
- Use lazy loading for images not immediately visible.

Expected gain:
- Better LCP/FCP and lower network transfer.

---

### 7) Add caching for API responses

Action:
- In service layer, cache stable lists with `shareReplay(1)` and TTL invalidation.
- Prevent duplicate requests during tab/page revisits.

Expected gain:
- Fewer network calls, faster repeat navigations.

---

### 8) Move expensive filtering/search to worker

Current context:
- Project already has `src/app/worker/filter.worker.ts`.

Action:
- Ensure large filtering/search operations run in worker (not main thread).
- Debounce search input (200-300ms) before sending worker messages.

Expected gain:
- Better UI responsiveness while typing/searching.

## Priority 4 - Build/Runtime Engineering

### 9) Keep dependencies lean

Action:
- Remove unused dependencies and imports.
- Audit large libraries and replace if lighter alternatives exist.

Command:
```bash
npm ls
```

Expected gain:
- Smaller bundles and faster install/build times.

---

### 10) Update baseline mapping warning

Action:
```bash
npm i baseline-browser-mapping@latest -D
```

Expected gain:
- More accurate build compatibility baseline; avoids stale browser target data.

---

### 11) Android WebView tuning

Action:
- Test production APK/AAB profile (`--configuration production`).
- Disable debug logs in production code paths.
- Verify that heavy initialization does not run in `AppComponent` constructor.

Expected gain:
- Faster startup on real Android devices.

## Implementation Order (Recommended)

1. Dynamic import for OCR (`tesseract.js`)
2. `trackBy` + remove template method calls
3. Fix oversized SCSS pages
4. Apply `OnPush` to heavy screens
5. Worker-based heavy filtering + debounce
6. Image optimization and lazy loading
7. API caching (`shareReplay` + TTL)

## Validation Plan

Run before/after measurements:

1. Build size check:
```bash
npm run build
```

2. Runtime smoke:
```bash
npm start
```

3. Android real-device check:
- Measure app startup time.
- Measure scroll smoothness on large list pages.
- Measure OCR feature load time before/after dynamic import.

## Success Criteria

- Reduced initial bundle size.
- Faster first page render.
- No UI freeze during long list filtering/searching.
- Smoother scroll performance on product-heavy pages.
- Lower repeated API latency due to caching.
