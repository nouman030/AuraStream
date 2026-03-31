import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VinylRecord = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const width = el.clientWidth || 320;
    const height = el.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    camera.position.set(0, 1, 10);
    camera.lookAt(0, 0, 0);

    // ── VINYL GROUP ──────────────────────────
    const vinylGroup = new THREE.Group();

    // Main disc
    const vinylGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.1, 128);
    const vinylMat = new THREE.MeshStandardMaterial({
      color: 0x080808,
      roughness: 0.15,
      metalness: 0.95,
      envMapIntensity: 1.5,
    });
    const vinyl = new THREE.Mesh(vinylGeo, vinylMat);
    vinyl.castShadow = true;
    vinyl.receiveShadow = true;
    vinylGroup.add(vinyl);

    // Groove rings with iridescent sheen
    const grooveColors = [0x1a1a2e, 0x16213e, 0x0f3460, 0x1a1a2e];
    for (let r = 0.9; r <= 3.3; r += 0.14) {
      const geo = new THREE.TorusGeometry(r, 0.012, 6, 200);
      const c = grooveColors[Math.floor(r * 3) % grooveColors.length];
      const mat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.05, metalness: 1.0 });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2;
      vinyl.add(ring);
    }

    // Center label – glowing violet
    const labelGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.12, 64);
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      roughness: 0.4,
      metalness: 0.3,
      emissive: 0x4f1fb8,
      emissiveIntensity: 0.6,
    });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.y = 0.01;
    vinyl.add(label);

    // Teal glowing ring around label
    const tealRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.025, 8, 128),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 2.5,
        roughness: 0.1, metalness: 0.5
      })
    );
    tealRing.rotation.x = Math.PI / 2;
    tealRing.position.y = 0.07;
    vinyl.add(tealRing);

    // Spindle hole
    vinyl.add(new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.2, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    ));

    // Floating particles around vinyl
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.8 + Math.random() * 1.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.6;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x7c3aed, size: 0.04, transparent: true, opacity: 0.7
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    vinylGroup.add(particles);

    vinylGroup.rotation.x = Math.PI * 0.13;
    scene.add(vinylGroup);

    // ── LIGHTING ──────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(6, 10, 8);
    key.castShadow = true;
    scene.add(key);

    const violet = new THREE.PointLight(0x7c3aed, 25, 30);
    violet.position.set(-5, 3, 4);
    scene.add(violet);

    const teal = new THREE.PointLight(0x06b6d4, 18, 25);
    teal.position.set(6, -2, 3);
    scene.add(teal);

    const gold = new THREE.PointLight(0xf59e0b, 8, 20);
    gold.position.set(0, 6, -3);
    scene.add(gold);

    // ── MOUSE PARALLAX ───────────────────────
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    const handleMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── ANIMATION ─────────────────────────────
    let rafId;
    let t = 0;
    const baseRotX = Math.PI * 0.13;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      t += 0.01;

      // Smooth spin
      vinyl.rotation.y += 0.006;
      particles.rotation.y -= 0.003;

      // Smooth parallax easing
      currentX += (targetX * 0.25 - currentX) * 0.05;
      currentY += (targetY * 0.15 - currentY) * 0.05;

      vinylGroup.rotation.x = baseRotX + currentY;
      vinylGroup.rotation.z = currentX * 0.1;

      // Animate teal ring glow
      tealRing.material.emissiveIntensity = 2.0 + Math.sin(t * 2) * 0.5;

      // Light animation
      violet.intensity = 22 + Math.sin(t * 1.3) * 5;
      teal.intensity = 16 + Math.cos(t * 0.9) * 4;

      renderer.render(scene, camera);
    };
    animate();

    // ── RESIZE ────────────────────────────────
    const handleResize = () => {
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default VinylRecord;
