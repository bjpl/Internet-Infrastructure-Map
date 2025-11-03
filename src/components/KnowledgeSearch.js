import knowledgeBaseService from '../services/knowledgeBaseService.js';
import DOMPurify from 'dompurify';

/**
 * Knowledge Search Component
 *
 * Provides search UI with autocomplete, filtering, and relevance ranking.
 */
class KnowledgeSearch {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.onResultClick = options.onResultClick || (() => {});
    this.recentSearches = this.loadRecentSearches();

    this.createSearchUI();
    this.setupEventListeners();
  }

  /**
   * Create search UI
   */
  createSearchUI() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'kb-search-widget';
    searchContainer.innerHTML = DOMPurify.sanitize(`
      <div class="kb-search-bar">
        <svg class="kb-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <circle cx="8" cy="8" r="6" stroke-width="2"/>
          <path d="M13 13l5 5" stroke-width="2"/>
        </svg>

        <input
          type="text"
          class="kb-search-input"
          placeholder="Search knowledge base..."
          aria-label="Search knowledge base"
          autocomplete="off"
        />

        <button class="kb-search-clear hidden" aria-label="Clear search">&times;</button>

        <button class="kb-search-filters" aria-label="Show filters">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 4h16M4 8h12M6 12h8M8 16h4" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </button>
      </div>

      <div class="kb-search-filters-panel hidden">
        <div class="kb-filter-group">
          <label>Category</label>
          <select class="kb-filter-category">
            <option value="">All Categories</option>
            <option value="concepts">Core Concepts</option>
            <option value="data">Technical Reference</option>
            <option value="frameworks">Decision Frameworks</option>
            <option value="internet-architecture">Architecture</option>
            <option value="performance">Performance</option>
            <option value="practical">Practical Guides</option>
            <option value="quick-ref">Quick Reference</option>
            <option value="security">Security</option>
          </select>
        </div>

        <div class="kb-filter-group">
          <label>Difficulty</label>
          <select class="kb-filter-difficulty">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div class="kb-filter-group">
          <label>Sort By</label>
          <select class="kb-filter-sort">
            <option value="relevance">Relevance</option>
            <option value="title">Title</option>
            <option value="recent">Most Recent</option>
            <option value="reading-time">Reading Time</option>
          </select>
        </div>
      </div>

      <div class="kb-search-results hidden"></div>

      <div class="kb-search-suggestions">
        <div class="kb-suggestions-header">
          <h4>Recent Searches</h4>
          <button class="kb-clear-recent">Clear</button>
        </div>
        <ul class="kb-recent-list"></ul>
      </div>
    `);

    this.container.appendChild(searchContainer);
    this.searchWidget = searchContainer;

    this.renderRecentSearches();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const input = this.searchWidget.querySelector('.kb-search-input');
    const clearBtn = this.searchWidget.querySelector('.kb-search-clear');
    const filtersBtn = this.searchWidget.querySelector('.kb-search-filters');
    const filtersPanel = this.searchWidget.querySelector('.kb-search-filters-panel');

    // Input events
    input.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
      clearBtn.classList.toggle('hidden', !e.target.value);
    });

    input.addEventListener('focus', () => {
      this.showSuggestions();
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.add('hidden');
      this.hideResults();
      this.showSuggestions();
      input.focus();
    });

    // Filters toggle
    filtersBtn.addEventListener('click', () => {
      filtersPanel.classList.toggle('hidden');
    });

    // Filter changes
    this.searchWidget.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', () => {
        if (input.value.trim()) {
          this.performSearch(input.value);
        }
      });
    });

    // Recent searches
    this.searchWidget.querySelector('.kb-clear-recent')?.addEventListener('click', () => {
      this.clearRecentSearches();
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.searchWidget.contains(e.target)) {
        this.hideResults();
        this.hideSuggestions();
      }
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideResults();
        input.blur();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (input.value.trim()) {
          this.performSearch(input.value);
        }
      }
    });
  }

  /**
   * Handle search input with debouncing
   */
  handleSearchInput(query) {
    clearTimeout(this.searchTimeout);

    if (!query.trim()) {
      this.hideResults();
      return;
    }

    // Debounce search
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }

  /**
   * Perform search
   */
  async performSearch(query) {
    if (!query.trim()) return;

    // Get filters
    const category = this.searchWidget.querySelector('.kb-filter-category').value;
    const difficulty = this.searchWidget.querySelector('.kb-filter-difficulty').value;

    // Search
    const results = knowledgeBaseService.search(query, {
      category: category || null,
      difficulty: difficulty || null,
      limit: 20
    });

    // Sort if needed
    const sortBy = this.searchWidget.querySelector('.kb-filter-sort').value;
    this.sortResults(results, sortBy);

    // Display results
    this.displayResults(results, query);

    // Save to recent searches
    this.addRecentSearch(query);
  }

  /**
   * Sort search results
   */
  sortResults(results, sortBy) {
    switch (sortBy) {
      case 'title':
        results.sort((a, b) => a.article.title.localeCompare(b.article.title));
        break;
      case 'recent':
        results.sort((a, b) => b.article.metadata.lastUpdated - a.article.metadata.lastUpdated);
        break;
      case 'reading-time':
        results.sort((a, b) => a.article.metadata.readingTime - b.article.metadata.readingTime);
        break;
      // 'relevance' is default from search
    }
  }

  /**
   * Display search results
   */
  displayResults(results, query) {
    const resultsContainer = this.searchWidget.querySelector('.kb-search-results');

    if (results.length === 0) {
      resultsContainer.innerHTML = DOMPurify.sanitize(`
        <div class="kb-no-results">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor">
            <circle cx="24" cy="24" r="20" stroke-width="2"/>
            <path d="M24 16v12M24 32v2" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <p>No results found for "${this.escapeHTML(query)}"</p>
          <p class="kb-no-results-hint">Try different keywords or browse by category</p>
        </div>
      `);
      resultsContainer.classList.remove('hidden');
      this.hideSuggestions();
      return;
    }

    resultsContainer.innerHTML = DOMPurify.sanitize(`
      <div class="kb-results-header">
        <span class="kb-results-count">${results.length} result${results.length !== 1 ? 's' : ''}</span>
      </div>
      <ul class="kb-results-list">
        ${results.map(({ article, snippet, score, matches }) => this.renderResultItem(article, snippet, score, matches, query)).join('')}
      </ul>
    `);

    resultsContainer.classList.remove('hidden');
    this.hideSuggestions();

    // Add click handlers
    resultsContainer.querySelectorAll('.kb-result-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.handleResultClick(results[index].article);
      });
    });
  }

  /**
   * Render a single result item
   */
  renderResultItem(article, snippet, score, matches, query) {
    const difficultyColors = {
      beginner: '#00ff88',
      intermediate: '#ffcc00',
      advanced: '#ff6b6b'
    };

    // Highlight query in title and snippet
    const highlightedTitle = this.highlightText(article.title, query);
    const highlightedSnippet = this.highlightText(snippet, query);

    return `
      <li class="kb-result-item" data-article-id="${article.id}">
        <div class="kb-result-header">
          <h4 class="kb-result-title">${highlightedTitle}</h4>
          <div class="kb-result-badges">
            <span class="kb-badge kb-badge-category">${article.category}</span>
            <span
              class="kb-badge kb-badge-difficulty"
              style="color: ${difficultyColors[article.metadata.difficulty]}"
            >
              ${article.metadata.difficulty}
            </span>
          </div>
        </div>

        <p class="kb-result-snippet">${highlightedSnippet}</p>

        <div class="kb-result-footer">
          <span class="kb-result-meta">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1" fill="none"/>
              <path d="M7 3v4l3 2" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
            ${article.metadata.readingTime} min read
          </span>
          ${article.metadata.tags && article.metadata.tags.length > 0 ? `
            <span class="kb-result-tags">
              ${article.metadata.tags.slice(0, 3).map(tag => `<span class="kb-tag">${tag}</span>`).join('')}
            </span>
          ` : ''}
        </div>
      </li>
    `;
  }

  /**
   * Highlight search query in text
   */
  highlightText(text, query) {
    if (!query) return this.escapeHTML(text);

    const escapedText = this.escapeHTML(text);
    const escapedQuery = this.escapeHTML(query);

    // Case-insensitive highlighting
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Handle result click
   */
  handleResultClick(article) {
    this.onResultClick(article);
    this.hideResults();
  }

  /**
   * Show suggestions (recent searches)
   */
  showSuggestions() {
    const input = this.searchWidget.querySelector('.kb-search-input');
    if (input.value.trim()) return;

    const suggestions = this.searchWidget.querySelector('.kb-search-suggestions');
    suggestions.classList.remove('hidden');
  }

  /**
   * Hide suggestions
   */
  hideSuggestions() {
    const suggestions = this.searchWidget.querySelector('.kb-search-suggestions');
    suggestions.classList.add('hidden');
  }

  /**
   * Hide results
   */
  hideResults() {
    const resultsContainer = this.searchWidget.querySelector('.kb-search-results');
    resultsContainer.classList.add('hidden');
  }

  /**
   * Render recent searches
   */
  renderRecentSearches() {
    const list = this.searchWidget.querySelector('.kb-recent-list');

    if (this.recentSearches.length === 0) {
      list.innerHTML = DOMPurify.sanitize('<li class="kb-recent-empty">No recent searches</li>');
      return;
    }

    list.innerHTML = DOMPurify.sanitize(this.recentSearches.map(search => `
      <li class="kb-recent-item">
        <button class="kb-recent-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="7" cy="7" r="2" fill="currentColor"/>
            <path d="M7 2a5 5 0 015 5" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
          ${this.escapeHTML(search)}
        </button>
      </li>
    `).join(''));

    // Add click handlers
    list.querySelectorAll('.kb-recent-search').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const input = this.searchWidget.querySelector('.kb-search-input');
        input.value = this.recentSearches[index];
        this.performSearch(this.recentSearches[index]);
      });
    });
  }

  /**
   * Add to recent searches
   */
  addRecentSearch(query) {
    // Remove if already exists
    const index = this.recentSearches.indexOf(query);
    if (index > -1) {
      this.recentSearches.splice(index, 1);
    }

    // Add to beginning
    this.recentSearches.unshift(query);

    // Limit to 10
    this.recentSearches = this.recentSearches.slice(0, 10);

    this.saveRecentSearches();
    this.renderRecentSearches();
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches() {
    this.recentSearches = [];
    this.saveRecentSearches();
    this.renderRecentSearches();
  }

  /**
   * Save recent searches to localStorage
   */
  saveRecentSearches() {
    localStorage.setItem('kb-recent-searches', JSON.stringify(this.recentSearches));
  }

  /**
   * Load recent searches from localStorage
   */
  loadRecentSearches() {
    const stored = localStorage.getItem('kb-recent-searches');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Focus search input
   */
  focus() {
    const input = this.searchWidget.querySelector('.kb-search-input');
    input.focus();
  }

  /**
   * Clear search
   */
  clear() {
    const input = this.searchWidget.querySelector('.kb-search-input');
    const clearBtn = this.searchWidget.querySelector('.kb-search-clear');

    input.value = '';
    clearBtn.classList.add('hidden');
    this.hideResults();
  }
}

export default KnowledgeSearch;
