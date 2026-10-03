---
name: r3f-stage-orchestration
description: >-
  Orchestrates Three.js and React Three Fiber (R3F) WebGL stages across Intro, Home Hero,
  and Studio Editor. Handles WebGL context preservation, 60fps performance tuning,
  dynamic 2D-to-3D canvas texture mapping, and dual-mode physical folding interaction.
---

# R3F Packaging Stage Orchestration Skill

This skill guides the agent in structuring high-performance, responsive 3D WebGL scenes for packaging folding, lighting, and texture synchronization.

---

## 1. WebGL Context Sharing & Memory Safety

To avoid WebGL context loss and re-initialization lag when navigating from Intro $\rightarrow$ Home $\rightarrow$ Studio Editor:

1. **Singleton Texture Cache**: Keep a single shared canvas texture ref for artwork.
2. **Device Pixel Ratio (DPR) Clamping**:
   ```typescript
   // Luôn giới hạn DPR tối đa là 2 để chống nghẽn GPU trên điện thoại Retina/OLED
   <Canvas
     dpr={[1, Math.min(window.devicePixelRatio, 2)]}
     gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
     camera={{ position: [0, 150, 300], fov: 45 }}
   >
   ```
3. **Disposal on Unmount**:
   Ensure geometries, materials, and canvas textures invoke `.dispose()` when destroying unneeded meshes.

---

## 2. Dynamic 2D Canvas to 3D Mesh Texture Mapping

When users edit text, logos, or patterns on the 2D dieline canvas (Fabric.js / Paper.js), update the 3D model without full re-render:

```typescript
import * as THREE from 'three';

export function syncCanvasToMaterial(
  sourceCanvas: HTMLCanvasElement,
  targetMaterial: THREE.MeshStandardMaterial
) {
  if (!targetMaterial.map) {
    const texture = new THREE.CanvasTexture(sourceCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    targetMaterial.map = texture;
  }
  targetMaterial.map.needsUpdate = true;
  targetMaterial.needsUpdate = true;
}
```

---

## 3. Dual-Mode Home Hero Packaging Interaction

Home Hero features both a global **Fold Progress Slider (0% - 100%)** and **Direct Click on Box Flaps (Interactive Flaps)**:

```typescript
export interface InteractiveBoxProps {
  progress: number; // 0.0 (phẳng) -> 1.0 (đóng kín)
  activeMaterial: 'kraft' | 'ivory' | 'gold_foil';
  onFlapClick?: (flapId: string) => void;
}
```

- When the user drags the slider, drive all panel pivot hinges proportionally.
- When the user clicks an individual flap (e.g. `top_lid`), toggle an Anime.js / GSAP tween to flip that flap $\pm 90^\circ$ independently, dispatching a tactile audio event.
