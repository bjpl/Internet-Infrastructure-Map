/**
 * main-integrated.js - Complete Integrated Internet Infrastructure Map
 *
 * This is the fully integrated version combining:
 * - DataOrchestrator for intelligent data fetching with fallbacks
 * - Knowledge Base integration with educational overlays
 * - All existing visualization features
 * - Progressive loading with real cache checking
 * - Auto-refresh scheduling
 * - Interactive learning tours
 *
 * @version 2.0.0 (Integrated)
 * @author Internet Infrastructure Map Team
 */

import * as THREE from 'three';
import * as d3 from 'd3';
import gsap from 'gsap';

// === ORCHESTRATION & DATA LAYER ===
// DataOrchestrator replaces the old DataManager with intelligent fallback chains
import { DataOrchestrator } from './services/dataOrchestrator.js';
import knowledgeBaseService from './services/knowledgeBaseService.js';
import KnowledgeBaseIntegration from './integrations/knowledgeBaseIntegration.js';

// === COMPONENT LAYER ===
// All visualization and UI components
import { GlobeRenderer } from './components/GlobeRenderer.js';
import { FilterControls } from './components/FilterControls.js';
import { DataTableManager } from './components/DataTableManager.js';
import EducationalOverlay from './components/EducationalOverlay.js';
import LearningTour from './components/LearningTour.js';
import KnowledgeSearch from './components/KnowledgeSearch.js';

/**
 * Integrated Infrastructure Map Application
 *
 * Architecture:
 * 1. DataOrchestrator - Manages all data fetching with intelligent fallbacks
 * 2. Knowledge Base - Provides educational content and context
 * 3. Visualization - Globe rendering with cables, datacenters, attacks
 * 4. UI Components - Filters, tables, overlays, tours
 */
class IntegratedInfrastructureMap {
  constructor() {
    this.container = document.getElementById('globe-container');

    // === DATA & ORCHESTRATION ===
    // DataOrchestrator handles all data with automatic fallbacks and caching
    this.dataOrchestrator = new DataOrchestrator({
      enableAutoRefresh: true,
      refreshInterval: 300000, // 5 minutes
      enableCache: true
    });

    // === COMPONENT INSTANCES ===
    this.globeRenderer = null;
    this.filterControls = null;
    this.tableManager = null;
    this.educationalOverlay = null;
    this.learningTour = null;
    this.knowledgeSearch = null;
    this.kbIntegration = null;

    // === DATA STORAGE ===
    // Store both raw and filtered data with metadata
    this.data = {
      // Raw data with metadata from orchestrator
      cables: {
        data: [],
        metadata: null
      },
      ixps: {
        data: [],
        metadata: null
      },
      datacenters: {
        data: [],
        metadata: null
      },

      // Filtered data for visualization
      filteredCables: [],
      filteredDatacenters: [],

      // Legacy BGP routes (simulated)
      bgpRoutes: []
    };

    // === APPLICATION STATE ===
    this.state = {
      loaded: false,
      error: null,

      // Layer visibility toggles
      layers: {
        cables: true,
        datacenters: true,
        bgp: false,
        attacks: true
      },

      // Progressive loading configuration
      progressive: {
        initialBatch: 100,
        batchSize: 50,
        delay: 500
      },

      // Data freshness tracking
      lastRefresh: {
        cables: null,
        ixps: null,
        datacenters: null
      }
    };

    // === STATISTICS ===
    this.stats = {
      cables: 0,
      datacenters: 0,
      bgpRoutes: 0,
      attacks: 0,
      fps: 60,
      objects: 0,
      particles: 0,

      // Data quality metrics
      cacheHitRate: 0,
      dataConfidence: 0
    };

    // === PERFORMANCE TRACKING ===
    this.lastTime = 0;
    this.frameCount = 0;
    this.animationId = null;

    // === VISUAL EFFECTS ===
    this.attackRipples = [];
    this.attackInterval = null;

    // Start initialization
    this.init().catch(this.handleInitError.bind(this));
  }

  /**
   * Initialize the complete application
   *
   * Initialization Flow:
   * 1. Initialize globe renderer and scene
   * 2. Initialize knowledge base service
   * 3. Initialize all UI components
   * 4. Load data through orchestrator
   * 5. Start animation loop
   */
  async init() {
    try {
      this.updateLoadingStatus('Initializing 3D globe...', 5);

      // === STEP 1: GLOBE RENDERER ===
      // Initialize the 3D globe with scene, camera, lights, stars
      this.globeRenderer = new GlobeRenderer(this.container, {
        initialView: { lat: 20, lng: -40, altitude: 2.8 },
        autoRotate: true,
        autoRotateSpeed: 0.5,
        starCount: 5000
      });

      await this.globeRenderer.init();
      console.log('[IntegratedMap] Globe renderer initialized');

      // === STEP 2: KNOWLEDGE BASE ===
      // Initialize knowledge base service (loads all articles)
      this.updateLoadingStatus('Loading knowledge base...', 15);
      await knowledgeBaseService.initialize();
      console.log('[IntegratedMap] Knowledge base initialized');

      // === STEP 3: UI COMPONENTS ===
      this.updateLoadingStatus('Initializing UI components...', 25);

      // Filter controls - handles all cable/datacenter filtering
      this.filterControls = new FilterControls(this.onFilterChange.bind(this));
      this.filterControls.init();

      // Table manager - manages data tables and CSV export
      this.tableManager = new DataTableManager(
        this.getFilteredData.bind(this),
        this.calculateDistance.bind(this)
      );
      this.tableManager.init();

      // Educational overlay - shows KB articles in various modes
      this.educationalOverlay = new EducationalOverlay();

      // Learning tour - guided tours through the visualization
      this.learningTour = new LearningTour(
        this.globeRenderer.getGlobe(),
        this.educationalOverlay
      );

      // Knowledge base integration - connects KB with visualization
      this.kbIntegration = new KnowledgeBaseIntegration(
        this.globeRenderer.getGlobe()
      );
      await this.kbIntegration.initialize();

      console.log('[IntegratedMap] All components initialized');

      // === STEP 4: EVENT LISTENERS ===
      this.setupEventListeners();
      this.setupKBEventDispatchers();

      // === STEP 5: DATA LOADING ===
      // Load all infrastructure data through orchestrator
      await this.loadData();

      // === STEP 6: START ANIMATION ===
      this.animate();

      // === STEP 7: COMPLETE ===
      this.hideLoadingScreen();
      this.state.loaded = true;

      // Show welcome notification with data quality info
      this.showDataQualityNotification();

      console.log('[IntegratedMap] Initialization complete');

    } catch (error) {
      this.handleInitError(error);
    }
  }

  /**
   * Load all infrastructure data with intelligent fallbacks
   *
   * Data Loading Flow:
   * 1. Submarine cables (TeleGeography API → Cache → Fallback)
   * 2. Data centers (PeeringDB API → Cache → Fallback)
   * 3. IXPs (PeeringDB API → Cache → Fallback)
   * 4. BGP routes (simulated)
   * 5. DDoS monitoring (simulated)
   */
  async loadData() {
    try {
      const totalSteps = 4;
      let currentStep = 0;

      // === LOAD SUBMARINE CABLES ===
      // DataOrchestrator automatically tries: Live API → Cache → Fallback
      this.updateLoadingStatus('Loading submarine cable data...', 30 + (currentStep / totalSteps) * 40);

      const cablesResult = await this.dataOrchestrator.getCables();
      this.data.cables = cablesResult;
      console.log(`[IntegratedMap] Loaded ${cablesResult.data.length} cables from ${cablesResult.metadata.source} (confidence: ${cablesResult.metadata.confidence})`);

      currentStep++;

      // Apply initial filters and render progressively
      this.onFilterChange(this.filterControls.getFilters());

      // === LOAD DATA CENTERS ===
      this.updateLoadingStatus('Mapping global data centers...', 30 + (currentStep / totalSteps) * 40);

      const datacentersResult = await this.dataOrchestrator.getDataCenters();
      this.data.datacenters = datacentersResult;
      console.log(`[IntegratedMap] Loaded ${datacentersResult.data.length} data centers from ${datacentersResult.metadata.source}`);

      this.visualizeDataCenters(datacentersResult.data);
      this.stats.datacenters = datacentersResult.data.length;

      currentStep++;

      // === LOAD IXPs ===
      this.updateLoadingStatus('Loading Internet Exchange Points...', 30 + (currentStep / totalSteps) * 40);

      const ixpsResult = await this.dataOrchestrator.getIXPs();
      this.data.ixps = ixpsResult;
      console.log(`[IntegratedMap] Loaded ${ixpsResult.data.length} IXPs from ${ixpsResult.metadata.source}`);

      currentStep++;

      // === INITIALIZE DDOS MONITORING ===
      this.updateLoadingStatus('Connecting to threat intelligence feeds...', 30 + (currentStep / totalSteps) * 40);
      this.initializeDDoSMonitoring();

      currentStep++;

      // === UPDATE STATS ===
      this.updateStats();

      // Track refresh times
      this.state.lastRefresh = {
        cables: Date.now(),
        ixps: Date.now(),
        datacenters: Date.now()
      };

      // Calculate average data confidence
      const confidences = [
        cablesResult.metadata.confidence,
        datacentersResult.metadata.confidence,
        ixpsResult.metadata.confidence
      ];
      this.stats.dataConfidence = (confidences.reduce((a, b) => a + b, 0) / confidences.length * 100).toFixed(1);

      // Get cache statistics from orchestrator
      const orchStats = this.dataOrchestrator.getStatistics();
      this.stats.cacheHitRate = parseFloat(orchStats.cacheHitRate);

    } catch (error) {
      console.error('[IntegratedMap] Error loading data:', error);
      this.showNotification('Some data sources are unavailable. Using cached data.', 'warning');
    }
  }

  /**
   * Filter change callback - called when any filter is changed
   *
   * @param {Object} filters - Current filter state
   */
  onFilterChange(filters) {
    // Apply filters to cable data
    const filtered = this.filterControls.applyFilters(this.data.cables.data);
    this.data.filteredCables = filtered;

    // Render cables progressively to avoid blocking UI
    this.renderCablesProgressive(filtered);

    // Update statistics
    this.stats.cables = filtered.length;
    this.updateStats();
  }

  /**
   * Render cables with progressive loading
   *
   * Progressive Loading Strategy:
   * 1. Render initial batch (100 cables) immediately
   * 2. Add particle effects to major cables
   * 3. Load remaining cables in batches of 50 with 500ms delay
   *
   * This prevents UI freezing on large datasets
   *
   * @param {Array} cables - Filtered cables to render
   */
  renderCablesProgressive(cables) {
    const globe = this.globeRenderer.getGlobe();

    // === INITIAL BATCH ===
    // Render first 100 cables immediately for instant feedback
    const initialBatch = cables.slice(0, this.state.progressive.initialBatch);
    const cableArcs = this.formatCableArcs(initialBatch);

    // Configure globe.gl arc rendering
    globe
      .arcsData(cableArcs)
      .arcStartLat('startLat')
      .arcStartLng('startLng')
      .arcEndLat('endLat')
      .arcEndLng('endLng')
      .arcColor('color')
      .arcStroke('stroke')
      .arcAltitude('altitude')
      .arcDashLength(0)
      .arcDashGap(0)
      .arcCurveResolution(64)
      .arcsTransitionDuration(1000)
      .arcLabel(arc => this.createCableTooltip(arc));

    // === VISUAL EFFECTS ===
    // Add particle glow to high-capacity cables
    this.addCableGlowEffects(cableArcs.filter(c => c.importance > 0.7));

    // === REMAINING BATCHES ===
    // Load rest in background batches
    if (cables.length > this.state.progressive.initialBatch) {
      setTimeout(() => {
        this.loadRemainingCables(cables.slice(this.state.progressive.initialBatch), cableArcs);
      }, this.state.progressive.delay);
    }
  }

  /**
   * Load remaining cables in batches
   *
   * @param {Array} remainingCables - Cables not yet loaded
   * @param {Array} currentArcs - Already rendered arcs (modified in place)
   */
  loadRemainingCables(remainingCables, currentArcs) {
    const batchSize = this.state.progressive.batchSize;
    let index = 0;

    const loadBatch = () => {
      const batch = remainingCables.slice(index, index + batchSize);

      if (batch.length > 0) {
        const batchArcs = this.formatCableArcs(batch);
        const allArcs = [...currentArcs, ...batchArcs];

        // Update globe with new arcs
        this.globeRenderer.getGlobe().arcsData(allArcs);

        // Update reference
        currentArcs.push(...batchArcs);

        index += batchSize;
        setTimeout(loadBatch, this.state.progressive.delay);
      }
    };

    loadBatch();
  }

  /**
   * Format cable data for globe.gl arc rendering
   *
   * This converts our cable data structure to the format expected by globe.gl
   * Also calculates visual properties like color, stroke width, altitude
   *
   * @param {Array} cables - Array of cable objects
   * @returns {Array} Arc objects for globe.gl
   */
  formatCableArcs(cables) {
    return cables.map(cable => {
      // Calculate importance score (0-1) based on capacity, distance, status
      const importance = this.calculateImportance(cable);

      // Calculate great circle distance
      const distance = this.calculateDistance(
        cable.landing_point_1.latitude,
        cable.landing_point_1.longitude,
        cable.landing_point_2.latitude,
        cable.landing_point_2.longitude
      );

      // === ALTITUDE CALCULATION ===
      // Distance-based altitude prevents long cables from being cut off by globe
      // Longer cables need higher altitude to arc over the globe properly
      let altitude;
      if (distance > 15000) {
        altitude = 0.5 + ((distance - 15000) / 5000) * 0.2;
      } else if (distance > 10000) {
        altitude = 0.35;
      } else if (distance > 5000) {
        altitude = 0.25;
      } else if (distance > 2000) {
        altitude = 0.15;
      } else if (distance > 1000) {
        altitude = 0.08;
      } else {
        altitude = 0.04;
      }

      return {
        // Start and end coordinates
        startLat: cable.landing_point_1.latitude,
        startLng: cable.landing_point_1.longitude,
        endLat: cable.landing_point_2.latitude,
        endLng: cable.landing_point_2.longitude,

        // Location names for tooltips
        startLocation: cable.landing_point_1.location,
        endLocation: cable.landing_point_2.location,

        // Visual properties
        color: this.getCableColor(cable, 0.85),
        stroke: Math.max(0.8, importance * 2.5),
        altitude: altitude,

        // Metadata for tooltips and interactions
        label: cable.name,
        capacity: cable.capacity_tbps,
        owner: cable.owner,
        status: cable.status,
        accuracy: cable.data_accuracy || 'estimated',
        importance: importance
      };
    }).filter(arc => arc !== null);
  }

  /**
   * Calculate cable importance score
   *
   * Importance factors:
   * - Capacity (40%): Higher capacity = more important
   * - Distance (30%): Longer cables = more important
   * - Status (30%): Active cables = more important
   *
   * @param {Object} cable - Cable object
   * @returns {number} Importance score 0-1
   */
  calculateImportance(cable) {
    let importance = 0;

    // === CAPACITY FACTOR (0-0.4) ===
    if (cable.capacity_tbps > 200) importance += 0.4;
    else if (cable.capacity_tbps > 100) importance += 0.3;
    else if (cable.capacity_tbps > 50) importance += 0.2;
    else importance += 0.1;

    // === DISTANCE FACTOR (0-0.3) ===
    const distance = this.calculateDistance(
      cable.landing_point_1.latitude,
      cable.landing_point_1.longitude,
      cable.landing_point_2.latitude,
      cable.landing_point_2.longitude
    );

    if (distance > 8000) importance += 0.3;
    else if (distance > 5000) importance += 0.2;
    else if (distance > 2000) importance += 0.1;

    // === STATUS FACTOR (0-0.3) ===
    if (cable.status === 'active') importance += 0.3;
    else if (cable.status === 'planned') importance += 0.1;

    return Math.min(importance, 1);
  }

  /**
   * Get cable color based on capacity tier
   *
   * Color scheme:
   * - High (>150 Tbps): Cyan (#00ffcc)
   * - Medium (50-150 Tbps): Gold (#ffcc00)
   * - Low (<50 Tbps): Magenta (#ff00ff)
   *
   * @param {Object} cable - Cable object
   * @param {number} opacity - Base opacity (0-1)
   * @returns {string} RGBA color string
   */
  getCableColor(cable, opacity) {
    const capacity = cable.capacity_tbps || 50;
    const minOpacity = 0.6;
    const actualOpacity = Math.max(minOpacity, opacity);

    if (capacity > 150) {
      return `rgba(0, 255, 204, ${actualOpacity})`; // High - cyan
    } else if (capacity >= 50 && capacity <= 150) {
      return `rgba(255, 204, 0, ${actualOpacity})`; // Medium - gold
    } else {
      return `rgba(255, 0, 255, ${actualOpacity})`; // Low - magenta
    }
  }

  /**
   * Create tooltip content for cable hover
   *
   * Integrates with knowledge base to provide educational context
   *
   * @param {Object} arc - Arc data object
   * @returns {string} HTML tooltip content
   */
  createCableTooltip(arc) {
    return `
      <div class="cable-tooltip" data-cable-id="${arc.label}">
        <div class="tooltip-header">
          <strong>${arc.label || 'Unknown Cable'}</strong>
          <span class="tooltip-badge tooltip-${arc.accuracy}">${arc.accuracy === 'live' ? 'Live Data' : 'Estimated'}</span>
        </div>
        <div class="tooltip-body">
          <div class="tooltip-row">
            <span class="tooltip-label">Route:</span>
            <span>${arc.startLocation || 'Unknown'} → ${arc.endLocation || 'Unknown'}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Capacity:</span>
            <span>${arc.capacity ? arc.capacity.toFixed(1) + ' Tbps' : 'N/A'}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Distance:</span>
            <span>${Math.round(this.calculateDistance(arc.startLat, arc.startLng, arc.endLat, arc.endLng))} km</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Status:</span>
            <span class="status-${arc.status}">${(arc.status || 'Active').toUpperCase()}</span>
          </div>
        </div>
        <div class="tooltip-footer">
          <button class="tooltip-learn-more" onclick="window.app.showCableKB('${arc.label}')">
            📚 Learn about submarine cables
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Add particle glow effects to major cables
   *
   * Creates animated particle trails along high-capacity cables
   *
   * @param {Array} majorCables - Array of important cable arcs
   */
  addCableGlowEffects(majorCables) {
    const scene = this.globeRenderer.getScene();
    const globe = this.globeRenderer.getGlobe();

    majorCables.forEach(cable => {
      const particleCount = 20;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      // Parse color from RGBA string
      const color = new THREE.Color(cable.color);

      // Create particles along arc path
      for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount;

        // Interpolate position along arc
        const coords = this.interpolateArc(
          cable.startLat,
          cable.startLng,
          cable.endLat,
          cable.endLng,
          t,
          cable.altitude,
          globe
        );

        if (coords) {
          positions[i * 3] = coords.x;
          positions[i * 3 + 1] = coords.y;
          positions[i * 3 + 2] = coords.z;

          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });

      const particles = new THREE.Points(geometry, material);
      particles.name = `cable-glow-${cable.label}`;
      scene.add(particles);

      // Animate pulsing glow
      gsap.to(material, {
        opacity: 0.2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    });

    this.stats.particles += majorCables.length * 20;
  }

  /**
   * Interpolate point along arc path
   *
   * @param {number} startLat - Start latitude
   * @param {number} startLng - Start longitude
   * @param {number} endLat - End latitude
   * @param {number} endLng - End longitude
   * @param {number} t - Interpolation factor (0-1)
   * @param {number} altitude - Arc altitude
   * @param {Object} globe - Globe instance
   * @returns {Object|null} {x, y, z} coordinates
   */
  interpolateArc(startLat, startLng, endLat, endLng, t, altitude, globe) {
    const startCoords = globe.getCoords(startLat, startLng, 0);
    const endCoords = globe.getCoords(endLat, endLng, 0);

    if (!startCoords || !endCoords) {
      return null;
    }

    // Calculate arc height (parabolic curve)
    const arcHeight = 100 * altitude * Math.sin(t * Math.PI);

    // Linear interpolation with arc
    const x = startCoords.x + (endCoords.x - startCoords.x) * t;
    const y = startCoords.y + (endCoords.y - startCoords.y) * t + arcHeight;
    const z = startCoords.z + (endCoords.z - startCoords.z) * t;

    return { x, y, z };
  }

  /**
   * Visualize data centers on the globe
   *
   * @param {Array} datacenters - Array of datacenter objects
   */
  visualizeDataCenters(datacenters) {
    const globe = this.globeRenderer.getGlobe();

    // Apply tier filtering
    let filtered = datacenters;
    const tierFilter = this.filterControls.getFilters().datacenterTier;

    if (tierFilter !== 'all') {
      const tierNum = parseInt(tierFilter.replace('tier', ''));
      filtered = datacenters.filter(dc => dc.tier === tierNum);
    }

    // Limit for performance (prevent rendering thousands of points)
    const tier1 = filtered.filter(dc => dc.tier === 1).slice(0, 50);
    const tier2 = filtered.filter(dc => dc.tier === 2).slice(0, 30);
    const tier3 = filtered.filter(dc => dc.tier === 3).slice(0, 20);

    const allDCs = [...tier1, ...tier2, ...tier3];

    // Format datacenter points for globe.gl
    const points = allDCs.map(dc => ({
      lat: dc.latitude,
      lng: dc.longitude,
      size: dc.tier === 1 ? 0.5 : dc.tier === 2 ? 0.35 : 0.25,
      color: dc.tier === 1 ? 'rgba(0, 255, 204, 0.9)' :
             dc.tier === 2 ? 'rgba(255, 204, 0, 0.8)' :
             'rgba(255, 0, 255, 0.7)',
      name: dc.name,
      city: dc.city,
      country: dc.country,
      tier: dc.tier,
      provider: dc.provider,
      accuracy: dc.data_accuracy
    }));

    // Render points on globe
    globe
      .pointsData(points)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor('color')
      .pointAltitude(0.01)
      .pointRadius('size')
      .pointLabel(d => this.createDataCenterTooltip(d));

    this.data.filteredDatacenters = points;
  }

  /**
   * Create tooltip for data center hover
   *
   * @param {Object} dc - Datacenter point data
   * @returns {string} HTML tooltip content
   */
  createDataCenterTooltip(dc) {
    return `
      <div class="datacenter-tooltip" data-dc-id="${dc.name}">
        <div class="tooltip-header">
          <strong>${dc.city}, ${dc.country}</strong>
          <span class="tooltip-badge tier-${dc.tier}">Tier ${dc.tier}</span>
        </div>
        <div class="tooltip-body">
          <div class="tooltip-row">
            <span class="tooltip-label">Provider:</span>
            <span>${dc.provider || 'N/A'}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Facility:</span>
            <span>${dc.name || 'Unknown'}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Location:</span>
            <span>${dc.lat.toFixed(2)}°, ${dc.lng.toFixed(2)}°</span>
          </div>
        </div>
        <div class="tooltip-footer">
          <button class="tooltip-learn-more" onclick="window.app.showDataCenterKB('${dc.name}')">
            📚 Learn about data centers
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Initialize DDoS attack monitoring
   *
   * Creates simulated DDoS attacks for demonstration
   */
  initializeDDoSMonitoring() {
    this.attackInterval = setInterval(() => {
      if (Math.random() > 0.7 && this.state.layers.attacks) {
        const attack = this.generateDDoSAttack();
        this.visualizeDDoSAttack(attack);
        this.stats.attacks++;
        this.updateStats();
      }
    }, 5000);
  }

  /**
   * Generate simulated DDoS attack
   *
   * @returns {Object} Attack data
   */
  generateDDoSAttack() {
    // Random location
    const lat = (Math.random() - 0.5) * 160;
    const lng = (Math.random() - 0.5) * 360;

    return {
      target: { lat, lng },
      magnitude: 5 + Math.random() * 15,
      type: ['SYN Flood', 'UDP Flood', 'HTTP Flood', 'DNS Amplification'][Math.floor(Math.random() * 4)]
    };
  }

  /**
   * Visualize DDoS attack with multi-layer ripple
   *
   * @param {Object} attack - Attack data
   */
  visualizeDDoSAttack(attack) {
    const scene = this.globeRenderer.getScene();
    const globe = this.globeRenderer.getGlobe();
    const coords = globe.getCoords(attack.target.lat, attack.target.lng, 0.2);

    if (!coords) return;

    const rippleGroup = new THREE.Group();
    rippleGroup.name = `attack-${Date.now()}`;

    // Create 3 concentric ripples
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.RingGeometry(0.1 + i * 0.5, 3 + i * 2, 64);
      const material = new THREE.MeshBasicMaterial({
        color: i === 0 ? '#ff0000' : i === 1 ? '#ff6600' : '#ffcc00',
        transparent: true,
        opacity: 0.8 - i * 0.2,
        side: THREE.DoubleSide
      });

      const ripple = new THREE.Mesh(geometry, material);
      ripple.position.set(coords.x, coords.y, coords.z);
      ripple.lookAt(0, 0, 0);
      rippleGroup.add(ripple);

      // Staggered animation
      gsap.to(ripple.scale, {
        x: attack.magnitude / (20 - i * 5),
        y: attack.magnitude / (20 - i * 5),
        z: 1,
        duration: 3,
        delay: i * 0.2,
        ease: 'power2.out'
      });

      gsap.to(material, {
        opacity: 0,
        duration: 3,
        delay: i * 0.2,
        ease: 'power2.out'
      });
    }

    scene.add(rippleGroup);
    this.attackRipples.push(rippleGroup);

    // Remove after animation
    setTimeout(() => {
      scene.remove(rippleGroup);
      this.attackRipples = this.attackRipples.filter(r => r !== rippleGroup);
      this.stats.attacks--;
      this.updateStats();
    }, 4000);
  }

  /**
   * Setup knowledge base event dispatchers
   *
   * Connects visualization events with knowledge base
   */
  setupKBEventDispatchers() {
    const globe = this.globeRenderer.getGlobe();

    // Cable click - show KB article
    globe.onArcClick(arc => {
      if (arc) {
        const event = new CustomEvent('arc-click', {
          detail: {
            id: arc.label,
            name: arc.label,
            capacity: arc.capacity,
            status: arc.status
          }
        });
        document.dispatchEvent(event);
      }
    });

    // Datacenter click - show KB article
    globe.onPointClick(point => {
      if (point) {
        const event = new CustomEvent('point-click', {
          detail: {
            id: point.name,
            city: point.city,
            tier: point.tier,
            provider: point.provider
          }
        });
        document.dispatchEvent(event);
      }
    });

    // Cable hover - show enhanced tooltip
    globe.onArcHover(arc => {
      if (arc) {
        const event = new CustomEvent('arc-hover', {
          detail: {
            cableData: arc,
            position: { x: window.event?.clientX || 0, y: window.event?.clientY || 0 }
          }
        });
        document.dispatchEvent(event);
      }
    });

    // Datacenter hover - show enhanced tooltip
    globe.onPointHover(point => {
      if (point) {
        const event = new CustomEvent('point-hover', {
          detail: {
            datacenterData: point,
            position: { x: window.event?.clientX || 0, y: window.event?.clientY || 0 }
          }
        });
        document.dispatchEvent(event);
      }
    });
  }

  /**
   * Show knowledge base article for cable
   *
   * @param {string} cableId - Cable identifier
   */
  showCableKB(cableId) {
    if (this.kbIntegration) {
      this.kbIntegration.showArticle('internet-architecture/core-concepts', 'sidebar');
    }
  }

  /**
   * Show knowledge base article for data center
   *
   * @param {string} dcId - Datacenter identifier
   */
  showDataCenterKB(dcId) {
    if (this.kbIntegration) {
      this.kbIntegration.showArticle('data/cdn-technologies', 'sidebar');
    }
  }

  /**
   * Calculate great circle distance between two points
   *
   * Uses Haversine formula
   *
   * @param {number} lat1 - Start latitude
   * @param {number} lon1 - Start longitude
   * @param {number} lat2 - End latitude
   * @param {number} lon2 - End longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Get filtered data for table manager
   *
   * @param {string} type - Data type requested
   * @returns {Array|number}
   */
  getFilteredData(type) {
    switch(type) {
      case 'cables':
        return this.data.filteredCables;
      case 'cablesTotal':
        return this.data.cables.data.length;
      case 'datacenters':
        return this.data.filteredDatacenters;
      case 'datacentersTotal':
        return this.data.datacenters.data.length;
      default:
        return [];
    }
  }

  /**
   * Setup event listeners for UI controls
   */
  setupEventListeners() {
    // Window resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.globeRenderer.onResize();
      }, 250);
    });

    // === LAYER TOGGLES ===
    document.getElementById('toggle-cables')?.addEventListener('change', (e) => {
      this.state.layers.cables = e.target.checked;
      if (e.target.checked) {
        this.onFilterChange(this.filterControls.getFilters());
      } else {
        this.globeRenderer.getGlobe().arcsData([]);
      }
    });

    document.getElementById('toggle-datacenters')?.addEventListener('change', (e) => {
      this.state.layers.datacenters = e.target.checked;
      if (e.target.checked) {
        this.visualizeDataCenters(this.data.datacenters.data);
      } else {
        this.globeRenderer.getGlobe().pointsData([]);
      }
    });

    document.getElementById('toggle-atmosphere')?.addEventListener('change', (e) => {
      this.globeRenderer.toggleAtmosphere(e.target.checked);
    });

    document.getElementById('toggle-attacks')?.addEventListener('change', (e) => {
      this.state.layers.attacks = e.target.checked;
      if (!e.target.checked && this.attackInterval) {
        clearInterval(this.attackInterval);
        // Clear existing ripples
        this.attackRipples.forEach(ripple => {
          this.globeRenderer.getScene().remove(ripple);
        });
        this.attackRipples = [];
      } else if (e.target.checked) {
        this.initializeDDoSMonitoring();
      }
    });

    // Rotation toggle
    const rotationToggle = document.getElementById('rotation-toggle');
    rotationToggle?.addEventListener('click', () => {
      const controls = this.globeRenderer.getControls();
      const isRotating = controls.autoRotate;
      this.globeRenderer.toggleAutoRotate(!isRotating);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'r' || e.key === 'R') {
        this.globeRenderer.resetView();
      } else if (e.key === 'p' || e.key === 'P') {
        const perfMon = document.querySelector('.performance-monitor');
        if (perfMon) {
          perfMon.style.display = perfMon.style.display === 'none' ? 'flex' : 'none';
        }
      } else if (e.key === 'k' || e.key === 'K') {
        // Toggle knowledge base sidebar
        if (this.kbIntegration) {
          this.kbIntegration.showArticle('internet-architecture/00-index', 'sidebar');
        }
      }
    });
  }

  /**
   * Update statistics display
   */
  updateStats() {
    const updates = [
      ['cable-count', this.stats.cables],
      ['datacenter-count', this.stats.datacenters],
      ['bgp-routes', this.stats.bgpRoutes],
      ['attack-count', this.stats.attacks],
      ['fps', Math.round(this.stats.fps)]
    ];

    updates.forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        const current = parseInt(element.textContent.replace(/,/g, '')) || 0;
        if (current !== value) {
          gsap.to({ value: current }, {
            value: value,
            duration: 0.5,
            onUpdate: function() {
              element.textContent = Math.round(this.targets()[0].value).toLocaleString();
            }
          });
        }
      }
    });

    // Update scene stats
    const scene = this.globeRenderer.getScene();
    if (scene) {
      // Only update if element exists
      const objectCountElement = document.getElementById('object-count');
      if (objectCountElement) {
        objectCountElement.textContent = scene.children.length;
      }

      // Count particles
      let particleCount = 0;
      scene.traverse(child => {
        if (child instanceof THREE.Points) {
          particleCount += child.geometry.attributes.position.count;
        }
      });

      const particleCountElement = document.getElementById('particle-count');
      if (particleCountElement) {
        particleCountElement.textContent = particleCount;
      }
    }

    // Update data quality stats
    const dataQuality = document.getElementById('data-quality');
    if (dataQuality) {
      dataQuality.textContent = `${this.stats.dataConfidence}%`;
    }

    const cacheHitRate = document.getElementById('cache-hit-rate');
    if (cacheHitRate) {
      cacheHitRate.textContent = `${this.stats.cacheHitRate}%`;
    }
  }

  /**
   * Update loading status
   *
   * @param {string} message - Status message
   * @param {number} progress - Progress percentage (0-100)
   */
  updateLoadingStatus(message, progress = null) {
    const statusElement = document.querySelector('.loading-status');
    const progressBar = document.querySelector('.loading-progress');

    if (statusElement) {
      statusElement.textContent = message;
    }

    if (progressBar && progress !== null) {
      progressBar.style.width = `${progress}%`;
    }
  }

  /**
   * Hide loading screen with animation
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      gsap.to(loadingScreen, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          loadingScreen.classList.add('hidden');
          loadingScreen.style.display = 'none';
        }
      });
    }
  }

  /**
   * Show data quality notification
   *
   * Informs user about data sources and confidence levels
   */
  showDataQualityNotification() {
    const sources = [];

    if (this.data.cables.metadata) {
      sources.push(`Cables: ${this.data.cables.metadata.source} (${(this.data.cables.metadata.confidence * 100).toFixed(0)}% confidence)`);
    }

    if (this.data.datacenters.metadata) {
      sources.push(`Data Centers: ${this.data.datacenters.metadata.source} (${(this.data.datacenters.metadata.confidence * 100).toFixed(0)}% confidence)`);
    }

    const message = `Data loaded successfully!\n${sources.join('\n')}`;
    this.showNotification(message, 'info');
  }

  /**
   * Show notification
   *
   * @param {string} message - Notification message
   * @param {string} type - 'info', 'warning', 'error'
   */
  showNotification(message, type = 'info') {
    const colors = {
      info: { bg: 'rgba(0, 200, 255, 0.1)', border: '#00c8ff' },
      warning: { bg: 'rgba(255, 200, 0, 0.1)', border: '#ffc800' },
      error: { bg: 'rgba(255, 51, 102, 0.1)', border: '#ff3366' }
    };

    const style = colors[type] || colors.info;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 30px;
      background: ${style.bg};
      border: 1px solid ${style.border};
      border-radius: 8px;
      padding: 15px;
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
      backdrop-filter: blur(10px);
      white-space: pre-line;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      gsap.to(notification, {
        opacity: 0,
        x: 20,
        duration: 0.5,
        onComplete: () => notification.remove()
      });
    }, 5000);
  }

  /**
   * Handle initialization errors
   *
   * @param {Error} error - Error object
   */
  handleInitError(error) {
    console.error('[IntegratedMap] Initialization error:', error);
    this.state.error = error;

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      const content = loadingScreen.querySelector('.loading-content');
      if (content) {
        content.innerHTML = `
          <div style="text-align: center;">
            <h2 style="color: #ff3366;">Initialization Error</h2>
            <p style="color: #fff; margin: 20px 0;">
              Failed to initialize the infrastructure map.
            </p>
            <p style="color: #aaa; font-size: 14px;">
              ${error.message || 'Unknown error occurred'}
            </p>
            <button onclick="location.reload()" style="
              margin-top: 20px;
              padding: 10px 20px;
              background: #00ffcc;
              color: #000;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-weight: bold;
            ">
              Retry
            </button>
          </div>
        `;
      }
    }
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Calculate FPS
    const now = performance.now();
    if (this.lastTime) {
      const delta = now - this.lastTime;
      this.stats.fps = 1000 / delta;
      this.frameCount++;

      // Update stats every 30 frames
      if (this.frameCount % 30 === 0) {
        this.updateStats();
      }
    }
    this.lastTime = now;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.attackInterval) {
      clearInterval(this.attackInterval);
    }

    // Stop data orchestrator auto-refresh
    if (this.dataOrchestrator) {
      this.dataOrchestrator.destroy();
    }

    // Clean up GSAP animations
    gsap.killTweensOf('*');

    // Clean up globe renderer
    if (this.globeRenderer) {
      this.globeRenderer.destroy();
    }

    // Clean up KB integration
    if (this.kbIntegration) {
      this.kbIntegration.destroy();
    }
  }
}

// === INITIALIZATION ===
// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[IntegratedMap] Starting initialization...');

  window.app = new IntegratedInfrastructureMap();

  // Add cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (window.app) {
      window.app.destroy();
    }
  });

  // Log application info
  console.log('[IntegratedMap] Version 2.0.0 (Integrated)');
  console.log('[IntegratedMap] Features:');
  console.log('  - DataOrchestrator with intelligent fallbacks');
  console.log('  - Knowledge Base integration');
  console.log('  - Progressive loading');
  console.log('  - Auto-refresh scheduling');
  console.log('  - Interactive learning tours');
  console.log('  - Educational overlays');
  console.log('  - Advanced filtering');
  console.log('  - CSV export');
});

export default IntegratedInfrastructureMap;
