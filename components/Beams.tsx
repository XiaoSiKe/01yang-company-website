'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type UniformValue = THREE.IUniform<unknown> | unknown;

type ExtendMaterialConfig = {
  header: string;
  vertexHeader?: string;
  fragmentHeader?: string;
  material?: THREE.MeshPhysicalMaterialParameters & { fog?: boolean };
  uniforms?: Record<string, UniformValue>;
  vertex?: Record<string, string>;
  fragment?: Record<string, string>;
};

type ShaderWithDefines = THREE.ShaderLibShader & {
  defines?: Record<string, string | number | boolean>;
};

export type BeamsProps = {
  beamWidth?: number;
  beamHeight?: number;
  beamNumber?: number;
  lightColor?: string;
  speed?: number;
  noiseIntensity?: number;
  scale?: number;
  rotation?: number;
};

const noise = `
float random (in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise (in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) +
    (c - a) * u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy,Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x,Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
  float n_xyz = mix(n_yz.x,n_yz.y,fade_xyz.x);
  return 2.2 * n_xyz;
}
`;

function extendMaterial<T extends THREE.Material = THREE.Material>(
  BaseMaterial: new (params?: THREE.MaterialParameters) => T,
  config: ExtendMaterialConfig,
) {
  const physical = THREE.ShaderLib.physical as ShaderWithDefines;
  const uniforms = THREE.UniformsUtils.clone(physical.uniforms) as Record<
    string,
    THREE.IUniform
  >;
  const defaults = new BaseMaterial(config.material ?? {}) as T & {
    color?: THREE.Color;
    roughness?: number;
    metalness?: number;
    envMap?: THREE.Texture;
    envMapIntensity?: number;
  };

  if (defaults.color) uniforms.diffuse.value = defaults.color;
  if ('roughness' in defaults) uniforms.roughness.value = defaults.roughness;
  if ('metalness' in defaults) uniforms.metalness.value = defaults.metalness;
  if ('envMap' in defaults) uniforms.envMap.value = defaults.envMap;
  if ('envMapIntensity' in defaults) {
    uniforms.envMapIntensity.value = defaults.envMapIntensity;
  }

  Object.entries(config.uniforms ?? {}).forEach(([key, uniform]) => {
    uniforms[key] =
      uniform !== null && typeof uniform === 'object' && 'value' in uniform
        ? (uniform as THREE.IUniform)
        : { value: uniform };
  });

  let vertexShader = `${config.header}\n${config.vertexHeader ?? ''}\n${physical.vertexShader}`;
  let fragmentShader = `${config.header}\n${config.fragmentHeader ?? ''}\n${physical.fragmentShader}`;

  Object.entries(config.vertex ?? {}).forEach(([include, code]) => {
    vertexShader = vertexShader.replace(include, `${include}\n${code}`);
  });
  Object.entries(config.fragment ?? {}).forEach(([include, code]) => {
    fragmentShader = fragmentShader.replace(include, `${include}\n${code}`);
  });

  const material = new THREE.ShaderMaterial({
    defines: { ...(physical.defines ?? {}) },
    uniforms,
    vertexShader,
    fragmentShader,
    lights: true,
    fog: Boolean(config.material?.fog),
  });

  defaults.dispose();
  return material;
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

function useInViewport(elementRef: React.RefObject<HTMLDivElement | null>) {
  const [isInViewport, setIsInViewport] = useState(true);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { rootMargin: '120px 0px' },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef]);

  return isInViewport;
}

const CanvasWrapper: FC<{
  children: ReactNode;
  reducedMotion: boolean;
  isInViewport: boolean;
}> = ({ children, reducedMotion, isInViewport }) => (
  <Canvas
    dpr={[1, 1.5]}
    frameloop={reducedMotion || !isInViewport ? 'demand' : 'always'}
    gl={{ antialias: true, powerPreference: 'high-performance' }}
    camera={{ position: [0, 0, 20], fov: 30 }}
    className="beams-canvas"
  >
    {children}
  </Canvas>
);

function hexToNormalizedRGB(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    Number.parseInt(clean.slice(0, 2), 16) / 255,
    Number.parseInt(clean.slice(2, 4), 16) / 255,
    Number.parseInt(clean.slice(4, 6), 16) / 255,
  ];
}

function createStackedPlanesBufferGeometry(
  count: number,
  width: number,
  height: number,
  spacing: number,
  heightSegments: number,
) {
  const geometry = new THREE.BufferGeometry();
  const vertices = count * (heightSegments + 1) * 2;
  const faces = count * heightSegments * 2;
  const positions = new Float32Array(vertices * 3);
  const indices = new Uint32Array(faces * 3);
  const uvs = new Float32Array(vertices * 2);
  let vertexOffset = 0;
  let indexOffset = 0;
  let uvOffset = 0;
  const totalWidth = count * width + (count - 1) * spacing;
  const xOffsetBase = -totalWidth / 2;

  for (let beam = 0; beam < count; beam += 1) {
    const xOffset = xOffsetBase + beam * (width + spacing);
    const uvXOffset = Math.random() * 300;
    const uvYOffset = Math.random() * 300;

    for (let segment = 0; segment <= heightSegments; segment += 1) {
      const y = height * (segment / heightSegments - 0.5);
      positions.set([xOffset, y, 0, xOffset + width, y, 0], vertexOffset * 3);
      const uvY = segment / heightSegments;
      uvs.set([uvXOffset, uvY + uvYOffset, uvXOffset + 1, uvY + uvYOffset], uvOffset);

      if (segment < heightSegments) {
        const a = vertexOffset;
        const b = vertexOffset + 1;
        const c = vertexOffset + 2;
        const d = vertexOffset + 3;
        indices.set([a, b, c, c, b, d], indexOffset);
        indexOffset += 6;
      }

      vertexOffset += 2;
      uvOffset += 4;
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

const MergedPlanes = forwardRef<
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>,
  {
    material: THREE.ShaderMaterial;
    width: number;
    count: number;
    height: number;
    reducedMotion: boolean;
  }
>(({ material, width, count, height, reducedMotion }, forwardedRef) => {
  const meshRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>(null!);
  useImperativeHandle(forwardedRef, () => meshRef.current);

  const geometry = useMemo(
    () => createStackedPlanesBufferGeometry(count, width, height, 0, 100),
    [count, height, width],
  );

  useFrame((_, delta) => {
    if (!reducedMotion) {
      meshRef.current.material.uniforms.time.value += 0.1 * delta;
    }
  });

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
});
MergedPlanes.displayName = 'MergedPlanes';

const DirectionalLight: FC<{
  position: [number, number, number];
  color: string;
}> = ({ position, color }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null!);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;

    const camera = light.shadow.camera as THREE.OrthographicCamera;
    camera.top = 24;
    camera.bottom = -24;
    camera.left = -24;
    camera.right = 24;
    camera.far = 64;
    light.shadow.bias = -0.004;
  }, []);

  return (
    <directionalLight
      ref={lightRef}
      color={color}
      intensity={1}
      position={position}
    />
  );
};

export default function Beams({
  beamWidth = 2,
  beamHeight = 15,
  beamNumber = 12,
  lightColor = '#ffffff',
  speed = 2,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 0,
}: BeamsProps) {
  const meshRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>(null!);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isInViewport = useInViewport(containerRef);

  const beamMaterial = useMemo(
    () =>
      extendMaterial(THREE.MeshStandardMaterial, {
        header: `
varying vec3 vEye;
varying float vNoise;
varying vec2 vUv;
varying vec3 vPosition;
uniform float time;
uniform float uSpeed;
uniform float uNoiseIntensity;
uniform float uScale;
${noise}`,
        vertexHeader: `
float getPos(vec3 pos) {
  vec3 noisePos = vec3(pos.x * 0., pos.y - uv.y, pos.z + time * uSpeed * 3.) * uScale;
  return cnoise(noisePos);
}
vec3 getCurrentPos(vec3 pos) {
  vec3 newpos = pos;
  newpos.z += getPos(pos);
  return newpos;
}
vec3 getNormal(vec3 pos) {
  vec3 curpos = getCurrentPos(pos);
  vec3 nextposX = getCurrentPos(pos + vec3(0.01, 0.0, 0.0));
  vec3 nextposZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0));
  vec3 tangentX = normalize(nextposX - curpos);
  vec3 tangentZ = normalize(nextposZ - curpos);
  return normalize(cross(tangentZ, tangentX));
}`,
        vertex: {
          '#include <begin_vertex>': 'transformed.z += getPos(transformed.xyz);',
          '#include <beginnormal_vertex>': 'objectNormal = getNormal(position.xyz);',
        },
        fragment: {
          '#include <dithering_fragment>': `
float randomNoise = noise(gl_FragCoord.xy);
gl_FragColor.rgb -= randomNoise / 15. * uNoiseIntensity;`,
        },
        material: { fog: true },
        uniforms: {
          diffuse: new THREE.Color(...hexToNormalizedRGB('#000000')),
          time: { value: 0 },
          roughness: 0.3,
          metalness: 0.3,
          uSpeed: { value: speed },
          envMapIntensity: 10,
          uNoiseIntensity: noiseIntensity,
          uScale: scale,
        },
      }),
    [noiseIntensity, scale, speed],
  );

  useEffect(() => () => beamMaterial.dispose(), [beamMaterial]);

  return (
    <div ref={containerRef} className="beams-root">
      <CanvasWrapper reducedMotion={reducedMotion} isInViewport={isInViewport}>
        <group rotation={[0, 0, THREE.MathUtils.degToRad(rotation)]}>
          <MergedPlanes
            ref={meshRef}
            material={beamMaterial}
            count={beamNumber}
            width={beamWidth}
            height={beamHeight}
            reducedMotion={reducedMotion}
          />
          <DirectionalLight color={lightColor} position={[0, 3, 10]} />
        </group>
        <ambientLight intensity={1} />
        <color attach="background" args={['#000000']} />
      </CanvasWrapper>
    </div>
  );
}
