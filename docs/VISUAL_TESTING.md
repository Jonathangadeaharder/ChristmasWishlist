# Visual Regression Testing with Percy

This project uses **Percy** with **Playwright** for visual regression testing to catch CSS bugs like icon/text overlap, layout regressions, and styling inconsistencies.

## What It Catches

Visual regression testing would have caught bugs like:

- ❌ Input icon overlapping with placeholder text (CSS specificity issue)
- ❌ Layout breaks at different screen sizes
- ❌ Missing styles or broken animations
- ❌ Unintended style changes after CSS updates

## Setup

### 1. Create a Percy Account

1. Go to [percy.io](https://percy.io) and sign up (free tier available)
2. Create a new project
3. Get your `PERCY_TOKEN` from the project settings

### 2. Configure Percy Token

**Option A: Environment Variable (recommended for CI/CD)**

```bash
export PERCY_TOKEN=your_token_here
```

**Option B: Create `.env` file (for local development)**

```bash
# .env (this file is gitignored)
PERCY_TOKEN=your_token_here
```

## Running Tests

### Local Testing (without Percy upload)

```bash
npm run test:visual:local
```

### With Percy (uploads snapshots for comparison)

```bash
# Requires PERCY_TOKEN to be set
npm run test:visual
```

### In CI/CD Pipeline

```yaml
# GitHub Actions example
- name: Visual Regression Tests
  env:
    PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
  run: npm run test:visual
```

## Test Coverage

The visual tests cover:

| Test Suite       | What It Tests                  |
| ---------------- | ------------------------------ |
| Login Page       | Desktop, mobile, tablet views  |
| Register Page    | Desktop, mobile views          |
| Input Components | Icon spacing, focus states     |
| Buttons          | Default, hover, loading states |
| Responsive       | 6 breakpoints (320px - 1440px) |
| Animations       | Post-animation settled state   |

## How It Works

1. **First Run**: Percy captures baseline screenshots
2. **Subsequent Runs**: Percy compares new screenshots to baselines
3. **Differences Detected**: Percy highlights visual changes for review
4. **Approve/Reject**: Team reviews and approves intentional changes

## Best Practices

### Writing Visual Tests

```typescript
import percySnapshot from '@percy/playwright'

test('component visual test', async ({ page }) => {
  await page.goto('/page')

  // Wait for content to load
  await expect(page.getByTestId('element')).toBeVisible()

  // Wait for animations to complete
  await page.waitForTimeout(500)

  // Capture snapshot
  await percySnapshot(page, 'Descriptive Snapshot Name')
})
```

### Naming Conventions

- Use descriptive names: `'Login Page - Mobile View'`
- Include state: `'Input Fields - With Error State'`
- Include viewport: `'Dashboard - Tablet (768px)'`

### Handling Dynamic Content

The `.percy.yml` config disables animations:

```css
* {
  transition: none !important;
  animation-duration: 0s !important;
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Visual Tests

on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Percy Visual Tests
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
        run: npm run test:visual
```

### Pull Request Workflow

1. Developer pushes code
2. CI runs visual tests
3. Percy compares screenshots
4. If differences found → Percy comments on PR with visual diff
5. Team reviews and approves visual changes
6. PR can be merged

## Troubleshooting

### "Percy is not running, disabling snapshots"

- Set `PERCY_TOKEN` environment variable
- Run with `percy exec --` prefix

### Flaky Tests

- Add `waitForTimeout` for animations
- Use `waitForSelector` for dynamic content
- Ensure consistent test data

### Large Diffs on Small Changes

- Check if animations are disabled in `.percy.yml`
- Verify viewport sizes are consistent
- Look for timing-dependent content

## Resources

- [Percy Documentation](https://www.browserstack.com/docs/percy)
- [Percy + Playwright Guide](https://www.browserstack.com/docs/percy/integrate/playwright)
- [Playwright Documentation](https://playwright.dev/docs/intro)
