<template>
  <div class="night-sky-container" ref="container"></div>
</template>

<script>
import * as THREE from "three";
import { onMounted, onBeforeUnmount, ref } from "vue";

export default {
  name: "NightSky",
  setup() {
    const container = ref(null);
    let scene, camera, renderer, stars, largeStars, animationFrameId;
    let currentStarColor = 0xd8e8d4; // Default sage green tint
    let planets = []; // Array to store Outer Wilds inspired planets
    let quantumMoon; // Special quantum moon that changes position
    let sunObject; // The sun object
    let isVisible = true; // Track if component is visible
    let lowPerformanceMode = false; // For mobile/low-end devices
    
    // Check if device is likely low-performance
    const checkPerformance = () => {
      // Check if mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      // Check if low-end device (rough estimate)
      const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      
      lowPerformanceMode = isMobile || isLowEnd;
    };
    
    // Add visibility detection to pause rendering when not visible
    const addVisibilityDetection = () => {
      // Use Intersection Observer to detect when component is visible
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              isVisible = entry.isIntersecting;
            });
          },
          { threshold: 0.1 }
        );
        
        if (container.value) {
          observer.observe(container.value);
        }
      }
      
      // Also pause when tab is not visible
      document.addEventListener("visibilitychange", () => {
        isVisible = document.visibilityState === "visible";
      });
    };

    const initThree = () => {
      // Check performance first
      checkPerformance();
      
      // Create scene
      scene = new THREE.Scene();

      // Create camera
      const { width, height } = container.value.getBoundingClientRect();
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 50;

      // Create renderer with performance considerations
      renderer = new THREE.WebGLRenderer({
        antialias: !lowPerformanceMode, // Disable antialiasing on low-end devices
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPerformanceMode ? 1 : 2));
      container.value.appendChild(renderer.domElement);

      // Create circular star texture
      const starTexture = createStarTexture();

      // Create stars with varied colors
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xf8f9ff,
        size: 0.6,
        transparent: true,
        map: starTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const starsVertices = [];
      const starsCount = 1500;

      for (let i = 0; i < starsCount; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        starsVertices.push(x, y, z);
      }

      starsGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starsVertices, 3)
      );
      stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);

      // Add some larger stars with theme color tint
      const largeStarsGeometry = new THREE.BufferGeometry();
      const largeStarsMaterial = new THREE.PointsMaterial({
        color: currentStarColor,
        size: 1.0,
        transparent: true,
        map: starTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const largeStarsVertices = [];
      const largeStarsCount = 100;

      for (let i = 0; i < largeStarsCount; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        largeStarsVertices.push(x, y, z);
      }

      largeStarsGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(largeStarsVertices, 3)
      );
      largeStars = new THREE.Points(largeStarsGeometry, largeStarsMaterial);
      scene.add(largeStars);

      // Create Outer Wilds inspired celestial objects
      createOuterWildsElements();

      // Handle window resize
      window.addEventListener("resize", onWindowResize);

      // Listen for theme changes
      document.addEventListener("themeChanged", updateStarColors);
      
      // Add visibility detection
      addVisibilityDetection();

      // Start animation
      animate();
    };

    // Create Outer Wilds inspired elements
    const createOuterWildsElements = () => {
      // Create the sun (similar to the Sun Station)
      const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
      const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffa500,
        transparent: true,
        opacity: 0.9,
      });
      sunObject = new THREE.Mesh(sunGeometry, sunMaterial);
      sunObject.position.set(-40, 20, -30);
      scene.add(sunObject);

      // Add sun glow
      const sunGlowGeometry = new THREE.SphereGeometry(4, 32, 32);
      const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffa500,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide,
      });
      const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
      sunObject.add(sunGlow);

      // Create Timber Hearth-like planet (green with water)
      createPlanet(2, 0x4da556, 15, 10, -20);

      // Create Brittle Hollow-like planet (dark with blue cracks)
      createPlanet(2.5, 0x1a1a2e, -20, -15, -25, 0x3498db);

      // Create Giant's Deep-like planet (ocean planet with storms)
      createPlanet(3, 0x2980b9, 25, -8, -30);

      // Create the Quantum Moon (changes position randomly)
      const quantumMoonGeometry = new THREE.SphereGeometry(1.2, 24, 24);
      const quantumMoonMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.8,
        metalness: 0.2,
      });
      quantumMoon = new THREE.Mesh(quantumMoonGeometry, quantumMoonMaterial);
      updateQuantumMoonPosition();
      scene.add(quantumMoon);

      // Add a subtle fog to the scene (cosmic cloud)
      scene.fog = new THREE.FogExp2(0x080820, 0.001);
    };

    // Helper function to create planets
    const createPlanet = (radius, color, x, y, z, crackColor = null) => {
      const planetGeometry = new THREE.SphereGeometry(radius, 32, 32);
      const planetMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.1,
      });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      planet.position.set(x, y, z);

      // If this is a cracked planet like Brittle Hollow
      if (crackColor) {
        const cracksMaterial = new THREE.MeshBasicMaterial({
          color: crackColor,
          side: THREE.DoubleSide,
        });

        // Create cracks
        for (let i = 0; i < 10; i++) {
          const crackGeometry = new THREE.BoxGeometry(radius * 2.2, 0.1, 0.1);
          const crack = new THREE.Mesh(crackGeometry, cracksMaterial);
          crack.rotation.x = Math.random() * Math.PI;
          crack.rotation.y = Math.random() * Math.PI;
          crack.rotation.z = Math.random() * Math.PI;
          planet.add(crack);
        }
      }

      scene.add(planet);
      planets.push(planet);
      return planet;
    };

    // Update the Quantum Moon position (like in Outer Wilds)
    const updateQuantumMoonPosition = () => {
      if (!quantumMoon) return;

      // Only change position when not being observed (random chance)
      if (Math.random() < 0.01) {
        const x = (Math.random() - 0.5) * 60;
        const y = (Math.random() - 0.5) * 60;
        const z = (Math.random() - 0.5) * 40 - 20;
        quantumMoon.position.set(x, y, z);
      }
    };

    // Update star colors when theme changes
    const updateStarColors = (event) => {
      if (largeStars && event.detail && event.detail.starColor) {
        // Convert hex string to number
        currentStarColor = parseInt(event.detail.starColor, 16);
        largeStars.material.color.set(currentStarColor);
      }
    };

    // Create a circular texture for stars
    const createStarTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;

      const context = canvas.getContext("2d");
      const gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );

      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
      gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.4)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Only render when visible
      if (!isVisible) return;
      
      // Reduce animation complexity on low-performance devices
      if (lowPerformanceMode && animationFrameId % 2 !== 0) return;

      // Rotate stars slowly
      stars.rotation.x += 0.0005;
      stars.rotation.y += 0.0003;

      // Animate planets (slow rotation)
      planets.forEach((planet, index) => {
        planet.rotation.y += 0.002 * (index % 2 === 0 ? 1 : -1);
        planet.rotation.x += 0.001 * (index % 3 === 0 ? 1 : -1);

        // Orbit movement
        const time = Date.now() * 0.0001;
        const radius = 5 + index * 3;
        const speed = 0.2 - index * 0.05;
        planet.position.x += Math.sin(time * speed) * 0.01;
        planet.position.y += Math.cos(time * speed) * 0.01;
      });

      // Animate sun glow
      if (sunObject) {
        sunObject.rotation.y += 0.001;
        sunObject.rotation.z += 0.0005;

        // Pulsating effect
        const pulseFactor = Math.sin(Date.now() * 0.001) * 0.1 + 1;
        sunObject.scale.set(pulseFactor, pulseFactor, pulseFactor);
      }

      // Update quantum moon
      updateQuantumMoonPosition();

      // Subtle camera movement
      camera.position.x = Math.sin(Date.now() * 0.0001) * 3;
      camera.position.y = Math.cos(Date.now() * 0.0001) * 2;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    const onWindowResize = () => {
      if (!container.value) return;

      const { width, height } = container.value.getBoundingClientRect();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    onMounted(() => {
      if (container.value) {
        initThree();
      }
    });

    onBeforeUnmount(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("themeChanged", updateStarColors);

      if (renderer && container.value) {
        container.value.removeChild(renderer.domElement);
      }

      // Clean up Three.js resources
      if (stars) {
        stars.geometry.dispose();
        stars.material.dispose();
      }

      if (scene) {
        scene.clear();
      }
    });

    return {
      container,
    };
  },
};
</script>

<style scoped>
.night-sky-container {
  width: 100%;
  height: 100vh;
  background: #242424; /* Dark gray background */
  overflow: hidden;
  position: relative;
  z-index: 0; /* Ensure this is lower than content z-index */
}
</style>
