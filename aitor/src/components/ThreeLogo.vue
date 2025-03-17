<template>
  <div class="three-logo-container" ref="container"></div>
</template>

<script>
import * as THREE from 'three';
import { onMounted, onBeforeUnmount, ref } from 'vue';

export default {
  name: 'ThreeLogo',
  setup() {
    const container = ref(null);
    let scene, camera, renderer, logo, animationFrameId;
    
    const initThree = () => {
      // Create scene
      scene = new THREE.Scene();
      
      // Create camera
      const { width, height } = container.value.getBoundingClientRect();
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      
      // Create renderer with transparency
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.value.appendChild(renderer.domElement);
      
      // Create minimalist "A" logo
      createLogo();
      
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);
      
      // Add point light for extra shine
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(-3, 3, 2);
      scene.add(pointLight);
      
      // Handle window resize
      window.addEventListener('resize', onWindowResize);
      
      // Start animation
      animate();
    };
    
    const createLogo = () => {
      // Create a group to hold all parts of the logo
      const group = new THREE.Group();
      
      // Create material with better visual properties
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x90b083, // Default color (sage green)
        metalness: 0.6,
        roughness: 0.3,
        reflectivity: 0.7,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2
      });
      
      // Create a modern abstract logo - interlocking curved shapes
      
      // Main circular ring
      const mainRingGeometry = new THREE.TorusGeometry(1, 0.08, 20, 50);
      const mainRing = new THREE.Mesh(mainRingGeometry, material);
      mainRing.rotation.x = Math.PI / 2;
      group.add(mainRing);
      
      // Create curved arc that intersects with the main ring
      const arcGeometry = new THREE.TorusGeometry(0.7, 0.08, 20, 50, Math.PI);
      const arc = new THREE.Mesh(arcGeometry, material);
      arc.position.y = 0.2;
      arc.rotation.y = Math.PI / 2;
      group.add(arc);
      
      // Create a floating sphere in the center
      const sphereGeometry = new THREE.SphereGeometry(0.15, 24, 24);
      const sphere = new THREE.Mesh(sphereGeometry, material);
      sphere.position.set(0, 0, 0);
      group.add(sphere);
      
      // Add the group to the scene
      scene.add(group);
      logo = group;
      
      // Listen for theme changes
      document.addEventListener('themeChanged', updateLogoColor);
    };
    
    // Update logo color when theme changes
    const updateLogoColor = (event) => {
      if (logo && event.detail && event.detail.starColor) {
        // Convert hex string to number
        const color = parseInt(event.detail.starColor, 16);
        logo.traverse((child) => {
          if (child.isMesh) {
            child.material.color.set(color);
          }
        });
      }
    };
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Create more elegant animation
      if (logo) {
        // Smooth rotation
        logo.rotation.y += 0.005;
        
        // Subtle floating motion
        const time = Date.now() * 0.001;
        logo.position.y = Math.sin(time) * 0.1;
        
        // Subtle breathing effect
        const scale = 1 + Math.sin(time * 0.5) * 0.03;
        logo.scale.set(scale, scale, scale);
      }
      
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
      
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('themeChanged', updateLogoColor);
      
      if (renderer && container.value) {
        container.value.removeChild(renderer.domElement);
      }
      
      // Clean up Three.js resources
      if (logo) {
        logo.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          }
        });
      }
      
      if (scene) {
        scene.clear();
      }
      
      if (renderer) {
        renderer.dispose();
      }
    });
    
    return {
      container
    };
  }
};
</script>

<style scoped>
.three-logo-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>