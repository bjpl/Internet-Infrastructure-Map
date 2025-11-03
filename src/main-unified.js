/**
 * main-unified.js - Unified Internet Infrastructure Map
 *
 * Combines the best features from all main.js variants:
 * - Advanced filtering from main-clean.js
 * - Progressive loading from main-improved.js
 * - Visual effects from main-beautiful.js
 * - Clean architecture with modular components
 *
 * @version 1.0.0
 * @author Internet Infrastructure Map Team
 */

import * as THREE from 'three';
import * as d3 from 'd3';
import gsap from 'gsap';
import { DataManager } from './dataManager.js';
import { GlobeRenderer } from './components/GlobeRenderer.js';
import { FilterControls } from './components/FilterControls.js';
import { DataTableManager } from './components/DataTableManager.js';
import DOMPurify from 'dompurify';
import { EducationalOverlay } from './components/EducationalOverlay.js';

class UnifiedInfrastructureMap {
  constructor() {
    this.container = document.getElementById('globe-container');
    this.dataManager = new DataManager();

    // Component instances
    this.globeRenderer = null;
    this.filterControls = null;
    this.tableManager = null;
    this.educationalOverlay = null;

    // Data storage
    this.data = {
      allCables: [],
      allDatacenters: [],
      filteredCables: [],
      filteredDatacenters: [],
      bgpRoutes: []
    };

    // Application state
    this.state = {
      loaded: false,
      error: null,
      layers: {
        cables: true,
        datacenters: true,
        bgp: false,
        attacks: true
      },
      progressive: {
        initialBatch: 100,
        batchSize: 50,
        delay: 500
      }
    };

    // Statistics
    this.stats = {
      cables: 0,
      datacenters: 0,
      bgpRoutes: 0,
      attacks: 0,
      fps: 60,
      objects: 0,
      particles: 0
    };

    // Performance tracking
    this.lastTime = 0;
    this.frameCount = 0;
    this.animationId = null;

    // Visual effects
    this.attackRipples = [];
    this.attackInterval = null;

    this.init().catch(this.handleInitError.bind(this));
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      this.updateLoadingStatus('Initializing 3D globe...');

      // Initialize globe renderer
      this.globeRenderer = new GlobeRenderer(this.container, {
        initialView: { lat: 20, lng: -40, altitude: 2.8 },
        autoRotate: true,
        autoRotateSpeed: 0.5,
        starCount: 5000
      });

      await this.globeRenderer.init();

      // Initialize filter controls
      this.filterControls = new FilterControls(this.onFilterChange.bind(this));
      this.filterControls.init();

      // Initialize table manager
      this.tableManager = new DataTableManager(
        this.getFilteredData.bind(this),
        this.calculateDistance.bind(this)
      );
      this.tableManager.init();

      // Initialize educational overlay
      this.educationalOverlay = new EducationalOverlay();
      this.educationalOverlay.init();

      // Setup event listeners
      this.setupEventListeners();

      // Load data with progress
      await this.loadData();

      // Start animation loop
      this.animate();

      // Hide loading screen
      this.hideLoadingScreen();

      this.state.loaded = true;

    } catch (error) {
      this.handleInitError(error);
    }
  }

  /**
   * Load all data with progressive rendering
   */
  async loadData() {
    try {
      const totalSteps = 4;
      let currentStep = 0;

      // Load submarine cables
      this.updateLoadingStatus('Loading submarine cable data...', (++currentStep / totalSteps) * 100);
      const cablesData = await this.dataManager.loadSubmarineCables();
      this.data.allCables = cablesData;

      // Apply initial filters and render progressively
      this.onFilterChange(this.filterControls.getFilters());

      // Load data centers
      this.updateLoadingStatus('Mapping global data centers...', (++currentStep / totalSteps) * 100);
      const datacentersData = await this.dataManager.loadDataCenters();
      this.data.allDatacenters = datacentersData;
      this.visualizeDataCenters(datacentersData);
      this.stats.datacenters = datacentersData.length;

      // Load BGP routes
      this.updateLoadingStatus('Initializing BGP route visualization...', (++currentStep / totalSteps) * 100);
      const bgpData = await this.dataManager.loadBGPRoutes();
      this.data.bgpRoutes = bgpData.routes || [];
      this.stats.bgpRoutes = bgpData.activeRoutes || 0;

      // Initialize DDoS monitoring
      this.updateLoadingStatus('Connecting to threat intelligence feeds...', (++currentStep / totalSteps) * 100);
      this.initializeDDoSMonitoring();

      // Update UI stats
      this.updateStats();

    } catch (error) {
      console.error('Error loading data:', error);
      this.showNotification('Some data sources are unavailable. Using cached data.', 'warning');
    }
  }

  /**
   * Filter change callback
   * @param {Object} filters
   */
  onFilterChange(filters) {
    const filtered = this.filterControls.applyFilters(this.data.allCables);
    this.data.filteredCables = filtered;

    // Render cables progressively
    this.renderCablesProgressive(filtered);

    // Update stats
    this.stats.cables = filtered.length;
    this.updateStats();
  }

  /**
   * Render cables with progressive loading
   * @param {Array} cables
   */
  renderCablesProgressive(cables) {
    const globe = this.globeRenderer.getGlobe();

    // Initial batch
    const initialBatch = cables.slice(0, this.state.progressive.initialBatch);
    const cableArcs = this.formatCableArcs(initialBatch);

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
      .arcLabel(arc => this.educationalOverlay.createCableTooltip(arc, this.calculateDistance.bind(this)));

    // Add particle glow to major cables
    this.addCableGlowEffects(cableArcs.filter(c => c.importance > 0.7));

    // Load remaining cables in batches
    if (cables.length > this.state.progressive.initialBatch) {
      setTimeout(() => {
        this.loadRemainingCables(cables.slice(this.state.progressive.initialBatch), cableArcs);
      }, this.state.progressive.delay);
    }
  }

  /**
   * Load remaining cables in batches
   * @param {Array} remainingCables
   * @param {Array} currentArcs
   */
  loadRemainingCables(remainingCables, currentArcs) {
    const batchSize = this.state.progressive.batchSize;
    let index = 0;

    const loadBatch = () => {
      const batch = remainingCables.slice(index, index + batchSize);

      if (batch.length > 0) {
        const batchArcs = this.formatCableArcs(batch);
        const allArcs = [...currentArcs, ...batchArcs];

        this.globeRenderer.getGlobe().arcsData(allArcs);

        // Update current arcs reference
        currentArcs.push(...batchArcs);

        index += batchSize;
        setTimeout(loadBatch, this.state.progressive.delay);
      }
    };

    loadBatch();
  }

  /**
   * Format cables as arc data for globe.gl
   * @param {Array} cables
   * @returns {Array}
   */
  formatCableArcs(cables) {
    return cables.map(cable => {
      const importance = this.calculateImportance(cable);
      const distance = this.calculateDistance(
        cable.landing_point_1.latitude,
        cable.landing_point_1.longitude,
        cable.landing_point_2.latitude,
        cable.landing_point_2.longitude
      );

      // Distance-based altitude to prevent cutoff
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
        startLat: cable.landing_point_1.latitude,
        startLng: cable.landing_point_1.longitude,
        endLat: cable.landing_point_2.latitude,
        endLng: cable.landing_point_2.longitude,
        startLocation: cable.landing_point_1.location,
        endLocation: cable.landing_point_2.location,
        color: this.getCableColor(cable, 0.85),
        stroke: Math.max(0.8, importance * 2.5),
        altitude: altitude,
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
   * Calculate cable importance
   * @param {Object} cable
   * @returns {number} Importance score 0-1
   */
  calculateImportance(cable) {
    let importance = 0;

    // Capacity factor (0-0.4)
    if (cable.capacity_tbps > 200) importance += 0.4;
    else if (cable.capacity_tbps > 100) importance += 0.3;
    else if (cable.capacity_tbps > 50) importance += 0.2;
    else importance += 0.1;

    // Distance factor (0-0.3)
    const distance = this.calculateDistance(
      cable.landing_point_1.latitude,
      cable.landing_point_1.longitude,
      cable.landing_point_2.latitude,
      cable.landing_point_2.longitude
    );

    if (distance > 8000) importance += 0.3;
    else if (distance > 5000) importance += 0.2;
    else if (distance > 2000) importance += 0.1;

    // Status factor (0-0.3)
    if (cable.status === 'active') importance += 0.3;
    else if (cable.status === 'planned') importance += 0.1;

    return Math.min(importance, 1);
  }

  /**
   * Get cable color based on capacity
   * @param {Object} cable
   * @param {number} opacity
   * @returns {string}
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
   * Add particle glow effects to major cables
   * @param {Array} majorCables
   */
  addCableGlowEffects(majorCables) {
    const scene = this.globeRenderer.getScene();
    const globe = this.globeRenderer.getGlobe();

    majorCables.forEach(cable => {
      const particleCount = 20;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      // Determine color based on capacity
      const color = new THREE.Color(cable.color);

      for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount;

        // Interpolate along the arc
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

      // Animate glow pulsing
      gsap.to(material, {
        opacity: 0.2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    });
  }

  /**
   * Interpolate point along arc
   * @param {number} startLat
   * @param {number} startLng
   * @param {number} endLat
   * @param {number} endLng
   * @param {number} t - Interpolation factor (0-1)
   * @param {number} altitude
   * @param {Object} globe
   * @returns {Object|null} {x, y, z} coordinates
   */
  interpolateArc(startLat, startLng, endLat, endLng, t, altitude, globe) {
    const startCoords = globe.getCoords(startLat, startLng, 0);
    const endCoords = globe.getCoords(endLat, endLng, 0);

    if (!startCoords || !endCoords) {
      return null;
    }

    // Calculate arc height
    const arcHeight = 100 * altitude * Math.sin(t * Math.PI);

    // Linear interpolation with arc
    const x = startCoords.x + (endCoords.x - startCoords.x) * t;
    const y = startCoords.y + (endCoords.y - startCoords.y) * t + arcHeight;
    const z = startCoords.z + (endCoords.z - startCoords.z) * t;

    return { x, y, z };
  }

  /**
   * Visualize data centers
   * @param {Array} datacenters
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

    // Limit for performance
    const tier1 = filtered.filter(dc => dc.tier === 1).slice(0, 50);
    const tier2 = filtered.filter(dc => dc.tier === 2).slice(0, 30);
    const tier3 = filtered.filter(dc => dc.tier === 3).slice(0, 20);

    const allDCs = [...tier1, ...tier2, ...tier3];

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

    globe
      .pointsData(points)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor('color')
      .pointAltitude(0.01)
      .pointRadius('size')
      .pointLabel(d => this.educationalOverlay.createDataCenterTooltip(d));

    this.data.filteredDatacenters = points;
  }

  /**
   * Initialize DDoS attack monitoring
   */
  initializeDDoSMonitoring() {
    this.attackInterval = setInterval(() => {
      if (Math.random() > 0.7 && this.state.layers.attacks) {
        const attack = this.dataManager.generateDDoSAttack();
        this.visualizeDDoSAttack(attack);
        this.stats.attacks++;
        this.updateStats();
      }
    }, 5000);
  }

  /**
   * Visualize DDoS attack with multi-layer ripple
   * @param {Object} attack
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
   * Calculate great circle distance
   * @param {number} lat1
   * @param {number} lon1
   * @param {number} lat2
   * @param {number} lon2
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
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
   * @param {string} type
   * @returns {Array|number}
   */
  getFilteredData(type) {
    switch(type) {
      case 'cables':
        return this.data.filteredCables;
      case 'cablesTotal':
        return this.data.allCables.length;
      case 'datacenters':
        return this.data.filteredDatacenters;
      case 'datacentersTotal':
        return this.data.allDatacenters.length;
      default:
        return [];
    }
  }

  /**
   * Setup event listeners
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

    // Layer toggles
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
        this.visualizeDataCenters(this.data.allDatacenters);
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
      document.getElementById('object-count').textContent = scene.children.length;

      // Count particles
      let particleCount = 0;
      scene.traverse(child => {
        if (child instanceof THREE.Points) {
          particleCount += child.geometry.attributes.position.count;
        }
      });
      document.getElementById('particle-count').textContent = particleCount;
    }
  }

  /**
   * Update loading status
   * @param {string} message
   * @param {number} progress
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
   * Hide loading screen
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
   * Show notification
   * @param {string} message
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
   * @param {Error} error
   */
  handleInitError(error) {
    console.error('Initialization error:', error);
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

    // Clean up GSAP animations
    gsap.killTweensOf('*');

    // Clean up globe renderer
    if (this.globeRenderer) {
      this.globeRenderer.destroy();
    }
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new UnifiedInfrastructureMap();

  // Add cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (window.app) {
      window.app.destroy();
    }
  });
});

export default UnifiedInfrastructureMap;
