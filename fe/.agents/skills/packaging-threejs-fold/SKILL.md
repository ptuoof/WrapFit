---
name: packaging-threejs-fold
description: >-
  Generate, simulate, and render procedural 3D packaging and boxes in Three.js and React Three Fiber with physics-based folding animations. Use when writing 3D code for box folding, rotating panels/flaps by dimensions (L, W, H), or rendering packaging models.
---

# Packaging 3D Folding Simulation Skill

This skill teaches the agent how to build procedural 3D packaging simulation models using Three.js and GSAP without requiring pre-baked `.glb` or `.gltf` asset files.

## 1. Panel Hierarchy & Pivot Hinge Architecture

When folding a flat dieline into a 3D box, never rotate meshes around their center. Every folding flap must have a **Pivot Group** positioned exactly along its Crease Line (Hinge).

### Hierarchical Tree Pattern:
```text
Base Panel (Center Anchor / Bottom of Box)
├── Front Panel (Rotates +90° along front crease)
│   └── Top Lid (Rotates +90° along front-top crease)
│       └── Tuck Flap (Rotates +90° along lid crease)
├── Back Panel (Rotates -90° along back crease)
├── Left Panel (Rotates +90° along left crease)
│   ├── Left Dust Flap Top (Rotates +90°)
│   └── Left Dust Flap Bottom (Rotates -90°)
└── Right Panel (Rotates -90° along right crease)
    ├── Right Dust Flap Top (Rotates +90°)
    └── Right Dust Flap Bottom (Rotates -90°)
```

## 2. GSAP Timeline Folding Sequence

Use GSAP `timeline` with staggered labels to mimic real physical folding steps:

```typescript
import { gsap } from "gsap";

export function createBoxFoldingTimeline(boxPivots: BoxPivotMap, progressCallback?: (p: number) => void) {
  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: "power2.inOut", duration: 0.8 },
    onUpdate: () => progressCallback?.(tl.progress())
  });

  tl.addLabel("step1_walls")
    .to(boxPivots.front.rotation, { x: Math.PI / 2 }, "step1_walls")
    .to(boxPivots.back.rotation, { x: -Math.PI / 2 }, "step1_walls")
    .to(boxPivots.left.rotation, { z: -Math.PI / 2 }, "step1_walls+=0.1")
    .to(boxPivots.right.rotation, { z: Math.PI / 2 }, "step1_walls+=0.1")

    .addLabel("step2_dust_flaps")
    .to([boxPivots.dustFlapLeftTop.rotation, boxPivots.dustFlapRightTop.rotation], {
      x: Math.PI / 2,
      stagger: 0.1
    }, "step2_dust_flaps")

    .addLabel("step3_lid")
    .to(boxPivots.topLid.rotation, { x: Math.PI / 2 }, "step3_lid")

    .addLabel("step4_tuck_flap")
    .to(boxPivots.tuckFlap.rotation, { x: Math.PI / 2 }, "step4_tuck_flap+=0.2");

  return tl;
}
```

## 3. Dynamic Texture Mapping (2D Canvas to 3D)

To synchronize artwork from the 2D editor to the 3D box:
1. Export the 2D user artwork canvas as an `HTMLCanvasElement` or data URL.
2. Create a `THREE.CanvasTexture(canvas)`.
3. Set `texture.needsUpdate = true` upon user edits.
4. Calculate UV bounding boxes matching the $(L, W, H)$ ratios for each specific panel face.
