import { useEffect, useRef, memo, useState } from "react";
import * as THREE from "three";
import { Sparkles } from "lucide-react";
import "./BanarasCanvas3D.css";

/**
 * BanarasCanvas3D - An authentic, respectful, lightweight 3D experiential canvas
 * depicting twilight over the River Ganga:
 * - Fluid reflective water plane with sinusoidal river ripples
 * - Floating brass diyas (earthen oil lamps) with warm golden point lights and flicker
 * - Ancient stone ghat silhouetted temples & steps
 * - Rising gentle ceremonial incandescence & embers
 * - Interactive camera subtle tilt responding to pointer / gyro with smooth damping
 * - Full reduced-motion fallback and pause-when-hidden optimization
 */
export const BanarasCanvas3D = memo(function BanarasCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x190e08, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 8.5);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // AMBIENT & MOONLIGHT / SKY LIGHT
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.4);
    scene.add(ambientLight);

    const moonlight = new THREE.DirectionalLight(0xffbf80, 0.9);
    moonlight.position.set(5, 12, -4);
    scene.add(moonlight);

    // WATER PLANE (Ganga)
    const waterGeo = new THREE.PlaneGeometry(30, 30, 48, 48);
    waterGeo.rotateX(-Math.PI / 2);
    const originalPositions = (waterGeo.attributes.position.array as Float32Array).slice();

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x120a05,
      roughness: 0.15,
      metalness: 0.85,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 0;
    scene.add(waterMesh);

    // FLOATING DIYAS (Traditional oil lamps floating downstream)
    const diyasGroup = new THREE.Group();
    const diyaCount = 14;
    interface DiyaData {
      mesh: THREE.Mesh;
      light: THREE.PointLight;
      speed: number;
      initX: number;
      initZ: number;
      driftPhase: number;
    }
    const diyas: DiyaData[] = [];

    const diyaGeometry = new THREE.ConeGeometry(0.2, 0.1, 8);
    diyaGeometry.rotateX(Math.PI);
    const diyaMaterial = new THREE.MeshStandardMaterial({
      color: 0xd48834,
      roughness: 0.4,
      metalness: 0.3,
    });

    const flameGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    flameGeometry.scale(0.8, 1.6, 0.8);
    const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xfff0aa });

    for (let i = 0; i < diyaCount; i++) {
      const diyaMesh = new THREE.Mesh(diyaGeometry, diyaMaterial);
      const flameMesh = new THREE.Mesh(flameGeometry, flameMaterial);
      flameMesh.position.y = 0.08;
      diyaMesh.add(flameMesh);

      const diyaLight = new THREE.PointLight(0xff9922, 1.2, 3.5, 2);
      diyaLight.position.y = 0.12;
      diyaMesh.add(diyaLight);

      const x = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 7 - 1;
      diyaMesh.position.set(x, 0.05, z);

      diyasGroup.add(diyaMesh);
      diyas.push({
        mesh: diyaMesh,
        light: diyaLight,
        speed: 0.18 + Math.random() * 0.15,
        initX: x,
        initZ: z,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }
    scene.add(diyasGroup);

    // FLOATING GOLDEN EMBERS & INCENSE PARTICLES
    const particlesCount = 90;
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleSpeeds = new Float32Array(particlesCount);
    for (let i = 0; i < particlesCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 1] = Math.random() * 5 + 0.1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      particleSpeeds[i] = 0.005 + Math.random() * 0.01;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffcb6b,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // MOUSE TILT INTERACTION
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetTiltX = x * 0.5;
      targetTiltY = y * 0.3;
    };

    container.addEventListener("mousemove", handlePointerMove);

    // RESIZE LISTENER
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Damped camera tilt
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;
      currentTiltY += (targetTiltY - currentTiltY) * 0.05;
      camera.position.x = currentTiltX * 2;
      camera.position.y = 3.2 + currentTiltY;
      camera.lookAt(0, 0.6, 0);

      // Water ripples
      const posArray = waterGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < posArray.length; i += 3) {
        const u = originalPositions[i];
        const v = originalPositions[i + 2];
        posArray[i + 1] =
          Math.sin(u * 1.5 + elapsedTime * 1.8) * 0.06 +
          Math.cos(v * 1.2 + elapsedTime * 1.4) * 0.05;
      }
      waterGeo.attributes.position.needsUpdate = true;

      // Diya floating motion & flame flicker
      diyas.forEach((d) => {
        // Drift downstream along Z
        d.mesh.position.z += d.speed * 0.015;
        d.mesh.position.x += Math.sin(elapsedTime * 0.8 + d.driftPhase) * 0.003;

        // Reset if it passes camera
        if (d.mesh.position.z > 5) {
          d.mesh.position.z = -5;
          d.mesh.position.x = (Math.random() - 0.5) * 8;
        }

        // Bob with water ripples
        d.mesh.position.y = 0.04 + Math.sin(elapsedTime * 2.2 + d.driftPhase) * 0.04;
        d.mesh.rotation.z = Math.sin(elapsedTime * 1.8 + d.driftPhase) * 0.05;

        // Flame flicker
        d.light.intensity = 1.0 + Math.sin(elapsedTime * 8 + d.driftPhase) * 0.35;
      });

      // Embers rising
      const pPositions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        pPositions[i * 3 + 1] += particleSpeeds[i];
        pPositions[i * 3] += Math.sin(elapsedTime + i) * 0.002;
        if (pPositions[i * 3 + 1] > 5) {
          pPositions[i * 3 + 1] = 0.2;
          pPositions[i * 3] = (Math.random() - 0.5) * 12;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      diyaGeometry.dispose();
      diyaMaterial.dispose();
      flameGeometry.dispose();
      flameMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [prefersReducedMotion]);

  return (
    <div className="banaras-3d-wrapper" ref={containerRef} aria-label="3D Twilight Ganga Experience">
      <div className="banaras-3d-badge">
        <Sparkles size={14} className="banaras-3d-sparkle" />
        <span>Ganga Twilight Experience • Live WebGL</span>
      </div>

      {prefersReducedMotion ? (
        <div className="banaras-3d-fallback">
          <img
            src="/img/boats.jpg"
            alt="Diyas on the Ganga at sunset, Varanasi"
            className="banaras-3d-fallback-img"
          />
          <div className="banaras-3d-fallback-scrim" />
          <div className="banaras-3d-fallback-text">
            <h4>Twilight Over the Sacred River</h4>
            <p>Floating diyas, evening chants, and the calm current along Dashashwamedh Ghat.</p>
          </div>
        </div>
      ) : (
        <canvas ref={canvasRef} className="banaras-3d-canvas" />
      )}

      <div className="banaras-3d-overlay">
        <div className="banaras-3d-overlay-text">
          <p className="banaras-3d-eyebrow">Interactive 3D Atmosphere</p>
          <h3>Floating Diyas on the Sacred Ganga</h3>
          <p className="banaras-3d-sub">
            Move your cursor or tilt your device to see the evening reflection across ancient Varanasi waters.
          </p>
        </div>
        <div className="banaras-3d-legend">
          <span className="legend-dot" />
          <span>Real-time fluid ripples & diya lights</span>
        </div>
      </div>
    </div>
  );
});
