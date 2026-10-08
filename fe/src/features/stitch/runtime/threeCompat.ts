/**
 * Makes Stitch scenes written against three r125/r128 (CDN builds) render the same
 * on the npm `three` the app ships.
 *
 * What changed since r128 and how this file compensates:
 * - Color management (r152): sRGB inputs are now linearised. We switch it off for
 *   the scene's lifetime and render to a linear output, as r128 did by default.
 * - Lighting (r155): legacy light units scaled every light by PI and ignored
 *   distance falloff when `distance` was 0. Lights get their intensity multiplied
 *   by PI and `decay` set to 0 so they keep the r128 look.
 * - `*BufferGeometry` aliases (removed in r144) map to the current geometries.
 */

type ThreeNamespace = typeof import('three');

type LightCtor = new (...args: never[]) => { intensity: number; decay?: number };

export interface ThreeCompatHandle<T> {
  three: T;
  dispose(): void;
}

const LINEAR_ENCODING = 3000;
const SRGB_ENCODING = 3001;

const LEGACY_GEOMETRY_ALIASES = [
  'Box',
  'Circle',
  'Cone',
  'Cylinder',
  'Dodecahedron',
  'Extrude',
  'Icosahedron',
  'Lathe',
  'Octahedron',
  'Plane',
  'Polyhedron',
  'Ring',
  'Shape',
  'Sphere',
  'Tetrahedron',
  'Torus',
  'TorusKnot',
  'Tube',
] as const;

export function createThreeCompat<T extends object>(namespace: T): ThreeCompatHandle<T> {
  const THREE = namespace as unknown as ThreeNamespace;
  const renderers = new Set<InstanceType<ThreeNamespace['WebGLRenderer']>>();
  const previousColorManagement = THREE.ColorManagement.enabled;
  THREE.ColorManagement.enabled = false;

  class CompatWebGLRenderer extends THREE.WebGLRenderer {
    constructor(parameters?: ConstructorParameters<ThreeNamespace['WebGLRenderer']>[0]) {
      super(parameters);
      this.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderers.add(this);
    }

    /** r128 API (removed in r162): LinearEncoding = 3000, sRGBEncoding = 3001. */
    get outputEncoding() {
      return this.outputColorSpace === THREE.SRGBColorSpace ? SRGB_ENCODING : LINEAR_ENCODING;
    }

    set outputEncoding(encoding: number) {
      this.outputColorSpace = encoding === SRGB_ENCODING ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
    }
  }

  const legacyLight = <C extends LightCtor>(Base: C, punctual: boolean): C =>
    class extends (Base as unknown as new (...args: unknown[]) => { intensity: number; decay?: number }) {
      constructor(...args: unknown[]) {
        super(...args);
        this.intensity *= Math.PI;
        if (punctual) this.decay = 0;
      }
    } as unknown as C;

  const compat: Record<string, unknown> = {
    ...THREE,
    WebGLRenderer: CompatWebGLRenderer,
    AmbientLight: legacyLight(THREE.AmbientLight as unknown as LightCtor, false),
    HemisphereLight: legacyLight(THREE.HemisphereLight as unknown as LightCtor, false),
    DirectionalLight: legacyLight(THREE.DirectionalLight as unknown as LightCtor, false),
    PointLight: legacyLight(THREE.PointLight as unknown as LightCtor, true),
    SpotLight: legacyLight(THREE.SpotLight as unknown as LightCtor, true),
    // r128 constants that no longer exist; the renderer above maps them to colour spaces.
    sRGBEncoding: SRGB_ENCODING,
    LinearEncoding: LINEAR_ENCODING,
  };
  for (const name of LEGACY_GEOMETRY_ALIASES) {
    compat[`${name}BufferGeometry`] = (THREE as unknown as Record<string, unknown>)[`${name}Geometry`];
  }

  return {
    three: compat as unknown as T,
    dispose() {
      for (const renderer of renderers) {
        renderer.setAnimationLoop(null);
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
      renderers.clear();
      THREE.ColorManagement.enabled = previousColorManagement;
    },
  };
}
