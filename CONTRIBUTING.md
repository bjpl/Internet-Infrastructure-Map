# Contributing to Live Internet Infrastructure Map

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Basic knowledge of JavaScript, Three.js, and WebGL

### Setup
```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Internet-Infrastructure-Map.git
cd Internet-Infrastructure-Map

# 3. Add upstream remote
git remote add upstream https://github.com/bjpl/Internet-Infrastructure-Map.git

# 4. Install dependencies
npm install

# 5. Create a feature branch
git checkout -b feature/your-feature-name

# 6. Start development server
npm run dev
```

---

## 📋 Development Workflow

### Before You Start
1. **Check existing issues** - Your feature/fix may already be in progress
2. **Create an issue** - Discuss significant changes before implementing
3. **Read the documentation** - Familiarize yourself with the architecture

### Making Changes
```bash
# Keep your fork updated
git fetch upstream
git rebase upstream/main

# Make your changes
# ... edit files ...

# Run tests
npm test

# Build to verify
npm run build

# Commit with meaningful message
git add .
git commit -m "feat: add submarine cable filtering by capacity"
```

### Commit Message Convention
We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat(api): add PeeringDB real-time updates
fix(globe): correct cable rendering offset
docs(kb): update knowledge base integration guide
refactor(services): extract data orchestration logic
test(components): add DataFreshness tests
```

### Submitting Changes
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Include:
# - Clear description of changes
# - Related issue number (#123)
# - Screenshots/GIFs for UI changes
# - Test results
```

---

## 🎯 Code Guidelines

### JavaScript Style
- **ES6+** modules and syntax
- **Async/await** over callbacks
- **Meaningful names** for variables and functions
- **Comments** explain "why", not "what"
- **JSDoc** for public APIs

**Good:**
```javascript
/**
 * Fetches submarine cables with intelligent fallback chain
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of cable objects
 */
async function getCablesWithFallback(options) {
  try {
    return await apiService.getCables(options);
  } catch (error) {
    return fallbackDataSource.getCables();
  }
}
```

**Avoid:**
```javascript
// Bad naming, no error handling
function get(o) {
  return apiService.getCables(o);
}
```

### Component Structure
```javascript
// 1. Imports
import { DataOrchestrator } from '../services/dataOrchestrator.js';

// 2. Constants
const DEFAULT_CACHE_TTL = 300; // 5 minutes

// 3. Class definition
export class DataManager {
  constructor() {
    this.orchestrator = new DataOrchestrator();
  }

  // 4. Public methods
  async getData() { }

  // 5. Private methods
  _processData() { }
}
```

### Performance Guidelines
- **60 FPS rendering** must be maintained
- **Lazy load** large datasets
- **Batch operations** where possible
- **Cache** expensive computations
- **Profile** before optimizing

### Testing Requirements
- **Unit tests** for services and utilities
- **Integration tests** for data flow
- **Component tests** for UI elements
- **Minimum 80% coverage** for new code

```javascript
// Example test
import { describe, it, expect } from 'vitest';
import { CacheService } from './cacheService.js';

describe('CacheService', () => {
  it('should store and retrieve data', () => {
    const cache = new CacheService();
    cache.set('key', 'value', 60);
    expect(cache.get('key')).toBe('value');
  });
});
```

---

## 📚 Documentation Guidelines

### Update Documentation When:
- Adding new features
- Changing APIs
- Fixing bugs (if relevant)
- Refactoring architecture

### Documentation Locations
```
docs/
├── guides/              - User-facing guides
├── architecture/        - Technical architecture
├── api/                 - API reference
├── reference/           - Quick references
└── INDEX.md            - Master documentation catalog
```

### Writing Style
- **Clear and concise** - Avoid jargon
- **Code examples** - Include working examples
- **Diagrams** - Use ASCII art or markdown tables
- **Up-to-date** - Keep examples current

---

## 🔍 Code Review Process

### What Reviewers Look For
1. **Functionality** - Does it work as intended?
2. **Tests** - Are there tests? Do they pass?
3. **Performance** - Any performance regressions?
4. **Code quality** - Is it readable and maintainable?
5. **Documentation** - Is it documented?
6. **Security** - Any security concerns?

### Addressing Feedback
- **Be responsive** - Reply to comments
- **Be open** - Consider suggestions
- **Iterate** - Make requested changes
- **Discuss** - Explain your approach if needed

### Review Timeline
- **Initial review:** Within 2-3 days
- **Follow-up:** Within 1-2 days
- **Merge:** After approval and CI passes

---

## 🐛 Reporting Bugs

### Before Reporting
1. **Search existing issues** - It may already be reported
2. **Test on latest version** - Bug may be fixed
3. **Reproduce reliably** - Can you make it happen consistently?

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 2.0.0]

**Additional Context**
Any other relevant information
```

---

## 💡 Suggesting Features

### Feature Request Template
```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How would you solve it?

**Alternatives Considered**
What other approaches did you consider?

**Additional Context**
Screenshots, mockups, examples
```

### Feature Evaluation Criteria
- **User value** - Does it benefit users?
- **Scope** - Is it within project scope?
- **Complexity** - Is the effort justified?
- **Maintainability** - Can it be maintained long-term?

---

## 🎨 UI/UX Contributions

### Design Principles
- **Educational first** - Support learning
- **Data accuracy** - Make quality visible
- **Performance** - Maintain 60 FPS
- **Accessibility** - WCAG 2.1 AA compliance
- **Responsive** - Mobile-friendly

### UI Contribution Process
1. **Create mockups** - Show your vision
2. **Discuss approach** - Get feedback early
3. **Implement** - Follow style guide
4. **Test** - Multiple browsers and devices

---

## 📦 Adding Dependencies

### Before Adding a Dependency
Ask yourself:
- Is it necessary?
- Can we implement it ourselves?
- Is it actively maintained?
- What's the bundle size impact?
- Are there security concerns?

### Approval Required For
- New runtime dependencies
- Major version updates
- License changes

### Document Why
```javascript
// package.json
"dependencies": {
  // Globe visualization - core feature
  "globe.gl": "^2.26.0",

  // API data fetching - critical functionality
  "axios": "^1.6.0"
}
```

---

## 🔐 Security

### Security Best Practices
- **Never commit** API keys, tokens, secrets
- **Use `.env`** for configuration
- **Validate inputs** - Sanitize user data
- **Update dependencies** - Keep them current
- **Report vulnerabilities** - See SECURITY.md

### Security Review Checklist
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Output sanitization done
- [ ] Dependencies up to date
- [ ] No known vulnerabilities

---

## 🌍 Internationalization (Future)

Currently English-only, but we plan to support:
- Multi-language UI
- Localized knowledge base
- Region-specific data

If you want to help with i18n, please create an issue first.

---

## 📊 Performance Benchmarks

### Current Targets
- **Initial load:** < 3s
- **FPS:** 60 (consistent)
- **Memory:** < 200MB
- **Bundle size:** < 2MB (gzipped)

### Measuring Performance
```bash
# Build and analyze
npm run build
npx vite-bundle-visualizer

# Run performance tests
npm run test:perf

# Profile in Chrome DevTools
npm run dev
# Open Chrome DevTools > Performance
```

---

## 🤝 Community

### Getting Help
- **GitHub Discussions** - Questions and ideas
- **GitHub Issues** - Bugs and features
- **Documentation** - Check docs/ first

### Code of Conduct
- Be respectful and inclusive
- No harassment or discrimination
- Focus on constructive feedback
- Assume good intentions

See CODE_OF_CONDUCT.md for full details.

---

## 🏆 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

---

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🎓 Learning Resources

### Project Architecture
- [Architecture Overview](docs/architecture/README.md)
- [Data Flow Diagrams](docs/architecture/data-flow-diagrams.md)
- [API Integration Guide](docs/guides/API_COMPLETE_GUIDE.md)

### Technologies Used
- [Three.js Documentation](https://threejs.org/docs/)
- [Globe.GL](https://github.com/vasturiano/globe.gl)
- [Vite](https://vitejs.dev/)
- [D3.js](https://d3js.org/)

### Testing
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

---

## 📞 Contact

- **Project Lead:** [GitHub Profile]
- **Maintainers:** See CODEOWNERS
- **Security:** See SECURITY.md

---

**Thank you for contributing!** 🙏

Every contribution, no matter how small, makes this project better for everyone.
