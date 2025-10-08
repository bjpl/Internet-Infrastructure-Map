import { marked } from 'marked';
import hljs from 'highlight.js';
import Fuse from 'fuse.js';

/**
 * Knowledge Base Service
 *
 * Loads, indexes, and provides access to the knowledge base markdown files.
 * Includes full-text search, related article retrieval, and markdown parsing.
 */
class KnowledgeBaseService {
  constructor() {
    this.articles = new Map();
    this.searchIndex = null;
    this.categories = new Map();
    this.visualizationMapping = new Map();
    this.initialized = false;

    // Configure marked for syntax highlighting
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {
            console.error('Highlighting error:', err);
          }
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false
    });

    // Knowledge base structure
    this.kbStructure = {
      'concepts': { title: 'Core Concepts', icon: '💡', difficulty: 'beginner' },
      'data': { title: 'Technical Reference', icon: '📊', difficulty: 'intermediate' },
      'frameworks': { title: 'Decision Frameworks', icon: '🔄', difficulty: 'advanced' },
      'internet-architecture': { title: 'Architecture', icon: '🏗️', difficulty: 'intermediate' },
      'performance': { title: 'Performance', icon: '⚡', difficulty: 'advanced' },
      'practical': { title: 'Practical Guides', icon: '🛠️', difficulty: 'beginner' },
      'quick-ref': { title: 'Quick Reference', icon: '📋', difficulty: 'beginner' },
      'security': { title: 'Security', icon: '🔒', difficulty: 'advanced' }
    };

    // Visualization element to KB article mapping
    this.initializeVisualizationMapping();
  }

  /**
   * Initialize the service by loading all KB articles
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing Knowledge Base Service...');

    try {
      await this.loadAllArticles();
      this.buildSearchIndex();
      this.initialized = true;
      console.log(`KB Service initialized: ${this.articles.size} articles loaded`);
    } catch (error) {
      console.error('Failed to initialize KB service:', error);
      throw error;
    }
  }

  /**
   * Load all markdown files from the knowledge base
   */
  async loadAllArticles() {
    const categories = Object.keys(this.kbStructure);

    // Load articles from each category
    for (const category of categories) {
      try {
        const articles = await this.loadCategory(category);
        articles.forEach(article => {
          this.articles.set(article.id, article);

          // Index by category
          if (!this.categories.has(category)) {
            this.categories.set(category, []);
          }
          this.categories.get(category).push(article.id);
        });
      } catch (error) {
        console.warn(`Failed to load category ${category}:`, error);
      }
    }
  }

  /**
   * Load all articles from a specific category
   */
  async loadCategory(category) {
    const articles = [];
    const basePath = `/knowledge-base/${category}`;

    // List of known files per category (in production, use directory listing)
    const categoryFiles = this.getCategoryFiles(category);

    for (const filename of categoryFiles) {
      try {
        const response = await fetch(`${basePath}/${filename}`);
        if (!response.ok) continue;

        const markdown = await response.text();
        const article = this.parseArticle(markdown, category, filename);
        articles.push(article);
      } catch (error) {
        console.warn(`Failed to load ${basePath}/${filename}:`, error);
      }
    }

    return articles;
  }

  /**
   * Get list of markdown files for each category
   */
  getCategoryFiles(category) {
    const files = {
      'concepts': ['cross-reference.md'],
      'data': [
        'cdn-technologies.md',
        'dns-records.md',
        'encryption-algorithms.md',
        'network-layers.md',
        'performance-metrics.md',
        'routing-protocols.md'
      ],
      'frameworks': ['routing-decision-framework.md'],
      'internet-architecture': ['00-index.md', 'core-concepts.md'],
      'performance': ['optimization-strategies.md'],
      'practical': ['troubleshooting-guide.md'],
      'quick-ref': ['http-status.md', 'ports.md', 'protocol-stack.md'],
      'security': ['cryptographic-reference.md']
    };

    return files[category] || [];
  }

  /**
   * Parse a markdown article and extract metadata
   */
  parseArticle(markdown, category, filename) {
    const lines = markdown.split('\n');
    let metadata = {
      title: '',
      description: '',
      tags: [],
      relatedTopics: [],
      visualizations: []
    };

    // Extract frontmatter if present
    if (lines[0] === '---') {
      const endIndex = lines.indexOf('---', 1);
      if (endIndex > 0) {
        const frontmatter = lines.slice(1, endIndex).join('\n');
        metadata = { ...metadata, ...this.parseFrontmatter(frontmatter) };
        markdown = lines.slice(endIndex + 1).join('\n');
      }
    }

    // Extract title from first heading if not in frontmatter
    if (!metadata.title) {
      const titleMatch = markdown.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        metadata.title = titleMatch[1];
      }
    }

    // Extract first paragraph as description if not in frontmatter
    if (!metadata.description) {
      const paragraphMatch = markdown.match(/^(?!#)(.+?)$/m);
      if (paragraphMatch) {
        metadata.description = paragraphMatch[1].substring(0, 200);
      }
    }

    // Generate article ID
    const id = `${category}/${filename.replace('.md', '')}`;

    // Parse markdown to HTML
    const htmlContent = marked.parse(markdown);

    // Extract code blocks for interactive examples
    const codeBlocks = this.extractCodeBlocks(markdown);

    // Calculate reading time (average 200 words per minute)
    const wordCount = markdown.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      id,
      filename,
      category,
      title: metadata.title || filename.replace('.md', ''),
      description: metadata.description || '',
      content: {
        markdown,
        html: htmlContent,
        summary: this.generateSummary(markdown),
        codeBlocks
      },
      metadata: {
        difficulty: this.kbStructure[category]?.difficulty || 'intermediate',
        readingTime,
        lastUpdated: Date.now(),
        tags: metadata.tags,
        relatedTopics: metadata.relatedTopics,
        visualizations: metadata.visualizations,
        wordCount
      }
    };
  }

  /**
   * Parse YAML frontmatter
   */
  parseFrontmatter(yaml) {
    const metadata = {};
    const lines = yaml.split('\n');

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata[key] = value.slice(1, -1).split(',').map(s => s.trim());
        } else {
          metadata[key] = value;
        }
      }
    }

    return metadata;
  }

  /**
   * Extract code blocks from markdown
   */
  extractCodeBlocks(markdown) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }

    return blocks;
  }

  /**
   * Generate a summary from markdown content
   */
  generateSummary(markdown) {
    // Remove code blocks
    let text = markdown.replace(/```[\s\S]*?```/g, '');
    // Remove headings
    text = text.replace(/^#+\s+.+$/gm, '');
    // Get first few sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).join('. ') + '.';
  }

  /**
   * Build full-text search index using Fuse.js
   */
  buildSearchIndex() {
    const articles = Array.from(this.articles.values());

    this.searchIndex = new Fuse(articles, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'description', weight: 2 },
        { name: 'content.markdown', weight: 1 },
        { name: 'metadata.tags', weight: 2 },
        { name: 'category', weight: 1.5 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 3
    });
  }

  /**
   * Search articles with full-text search
   */
  search(query, options = {}) {
    if (!this.searchIndex) {
      console.warn('Search index not initialized');
      return [];
    }

    const {
      category = null,
      difficulty = null,
      limit = 10
    } = options;

    let results = this.searchIndex.search(query);

    // Apply filters
    if (category) {
      results = results.filter(r => r.item.category === category);
    }

    if (difficulty) {
      results = results.filter(r => r.item.metadata.difficulty === difficulty);
    }

    // Limit results
    results = results.slice(0, limit);

    // Add highlighted snippets
    return results.map(result => ({
      article: result.item,
      score: result.score,
      matches: result.matches,
      snippet: this.generateSnippet(result.item, result.matches)
    }));
  }

  /**
   * Generate a snippet with highlighted matches
   */
  generateSnippet(article, matches) {
    if (!matches || matches.length === 0) {
      return article.description;
    }

    const contentMatch = matches.find(m => m.key === 'content.markdown');
    if (!contentMatch) {
      return article.description;
    }

    const { indices } = contentMatch;
    if (!indices || indices.length === 0) {
      return article.description;
    }

    // Get the first match location
    const [start, end] = indices[0];
    const markdown = article.content.markdown;

    // Extract context around match
    const contextStart = Math.max(0, start - 100);
    const contextEnd = Math.min(markdown.length, end + 100);

    let snippet = markdown.substring(contextStart, contextEnd);

    // Clean up snippet
    snippet = snippet.replace(/^[^\s]*/, '...').replace(/[^\s]*$/, '...');

    return snippet;
  }

  /**
   * Get a specific article by ID
   */
  getArticle(id) {
    return this.articles.get(id) || null;
  }

  /**
   * Get all articles in a category
   */
  getArticlesByCategory(category) {
    const articleIds = this.categories.get(category) || [];
    return articleIds.map(id => this.articles.get(id)).filter(Boolean);
  }

  /**
   * Get related articles based on tags and topics
   */
  getRelatedArticles(articleId, limit = 5) {
    const article = this.articles.get(articleId);
    if (!article) return [];

    const { tags, relatedTopics, visualizations } = article.metadata;
    const allArticles = Array.from(this.articles.values());

    // Calculate relevance score for each article
    const scored = allArticles
      .filter(a => a.id !== articleId)
      .map(a => ({
        article: a,
        score: this.calculateRelevance(article, a)
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(s => s.article);
  }

  /**
   * Calculate relevance score between two articles
   */
  calculateRelevance(article1, article2) {
    let score = 0;

    // Same category bonus
    if (article1.category === article2.category) {
      score += 2;
    }

    // Shared tags
    const sharedTags = this.countSharedItems(
      article1.metadata.tags,
      article2.metadata.tags
    );
    score += sharedTags * 3;

    // Shared related topics
    const sharedTopics = this.countSharedItems(
      article1.metadata.relatedTopics,
      article2.metadata.relatedTopics
    );
    score += sharedTopics * 2;

    // Shared visualizations
    const sharedViz = this.countSharedItems(
      article1.metadata.visualizations,
      article2.metadata.visualizations
    );
    score += sharedViz * 5;

    // Similar difficulty
    if (article1.metadata.difficulty === article2.metadata.difficulty) {
      score += 1;
    }

    return score;
  }

  /**
   * Count shared items between two arrays
   */
  countSharedItems(arr1, arr2) {
    if (!arr1 || !arr2) return 0;
    const set1 = new Set(arr1);
    return arr2.filter(item => set1.has(item)).length;
  }

  /**
   * Initialize visualization element to KB article mapping
   */
  initializeVisualizationMapping() {
    // Map visualization element types to relevant KB articles
    this.visualizationMapping.set('cable', [
      'internet-architecture/00-index',
      'internet-architecture/core-concepts',
      'data/performance-metrics'
    ]);

    this.visualizationMapping.set('datacenter', [
      'internet-architecture/00-index',
      'data/cdn-technologies',
      'performance/optimization-strategies'
    ]);

    this.visualizationMapping.set('ixp', [
      'internet-architecture/core-concepts',
      'data/routing-protocols'
    ]);

    this.visualizationMapping.set('bgp-route', [
      'data/routing-protocols',
      'frameworks/routing-decision-framework'
    ]);

    this.visualizationMapping.set('dns', [
      'data/dns-records',
      'internet-architecture/core-concepts'
    ]);
  }

  /**
   * Get KB articles related to a visualization element
   */
  getArticlesForVisualization(elementType, elementData = {}) {
    const articleIds = this.visualizationMapping.get(elementType) || [];
    return articleIds.map(id => this.articles.get(id)).filter(Boolean);
  }

  /**
   * Get tooltip content for a visualization element
   */
  async getTooltipContent(elementType, elementId, elementData = {}) {
    const articles = this.getArticlesForVisualization(elementType, elementData);

    if (articles.length === 0) {
      return {
        title: elementType.charAt(0).toUpperCase() + elementType.slice(1),
        summary: 'Click to learn more about this element.',
        quickFacts: []
      };
    }

    const primaryArticle = articles[0];

    return {
      title: this.getElementTitle(elementType, elementData),
      summary: primaryArticle.content.summary,
      quickFacts: this.extractQuickFacts(primaryArticle, elementType),
      learnMoreArticles: articles.map(a => ({
        id: a.id,
        title: a.title,
        readingTime: a.metadata.readingTime
      }))
    };
  }

  /**
   * Generate title for visualization element
   */
  getElementTitle(elementType, elementData) {
    const titles = {
      'cable': elementData.name || 'Submarine Cable',
      'datacenter': elementData.city ? `${elementData.city} Data Center` : 'Data Center',
      'ixp': elementData.name || 'Internet Exchange Point',
      'bgp-route': 'BGP Route',
      'dns': 'DNS Server'
    };

    return titles[elementType] || elementType;
  }

  /**
   * Extract quick facts from article relevant to element type
   */
  extractQuickFacts(article, elementType) {
    // Simple extraction - can be enhanced with NLP
    const facts = [];
    const lines = article.content.markdown.split('\n');

    // Look for bullet points or numbered lists
    for (const line of lines) {
      if (line.match(/^[\-\*\+]\s+/) || line.match(/^\d+\.\s+/)) {
        const fact = line.replace(/^[\-\*\+\d\.]\s+/, '').trim();
        if (fact.length > 20 && fact.length < 150) {
          facts.push(fact);
        }
      }

      if (facts.length >= 3) break;
    }

    return facts;
  }

  /**
   * Get navigation path between topics
   */
  getNavigationPath(fromArticleId, toArticleId) {
    const fromArticle = this.articles.get(fromArticleId);
    const toArticle = this.articles.get(toArticleId);

    if (!fromArticle || !toArticle) {
      return null;
    }

    // Simple path: related articles form a graph
    // For now, return direct connection or one-hop path
    const related = this.getRelatedArticles(fromArticleId, 20);
    const directConnection = related.find(a => a.id === toArticleId);

    if (directConnection) {
      return {
        steps: [fromArticle, toArticle],
        totalTime: fromArticle.metadata.readingTime + toArticle.metadata.readingTime,
        difficulty: Math.max(
          this.difficultyToNumber(fromArticle.metadata.difficulty),
          this.difficultyToNumber(toArticle.metadata.difficulty)
        )
      };
    }

    // Find one-hop path
    for (const intermediate of related) {
      const intermediateRelated = this.getRelatedArticles(intermediate.id, 20);
      if (intermediateRelated.find(a => a.id === toArticleId)) {
        return {
          steps: [fromArticle, intermediate, toArticle],
          totalTime: fromArticle.metadata.readingTime +
                     intermediate.metadata.readingTime +
                     toArticle.metadata.readingTime,
          difficulty: Math.max(
            this.difficultyToNumber(fromArticle.metadata.difficulty),
            this.difficultyToNumber(intermediate.metadata.difficulty),
            this.difficultyToNumber(toArticle.metadata.difficulty)
          )
        };
      }
    }

    return null;
  }

  /**
   * Convert difficulty level to number for comparison
   */
  difficultyToNumber(difficulty) {
    const map = { beginner: 1, intermediate: 2, advanced: 3 };
    return map[difficulty] || 2;
  }

  /**
   * Get all categories with metadata
   */
  getAllCategories() {
    return Object.entries(this.kbStructure).map(([key, value]) => ({
      id: key,
      ...value,
      articleCount: this.categories.get(key)?.length || 0
    }));
  }
}

// Create singleton instance
const knowledgeBaseService = new KnowledgeBaseService();

export default knowledgeBaseService;
