# Fix Run Result - Performance + Debug

Date: 2026-04-10

## What I fixed

### 1) Lint blockers fixed
- `src/app/articles/articles.page.html`
  - Replaced negated async checks with explicit comparisons.
- `src/app/cart/cart.page.html`
  - Replaced `!=` with strict `!==` in template conditions.
- `src/app/gift/gift.page.html`
  - Replaced `==` with strict `===`.
- `src/app/facture/facture.page.ts`
  - Removed empty `OnInit` lifecycle usage.

### 2) Test compile blocker fixed
- `src/app/auth.guard.spec.ts`
  - Fixed broken import/use (`authGuard` -> class-based `AuthGuard` test).

### 3) Performance improvement implemented
- `src/app/marque/marque.page.ts`
  - Removed eager `tesseract.js` import.
  - Added lazy dynamic import with cache (`getTesseract()`).
  - OCR now loads only when ZXing fails and OCR path is needed.

## Validation executed

1. `npm run lint` -> PASS
2. `npm run build` -> PASS
3. `npm run test -- --watch=false --browsers=ChromeHeadless` -> FAIL (16 failed, 15 passed)

## Current remaining test failures (root cause)

Most failing specs are minimal/generated tests that create components/services without required providers:

- Missing `HttpClient` provider in specs that instantiate:
  - `ClientService`, `PhotoService`, `ArticlesService` and pages depending on them.
- Missing `ActivatedRoute` provider:
  - `ArticlesPage`, `CommandePharmaciePage`.
- Missing `Storage` provider:
  - `DataService`.

## Why tests still fail

The suite has many placeholder specs (mostly `should create`) with no `TestBed.configureTestingModule(...)` imports/providers for constructor dependencies.

## Recommended next fix batch

For each failing spec:

1. Add `HttpClientTestingModule` where `HttpClient`-based services are injected.
2. Add `ActivatedRoute` mock provider where route params are used.
3. Add `Storage` mock provider for `DataService`.
4. Keep tests minimal but valid (`should create` + correct setup).

This will make the test pipeline green without changing runtime app behavior.
