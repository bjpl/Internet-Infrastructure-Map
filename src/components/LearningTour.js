/**
 * Learning Tour Component
 *
 * Provides guided tours through the visualization with step-by-step
 * explanations and highlights of visual elements.
 */
class LearningTour {
  constructor(globe, overlayManager) {
    this.globe = globe;
    this.overlayManager = overlayManager;
    this.currentTour = null;
    this.currentStep = 0;
    this.isPlaying = false;

    this.tours = this.initializeTours();
    this.createTourUI();
  }

  /**
   * Initialize predefined tours
   */
  initializeTours() {
    return {
      'submarine-cables': {
        id: 'submarine-cables',
        title: 'Submarine Cables: The Backbone of the Internet',
        description: 'Learn how underwater fiber optic cables connect continents and carry 99% of international data.',
        difficulty: 'beginner',
        duration: 8, // minutes
        steps: [
          {
            title: 'Welcome to Submarine Cables',
            content: 'Submarine cables are massive fiber optic cables laid on the ocean floor that connect continents. They carry 99% of all international internet traffic.',
            action: {
              type: 'camera',
              target: { lat: 20, lng: -40, altitude: 2.5 }
            },
            highlight: null,
            kbArticle: 'internet-architecture/00-index'
          },
          {
            title: 'Transatlantic Cables',
            content: 'The Atlantic Ocean has the densest concentration of cables, connecting North America with Europe. The first transatlantic cable was laid in 1858!',
            action: {
              type: 'camera',
              target: { lat: 45, lng: -30, altitude: 1.8 }
            },
            highlight: {
              type: 'region',
              filter: { region: 'transatlantic' }
            },
            kbArticle: 'internet-architecture/core-concepts'
          },
          {
            title: 'Major Cable Systems',
            content: 'Modern cables like MAREA (Microsoft/Facebook) and Grace Hopper (Google) can transmit over 200 terabits per second - enough to stream 70 million 4K videos simultaneously.',
            action: {
              type: 'camera',
              target: { lat: 35, lng: -30, altitude: 1.5 }
            },
            highlight: {
              type: 'cables',
              filter: { capacity: 'high' }
            },
            kbArticle: 'data/performance-metrics'
          },
          {
            title: 'Pacific Connections',
            content: 'The Pacific Ocean presents unique challenges due to its vast size and depth. Cables here often exceed 10,000 km in length.',
            action: {
              type: 'camera',
              target: { lat: 20, lng: -150, altitude: 2.2 }
            },
            highlight: {
              type: 'region',
              filter: { region: 'transpacific' }
            },
            kbArticle: 'internet-architecture/00-index'
          },
          {
            title: 'Landing Points',
            content: 'Cables come ashore at landing points, often in remote beaches. These facilities are heavily secured and monitored.',
            action: {
              type: 'camera',
              target: { lat: 40.7, lng: -74.0, altitude: 0.5 }
            },
            highlight: {
              type: 'cables',
              filter: { majorOnly: true }
            },
            kbArticle: 'internet-architecture/core-concepts'
          },
          {
            title: 'Resilience and Redundancy',
            content: 'Multiple cables along similar routes provide redundancy. If one fails, traffic automatically reroutes through others.',
            action: {
              type: 'camera',
              target: { lat: 20, lng: -40, altitude: 2.5 }
            },
            highlight: {
              type: 'all-cables',
              filter: { accuracy: 'all' }
            },
            kbArticle: 'data/routing-protocols'
          }
        ]
      },

      'data-centers': {
        id: 'data-centers',
        title: 'Data Centers: The Cloud\'s Physical Home',
        description: 'Explore where the "cloud" actually lives - massive facilities housing servers and network equipment.',
        difficulty: 'beginner',
        duration: 6,
        steps: [
          {
            title: 'Introduction to Data Centers',
            content: 'Data centers are facilities that house computer systems, storage, and networking equipment. They\'re the physical infrastructure behind "the cloud".',
            action: {
              type: 'camera',
              target: { lat: 40, lng: -100, altitude: 2.0 }
            },
            highlight: null,
            kbArticle: 'internet-architecture/00-index'
          },
          {
            title: 'Tier Classifications',
            content: 'Data centers are classified into tiers (1-4) based on redundancy and uptime. Tier 4 facilities guarantee 99.995% uptime.',
            action: {
              type: 'toggle',
              target: 'datacenters',
              value: true
            },
            highlight: {
              type: 'datacenters',
              filter: { tier: 'all' }
            },
            kbArticle: 'internet-architecture/00-index'
          },
          {
            title: 'Geographic Distribution',
            content: 'Major tech companies strategically place data centers worldwide to reduce latency and comply with data sovereignty laws.',
            action: {
              type: 'camera',
              target: { lat: 20, lng: 0, altitude: 2.5 }
            },
            highlight: {
              type: 'datacenters',
              filter: { tier: 'tier1' }
            },
            kbArticle: 'data/cdn-technologies'
          },
          {
            title: 'Internet Exchange Points',
            content: 'Data centers often host IXPs - neutral facilities where different networks interconnect to exchange traffic directly.',
            action: {
              type: 'camera',
              target: { lat: 51.5, lng: 0.0, altitude: 0.8 }
            },
            highlight: {
              type: 'datacenters',
              filter: { tier: 'tier1' }
            },
            kbArticle: 'internet-architecture/core-concepts'
          },
          {
            title: 'Energy and Cooling',
            content: 'Modern data centers consume enormous amounts of power. Cooling alone can account for 40% of total energy use.',
            action: {
              type: 'camera',
              target: { lat: 45, lng: -120, altitude: 1.2 }
            },
            highlight: {
              type: 'datacenters',
              filter: { tier: 'all' }
            },
            kbArticle: 'performance/optimization-strategies'
          }
        ]
      },

      'routing': {
        id: 'routing',
        title: 'How Data Finds Its Way',
        description: 'Understand BGP routing, the protocol that makes the internet possible.',
        difficulty: 'intermediate',
        duration: 10,
        steps: [
          {
            title: 'Introduction to Routing',
            content: 'When you visit a website, your data must navigate through dozens of networks. BGP (Border Gateway Protocol) makes this possible.',
            action: {
              type: 'camera',
              target: { lat: 20, lng: -40, altitude: 2.5 }
            },
            highlight: null,
            kbArticle: 'data/routing-protocols'
          },
          {
            title: 'Autonomous Systems',
            content: 'The internet is divided into ~70,000 Autonomous Systems (AS) - networks controlled by a single organization.',
            action: {
              type: 'camera',
              target: { lat: 40, lng: -100, altitude: 2.0 }
            },
            highlight: {
              type: 'cables',
              filter: { majorOnly: true }
            },
            kbArticle: 'data/routing-protocols'
          },
          {
            title: 'BGP Peering',
            content: 'Networks peer (connect) at IXPs or through private connections. Traffic flows based on business relationships and technical efficiency.',
            action: {
              type: 'camera',
              target: { lat: 51.5, lng: 0.0, altitude: 1.0 }
            },
            highlight: {
              type: 'datacenters',
              filter: { tier: 'tier1' }
            },
            kbArticle: 'frameworks/routing-decision-framework'
          },
          {
            title: 'Path Selection',
            content: 'BGP chooses paths based on policy, not just shortest distance. A packet might take a longer route due to business agreements.',
            action: {
              type: 'camera',
              target: { lat: 20, lng: -40, altitude: 2.2 }
            },
            highlight: {
              type: 'cables',
              filter: { region: 'all' }
            },
            kbArticle: 'data/routing-protocols'
          },
          {
            title: 'Route Convergence',
            content: 'When a link fails, BGP must converge on new paths. This can take seconds to minutes, causing temporary outages.',
            action: {
              type: 'camera',
              target: { lat: 35, lng: -30, altitude: 1.8 }
            },
            highlight: {
              type: 'region',
              filter: { region: 'transatlantic' }
            },
            kbArticle: 'data/routing-protocols'
          }
        ]
      },

      'performance': {
        id: 'performance',
        title: 'Performance and Optimization',
        description: 'Learn how CDNs and caching make the web fast.',
        difficulty: 'intermediate',
        duration: 7,
        steps: [
          {
            title: 'The Speed of Light Problem',
            content: 'Even at the speed of light through fiber, latency adds up. A round trip from NYC to Singapore takes ~200ms minimum.',
            action: {
              type: 'camera',
              target: { lat: 20, lng: 100, altitude: 2.5 }
            },
            highlight: {
              type: 'region',
              filter: { region: 'transpacific' }
            },
            kbArticle: 'data/performance-metrics'
          },
          {
            title: 'Content Delivery Networks',
            content: 'CDNs solve latency by caching content close to users. Instead of going to Singapore, your request might only go 50 miles.',
            action: {
              type: 'camera',
              target: { lat: 40, lng: -100, altitude: 2.0 }
            },
            highlight: {
              type: 'datacenters',
              filter: { tier: 'all' }
            },
            kbArticle: 'data/cdn-technologies'
          },
          {
            title: 'Edge Locations',
            content: 'CDNs deploy thousands of edge servers worldwide. Cloudflare, for example, operates in 300+ cities.',
            action: {
              type: 'camera',
              target: { lat: 20, lng: 0, altitude: 2.5 }
            },
            highlight: {
              type: 'datacenters',
              filter: { tier: 'tier1' }
            },
            kbArticle: 'data/cdn-technologies'
          },
          {
            title: 'Caching Strategies',
            content: 'Different content types have different caching strategies. Static assets cache for days, while API responses might cache for seconds.',
            action: {
              type: 'camera',
              target: { lat: 40, lng: -74, altitude: 0.8 }
            },
            highlight: {
              type: 'datacenters',
              filter: { tier: 'tier1' }
            },
            kbArticle: 'performance/optimization-strategies'
          },
          {
            title: 'Optimization Techniques',
            content: 'Modern web performance uses compression, HTTP/2, image optimization, and code splitting to minimize data transfer.',
            action: {
              type: 'camera',
              target: { lat: 20, lng: -40, altitude: 2.5 }
            },
            highlight: null,
            kbArticle: 'performance/optimization-strategies'
          }
        ]
      }
    };
  }

  /**
   * Create tour UI elements
   */
  createTourUI() {
    const tourContainer = document.createElement('div');
    tourContainer.className = 'learning-tour-container hidden';
    tourContainer.innerHTML = `
      <div class="tour-overlay"></div>
      <div class="tour-modal">
        <div class="tour-header">
          <h3 class="tour-title"></h3>
          <button class="tour-close" aria-label="Close tour">×</button>
        </div>

        <div class="tour-progress">
          <div class="tour-progress-bar">
            <div class="tour-progress-fill"></div>
          </div>
          <span class="tour-progress-text"></span>
        </div>

        <div class="tour-content">
          <h4 class="tour-step-title"></h4>
          <div class="tour-step-content"></div>
        </div>

        <div class="tour-controls">
          <button class="tour-btn tour-prev" disabled>
            <svg width="16" height="16" fill="currentColor">
              <path d="M11 2L4 8l7 6" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            Previous
          </button>

          <button class="tour-btn tour-kb">
            <svg width="16" height="16" fill="currentColor">
              <path d="M3 2h10v12H3z" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Learn More
          </button>

          <button class="tour-btn tour-next">
            Next
            <svg width="16" height="16" fill="currentColor">
              <path d="M5 2l7 6-7 6" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="tour-highlight-overlay"></div>
    `;

    document.body.appendChild(tourContainer);
    this.tourContainer = tourContainer;

    this.setupTourListeners();
  }

  /**
   * Setup event listeners for tour controls
   */
  setupTourListeners() {
    this.tourContainer.querySelector('.tour-close')?.addEventListener('click', () => {
      this.stop();
    });

    this.tourContainer.querySelector('.tour-prev')?.addEventListener('click', () => {
      this.previousStep();
    });

    this.tourContainer.querySelector('.tour-next')?.addEventListener('click', () => {
      this.nextStep();
    });

    this.tourContainer.querySelector('.tour-kb')?.addEventListener('click', () => {
      this.showKBArticle();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isPlaying) return;

      if (e.key === 'ArrowRight') {
        this.nextStep();
      } else if (e.key === 'ArrowLeft') {
        this.previousStep();
      } else if (e.key === 'Escape') {
        this.stop();
      }
    });
  }

  /**
   * Start a tour
   */
  start(tourId) {
    this.currentTour = this.tours[tourId];
    if (!this.currentTour) {
      console.error(`Tour ${tourId} not found`);
      return;
    }

    this.currentStep = 0;
    this.isPlaying = true;

    this.tourContainer.classList.remove('hidden');
    this.tourContainer.querySelector('.tour-title').textContent = this.currentTour.title;

    this.showStep(0);
  }

  /**
   * Show a specific step
   */
  async showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.currentTour.steps.length) {
      return;
    }

    this.currentStep = stepIndex;
    const step = this.currentTour.steps[stepIndex];

    // Update UI
    this.tourContainer.querySelector('.tour-step-title').textContent = step.title;
    this.tourContainer.querySelector('.tour-step-content').innerHTML = step.content;

    // Update progress
    const progress = ((stepIndex + 1) / this.currentTour.steps.length) * 100;
    this.tourContainer.querySelector('.tour-progress-fill').style.width = `${progress}%`;
    this.tourContainer.querySelector('.tour-progress-text').textContent =
      `Step ${stepIndex + 1} of ${this.currentTour.steps.length}`;

    // Update button states
    const prevBtn = this.tourContainer.querySelector('.tour-prev');
    const nextBtn = this.tourContainer.querySelector('.tour-next');

    prevBtn.disabled = stepIndex === 0;

    if (stepIndex === this.currentTour.steps.length - 1) {
      nextBtn.textContent = 'Finish';
    } else {
      nextBtn.innerHTML = `
        Next
        <svg width="16" height="16" fill="currentColor">
          <path d="M5 2l7 6-7 6" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      `;
    }

    // Execute step action
    await this.executeStepAction(step);

    // Highlight elements if specified
    if (step.highlight) {
      this.highlightElements(step.highlight);
    } else {
      this.clearHighlights();
    }
  }

  /**
   * Execute step action (camera movement, toggles, etc.)
   */
  async executeStepAction(step) {
    const { action } = step;
    if (!action) return;

    switch (action.type) {
      case 'camera':
        this.globe.pointOfView(action.target, 1500);
        break;

      case 'toggle':
        const toggle = document.getElementById(`toggle-${action.target}`);
        if (toggle) {
          toggle.checked = action.value;
          toggle.dispatchEvent(new Event('change'));
        }
        break;

      case 'filter':
        // Apply filter to controls
        Object.entries(action.filters || {}).forEach(([key, value]) => {
          const control = document.getElementById(`${key}-filter`);
          if (control) {
            control.value = value;
            control.dispatchEvent(new Event('change'));
          }
        });
        break;
    }
  }

  /**
   * Highlight specific elements on the globe
   */
  highlightElements(highlightSpec) {
    const { type, filter } = highlightSpec;

    // This would integrate with the main visualization
    // to highlight specific cables or datacenters

    const event = new CustomEvent('tour-highlight', {
      detail: { type, filter }
    });
    document.dispatchEvent(event);
  }

  /**
   * Clear all highlights
   */
  clearHighlights() {
    const event = new CustomEvent('tour-highlight', {
      detail: { type: 'clear' }
    });
    document.dispatchEvent(event);
  }

  /**
   * Show knowledge base article for current step
   */
  showKBArticle() {
    const step = this.currentTour.steps[this.currentStep];
    if (step.kbArticle && this.overlayManager) {
      this.overlayManager.showSidebar(step.kbArticle);
    }
  }

  /**
   * Go to next step
   */
  async nextStep() {
    if (this.currentStep < this.currentTour.steps.length - 1) {
      await this.showStep(this.currentStep + 1);
    } else {
      this.stop();
    }
  }

  /**
   * Go to previous step
   */
  async previousStep() {
    if (this.currentStep > 0) {
      await this.showStep(this.currentStep - 1);
    }
  }

  /**
   * Stop the tour
   */
  stop() {
    this.isPlaying = false;
    this.clearHighlights();
    this.tourContainer.classList.add('hidden');

    // Reset view
    this.globe.pointOfView({ lat: 20, lng: -40, altitude: 2.5 }, 1000);
  }

  /**
   * Get all available tours
   */
  getAllTours() {
    return Object.values(this.tours).map(tour => ({
      id: tour.id,
      title: tour.title,
      description: tour.description,
      difficulty: tour.difficulty,
      duration: tour.duration,
      steps: tour.steps.length
    }));
  }
}

export default LearningTour;
