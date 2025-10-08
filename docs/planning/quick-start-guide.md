# Quick Start Guide - Internet Infrastructure Map

**For Developers Joining the Project**

Welcome! This guide will get you up and running in under 30 minutes.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Project Structure](#project-structure)
6. [Common Tasks](#common-tasks)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Resources](#resources)

---

## Prerequisites

### Required Software
- **Node.js:** v18.0.0 or higher ([Download](https://nodejs.org/))
- **Git:** Latest version ([Download](https://git-scm.com/))
- **Code Editor:** VS Code recommended ([Download](https://code.visualstudio.com/))

### Recommended VS Code Extensions
- ESLint
- Prettier
- GitLens
- Thunder Client (API testing)

### Hardware Requirements
- **GPU:** WebGL 2.0 compatible graphics card
- **RAM:** 8GB minimum, 16GB recommended
- **Display:** 1920x1080 or higher

### Browser Compatibility
- Chrome 90+ (recommended for development)
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Project Overview

### What is This Project?

An interactive 3D globe visualization showing global internet infrastructure:
- **550+ Submarine Cables** (fiber optic cables under the ocean)
- **8,000+ Data Centers** (major facilities worldwide)
- **BGP Traffic Flows** (network routing visualization)
- **Educational Knowledge Base** (learn how the internet works)

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **3D Graphics** | Three.js, WebGL | Rendering 3D globe |
| **Visualization** | globe.gl | Globe library |
| **Data** | D3.js | Data transformation |
| **Animation** | GSAP | Smooth animations |
| **Build** | Vite | Dev server & bundler |
| **Testing** | Vitest, Playwright | Unit & E2E tests |

### Current Project Status

We're enhancing the project across three paths:

- **Path A: Code Consolidation** ✅ In Progress
  - Merging 4 main.js files into 1 unified codebase

- **Path B: Real Data Integration** 🔜 Upcoming
  - Replacing estimated data with live APIs

- **Path C: Knowledge Base Integration** 🔜 Upcoming
  - Adding interactive educational content

See [implementation-roadmap.md](./implementation-roadmap.md) for full details.

---

## Getting Started

### 1. Clone the Repository

```bash
# Clone the repo
git clone https://github.com/bjpl/Internet-Infrastructure-Map.git
cd Internet-Infrastructure-Map

# Or via SSH
git clone git@github.com:bjpl/Internet-Infrastructure-Map.git
cd Internet-Infrastructure-Map
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# This will install:
# - Three.js (3D graphics)
# - globe.gl (globe library)
# - D3.js (data manipulation)
# - Vite (dev server)
# - And more...
```

**Note:** If you see warnings about peer dependencies, you can safely ignore them.

### 3. Start Development Server

```bash
# Start the dev server
npm run dev

# Output:
# VITE v5.1.0  ready in 450 ms
#
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### 4. Open in Browser

Navigate to `http://localhost:5173/` in your browser.

You should see:
- 🌍 A rotating 3D Earth globe
- 🌊 Glowing submarine cables
- 🏢 Pulsing data centers
- ✨ Particle effects for traffic

**First Run:** Initial load may take 5-10 seconds while data loads.

### 5. Verify Everything Works

**Quick Checklist:**
- [ ] Globe rotates smoothly (60 FPS)
- [ ] Submarine cables glow and animate
- [ ] Data centers pulse with varying colors
- [ ] UI controls are visible on the right
- [ ] No console errors in DevTools (F12)

If you see errors, check [Troubleshooting](#troubleshooting).

---

## Development Workflow

### Branch Strategy

We use **Git Flow** branching:

```
main            Production-ready code
  └── develop   Integration branch
        ├── feature/code-consolidation
        ├── feature/api-integration
        └── feature/knowledge-base
```

**Creating a Feature Branch:**

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name

# Work on your feature...

# Commit your changes
git add .
git commit -m "feat: add submarine cable filtering"

# Push to remote
git push -u origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting (no logic change)
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Build process, dependencies

**Examples:**

```bash
git commit -m "feat(cables): add cable capacity indicators"
git commit -m "fix(rendering): resolve memory leak in particle system"
git commit -m "docs(api): document PeeringDB integration"
git commit -m "refactor(core): consolidate globe initialization"
```

### Code Review Process

1. **Create Pull Request** on GitHub
2. **Request Review** from at least 1 team member
3. **CI/CD Pipeline** runs automatically:
   - Linting (ESLint)
   - Unit tests (Vitest)
   - Build verification
4. **Address Feedback** and push updates
5. **Merge** once approved and CI passes

---

## Project Structure

```
internet-infrastructure-map/
├── .github/                  # GitHub workflows (CI/CD)
├── docs/                     # Documentation
│   ├── planning/            # Roadmap, quick-start (you are here!)
│   ├── daily_reports/       # Development logs
│   ├── DEPLOYMENT.md        # Deployment instructions
│   └── UPDATES.md           # Changelog
├── knowledge-base/          # Educational content (KB integration)
│   ├── concepts/            # Core networking concepts
│   ├── protocols/           # Protocol documentation
│   ├── security/            # Security topics
│   └── ...
├── src/                     # Source code
│   ├── main.js             # Main entry point (CURRENT)
│   ├── main-clean.js       # Clean variant (to be merged)
│   ├── main-beautiful.js   # Visual effects variant (to be merged)
│   ├── main-improved.js    # Performance variant (to be merged)
│   ├── cableRenderer.js    # Submarine cable rendering
│   ├── dataManager.js      # Data loading & management
│   ├── effects.js          # Visual effects (glow, particles)
│   └── styles.css          # UI styling
├── public/                  # Static assets
│   ├── earth_texture.jpg   # Earth texture map
│   └── ...
├── tests/                   # Test files (to be created)
│   ├── unit/               # Unit tests
│   └── e2e/                # End-to-end tests
├── dist/                    # Built files (generated)
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
└── README.md               # Project README

Total Lines of Code:
- src/main.js: 499 lines
- src/main-clean.js: 1,827 lines
- src/main-improved.js: 960 lines
- src/main-beautiful.js: 672 lines
- src/dataManager.js: 878 lines
- src/cableRenderer.js: 176 lines
- src/effects.js: 368 lines
Total: ~5,380 lines (to be consolidated!)
```

### Key Files Explained

| File | Purpose | Status |
|------|---------|--------|
| `src/main.js` | Current production entry point | Active |
| `src/main-clean.js` | Refactored version (cleanest code) | To merge |
| `src/main-beautiful.js` | Enhanced visual effects | To merge |
| `src/main-improved.js` | Performance optimizations | To merge |
| `src/dataManager.js` | Data fetching and transformation | Active |
| `src/cableRenderer.js` | Submarine cable rendering logic | Active |
| `src/effects.js` | Particle systems, glow effects | Active |
| `vite.config.js` | Build configuration | Active |

**Phase 1 Goal:** Merge all main-*.js files into a single, modular main.js

---

## Common Tasks

### Running the Development Server

```bash
npm run dev
```

**What it does:**
- Starts Vite dev server on `http://localhost:5173/`
- Watches for file changes
- Hot module replacement (HMR) for instant updates
- Source maps for debugging

### Building for Production

```bash
npm run build
```

**What it does:**
- Bundles code with Vite
- Minifies JavaScript and CSS
- Optimizes assets
- Outputs to `dist/` folder

**Check build output:**

```bash
npm run preview
```

Opens production build at `http://localhost:4173/`

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

**Note:** Test suite is being set up in Phase 0. Initial tests coming soon!

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format with Prettier
npm run format

# Check formatting
npm run format:check
```

**Note:** Pre-commit hooks will run these automatically when you commit.

### Working with Data

**Fetching Latest Data:**

```bash
# Fetch submarine cable data
npm run fetch-data:cables

# Fetch data center data
npm run fetch-data:facilities

# Fetch all data
npm run fetch-data
```

**Note:** Data fetching scripts are being enhanced in Phase 2 (Real Data Integration).

### Debugging

**Enable Debug Mode:**

```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
```

This enables:
- FPS counter
- Performance stats
- Verbose console logging
- Visual debugging overlays

**Disable Debug Mode:**

```javascript
localStorage.removeItem('debug');
location.reload();
```

---

## Testing

### Unit Testing with Vitest

**Running Tests:**

```bash
npm run test
```

**Writing a Test:**

```javascript
// tests/unit/dataManager.test.js
import { describe, it, expect } from 'vitest';
import { transformCableData } from '../../src/dataManager.js';

describe('dataManager', () => {
  it('should transform cable data correctly', () => {
    const input = { name: 'Test Cable', coords: [[0, 0], [10, 10]] };
    const result = transformCableData(input);

    expect(result).toHaveProperty('name', 'Test Cable');
    expect(result.coords).toHaveLength(2);
  });
});
```

**Test Coverage Goals:**
- Core modules: ≥ 90%
- Feature modules: ≥ 80%
- Overall: ≥ 85%

### E2E Testing with Playwright

**Running E2E Tests:**

```bash
npm run test:e2e
```

**Writing an E2E Test:**

```javascript
// tests/e2e/visualization.spec.js
import { test, expect } from '@playwright/test';

test('globe renders and rotates', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Wait for globe to load
  await page.waitForSelector('canvas');

  // Check FPS is acceptable
  const fps = await page.evaluate(() => {
    return window.globeStats?.fps || 0;
  });

  expect(fps).toBeGreaterThan(30);
});
```

### Visual Regression Testing

**Capture Baseline:**

```bash
npm run test:visual:baseline
```

**Run Visual Tests:**

```bash
npm run test:visual
```

Uses Percy or BackstopJS to compare screenshots.

---

## Troubleshooting

### Issue: Dev Server Won't Start

**Error:** `EADDRINUSE: address already in use`

**Solution:**

```bash
# Find process using port 5173
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.js
# server: { port: 3000 }
```

---

### Issue: Globe Doesn't Render

**Symptoms:** Blank screen, black canvas

**Check:**

1. **Console Errors:** Open DevTools (F12), check Console tab
2. **WebGL Support:** Visit https://get.webgl.org/
3. **GPU Acceleration:** Ensure enabled in browser settings

**Common Causes:**

- Outdated browser (update to latest)
- WebGL disabled
- Graphics drivers need updating

**Solution:**

```bash
# Try software rendering (slower, but works)
# Add to vite.config.js
export default {
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
}
```

---

### Issue: Performance is Slow (FPS < 30)

**Check:**

1. **Browser DevTools Performance Tab:** Profile rendering
2. **Number of Objects:** Check data counts in console
3. **GPU Usage:** Monitor GPU in Task Manager

**Solutions:**

- Reduce data density (toggle off some layers)
- Lower quality settings
- Close other GPU-intensive apps
- Use Chrome (fastest WebGL performance)

**Debug:**

```javascript
// In browser console
console.log('Cables:', window.globe.getCablesCount());
console.log('Data Centers:', window.globe.getDataCentersCount());
console.log('Particles:', window.globe.getParticleCount());
```

---

### Issue: Data Not Loading

**Error:** `Failed to fetch data from API`

**Check:**

1. **Network Tab:** See failed requests
2. **CORS Issues:** Check console for CORS errors
3. **API Status:** Verify API endpoints are up

**Solution:**

```bash
# Use mock data for development
cp src/data/mock-cables.json src/data/cables.json

# Or fetch data manually
npm run fetch-data
```

---

### Issue: Tests Failing

**Common Causes:**

- Missing test dependencies
- Outdated snapshots
- Environment differences

**Solutions:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Update snapshots
npm run test -- -u

# Run tests in isolation
npm run test -- --no-threads
```

---

### Issue: Build Fails

**Error:** `Rollup error: Unexpected token`

**Check:**

1. **Syntax Errors:** Run ESLint
2. **Import Paths:** Verify all imports are correct
3. **Dependencies:** Check package.json versions

**Solution:**

```bash
# Clean build cache
rm -rf dist node_modules/.vite

# Rebuild
npm run build
```

---

### Getting Help

**Still stuck?**

1. **Check Documentation:** See [docs/](../README.md) folder
2. **Search Issues:** [GitHub Issues](https://github.com/bjpl/Internet-Infrastructure-Map/issues)
3. **Ask the Team:** Post in team chat
4. **Create Issue:** [New Issue](https://github.com/bjpl/Internet-Infrastructure-Map/issues/new)

---

## Resources

### Essential Documentation

- **Three.js Docs:** https://threejs.org/docs/
- **globe.gl API:** https://github.com/vasturiano/globe.gl
- **D3.js Guide:** https://d3js.org/
- **Vite Guide:** https://vitejs.dev/guide/

### Learning Resources

**WebGL & Three.js:**
- [Three.js Journey](https://threejs-journey.com/) (course)
- [Discover Three.js](https://discoverthreejs.com/) (book)
- [WebGL Fundamentals](https://webglfundamentals.org/)

**Networking Concepts:**
- See `knowledge-base/` folder (educational content)
- [How DNS Works](https://howdns.works/)
- [BGP Tutorial](https://www.cloudflare.com/learning/security/glossary/what-is-bgp/)

### Project Documentation

- **Roadmap:** [implementation-roadmap.md](./implementation-roadmap.md)
- **Daily Reports:** [docs/daily_reports/](../daily_reports/)
- **Deployment:** [docs/DEPLOYMENT.md](../DEPLOYMENT.md)
- **Updates:** [docs/UPDATES.md](../UPDATES.md)

### Useful Tools

- **WebGL Inspector:** https://benvanik.github.io/WebGL-Inspector/
- **Three.js Editor:** https://threejs.org/editor/
- **GeoJSON Validator:** https://geojsonlint.com/
- **API Testing:** [Thunder Client](https://www.thunderclient.com/) (VS Code extension)

### Code Examples

**Initialize Globe:**

```javascript
import Globe from 'globe.gl';

const globe = Globe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
  .backgroundColor('rgba(0,0,0,0)')
  .showAtmosphere(true)
  .atmosphereColor('#4A90E2')
  .atmosphereAltitude(0.15);

globe(document.getElementById('globeViz'));
```

**Add Submarine Cables:**

```javascript
globe.arcsData(cableData)
  .arcColor('color')
  .arcStroke(0.5)
  .arcDashLength(0.4)
  .arcDashGap(0.2)
  .arcDashAnimateTime(1500);
```

**Add Data Centers:**

```javascript
globe.pointsData(dataCenterData)
  .pointAltitude('altitude')
  .pointRadius(0.1)
  .pointColor('color')
  .pointResolution(12);
```

---

## Next Steps

### For New Developers

1. ✅ Complete this quick-start guide
2. ✅ Run the project locally successfully
3. 📖 Read the [implementation-roadmap.md](./implementation-roadmap.md)
4. 🏗️ Pick a task from the current phase
5. 🌿 Create a feature branch
6. 💻 Start coding!

### Current Phase: Code Consolidation

**Good First Issues:**

- Extract globe initialization into separate module
- Add unit tests for dataManager.js
- Create visual regression test suite
- Document cable rendering logic
- Improve error handling in data loading

**See:** [Phase 1 Tasks](./implementation-roadmap.md#phase-1-code-consolidation-week-3-4)

### Join the Team

- **Daily Standups:** 9:00 AM (your timezone)
- **Code Reviews:** Required for all PRs
- **Weekly Planning:** Fridays 2:00 PM
- **Slack Channel:** #internet-infrastructure-map

---

## FAQ

**Q: How long does it take to get started?**
A: Most developers are up and running in 15-30 minutes.

**Q: What if I'm new to Three.js/WebGL?**
A: No problem! Check the learning resources above. Start with small tasks and pair program with experienced team members.

**Q: Can I work on multiple phases simultaneously?**
A: Phase 1 must be completed first. Phases 2 and 3 can be developed in parallel.

**Q: How do I update my fork with upstream changes?**
A:
```bash
git remote add upstream https://github.com/bjpl/Internet-Infrastructure-Map.git
git fetch upstream
git checkout develop
git merge upstream/develop
git push origin develop
```

**Q: Where can I find the data sources?**
A: See `src/dataManager.js` for current sources and [implementation-roadmap.md Phase 2](./implementation-roadmap.md#phase-2-real-data-integration-week-5-7) for planned integrations.

**Q: Is there a code style guide?**
A: Yes, we use ESLint + Prettier. Run `npm run lint` to check. Pre-commit hooks enforce it automatically.

**Q: How do I report a bug?**
A: [Create an issue](https://github.com/bjpl/Internet-Infrastructure-Map/issues/new) with steps to reproduce, expected behavior, and actual behavior.

---

**Welcome to the team! Let's build something amazing together. 🌐✨**

---

**Document Control:**
- **Version:** 1.0
- **Last Updated:** October 7, 2025
- **Maintained By:** Project Lead
- **For Questions:** See [Getting Help](#getting-help)
