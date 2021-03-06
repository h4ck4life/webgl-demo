import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas, useLoader, useFrame } from "react-three-fiber";
import { DoubleSide, RepeatWrapping, sRGBEncoding, LinearFilter } from "three";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  Loader,
  OrbitControls,
  useTexture,
  PerspectiveCamera,
} from "@react-three/drei";

import { vertexShader, fragmentShader } from "./shaders";

import "./style.css";

export default function App() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas style={{ backgroundColor: 'black' }}>
        <Suspense fallback={null}>
          <group>
            <Terrain />
            <Model url="/animated_flag/scene.gltf" />
          </group>
          <ambientLight />
        </Suspense>
        <PerspectiveCamera
          position={[0.5, 0.2, 0.2]}
          near={0.01}
          far={1000}
          //fov={25}
          makeDefault
        />
        <OrbitControls
          maxPolarAngle={(Math.PI / 2) - 0.1}
          minDistance={0.2}
          //autoRotateSpeed={0.7}
          //autoRotate={true}
          maxDistance={1}
          screenSpacePanning={false} />
      </Canvas>
      <Loader />
    </div>
  );
}

function Model({ url }) {
  const group = useRef()
  const { nodes, scene, materials, animations } = useLoader(GLTFLoader, url)
  const actions = useRef()
  const [mixer] = useState(() => new THREE.AnimationMixer())
  useFrame((state, delta) => mixer.update(delta))
  useEffect(() => {
    actions.current = { idle: mixer.clipAction(animations[0], group.current) }
    actions.current.idle.play()
    return () => animations.forEach((clip) => mixer.uncacheClip(clip))
  }, [])
  return (
    <mesh
      position={[0, 0.055, 0.05]}
      rotation={[0, 0, 0]}
      scale={[0.5 / 1024, 0.5 / 1024, 0.5 / 1024]}
    >
      <group ref={group} dispose={null}>
        <primitive
          ref={group}
          name="Object_0"
          object={nodes["RootNode"]}
        />
      </group>
    </mesh>
  )
}

function Terrain() {
  // Load the heightmap image
  const heightMap = useTexture('/keriang_shader.png');
  // Apply some properties to ensure it renders correctly
  heightMap.encoding = sRGBEncoding;
  heightMap.wrapS = RepeatWrapping;
  heightMap.wrapT = RepeatWrapping;
  heightMap.anisotropy = 16;

  // Load the texture map
  const textureMap = useTexture("/keriang.PNG");
  // Apply some properties to ensure it renders correctly
  textureMap.encoding = sRGBEncoding;
  textureMap.wrapS = RepeatWrapping;
  textureMap.wrapT = RepeatWrapping;
  textureMap.anisotropy = 16;
  textureMap.minFilter = LinearFilter;

  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1 / 1024, 1 / 1024, 1 / 1024]}
    >
      <planeBufferGeometry args={[1024, 1024, 256, 256]} />
      <shaderMaterial
        uniforms={{
          // Feed the heightmap
          bumpTexture: { value: heightMap },
          // Feed the scaling constant for the heightmap
          bumpScale: { value: 60 },
          // Feed the texture map
          terrainTexture: { value: textureMap }
        }}
        // Feed the shaders as strings
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={DoubleSide}
      />
    </mesh>
  );
}
