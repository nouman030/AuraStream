import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AudioWaveform = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const width = el.clientWidth || window.innerWidth;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    camera.position.set(0, 1, 22);
    camera.lookAt(0, 0, 0);

    // ── DUAL WAVEFORM (mirrored) ─────────────
    const count = 96;
    const bars = [];
    const group = new THREE.Group();

    for (let i = 0; i < count; i++) {
      const t = i / count;
      // Color gradient from teal→violet→gold
      const color = new THREE.Color();
      if (t < 0.5) {
        color.lerpColors(new THREE.Color(0x06b6d4), new THREE.Color(0x7c3aed), t * 2);
      } else {
        color.lerpColors(new THREE.Color(0x7c3aed), new THREE.Color(0xf59e0b), (t - 0.5) * 2);
      }

      // Top bar (positive)
      const topGeo = new THREE.BoxGeometry(0.18, 1, 0.18);
      const topMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.7,
        transparent: true,
        opacity: 0.9,
      });
      const topBar = new THREE.Mesh(topGeo, topMat);
      topBar.position.x = (i - count / 2) * 0.38;

      // Bottom mirror bar
      const botBar = topBar.clone();
      botBar.material = topMat.clone();
      botBar.material.opacity = 0.35;
      botBar.material.emissiveIntensity = 0.15;

      group.add(topBar);
      group.add(botBar);
      bars.push({
        top: topBar, bot: botBar,
        phase: i * 0.13 + Math.random() * 0.5,
        freq: 0.8 + Math.random() * 0.5,
      });
    }

    scene.add(group);

    // Subtle floor glow plane
    const planeGeo = new THREE.PlaneGeometry(50, 2);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed, transparent: true, opacity: 0.04,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.y = -0.1;
    scene.add(plane);

    // ── LIGHTING ────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pl1 = new THREE.PointLight(0x06b6d4, 12, 60);
    pl1.position.set(-15, 8, 12);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0x7c3aed, 10, 60);
    pl2.position.set(15, 8, 12);
    scene.add(pl2);

    // ── SCROLL REACTION ─────────────────────
    let scrollProgress = 0;
    const handleScroll = () => {
      scrollProgress = Math.min(1, window.scrollY / 500);
    };
    window.addEventListener('scroll', handleScroll);

    // ── MOUSE INTERACTION ───────────────────
    let mouseNorm = 0;
    const handleMouseMove = (e) => {
      mouseNorm = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── ANIMATE ─────────────────────────────
    let rafId, time = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      time += 0.018;
      const flatten = scrollProgress;

      bars.forEach(({ top, bot, phase, freq }) => {
        const wave1 = Math.sin(time * freq + phase) * 0.9;
        const wave2 = Math.cos(time * 0.6 + phase * 1.4) * 0.5;
        const wave3 = Math.sin(time * 1.2 + phase * 0.8) * 0.25;
        const amplitude = (Math.abs(wave1) + Math.abs(wave2) + Math.abs(wave3)) + 0.3;
        const target = amplitude * 3.5;

        const smoothed = target * (1 - flatten * 0.85) + 0.15;
        top.scale.y += (smoothed - top.scale.y) * 0.1;
        top.position.y = top.scale.y * 0.5;

        // Mirror bottom
        bot.scale.y += (smoothed * 0.45 - bot.scale.y) * 0.1;
        bot.position.y = -bot.scale.y * 0.5;

        // Pulse emissive
        top.material.emissiveIntensity = 0.3 + Math.abs(wave1) * 0.5;
      });

      // Slight group tilt based on mouse
      group.rotation.y += (mouseNorm * 0.08 - group.rotation.y) * 0.04;
      group.rotation.x += (-0.05 - group.rotation.x) * 0.04;

      // Animate lights
      pl1.intensity = 10 + Math.sin(time * 0.7) * 4;
      pl2.intensity = 10 + Math.cos(time * 0.9) * 4;

      renderer.render(scene, camera);
    };
    animate();

    // ── RESIZE ──────────────────────────────
    const handleResize = () => {
      if (!el) return;
      const w = el.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-x-0 bottom-0 h-[300px] pointer-events-none"
      style={{
        maskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
      }}
    />
  );
};

export default AudioWaveform;
