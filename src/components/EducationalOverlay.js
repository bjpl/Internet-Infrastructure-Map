import knowledgeBaseService from '../services/knowledgeBaseService.js';
import hljs from 'highlight.js';

/**
 * Educational Overlay Component
 *
 * Displays knowledge base content in various modes:
 * - Tooltip: Quick hover info
 * - Sidebar: Persistent side panel
 * - Modal: Focused article view
 * - Fullscreen: Immersive reading experience
 */
class EducationalOverlay {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.mode = 'tooltip'; // tooltip, sidebar, modal, fullscreen
    this.currentArticle = null;
    this.history = [];
    this.bookmarks = this.loadBookmarks();

    this.elements = {
      tooltip: null,
      sidebar: null,
      modal: null,
      fullscreen: null
    };

    this.createOverlays();
    this.setupEventListeners();
  }

  /**
   * Create all overlay DOM elements
   */
  createOverlays() {
    this.createTooltip();
    this.createSidebar();
    this.createModal();
    this.createFullscreen();
  }

  /**
   * Create tooltip overlay
   */
  createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'kb-tooltip hidden';
    tooltip.innerHTML = `
      <div class="kb-tooltip-content">
        <div class="kb-tooltip-header">
          <h4 class="kb-tooltip-title"></h4>
          <button class="kb-tooltip-close" aria-label="Close tooltip">×</button>
        </div>
        <div class="kb-tooltip-body"></div>
        <div class="kb-tooltip-footer">
          <button class="kb-tooltip-learn-more">Learn More</button>
        </div>
      </div>
    `;

    this.container.appendChild(tooltip);
    this.elements.tooltip = tooltip;
  }

  /**
   * Create sidebar overlay
   */
  createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'kb-sidebar hidden';
    sidebar.innerHTML = `
      <div class="kb-sidebar-header">
        <button class="kb-sidebar-back" title="Back" aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12 4l-8 8 8 8" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </button>
        <h3 class="kb-sidebar-title">Knowledge Base</h3>
        <button class="kb-sidebar-bookmark" title="Bookmark" aria-label="Bookmark article">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path d="M5 2h10v16l-5-3-5 3V2z" stroke-width="2"/>
          </svg>
        </button>
        <button class="kb-sidebar-close" title="Close" aria-label="Close sidebar">×</button>
      </div>

      <div class="kb-sidebar-tabs">
        <button class="kb-sidebar-tab active" data-tab="article">Article</button>
        <button class="kb-sidebar-tab" data-tab="search">Search</button>
        <button class="kb-sidebar-tab" data-tab="related">Related</button>
      </div>

      <div class="kb-sidebar-content">
        <div class="kb-sidebar-pane active" data-pane="article">
          <div class="kb-article-meta"></div>
          <div class="kb-article-content"></div>
        </div>

        <div class="kb-sidebar-pane" data-pane="search">
          <div class="kb-search-box">
            <input
              type="text"
              class="kb-search-input"
              placeholder="Search knowledge base..."
              aria-label="Search knowledge base"
            />
            <button class="kb-search-button" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <circle cx="8" cy="8" r="6" stroke-width="2"/>
                <path d="M13 13l5 5" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="kb-search-results"></div>
        </div>

        <div class="kb-sidebar-pane" data-pane="related">
          <div class="kb-related-articles"></div>
        </div>
      </div>

      <div class="kb-sidebar-footer">
        <button class="kb-expand-fullscreen" title="Fullscreen">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 2h6v2H4v4H2V2zm16 0h-6v2h4v4h2V2zM2 18h6v-2H4v-4H2v6zm16 0h-6v-2h4v-4h2v6z"/>
          </svg>
        </button>
      </div>
    `;

    this.container.appendChild(sidebar);
    this.elements.sidebar = sidebar;
  }

  /**
   * Create modal overlay
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'kb-modal hidden';
    modal.innerHTML = `
      <div class="kb-modal-backdrop"></div>
      <div class="kb-modal-container">
        <div class="kb-modal-header">
          <h2 class="kb-modal-title"></h2>
          <button class="kb-modal-close" aria-label="Close modal">×</button>
        </div>
        <div class="kb-modal-content"></div>
      </div>
    `;

    this.container.appendChild(modal);
    this.elements.modal = modal;
  }

  /**
   * Create fullscreen overlay
   */
  createFullscreen() {
    const fullscreen = document.createElement('div');
    fullscreen.className = 'kb-fullscreen hidden';
    fullscreen.innerHTML = `
      <div class="kb-fullscreen-nav">
        <button class="kb-fullscreen-back" aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          Back
        </button>
        <button class="kb-fullscreen-close" aria-label="Exit fullscreen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h12v2H8v10H6V6zm12 12H6v-2h10V6h2v12z"/>
          </svg>
          Exit
        </button>
      </div>

      <div class="kb-fullscreen-container">
        <article class="kb-fullscreen-article">
          <header class="kb-fullscreen-header">
            <div class="kb-fullscreen-meta"></div>
            <h1 class="kb-fullscreen-title"></h1>
          </header>
          <div class="kb-fullscreen-content"></div>
        </article>

        <aside class="kb-fullscreen-sidebar">
          <div class="kb-fullscreen-toc">
            <h3>Table of Contents</h3>
            <nav class="kb-fullscreen-toc-nav"></nav>
          </div>
          <div class="kb-fullscreen-related">
            <h3>Related Articles</h3>
            <div class="kb-fullscreen-related-list"></div>
          </div>
        </aside>
      </div>
    `;

    this.container.appendChild(fullscreen);
    this.elements.fullscreen = fullscreen;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Tooltip events
    this.elements.tooltip.querySelector('.kb-tooltip-close')?.addEventListener('click', () => {
      this.hide('tooltip');
    });

    this.elements.tooltip.querySelector('.kb-tooltip-learn-more')?.addEventListener('click', () => {
      if (this.currentArticle) {
        this.showSidebar(this.currentArticle);
      }
    });

    // Sidebar events
    this.elements.sidebar.querySelector('.kb-sidebar-close')?.addEventListener('click', () => {
      this.hide('sidebar');
    });

    this.elements.sidebar.querySelector('.kb-sidebar-back')?.addEventListener('click', () => {
      this.navigateBack();
    });

    this.elements.sidebar.querySelector('.kb-sidebar-bookmark')?.addEventListener('click', () => {
      this.toggleBookmark();
    });

    this.elements.sidebar.querySelector('.kb-expand-fullscreen')?.addEventListener('click', () => {
      if (this.currentArticle) {
        this.showFullscreen(this.currentArticle);
      }
    });

    // Tab switching
    this.elements.sidebar.querySelectorAll('.kb-sidebar-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Search
    const searchInput = this.elements.sidebar.querySelector('.kb-search-input');
    const searchButton = this.elements.sidebar.querySelector('.kb-search-button');

    searchButton?.addEventListener('click', () => {
      this.performSearch(searchInput.value);
    });

    searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch(searchInput.value);
      }
    });

    // Modal events
    this.elements.modal.querySelector('.kb-modal-close')?.addEventListener('click', () => {
      this.hide('modal');
    });

    this.elements.modal.querySelector('.kb-modal-backdrop')?.addEventListener('click', () => {
      this.hide('modal');
    });

    // Fullscreen events
    this.elements.fullscreen.querySelector('.kb-fullscreen-close')?.addEventListener('click', () => {
      this.hide('fullscreen');
    });

    this.elements.fullscreen.querySelector('.kb-fullscreen-back')?.addEventListener('click', () => {
      if (this.currentArticle) {
        this.showSidebar(this.currentArticle);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAll();
      }
    });
  }

  /**
   * Show tooltip for element
   */
  async showTooltip(elementType, elementData, position) {
    const content = await knowledgeBaseService.getTooltipContent(
      elementType,
      elementData.id,
      elementData
    );

    const tooltip = this.elements.tooltip;
    tooltip.querySelector('.kb-tooltip-title').textContent = content.title;

    const body = tooltip.querySelector('.kb-tooltip-body');
    body.innerHTML = `
      <p class="kb-tooltip-summary">${content.summary}</p>
      ${content.quickFacts && content.quickFacts.length > 0 ? `
        <ul class="kb-tooltip-facts">
          ${content.quickFacts.map(fact => `<li>${fact}</li>`).join('')}
        </ul>
      ` : ''}
    `;

    // Store article reference for "Learn More"
    if (content.learnMoreArticles && content.learnMoreArticles.length > 0) {
      this.currentArticle = content.learnMoreArticles[0].id;
    }

    // Position tooltip
    this.positionTooltip(tooltip, position);

    tooltip.classList.remove('hidden');
  }

  /**
   * Position tooltip near cursor/element
   */
  positionTooltip(tooltip, position) {
    const { x, y } = position;
    const rect = tooltip.getBoundingClientRect();

    let left = x + 15;
    let top = y + 15;

    // Ensure tooltip stays in viewport
    if (left + rect.width > window.innerWidth) {
      left = x - rect.width - 15;
    }

    if (top + rect.height > window.innerHeight) {
      top = y - rect.height - 15;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  /**
   * Show sidebar with article
   */
  async showSidebar(articleId) {
    const article = knowledgeBaseService.getArticle(articleId);
    if (!article) return;

    this.currentArticle = articleId;
    this.history.push(articleId);

    // Update article content
    const metaEl = this.elements.sidebar.querySelector('.kb-article-meta');
    metaEl.innerHTML = this.renderArticleMeta(article);

    const contentEl = this.elements.sidebar.querySelector('.kb-article-content');
    contentEl.innerHTML = article.content.html;

    // Add syntax highlighting
    contentEl.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });

    // Update related articles
    await this.updateRelatedArticles(articleId);

    // Show sidebar
    this.hide('tooltip');
    this.elements.sidebar.classList.remove('hidden');

    // Update bookmark state
    this.updateBookmarkButton();
  }

  /**
   * Render article metadata
   */
  renderArticleMeta(article) {
    const difficultyColors = {
      beginner: '#00ff88',
      intermediate: '#ffcc00',
      advanced: '#ff6b6b'
    };

    return `
      <div class="kb-meta-badges">
        <span class="kb-badge kb-badge-category">${article.category}</span>
        <span class="kb-badge kb-badge-difficulty" style="color: ${difficultyColors[article.metadata.difficulty]}">
          ${article.metadata.difficulty}
        </span>
        <span class="kb-badge kb-badge-time">
          ${article.metadata.readingTime} min read
        </span>
      </div>
      <h2 class="kb-article-title">${article.title}</h2>
      <p class="kb-article-description">${article.description}</p>
    `;
  }

  /**
   * Update related articles panel
   */
  async updateRelatedArticles(articleId) {
    const related = knowledgeBaseService.getRelatedArticles(articleId, 5);
    const container = this.elements.sidebar.querySelector('.kb-related-articles');

    if (related.length === 0) {
      container.innerHTML = '<p class="kb-no-results">No related articles found.</p>';
      return;
    }

    container.innerHTML = `
      <ul class="kb-related-list">
        ${related.map(article => `
          <li class="kb-related-item" data-article-id="${article.id}">
            <h4>${article.title}</h4>
            <p>${article.description.substring(0, 100)}...</p>
            <span class="kb-related-meta">${article.metadata.readingTime} min read</span>
          </li>
        `).join('')}
      </ul>
    `;

    // Add click handlers
    container.querySelectorAll('.kb-related-item').forEach(item => {
      item.addEventListener('click', () => {
        this.showSidebar(item.dataset.articleId);
      });
    });
  }

  /**
   * Show modal with article
   */
  async showModal(articleId) {
    const article = knowledgeBaseService.getArticle(articleId);
    if (!article) return;

    this.currentArticle = articleId;

    const modal = this.elements.modal;
    modal.querySelector('.kb-modal-title').textContent = article.title;
    modal.querySelector('.kb-modal-content').innerHTML = article.content.html;

    // Highlight code blocks
    modal.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });

    modal.classList.remove('hidden');
  }

  /**
   * Show fullscreen article view
   */
  async showFullscreen(articleId) {
    const article = knowledgeBaseService.getArticle(articleId);
    if (!article) return;

    this.currentArticle = articleId;

    const fs = this.elements.fullscreen;

    // Update metadata
    fs.querySelector('.kb-fullscreen-meta').innerHTML = this.renderArticleMeta(article);
    fs.querySelector('.kb-fullscreen-title').textContent = article.title;
    fs.querySelector('.kb-fullscreen-content').innerHTML = article.content.html;

    // Generate table of contents
    this.generateTableOfContents(article);

    // Update related articles
    await this.updateFullscreenRelated(articleId);

    // Highlight code blocks
    fs.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });

    this.hide('sidebar');
    fs.classList.remove('hidden');
  }

  /**
   * Generate table of contents from headings
   */
  generateTableOfContents(article) {
    const content = this.elements.fullscreen.querySelector('.kb-fullscreen-content');
    const tocNav = this.elements.fullscreen.querySelector('.kb-fullscreen-toc-nav');

    const headings = content.querySelectorAll('h1, h2, h3');
    if (headings.length === 0) {
      tocNav.innerHTML = '<p>No sections</p>';
      return;
    }

    const tocItems = Array.from(headings).map((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      const level = parseInt(heading.tagName.substring(1));

      return `
        <a href="#${id}" class="kb-toc-item kb-toc-level-${level}">
          ${heading.textContent}
        </a>
      `;
    });

    tocNav.innerHTML = tocItems.join('');
  }

  /**
   * Update fullscreen related articles
   */
  async updateFullscreenRelated(articleId) {
    const related = knowledgeBaseService.getRelatedArticles(articleId, 5);
    const container = this.elements.fullscreen.querySelector('.kb-fullscreen-related-list');

    if (related.length === 0) {
      container.innerHTML = '<p>No related articles</p>';
      return;
    }

    container.innerHTML = related.map(article => `
      <div class="kb-fullscreen-related-item" data-article-id="${article.id}">
        <h4>${article.title}</h4>
        <p>${article.description.substring(0, 80)}...</p>
      </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.kb-fullscreen-related-item').forEach(item => {
      item.addEventListener('click', () => {
        this.showFullscreen(item.dataset.articleId);
      });
    });
  }

  /**
   * Switch sidebar tab
   */
  switchTab(tabName) {
    // Update tab buttons
    this.elements.sidebar.querySelectorAll('.kb-sidebar-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update panes
    this.elements.sidebar.querySelectorAll('.kb-sidebar-pane').forEach(pane => {
      pane.classList.toggle('active', pane.dataset.pane === tabName);
    });
  }

  /**
   * Perform search
   */
  async performSearch(query) {
    if (!query.trim()) return;

    const results = knowledgeBaseService.search(query, { limit: 10 });
    const container = this.elements.sidebar.querySelector('.kb-search-results');

    if (results.length === 0) {
      container.innerHTML = '<p class="kb-no-results">No results found.</p>';
      return;
    }

    container.innerHTML = `
      <ul class="kb-search-result-list">
        ${results.map(({ article, snippet, score }) => `
          <li class="kb-search-result" data-article-id="${article.id}">
            <h4>${article.title}</h4>
            <p class="kb-search-snippet">${snippet}</p>
            <div class="kb-search-meta">
              <span class="kb-badge">${article.category}</span>
              <span>${article.metadata.readingTime} min read</span>
            </div>
          </li>
        `).join('')}
      </ul>
    `;

    // Add click handlers
    container.querySelectorAll('.kb-search-result').forEach(item => {
      item.addEventListener('click', () => {
        this.switchTab('article');
        this.showSidebar(item.dataset.articleId);
      });
    });
  }

  /**
   * Navigate back in history
   */
  navigateBack() {
    if (this.history.length <= 1) {
      this.hide('sidebar');
      return;
    }

    this.history.pop(); // Remove current
    const previousArticleId = this.history[this.history.length - 1];
    this.showSidebar(previousArticleId);
  }

  /**
   * Toggle bookmark
   */
  toggleBookmark() {
    if (!this.currentArticle) return;

    const index = this.bookmarks.indexOf(this.currentArticle);
    if (index > -1) {
      this.bookmarks.splice(index, 1);
    } else {
      this.bookmarks.push(this.currentArticle);
    }

    this.saveBookmarks();
    this.updateBookmarkButton();
  }

  /**
   * Update bookmark button state
   */
  updateBookmarkButton() {
    const button = this.elements.sidebar.querySelector('.kb-sidebar-bookmark');
    const isBookmarked = this.bookmarks.includes(this.currentArticle);

    if (isBookmarked) {
      button.classList.add('active');
      button.querySelector('svg').setAttribute('fill', 'currentColor');
    } else {
      button.classList.remove('active');
      button.querySelector('svg').setAttribute('fill', 'none');
    }
  }

  /**
   * Save bookmarks to localStorage
   */
  saveBookmarks() {
    localStorage.setItem('kb-bookmarks', JSON.stringify(this.bookmarks));
  }

  /**
   * Load bookmarks from localStorage
   */
  loadBookmarks() {
    const stored = localStorage.getItem('kb-bookmarks');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Hide specific overlay
   */
  hide(mode) {
    if (this.elements[mode]) {
      this.elements[mode].classList.add('hidden');
    }
  }

  /**
   * Hide all overlays
   */
  hideAll() {
    Object.values(this.elements).forEach(el => {
      if (el) el.classList.add('hidden');
    });
  }
}

export default EducationalOverlay;
