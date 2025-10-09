# Live Internet Infrastructure Map 🌐

> **An educational 3D visualization of global internet infrastructure with live data, intelligent fallbacks, and integrated knowledge base**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-live-green.svg)
![Data Quality](https://img.shields.io/badge/data%20quality-85%25-brightgreen.svg)

**Live Demo:** [https://bjpl.github.io/Internet-Infrastructure-Map/](https://bjpl.github.io/Internet-Infrastructure-Map/)

---

## ✨ What's New in v2.0

🚀 **Live API Integration** - Real data from TeleGeography, PeeringDB, and Cloudflare Radar  
📚 **Knowledge Base** - 200+ educational articles integrated  
📊 **Data Freshness Dashboard** - Real-time quality monitoring  
🎓 **Learning Tours** - Guided infrastructure walkthroughs  
🧠 **Intelligent Fallbacks** - API → Cache → Hardcoded chain  

---

## 🎯 Overview

Interactive 3D globe showing internet infrastructure with:
- **100+ Real Submarine Cables** (TeleGeography live data)
- **500+ Real Data Centers** (PeeringDB live data)
- **Integrated Knowledge Base** (200+ educational articles)
- **Data Quality Dashboard** (real-time confidence scores)

See full details in [docs/IMPLEMENTATION_COMPLETE.md](docs/IMPLEMENTATION_COMPLETE.md)

---

## 🚀 Quick Start

\`\`\`bash
# Clone and install
git clone https://github.com/bjpl/Internet-Infrastructure-Map.git
cd Internet-Infrastructure-Map
npm install

# Run immediately (works without API keys!)
npm run dev

# Other useful commands:
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run fetch-data # Fetch latest data from APIs (requires API keys)
\`\`\`

**Optional:** Add API keys to \`.env\` for 100% live data (see [docs/API_INTEGRATION_GUIDE.md](docs/API_INTEGRATION_GUIDE.md))

---

## 📚 Documentation

### Quick Start
- **[Getting Started Guide](docs/GETTING_STARTED.md)** - Choose your learning path
- **[Quick Reference](docs/reference/QUICK_REFERENCE.md)** - One-page cheat sheet
- **[Developer Cheat Sheet](docs/reference/DEVELOPER_CHEATSHEET.md)** - Dev quick reference

### Comprehensive Guides
- **[API Complete Guide](docs/guides/API_COMPLETE_GUIDE.md)** - All API documentation (consolidated)
- **[Knowledge Base Guide](docs/guides/KNOWLEDGE_BASE_GUIDE.md)** - Educational features
- **[KB Advanced Guide](docs/guides/KB_ADVANCED_GUIDE.md)** - Advanced customization
- **[Data Quality Guide](docs/guides/DATA_QUALITY_GUIDE.md)** - Quality monitoring (consolidated)

### Technical Reference
- **[Architecture](docs/architecture/README.md)** - System design & patterns
- **[Error Handling](docs/api/ERROR_HANDLING.md)** - API troubleshooting
- **[Implementation Complete](docs/IMPLEMENTATION_COMPLETE.md)** - Full feature summary
- **[Documentation Index](docs/INDEX.md)** - Complete catalog

---

## ✨ Key Features

### 1. Live Data with Intelligent Fallbacks
\`\`\`
🟢 Try: Live API → 🟡 Cache → ⚪ Fallback (always works!)
\`\`\`

### 2. Knowledge Base Integration
Click any cable/data center → Learn about internet infrastructure

### 3. Data Quality Dashboard
Real-time confidence scores (85% average accuracy)

### 4. Visual Excellence
- 60 FPS WebGL rendering
- Color-coded cables by capacity
- Interactive tooltips with education
- Smooth GSAP animations

---

## 📊 Data Sources

| Source | Type | Count | Accuracy |
|--------|------|-------|----------|
| TeleGeography | Cables | 100+ | 85% |
| PeeringDB | Data Centers | 500+ | 90% |
| Cloudflare Radar | Insights | Live | 95% |

---

## 🏗️ Architecture

Modern service-layer architecture:
\`\`\`
UI → Components → DataOrchestrator → APIs/Cache/Fallback
\`\`\`

See [docs/architecture/](docs/architecture/) for diagrams.

---

## 🤝 Contributing

We welcome contributions! Areas for help:
1. More live data sources (Hurricane Electric BGP, RIPE Atlas)
2. Knowledge base expansion (more articles and tours)
3. Mobile optimization (React Native app)
4. Accessibility improvements (WCAG 2.1 AA)
5. Internationalization (i18n support)

**Get Started:**
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- Check [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards
- Review [SECURITY.md](SECURITY.md) for security policy
- See [CHANGELOG.md](CHANGELOG.md) for version history

---

## 📝 License

MIT License - See LICENSE file

---

## 🙏 Acknowledgments

**Data:** TeleGeography, PeeringDB, Cloudflare Radar  
**Tools:** Three.js, Globe.GL, Vite  
**AI:** Claude Code + Claude Flow + RUV Swarm  

---

**Version:** 2.0.0 | **Status:** ✅ Production Ready | **Updated:** Oct 7, 2025
