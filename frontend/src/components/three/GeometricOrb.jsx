import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GeometricOrb = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const SIZE = 88;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    camera.position.z = 5.5;

    // ── CORE ICOSAHEDRON ──────────────────────
    const innerGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 1.0,
      roughness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    const core = new THREE.Mesh(innerGeo, innerMat);
    scene.add(core);

    // Crystal wireframe overlay on core
    const edgesGeo = new THREE.EdgesGeometry(innerGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
    core.add(new THREE.LineSegments(edgesGeo, edgesMat));

    // ── OUTER ORBIT RING 1 ─────────────────────
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.018, 8, 160),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.5, transparent: true, opacity: 0.7 })
    );
    scene.add(ring1);

    // ── OUTER ORBIT RING 2 ─────────────────────
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.012, 8, 120),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x7c3aed, emissiveIntensity: 1.8, transparent: true, opacity: 0.6 })
    );
    ring2.rotation.x = Math.PI / 3;
    scene.add(ring2);

    // ── OUTER WIREFRAME SHELL ─────────────────
    const outerGeo = new THREE.IcosahedronGeometry(2.0, 1);
    const outerEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(outerGeo),
      new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.08 })
    );
    scene.add(outerEdges);

    // ── SPARK PARTICLES ────────────────────────
    const sparkCount = 40;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = 1.9 + Math.random() * 0.4;
      sparkPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      sparkPos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      sparkPos[i * 3 + 2] = r * Math.cos(theta);
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.05, transparent: true, opacity: 0.9 });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    // ── LIGHTING ─────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const l1 = new THREE.PointLight(0xffffff, 15, 30);
    l1.position.set(4, 4, 4);
    scene.add(l1);
    const l2 = new THREE.PointLight(0x7c3aed, 20, 25);
    l2.position.set(-4, -3, 3);
    scene.add(l2);
    const l3 = new THREE.PointLight(0xf59e0b, 12, 20);
    l3.position.set(0, 4, -4);
    scene.add(l3);

    // ── INTERACTION ──────────────────────────
    let hovered = false;
    el.addEventListener('mouseenter', () => (hovered = true));
    el.addEventListener('mouseleave', () => (hovered = false));

    // ── ANIMATE ──────────────────────────────
    let rafId, time = 0;
    let speed = 0.008, targetSpeed = 0.008;
    let scaleFactor = 1, targetScale = 1;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      time += 0.016;

      targetSpeed = hovered ? 0.045 : 0.008;
      targetScale = hovered ? 1.15 : 1.0;
      speed += (targetSpeed - speed) * 0.06;
      scaleFactor += (targetScale - scaleFactor) * 0.06;

      core.rotation.x += speed;
      core.rotation.y += speed * 1.3;
      outerEdges.rotation.x -= speed * 0.5;
      outerEdges.rotation.y += speed * 0.35;

      // Orbit rings animated independently
      ring1.rotation.z += speed * 0.8;
      ring1.rotation.y += speed * 0.3;
      ring2.rotation.x += speed * 0.6;
      ring2.rotation.z -= speed * 0.4;

      sparks.rotation.y += speed * 0.4;
      sparks.rotation.x += speed * 0.2;

      core.scale.setScalar(scaleFactor);

      // Pulse emissive on hover
      innerMat.emissiveIntensity = 0.35 + Math.sin(time * 2.5) * 0.2 + (hovered ? 0.5 : 0);
      ring1.material.emissiveIntensity = 1.2 + Math.sin(time * 1.8) * 0.6;
      ring2.material.emissiveIntensity = 1.5 + Math.cos(time * 2.1) * 0.5;
      sparkMat.opacity = 0.7 + Math.sin(time * 3) * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-[88px] h-[88px] flex-shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:shadow-[0_0_50px_rgba(245,158,11,0.6)]"
    />
  );
};

export default GeometricOrb;
