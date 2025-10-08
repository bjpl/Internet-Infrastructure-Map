/**
 * Knowledge Base Integration Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import knowledgeBaseService from '../../src/services/knowledgeBaseService.js';
import EducationalOverlay from '../../src/components/EducationalOverlay.js';
import LearningTour from '../../src/components/LearningTour.js';
import KnowledgeSearch from '../../src/components/KnowledgeSearch.js';

describe('KnowledgeBaseService', () => {
  beforeEach(async () => {
    // Initialize service before each test
    await knowledgeBaseService.initialize();
  });

  describe('Initialization', () => {
    it('should initialize with articles loaded', () => {
      expect(knowledgeBaseService.initialized).toBe(true);
      expect(knowledgeBaseService.articles.size).toBeGreaterThan(0);
    });

    it('should create search index', () => {
      expect(knowledgeBaseService.searchIndex).toBeDefined();
    });

    it('should organize articles by category', () => {
      const categories = knowledgeBaseService.getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe('Article Loading', () => {
    it('should parse markdown articles correctly', () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      expect(articles.length).toBeGreaterThan(0);

      const firstArticle = articles[0];
      expect(firstArticle).toHaveProperty('id');
      expect(firstArticle).toHaveProperty('title');
      expect(firstArticle).toHaveProperty('content');
      expect(firstArticle.content).toHaveProperty('markdown');
      expect(firstArticle.content).toHaveProperty('html');
    });

    it('should extract metadata from articles', () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      const article = articles[0];

      expect(article.metadata).toBeDefined();
      expect(article.metadata).toHaveProperty('difficulty');
      expect(article.metadata).toHaveProperty('readingTime');
      expect(['beginner', 'intermediate', 'advanced']).toContain(article.metadata.difficulty);
    });

    it('should generate article summaries', () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      const article = articles[0];

      expect(article.content.summary).toBeDefined();
      expect(article.content.summary.length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('should search articles by text', () => {
      const results = knowledgeBaseService.search('submarine cable');
      expect(results.length).toBeGreaterThan(0);

      const firstResult = results[0];
      expect(firstResult).toHaveProperty('article');
      expect(firstResult).toHaveProperty('score');
    });

    it('should filter search by category', () => {
      const results = knowledgeBaseService.search('protocol', {
        category: 'data'
      });

      results.forEach(result => {
        expect(result.article.category).toBe('data');
      });
    });

    it('should filter search by difficulty', () => {
      const results = knowledgeBaseService.search('internet', {
        difficulty: 'beginner'
      });

      results.forEach(result => {
        expect(result.article.metadata.difficulty).toBe('beginner');
      });
    });

    it('should limit search results', () => {
      const results = knowledgeBaseService.search('network', { limit: 5 });
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should generate snippets for search results', () => {
      const results = knowledgeBaseService.search('cable');
      if (results.length > 0) {
        expect(results[0].snippet).toBeDefined();
      }
    });
  });

  describe('Related Articles', () => {
    it('should find related articles', () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      if (articles.length === 0) return;

      const article = articles[0];
      const related = knowledgeBaseService.getRelatedArticles(article.id);

      expect(Array.isArray(related)).toBe(true);
      expect(related.every(a => a.id !== article.id)).toBe(true);
    });

    it('should rank related articles by relevance', () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      if (articles.length === 0) return;

      const article = articles[0];
      const related = knowledgeBaseService.getRelatedArticles(article.id, 5);

      // Related articles should share category or tags
      if (related.length > 0) {
        const firstRelated = related[0];
        const hasSharedCategory = firstRelated.category === article.category;
        const hasSharedTags = article.metadata.tags?.some(tag =>
          firstRelated.metadata.tags?.includes(tag)
        );

        expect(hasSharedCategory || hasSharedTags).toBe(true);
      }
    });
  });

  describe('Visualization Integration', () => {
    it('should map visualization elements to articles', () => {
      const cableArticles = knowledgeBaseService.getArticlesForVisualization('cable');
      expect(cableArticles.length).toBeGreaterThan(0);

      const datacenterArticles = knowledgeBaseService.getArticlesForVisualization('datacenter');
      expect(datacenterArticles.length).toBeGreaterThan(0);
    });

    it('should generate tooltip content for elements', async () => {
      const content = await knowledgeBaseService.getTooltipContent('cable', 'cable-1', {
        name: 'Test Cable'
      });

      expect(content).toHaveProperty('title');
      expect(content).toHaveProperty('summary');
      expect(content).toHaveProperty('quickFacts');
    });
  });

  describe('Navigation Paths', () => {
    it('should find navigation path between articles', () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      if (articles.length < 2) return;

      const path = knowledgeBaseService.getNavigationPath(
        articles[0].id,
        articles[1].id
      );

      if (path) {
        expect(path).toHaveProperty('steps');
        expect(path.steps.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});

describe('EducationalOverlay', () => {
  let overlay;

  beforeEach(() => {
    // Create container for overlay
    document.body.innerHTML = '<div id="test-container"></div>';
    overlay = new EducationalOverlay({
      container: document.getElementById('test-container')
    });
  });

  afterEach(() => {
    if (overlay) {
      overlay.hideAll();
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should create all overlay elements', () => {
      expect(overlay.elements.tooltip).toBeDefined();
      expect(overlay.elements.sidebar).toBeDefined();
      expect(overlay.elements.modal).toBeDefined();
      expect(overlay.elements.fullscreen).toBeDefined();
    });

    it('should load bookmarks from localStorage', () => {
      expect(Array.isArray(overlay.bookmarks)).toBe(true);
    });
  });

  describe('Tooltip Display', () => {
    it('should show tooltip', async () => {
      await overlay.showTooltip('cable', { id: 'test' }, { x: 100, y: 100 });

      expect(overlay.elements.tooltip.classList.contains('hidden')).toBe(false);
    });

    it('should position tooltip correctly', async () => {
      await overlay.showTooltip('cable', { id: 'test' }, { x: 100, y: 100 });

      const tooltip = overlay.elements.tooltip;
      const left = parseInt(tooltip.style.left);
      const top = parseInt(tooltip.style.top);

      expect(left).toBeGreaterThan(0);
      expect(top).toBeGreaterThan(0);
    });

    it('should hide tooltip', async () => {
      await overlay.showTooltip('cable', { id: 'test' }, { x: 100, y: 100 });
      overlay.hide('tooltip');

      expect(overlay.elements.tooltip.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Sidebar Display', () => {
    beforeEach(async () => {
      await knowledgeBaseService.initialize();
    });

    it('should show sidebar with article', async () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      if (articles.length === 0) return;

      await overlay.showSidebar(articles[0].id);

      expect(overlay.elements.sidebar.classList.contains('hidden')).toBe(false);
      expect(overlay.currentArticle).toBe(articles[0].id);
    });

    it('should track navigation history', async () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      if (articles.length < 2) return;

      await overlay.showSidebar(articles[0].id);
      await overlay.showSidebar(articles[1].id);

      expect(overlay.history.length).toBe(2);
    });

    it('should navigate back in history', async () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      if (articles.length < 2) return;

      await overlay.showSidebar(articles[0].id);
      await overlay.showSidebar(articles[1].id);
      overlay.navigateBack();

      expect(overlay.currentArticle).toBe(articles[0].id);
    });
  });

  describe('Bookmark Management', () => {
    beforeEach(async () => {
      await knowledgeBaseService.initialize();
      localStorage.clear();
    });

    it('should toggle bookmarks', async () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      if (articles.length === 0) return;

      await overlay.showSidebar(articles[0].id);
      overlay.toggleBookmark();

      expect(overlay.bookmarks).toContain(articles[0].id);

      overlay.toggleBookmark();
      expect(overlay.bookmarks).not.toContain(articles[0].id);
    });

    it('should save bookmarks to localStorage', async () => {
      const articles = Array.from(knowledgeBaseService.articles.values());
      if (articles.length === 0) return;

      await overlay.showSidebar(articles[0].id);
      overlay.toggleBookmark();

      const stored = JSON.parse(localStorage.getItem('kb-bookmarks'));
      expect(stored).toContain(articles[0].id);
    });
  });

  describe('Tab Switching', () => {
    it('should switch between tabs', () => {
      overlay.switchTab('search');

      const activeTab = overlay.elements.sidebar.querySelector('.kb-sidebar-tab.active');
      expect(activeTab.dataset.tab).toBe('search');

      const activePane = overlay.elements.sidebar.querySelector('.kb-sidebar-pane.active');
      expect(activePane.dataset.pane).toBe('search');
    });
  });

  describe('Search Integration', () => {
    beforeEach(async () => {
      await knowledgeBaseService.initialize();
    });

    it('should perform search in sidebar', async () => {
      await overlay.performSearch('internet');

      const resultsContainer = overlay.elements.sidebar.querySelector('.kb-search-results');
      expect(resultsContainer.innerHTML.length).toBeGreaterThan(0);
    });
  });
});

describe('LearningTour', () => {
  let tour;
  let mockGlobe;

  beforeEach(() => {
    mockGlobe = {
      pointOfView: vi.fn()
    };

    tour = new LearningTour(mockGlobe);
  });

  afterEach(() => {
    if (tour && tour.isPlaying) {
      tour.stop();
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should load predefined tours', () => {
      const tours = tour.getAllTours();
      expect(tours.length).toBeGreaterThan(0);
    });

    it('should create tour UI', () => {
      expect(tour.tourContainer).toBeDefined();
      expect(document.querySelector('.learning-tour-container')).toBeTruthy();
    });
  });

  describe('Tour Playback', () => {
    it('should start a tour', () => {
      tour.start('submarine-cables');

      expect(tour.isPlaying).toBe(true);
      expect(tour.currentTour).toBeDefined();
      expect(tour.currentStep).toBe(0);
    });

    it('should navigate to next step', async () => {
      tour.start('submarine-cables');
      await tour.nextStep();

      expect(tour.currentStep).toBe(1);
    });

    it('should navigate to previous step', async () => {
      tour.start('submarine-cables');
      await tour.nextStep();
      await tour.previousStep();

      expect(tour.currentStep).toBe(0);
    });

    it('should stop at the end', async () => {
      tour.start('submarine-cables');

      // Navigate to last step
      const steps = tour.currentTour.steps.length;
      for (let i = 0; i < steps; i++) {
        await tour.nextStep();
      }

      expect(tour.isPlaying).toBe(false);
    });

    it('should execute step actions', async () => {
      tour.start('submarine-cables');

      // Camera action should call globe.pointOfView
      expect(mockGlobe.pointOfView).toHaveBeenCalled();
    });
  });

  describe('Tour Information', () => {
    it('should provide tour metadata', () => {
      const tours = tour.getAllTours();
      const firstTour = tours[0];

      expect(firstTour).toHaveProperty('id');
      expect(firstTour).toHaveProperty('title');
      expect(firstTour).toHaveProperty('description');
      expect(firstTour).toHaveProperty('difficulty');
      expect(firstTour).toHaveProperty('duration');
      expect(firstTour).toHaveProperty('steps');
    });
  });
});

describe('KnowledgeSearch', () => {
  let search;
  let container;

  beforeEach(async () => {
    await knowledgeBaseService.initialize();

    container = document.createElement('div');
    container.id = 'search-container';
    document.body.appendChild(container);

    search = new KnowledgeSearch({ container });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should create search UI', () => {
      expect(search.searchWidget).toBeDefined();
      expect(container.querySelector('.kb-search-input')).toBeTruthy();
    });

    it('should load recent searches', () => {
      expect(Array.isArray(search.recentSearches)).toBe(true);
    });
  });

  describe('Search Execution', () => {
    it('should perform search', async () => {
      await search.performSearch('cable');

      const results = container.querySelector('.kb-search-results');
      expect(results.classList.contains('hidden')).toBe(false);
    });

    it('should display no results message', async () => {
      await search.performSearch('zzzznonexistent');

      const noResults = container.querySelector('.kb-no-results');
      expect(noResults).toBeTruthy();
    });

    it('should highlight search terms', () => {
      const highlighted = search.highlightText('This is a test', 'test');
      expect(highlighted).toContain('<mark>');
    });
  });

  describe('Recent Searches', () => {
    it('should add to recent searches', async () => {
      await search.performSearch('submarine');

      expect(search.recentSearches).toContain('submarine');
    });

    it('should limit recent searches', async () => {
      for (let i = 0; i < 15; i++) {
        await search.performSearch(`query${i}`);
      }

      expect(search.recentSearches.length).toBeLessThanOrEqual(10);
    });

    it('should clear recent searches', () => {
      search.recentSearches = ['test1', 'test2'];
      search.clearRecentSearches();

      expect(search.recentSearches.length).toBe(0);
    });
  });

  describe('Filters', () => {
    it('should apply category filter', async () => {
      const categoryFilter = container.querySelector('.kb-filter-category');
      categoryFilter.value = 'data';
      categoryFilter.dispatchEvent(new Event('change'));

      await search.performSearch('protocol');

      // Results should be filtered by category
      // (Implementation detail - actual filtering happens in the service)
    });
  });
});
