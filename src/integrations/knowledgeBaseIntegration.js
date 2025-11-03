import knowledgeBaseService from '../services/knowledgeBaseService.js';
import EducationalOverlay from '../components/EducationalOverlay.js';
import LearningTour from '../components/LearningTour.js';
import KnowledgeSearch from '../components/KnowledgeSearch.js';
import DOMPurify from 'dompurify';

/**
 * Knowledge Base Integration
 *
 * Integrates the knowledge base with the visualization,
 * adding educational overlays and interactive learning features.
 */
class KnowledgeBaseIntegration {
  constructor(globe) {
    this.globe = globe;
    this.overlay = null;
    this.tour = null;
    this.search = null;
    this.initialized = false;

    this.setupEventListeners();
  }

  /**
   * Initialize the knowledge base integration
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing Knowledge Base Integration...');

    try {
      // Initialize knowledge base service
      await knowledgeBaseService.initialize();

      // Create overlay components
      this.overlay = new EducationalOverlay();

      // Create learning tour
      this.tour = new LearningTour(this.globe, this.overlay);

      // Create search widget (if needed)
      this.initializeSearchWidget();

      // Add KB integration UI
      this.addKBUI();

      this.initialized = true;
      console.log('Knowledge Base Integration initialized');
    } catch (error) {
      console.error('Failed to initialize KB integration:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners for visualization elements
   */
  setupEventListeners() {
    // Listen for arc (cable) clicks
    document.addEventListener('arc-click', (e) => {
      this.handleCableClick(e.detail);
    });

    // Listen for point (datacenter) clicks
    document.addEventListener('point-click', (e) => {
      this.handleDatacenterClick(e.detail);
    });

    // Listen for arc (cable) hover
    document.addEventListener('arc-hover', (e) => {
      this.handleCableHover(e.detail);
    });

    // Listen for point (datacenter) hover
    document.addEventListener('point-hover', (e) => {
      this.handleDatacenterHover(e.detail);
    });

    // Listen for tour highlights
    document.addEventListener('tour-highlight', (e) => {
      this.handleTourHighlight(e.detail);
    });
  }

  /**
   * Handle cable click
   */
  async handleCableClick(cableData) {
    if (!this.overlay) return;

    // Show sidebar with cable information
    const articles = knowledgeBaseService.getArticlesForVisualization('cable', cableData);

    if (articles.length > 0) {
      await this.overlay.showSidebar(articles[0].id);
    }
  }

  /**
   * Handle data center click
   */
  async handleDatacenterClick(datacenterData) {
    if (!this.overlay) return;

    const articles = knowledgeBaseService.getArticlesForVisualization('datacenter', datacenterData);

    if (articles.length > 0) {
      await this.overlay.showSidebar(articles[0].id);
    }
  }

  /**
   * Handle cable hover
   */
  async handleCableHover(event) {
    if (!this.overlay) return;

    const { cableData, position } = event;

    // Show tooltip on hover
    await this.overlay.showTooltip('cable', cableData, position);
  }

  /**
   * Handle data center hover
   */
  async handleDatacenterHover(event) {
    if (!this.overlay) return;

    const { datacenterData, position } = event;

    await this.overlay.showTooltip('datacenter', datacenterData, position);
  }

  /**
   * Handle tour highlight requests
   */
  handleTourHighlight(highlightSpec) {
    const { type, filter } = highlightSpec;

    if (type === 'clear') {
      // Clear all highlights
      this.clearHighlights();
      return;
    }

    // Apply highlights based on spec
    this.applyHighlights(type, filter);
  }

  /**
   * Apply highlights to visualization elements
   */
  applyHighlights(type, filter) {
    // This integrates with the main visualization
    // to highlight specific elements

    const event = new CustomEvent('apply-highlight', {
      detail: { type, filter }
    });
    document.dispatchEvent(event);
  }

  /**
   * Clear all highlights
   */
  clearHighlights() {
    const event = new CustomEvent('clear-highlight');
    document.dispatchEvent(event);
  }

  /**
   * Initialize search widget
   */
  initializeSearchWidget() {
    const searchContainer = document.getElementById('kb-search-container');
    if (!searchContainer) return;

    this.search = new KnowledgeSearch({
      container: searchContainer,
      onResultClick: (article) => {
        if (this.overlay) {
          this.overlay.showSidebar(article.id);
        }
      }
    });
  }

  /**
   * Add knowledge base UI elements
   */
  addKBUI() {
    const controlPanel = document.querySelector('.control-panel');
    if (!controlPanel) return;

    // Add KB section to control panel
    const kbSection = document.createElement('div');
    kbSection.className = 'control-section kb-section';
    kbSection.innerHTML = DOMPurify.sanitize(`
      <h3 class="section-title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 1h10v2H3z"/>
          <path d="M3 5h10v2H3z"/>
          <path d="M3 9h7v2H3z"/>
          <path d="M3 13h7v2H3z"/>
        </svg>
        Knowledge Base
      </h3>

      <div class="section-content">
        <button class="kb-button kb-search-btn" id="kb-search-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
            <circle cx="6" cy="6" r="5" stroke-width="2"/>
            <path d="M10 10l5 5" stroke-width="2"/>
          </svg>
          Search Knowledge Base
        </button>

        <button class="kb-button kb-browse-btn" id="kb-browse-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2h12v12H2z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Browse Articles
        </button>

        <div class="kb-tours">
          <h4 class="subsection-title">Learning Tours</h4>
          <select class="kb-tour-select" id="kb-tour-select">
            <option value="">Select a tour...</option>
          </select>
          <button class="kb-button kb-start-tour-btn" id="kb-start-tour-btn" disabled>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 2l10 6-10 6V2z"/>
            </svg>
            Start Tour
          </button>
        </div>
      </div>
    `);

    controlPanel.appendChild(kbSection);

    // Add event listeners
    this.setupKBUIListeners();
  }

  /**
   * Setup KB UI listeners
   */
  setupKBUIListeners() {
    // Search button
    document.getElementById('kb-search-btn')?.addEventListener('click', () => {
      if (this.overlay) {
        // Show sidebar in search mode
        this.overlay.showSidebar('internet-architecture/00-index');
        this.overlay.switchTab('search');
      }
    });

    // Browse button
    document.getElementById('kb-browse-btn')?.addEventListener('click', () => {
      this.showBrowseModal();
    });

    // Tour select
    const tourSelect = document.getElementById('kb-tour-select');
    const startTourBtn = document.getElementById('kb-start-tour-btn');

    if (tourSelect && this.tour) {
      // Populate tours
      const tours = this.tour.getAllTours();
      tours.forEach(tour => {
        const option = document.createElement('option');
        option.value = tour.id;
        option.textContent = `${tour.title} (${tour.duration} min)`;
        tourSelect.appendChild(option);
      });

      // Tour selection
      tourSelect.addEventListener('change', (e) => {
        startTourBtn.disabled = !e.target.value;
      });

      // Start tour
      startTourBtn.addEventListener('click', () => {
        const selectedTour = tourSelect.value;
        if (selectedTour && this.tour) {
          this.tour.start(selectedTour);
        }
      });
    }
  }

  /**
   * Show browse modal with all categories
   */
  showBrowseModal() {
    const categories = knowledgeBaseService.getAllCategories();

    const modal = document.createElement('div');
    modal.className = 'kb-browse-modal';
    modal.innerHTML = DOMPurify.sanitize(`
      <div class="kb-modal-backdrop"></div>
      <div class="kb-modal-container">
        <div class="kb-modal-header">
          <h2 class="kb-modal-title">Browse Knowledge Base</h2>
          <button class="kb-modal-close" aria-label="Close">×</button>
        </div>
        <div class="kb-modal-content">
          <div class="kb-category-grid">
            ${categories.map(cat => `
              <div class="kb-category-card" data-category="${cat.id}">
                <div class="kb-category-icon">${cat.icon}</div>
                <h3 class="kb-category-title">${cat.title}</h3>
                <p class="kb-category-count">${cat.articleCount} articles</p>
                <span class="kb-category-difficulty">${cat.difficulty}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `);

    document.body.appendChild(modal);

    // Close button
    modal.querySelector('.kb-modal-close').addEventListener('click', () => {
      modal.remove();
    });

    // Backdrop click
    modal.querySelector('.kb-modal-backdrop').addEventListener('click', () => {
      modal.remove();
    });

    // Category clicks
    modal.querySelectorAll('.kb-category-card').forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        const articles = knowledgeBaseService.getArticlesByCategory(category);

        if (articles.length > 0 && this.overlay) {
          this.overlay.showSidebar(articles[0].id);
          modal.remove();
        }
      });
    });

    // Show modal
    setTimeout(() => modal.classList.add('visible'), 10);
  }

  /**
   * Add "Learn More" button to existing cable tooltips
   */
  enhanceCableTooltips() {
    // This would integrate with the existing tooltip system
    // to add a "Learn More" button that opens the KB

    const tooltips = document.querySelectorAll('.globe-tooltip');
    tooltips.forEach(tooltip => {
      if (!tooltip.querySelector('.kb-learn-more')) {
        const button = document.createElement('button');
        button.className = 'kb-learn-more';
        button.textContent = 'Learn More';
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          // Extract cable ID and show KB article
          const cableId = tooltip.dataset.cableId;
          if (cableId && this.overlay) {
            const articles = knowledgeBaseService.getArticlesForVisualization('cable', { id: cableId });
            if (articles.length > 0) {
              this.overlay.showSidebar(articles[0].id);
            }
          }
        });
        tooltip.appendChild(button);
      }
    });
  }

  /**
   * Get tour by ID
   */
  getTour(tourId) {
    return this.tour ? this.tour.tours[tourId] : null;
  }

  /**
   * Start a specific tour
   */
  startTour(tourId) {
    if (this.tour) {
      this.tour.start(tourId);
    }
  }

  /**
   * Search knowledge base
   */
  async search(query, options = {}) {
    return knowledgeBaseService.search(query, options);
  }

  /**
   * Get article by ID
   */
  getArticle(articleId) {
    return knowledgeBaseService.getArticle(articleId);
  }

  /**
   * Show article in overlay
   */
  async showArticle(articleId, mode = 'sidebar') {
    if (!this.overlay) return;

    switch (mode) {
      case 'tooltip':
        // Not applicable for direct article viewing
        break;
      case 'sidebar':
        await this.overlay.showSidebar(articleId);
        break;
      case 'modal':
        await this.overlay.showModal(articleId);
        break;
      case 'fullscreen':
        await this.overlay.showFullscreen(articleId);
        break;
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.overlay) {
      this.overlay.hideAll();
    }

    if (this.tour) {
      this.tour.stop();
    }

    // Remove KB UI
    const kbSection = document.querySelector('.kb-section');
    if (kbSection) {
      kbSection.remove();
    }
  }
}

export default KnowledgeBaseIntegration;
