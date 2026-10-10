"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { BoxDimensions } from "@wrapfit/shared";

interface FoldingBox3DProps {
  dimensions: BoxDimensions;
  foldProgress: number; // 0 (flat 2D) to 1 (fully folded 3D)
}

export const FoldingBox3D: React.FC<FoldingBox3DProps> = ({ dimensions, foldProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#FDFBF7");

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(200, 250, 300);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(100, 200, 150);
    scene.add(dirLight);

    // Base Box Panel Pivot (Hierarchical Folding)
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    // Animate
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [dimensions]);

  return (
    <div className="relative w-full h-[500px] rounded-2xl border border-stone-200 overflow-hidden bg-paper-ivory">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur px-4 py-2 rounded-xl flex items-center justify-between text-xs text-stone-600 border border-stone-200">
        <span>Gập hộp: {Math.round(foldProgress * 100)}%</span>
        <span>Kích thước: {dimensions.length} x {dimensions.width} x {dimensions.height} mm</span>
      </div>
    </div>
  );
};
