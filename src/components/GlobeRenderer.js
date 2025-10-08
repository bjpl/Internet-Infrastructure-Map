/**
 * GlobeRenderer - Manages Three.js globe setup and rendering
 *
 * Responsibilities:
 * - Globe initialization with globe.gl
 * - Scene setup and lighting
 * - Star field generation
 * - Camera configuration
 * - Renderer quality settings
 */

import Globe from 'globe.gl';
import * as THREE from 'three';

export class GlobeRenderer {
  /**
   * @param {HTMLElement} container - DOM container for the globe
   * @param {Object} config - Configuration options
   */
  constructor(container, config = {}) {
    this.container = container;
    this.config = {
      globeImage: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      bumpImage: '//unpkg.com/three-globe/example/img/earth-topology.png',
      backgroundImage: '//unpkg.com/three-globe/example/img/night-sky.png',
      atmosphereColor: '#00ffcc',
      atmosphereAltitude: 0.15,
      initialView: { lat: 20, lng: -40, altitude: 2.8 },
      starCount: 5000,
      autoRotate: true,
      autoRotateSpeed: 0.5,
      ...config
    };

    this.globe = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
  }

  /**
   * Initialize the globe and scene
   * @returns {Promise<Globe>} Initialized globe instance
   */
  async init() {
    return new Promise((resolve, reject) => {
      try {
        this.globe = Globe()
          .globeImageUrl(this.config.globeImage)
          .bumpImageUrl(this.config.bumpImage)
          .backgroundImageUrl(this.config.backgroundImage)
          .showAtmosphere(true)
          .atmosphereColor(this.config.atmosphereColor)
          .atmosphereAltitude(this.config.atmosphereAltitude)
          .enablePointerInteraction(true)
          .onGlobeReady(() => {
            this.setupScene();
            resolve(this.globe);
          });

        this.globe(this.container);

        // Set initial camera position
        this.globe.pointOfView(this.config.initialView, 0);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup Three.js scene with lighting and effects
   */
  setupScene() {
    this.scene = this.globe.scene();
    this.camera = this.globe.camera();
    this.renderer = this.globe.renderer();
    this.controls = this.globe.controls();

    // High quality renderer settings
    this.renderer.antialias = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Camera settings for better arc visibility
    this.camera.near = 0.1;
    this.camera.far = 10000;
    this.camera.updateProjectionMatrix();

    // Controls configuration
    this.controls.autoRotate = this.config.autoRotate;
    this.controls.autoRotateSpeed = this.config.autoRotateSpeed;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.8;
    this.controls.minDistance = 120;
    this.controls.maxDistance = 500;

    // Setup lighting
    this.setupLights();

    // Add star field
    this.createStarField();
  }

  /**
   * Configure scene lighting
   */
  setupLights() {
    // Remove existing lights
    this.scene.traverse((child) => {
      if (child instanceof THREE.Light) {
        this.scene.remove(child);
      }
    });

    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Accent point lights for visual interest
    const cyanLight = new THREE.PointLight(0x00ffcc, 0.4, 500);
    cyanLight.position.set(200, 100, 50);
    this.scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff00ff, 0.3, 500);
    magentaLight.position.set(-200, -100, 50);
    this.scene.add(magentaLight);

    // Hemisphere light for realistic ambient
    const hemisphereLight = new THREE.HemisphereLight(0x5555ff, 0x555555, 0.2);
    this.scene.add(hemisphereLight);
  }

  /**
   * Create star field background
   */
  createStarField() {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const vertices = [];

    for (let i = 0; i < this.config.starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 600 + Math.random() * 200;

      vertices.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const starField = new THREE.Points(geometry, material);
    starField.name = 'starField';
    this.scene.add(starField);
  }

  /**
   * Toggle star field visibility
   * @param {boolean} visible
   */
  toggleStars(visible) {
    const starField = this.scene.getObjectByName('starField');
    if (starField) starField.visible = visible;
  }

  /**
   * Toggle atmosphere
   * @param {boolean} visible
   */
  toggleAtmosphere(visible) {
    this.globe.showAtmosphere(visible);
  }

  /**
   * Toggle auto-rotation
   * @param {boolean} enabled
   */
  toggleAutoRotate(enabled) {
    this.controls.autoRotate = enabled;
    this.controls.update();
  }

  /**
   * Reset camera to initial position
   * @param {number} duration - Animation duration in ms
   */
  resetView(duration = 1000) {
    this.globe.pointOfView(this.config.initialView, duration);
  }

  /**
   * Handle window resize
   */
  onResize() {
    this.globe.width(window.innerWidth);
    this.globe.height(window.innerHeight);
  }

  /**
   * Get the globe instance
   * @returns {Globe}
   */
  getGlobe() {
    return this.globe;
  }

  /**
   * Get the Three.js scene
   * @returns {THREE.Scene}
   */
  getScene() {
    return this.scene;
  }

  /**
   * Get the camera
   * @returns {THREE.Camera}
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Get the renderer
   * @returns {THREE.WebGLRenderer}
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   * Get the controls
   * @returns {Object}
   */
  getControls() {
    return this.controls;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.globe && this.globe._destructor) {
      this.globe._destructor();
    }
  }
}
