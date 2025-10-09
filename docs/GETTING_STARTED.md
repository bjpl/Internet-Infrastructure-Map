# Getting Started Guide

**Choose Your Path - Interactive Getting Started for Live Internet Infrastructure Map**

Welcome! This guide helps you find the right documentation based on your goals.

---

## Quick Start (Everyone)

Want to see it running right now? Start here:

```bash
# 1. Clone the repository
git clone https://github.com/bjpl/Internet-Infrastructure-Map.git
cd Internet-Infrastructure-Map

# 2. Install dependencies
npm install

# 3. Run it!
npm run dev
```

**That's it!** The app works immediately with intelligent fallbacks. No API keys needed to start.

**Next:** Open http://localhost:5173 and explore the 3D globe.

---

## Choose Your Journey

### Path 1: "I Want to Get Started" 🚀

**You are:** New to the project
**Goal:** Run the app and understand what it does
**Time:** 15 minutes

#### Your Roadmap:

1. **Run the App** (5 min)
   - Follow [Quick Start](#quick-start-everyone) above
   - Explore the 3D globe visualization
   - Click on cables and data centers

2. **Understand Features** (5 min)
   - Read [README.md](../README.md) - Project overview
   - Check out the live demo: [https://bjpl.github.io/Internet-Infrastructure-Map/](https://bjpl.github.io/Internet-Infrastructure-Map/)

3. **Learn About Data** (5 min)
   - Read [Data Freshness README](./DATA_FRESHNESS_README.md)
   - Understand the API → Cache → Fallback chain

#### Next Steps:
- Want live data? → Go to **Path 3: APIs**
- Want to learn while exploring? → Go to **Path 5: Knowledge Base**
- Want to understand the code? → Go to **Path 2: Architecture**

---

### Path 2: "I Want to Understand the Architecture" 🏗️

**You are:** Developer or architect
**Goal:** Understand how the system works
**Time:** 1-2 hours

#### Your Roadmap:

1. **High-Level Overview** (20 min)
   - [Implementation Complete](./IMPLEMENTATION_COMPLETE.md) - What was built
   - [Architecture Overview](./architecture/README.md) - System design

2. **Deep Dive** (40 min)
   - [Integration Architecture](./architecture/integration-architecture.md) - How everything connects
   - [Data Flow Diagrams](./architecture/data-flow-diagrams.md) - Visual data flows
   - [API Integration Patterns](./architecture/api-integration-patterns.md) - Best practices

3. **Code Structure** (20 min)
   - [Service Layer Summary](./SERVICE_LAYER_SUMMARY.md) - Service architecture
   - [Main Unified Guide](./MAIN_UNIFIED_GUIDE.md) - Codebase walkthrough

#### Key Concepts You'll Learn:
- DataOrchestrator pattern
- Three-tier caching (Memory → IndexedDB → Service Worker)
- Intelligent fallback chain
- Knowledge Base integration
- Real-time data freshness monitoring

#### Next Steps:
- Ready to implement? → Go to **Path 4: Contributing**
- Need API details? → Go to **Path 3: APIs**

---

### Path 3: "I Want to Integrate APIs" 🔌

**You are:** Developer adding live data sources
**Goal:** Connect to TeleGeography, PeeringDB, and Cloudflare Radar
**Time:** 30 minutes setup + configuration

#### Your Roadmap:

1. **Quick Setup** (5 min)
   - [Quick Start: Live APIs](./QUICK_START_LIVE_APIS.md) - Get APIs running fast

2. **Detailed Configuration** (20 min)
   - [API Integration Guide](./API_INTEGRATION_GUIDE.md) - Complete setup
   - [API Service Guide](./API_SERVICE_GUIDE.md) - Service layer details

3. **Advanced Usage** (15 min)
   - [Live API Usage Examples](./LIVE_API_USAGE_EXAMPLES.md) - Code examples
   - [API Integration Patterns](./architecture/api-integration-patterns.md) - Best practices

4. **Verification** (5 min)
   - [Data Freshness Guide](./DATA_FRESHNESS_GUIDE.md) - Monitor data quality

#### APIs You'll Integrate:
- **TeleGeography:** Submarine cables (100+ real cables)
- **PeeringDB:** Internet exchange points and data centers (500+ facilities)
- **Cloudflare Radar:** Real-time internet traffic insights

#### Configuration Steps:
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Add your API keys to .env
VITE_TELEGEOGRAPHY_API_KEY=your_key_here
VITE_PEERINGDB_API_KEY=your_key_here
VITE_CLOUDFLARE_RADAR_API_KEY=your_key_here

# 3. Restart dev server
npm run dev
```

#### Next Steps:
- Monitor data quality → [Data Freshness Dashboard](./DATA_FRESHNESS_GUIDE.md)
- Understand caching → [Architecture Overview](./architecture/README.md)

---

### Path 4: "I Want to Contribute" 🤝

**You are:** Developer ready to add features or fix bugs
**Goal:** Understand codebase and contribute effectively
**Time:** 1 hour

#### Your Roadmap:

1. **Understand Current State** (20 min)
   - [Implementation Complete](./IMPLEMENTATION_COMPLETE.md) - What's been built
   - [Service Layer Summary](./SERVICE_LAYER_SUMMARY.md) - Code organization
   - [Unification Summary](./UNIFICATION_SUMMARY.md) - Code consolidation process

2. **Code Architecture** (20 min)
   - [Main Unified Guide](./MAIN_UNIFIED_GUIDE.md) - Codebase walkthrough
   - [Main Variants Comparison](./code-analysis/main-variants-comparison.md) - Code evolution

3. **Development Setup** (15 min)
   - Set up development environment
   - Run tests: `npm test`
   - Build: `npm run build`

4. **Make Your First Contribution** (15 min)
   - Find an issue or improvement area
   - Follow existing patterns from [Service Layer Summary](./SERVICE_LAYER_SUMMARY.md)
   - Test your changes

#### Key Files to Know:
```
src/
├── main-integrated.js          # ⭐ Active main file
├── services/
│   ├── dataOrchestrator.js    # Central data coordination
│   ├── apiService.js          # API management
│   ├── cacheService.js        # Caching layer
│   └── knowledgeBaseService.js # KB integration
└── components/                 # UI components
```

#### Next Steps:
- Deploy your changes → [Deployment Guide](./DEPLOYMENT.md)
- Add tests → Check `tests/` directory

---

### Path 5: "I Want to Use the Knowledge Base" 📚

**You are:** Educator, student, or curious explorer
**Goal:** Leverage educational features and learning tours
**Time:** 30 minutes

#### Your Roadmap:

1. **Quick Setup** (5 min)
   - [KB Quick Start](./KB_QUICK_START.md) - 5-minute integration

2. **Understand Features** (15 min)
   - [Knowledge Base Integration](./KNOWLEDGE_BASE_INTEGRATION.md) - Complete guide
   - Try the [KB Demo](./kb-demo.html) - Interactive demo

3. **Explore Content** (10 min)
   - Browse `knowledge-base/` directory
   - Try learning tours in the app
   - Use the search feature

#### What You Get:
- **200+ Educational Articles** covering:
  - Internet architecture fundamentals
  - Network protocols and layers
  - Submarine cable technology
  - Data center tiers
  - Security and encryption
  - Performance optimization
  - Troubleshooting guides

#### Interactive Features:
- **Tooltips:** Click any cable or data center → Learn
- **Learning Tours:** Guided walkthroughs of infrastructure
- **Search:** Full-text search across all content
- **Related Concepts:** Navigation between connected topics

#### Using Knowledge Base Features:
```javascript
// Search for content
const results = await kbIntegration.search('submarine cables');

// Start a learning tour
kbIntegration.startTour('internet-infrastructure');

// Show specific article
kbIntegration.showArticle('internet-architecture/core-concepts');
```

#### Next Steps:
- Add your own content → [Knowledge Base Mapping](./research/knowledge-base-mapping.md)
- Customize tours → Edit `src/components/LearningTour.js`

---

### Path 6: "I Want to Deploy This" 🚢

**You are:** DevOps engineer or project maintainer
**Goal:** Deploy to production
**Time:** 45 minutes

#### Your Roadmap:

1. **Pre-Deployment** (15 min)
   - Review [Deployment Guide](./DEPLOYMENT.md)
   - Configure environment variables
   - Set up API keys

2. **Build & Test** (15 min)
   ```bash
   # Run tests
   npm test

   # Build production bundle
   npm run build

   # Preview production build
   npm run preview
   ```

3. **Deploy** (15 min)
   - **GitHub Pages:** Push to `gh-pages` branch
   - **Netlify/Vercel:** Connect repository
   - **Custom Server:** Deploy `dist/` directory

4. **Post-Deployment** (10 min)
   - Verify all APIs are working
   - Check data freshness dashboard
   - Monitor error logs

#### Environment Variables:
```bash
# Production .env
VITE_TELEGEOGRAPHY_API_KEY=prod_key_here
VITE_PEERINGDB_API_KEY=prod_key_here
VITE_CLOUDFLARE_RADAR_API_KEY=prod_key_here
VITE_ENVIRONMENT=production
```

#### Deployment Checklist:
- [ ] All tests passing
- [ ] API keys configured
- [ ] Build completes successfully
- [ ] Performance metrics acceptable
- [ ] Error tracking enabled
- [ ] Monitoring dashboard ready

#### Next Steps:
- Monitor performance → [Data Freshness Guide](./DATA_FRESHNESS_GUIDE.md)
- Set up CI/CD → Add GitHub Actions workflow

---

## Common Questions

### Q: Do I need API keys to run the app?

**A:** No! The app works immediately with intelligent fallbacks. API keys give you live data, but the app functions perfectly without them using cached and fallback data.

### Q: Which documentation should I read first?

**A:**
- **New user?** → [README](../README.md)
- **Developer?** → [Implementation Complete](./IMPLEMENTATION_COMPLETE.md)
- **Architect?** → [Architecture Overview](./architecture/README.md)

### Q: How do I find specific information?

**A:** Use the [Navigation Guide](./NAVIGATION.md) or [Documentation Index](./INDEX.md) for comprehensive search and categorization.

### Q: Where are code examples?

**A:**
- API examples → [Live API Usage Examples](./LIVE_API_USAGE_EXAMPLES.md)
- KB examples → [KB Quick Start](./KB_QUICK_START.md)
- Architecture patterns → [API Integration Patterns](./architecture/api-integration-patterns.md)

### Q: How do I contribute?

**A:** Follow **Path 4: Contributing** above, then check existing issues or create a pull request.

---

## Path Comparison

| Path | Who | Time | Outcome |
|------|-----|------|---------|
| 1: Get Started | Everyone | 15 min | App running locally |
| 2: Architecture | Developers/Architects | 1-2 hrs | Deep system understanding |
| 3: APIs | Developers | 30 min | Live data integrated |
| 4: Contribute | Contributors | 1 hr | Ready to code |
| 5: Knowledge Base | Educators | 30 min | Educational features active |
| 6: Deploy | DevOps | 45 min | Production deployment |

---

## Visual Learning Path

```
┌─────────────────────────────────────────────────────┐
│                START HERE                           │
│         What do you want to do?                     │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    Run App      Understand      Build Features
        │           Code              │
        │               │             │
        ▼               ▼             ▼
   Path 1         Path 2         Path 3/4
   15 min         1-2 hrs        30-60 min
        │               │             │
        └───────────────┼─────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  Choose Next:   │
              │                 │
              │  • Deploy       │
              │  • Contribute   │
              │  • Learn More   │
              └─────────────────┘
```

---

## Additional Resources

### Documentation
- [Complete Index](./INDEX.md) - All documentation categorized
- [Navigation Guide](./NAVIGATION.md) - How to find what you need

### Code
- [GitHub Repository](https://github.com/bjpl/Internet-Infrastructure-Map)
- [Live Demo](https://bjpl.github.io/Internet-Infrastructure-Map/)

### Community
- GitHub Issues - Bug reports and feature requests
- Discussions - Questions and community support

---

## Need Help?

**Can't find what you need?**
1. Check [Navigation Guide](./NAVIGATION.md)
2. Search [Documentation Index](./INDEX.md)
3. Review [Common Questions](#common-questions)
4. Open a GitHub issue

**Still stuck?**
- Explore the [live demo](https://bjpl.github.io/Internet-Infrastructure-Map/)
- Check the [KB demo](./kb-demo.html)
- Review code examples in the docs

---

**Ready to start?** Pick your path above and begin your journey!

**Navigation:** [Documentation Index](./INDEX.md) | [Navigation Guide](./NAVIGATION.md) | [Back to README](../README.md)
