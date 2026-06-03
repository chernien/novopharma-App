# Debug Result - Novopharma

Date: 2026-04-10  
Scope: `lint`, `test`, `build`, and runtime `ng serve` smoke check

## Commands Executed

1. `npm run lint`
2. `npm run test -- --watch=false --browsers=ChromeHeadless`
3. `npm run build`
4. `npm start` (runtime compile/start check)

## Results

- `lint`: **FAILED** (9 errors)
- `test`: **FAILED** (TypeScript import/spec mismatch)
- `build`: **PASSED** (with warnings)
- `start` (`ng serve`): **PASSED** (compiled successfully on `http://localhost:4200`)

## Root Causes Identified

### 1) Lint failures in templates and lifecycle method

- File: `src/app/articles/articles.page.html`
  - `@angular-eslint/template/no-negated-async` at `43:78` and `69:64`
- File: `src/app/cart/cart.page.html`
  - `@angular-eslint/template/eqeqeq` at `28:78`, `45:91`, `73:42`, `84:34`
- File: `src/app/gift/gift.page.html`
  - `@angular-eslint/template/eqeqeq` at `125:58`, `129:58`
- File: `src/app/facture/facture.page.ts`
  - `@angular-eslint/no-empty-lifecycle-method` at `41:3`

Impact:
- Static quality gate fails; CI/dev checks can block merge/deploy workflows.

### 2) Unit test compile failure

- File: `src/app/auth.guard.spec.ts`
- Problem:
  - Test imports `authGuard` from `./auth.guard`, but module exports `AuthGuard` class.
  - Error:
    - `export 'authGuard' was not found in './auth.guard' (possible exports: AuthGuard)`
    - TS2724 suggests `AuthGuard`.

Impact:
- Test runner stops on compile/load error before executing specs.

## Non-Blocking Warnings

- Browsers baseline data is outdated:
  - Suggestion emitted by tooling: `npm i baseline-browser-mapping@latest -D`
- Build style budget warnings:
  - `src/app/articles/articles.page.scss` exceeds budget by 132 bytes
  - `src/app/pharamcie/pharamcie.page.scss` exceeds budget by 138 bytes
  - `src/app/recommande/recommande.page.scss` exceeds budget by 98 bytes
- CommonJS optimization warning:
  - `src/app/marque/marque.page.ts` depends on `tesseract.js`

## Recommended Fix Order

1. Fix `auth.guard.spec.ts` import/use mismatch (`authGuard` -> `AuthGuard` or adapt test style).
2. Fix template lint issues:
   - Replace `!=`/`==` with strict `!==`/`===`.
   - Replace negated async checks with explicit comparisons like:
     - `(obs | async) === false`
     - `(obs | async) === null`
     - `(obs | async) === undefined`
3. Remove or implement body for empty lifecycle method in `facture.page.ts`.
4. Re-run:
   - `npm run lint`
   - `npm run test -- --watch=false --browsers=ChromeHeadless`
   - `npm run build`

## Runtime Status

- Angular dev server started successfully.
- Last runtime compile status: `Compiled successfully.`

## Conclusion

The app currently **builds and serves**, but is **not debug-clean** because lint and unit test checks fail.  
Primary blockers are lint-rule violations and one broken guard spec import.
