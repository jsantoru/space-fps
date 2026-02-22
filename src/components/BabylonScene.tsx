import { useEffect, useRef, useState } from 'react';
import {
  Engine,
  Scene,
  UniversalCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Color4,
  StandardMaterial,
  Color3,
  Ray,
  Mesh,
  LinesMesh
} from '@babylonjs/core';

const BabylonScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Babylon engine
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);

    // Set space-themed background
    scene.clearColor = new Color4(0.01, 0.01, 0.05, 1);

    // Create FPS camera
    const camera = new UniversalCamera(
      'camera',
      new Vector3(0, 2, -10),
      scene
    );
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvasRef.current, true);

    // Camera settings for FPS feel
    camera.speed = 0.3;
    camera.angularSensibility = 2000;
    camera.minZ = 0.1;

    // Enable collision detection
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new Vector3(1, 1, 1);

    // WASD + mouse controls
    camera.keysUp = [87]; // W
    camera.keysDown = [83]; // S
    camera.keysLeft = [65]; // A
    camera.keysRight = [68]; // D

    // Shooting mechanics
    const activeLasers: LinesMesh[] = [];

    const shoot = () => {
      // Create ray from camera
      const ray = camera.getForwardRay(100);

      // Cast ray and check for hits
      const hit = scene.pickWithRay(ray);

      if (hit && hit.pickedPoint) {
        // Create laser beam visual
        const laserPoints = [
          camera.position.clone(),
          hit.pickedPoint.clone()
        ];

        const laser = MeshBuilder.CreateLines(
          'laser',
          { points: laserPoints },
          scene
        );

        // Make laser glow (red for now, can be green/blue for different weapons)
        laser.color = new Color3(1, 0.2, 0.2);
        laser.alpha = 1;

        activeLasers.push(laser);

        // Fade out and dispose laser after a short time
        let alpha = 1;
        const fadeInterval = setInterval(() => {
          alpha -= 0.1;
          laser.alpha = alpha;

          if (alpha <= 0) {
            clearInterval(fadeInterval);
            laser.dispose();
            const index = activeLasers.indexOf(laser);
            if (index > -1) {
              activeLasers.splice(index, 1);
            }
          }
        }, 30);

        // Check if we hit something
        if (hit.pickedMesh && hit.pickedMesh.name.startsWith('enemy')) {
          // Hit an enemy!
          const enemy = hit.pickedMesh as Mesh;

          // Create explosion effect (scale up and fade)
          let scale = 1;
          const explodeInterval = setInterval(() => {
            scale += 0.2;
            enemy.scaling = new Vector3(scale, scale, scale);

            if (enemy.material && 'alpha' in enemy.material) {
              (enemy.material as StandardMaterial).alpha -= 0.15;
            }

            if (scale >= 2) {
              clearInterval(explodeInterval);
              enemy.dispose();

              // Remove from enemies array
              const index = enemies.indexOf(enemy);
              if (index > -1) {
                enemies.splice(index, 1);
              }
            }
          }, 30);

          // Update score
          setScore(prev => prev + 10);
        }
      }
    };

    // Pointer lock and shooting on click
    scene.onPointerDown = (evt) => {
      if (!engine.isPointerLock) {
        canvasRef.current?.requestPointerLock();
      } else if (evt.button === 0) {
        // Left click to shoot
        shoot();
      }
    };

    // Add basic lighting
    const light = new HemisphericLight(
      'light',
      new Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.7;

    // Create space skybox with stars
    const skybox = MeshBuilder.CreateBox('skyBox', { size: 1000 }, scene);
    const skyboxMaterial = new StandardMaterial('skyBox', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.emissiveColor = new Color3(0.01, 0.01, 0.05);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;

    // Enable gravity in the scene
    scene.gravity = new Vector3(0, -0.5, 0);
    scene.collisionsEnabled = true;

    // Create a simple ground platform (space station floor)
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 50, height: 50 },
      scene
    );
    ground.position.y = 0;
    ground.checkCollisions = true;

    // Basic metallic material for space station look
    const groundMaterial = new StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.2, 0.25);
    groundMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
    ground.material = groundMaterial;

    // Add a test box
    const box = MeshBuilder.CreateBox('box', { size: 2 }, scene);
    box.position = new Vector3(0, 1, 5);
    box.checkCollisions = true;

    const boxMaterial = new StandardMaterial('boxMat', scene);
    boxMaterial.diffuseColor = new Color3(0.5, 0.5, 0.6);
    boxMaterial.emissiveColor = new Color3(0.1, 0.1, 0.2);
    box.material = boxMaterial;

    // Add some walls/barriers
    const wall1 = MeshBuilder.CreateBox('wall1', { width: 20, height: 4, depth: 1 }, scene);
    wall1.position = new Vector3(0, 2, 15);
    wall1.checkCollisions = true;

    const wallMaterial = new StandardMaterial('wallMat', scene);
    wallMaterial.diffuseColor = new Color3(0.3, 0.3, 0.35);
    wallMaterial.specularColor = new Color3(0.6, 0.6, 0.6);
    wall1.material = wallMaterial;

    // Add glowing pillars
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const radius = 20;
      const pillar = MeshBuilder.CreateCylinder(
        `pillar${i}`,
        { height: 6, diameter: 1 },
        scene
      );
      pillar.position = new Vector3(
        Math.cos(angle) * radius,
        3,
        Math.sin(angle) * radius
      );
      pillar.checkCollisions = true;

      const pillarMaterial = new StandardMaterial(`pillarMat${i}`, scene);
      pillarMaterial.diffuseColor = new Color3(0.2, 0.4, 0.8);
      pillarMaterial.emissiveColor = new Color3(0.1, 0.2, 0.5);
      pillar.material = pillarMaterial;
    }

    // Add enemy targets (floating droids)
    const enemies: Mesh[] = [];

    const createEnemy = (position: Vector3, index: number) => {
      // Create enemy body (sphere for now, can be more complex later)
      const enemy = MeshBuilder.CreateSphere(
        `enemy${index}`,
        { diameter: 1.5 },
        scene
      );
      enemy.position = position;

      // Enemy material - glowing red/orange
      const enemyMaterial = new StandardMaterial(`enemyMat${index}`, scene);
      enemyMaterial.diffuseColor = new Color3(0.8, 0.2, 0.1);
      enemyMaterial.emissiveColor = new Color3(0.5, 0.1, 0);
      enemy.material = enemyMaterial;

      // Add some details - could be weapon or sensor
      const detail = MeshBuilder.CreateBox(
        `enemyDetail${index}`,
        { width: 0.3, height: 0.3, depth: 0.8 },
        scene
      );
      detail.parent = enemy;
      detail.position = new Vector3(0, 0, 0.8);
      detail.material = enemyMaterial;

      enemies.push(enemy);
      return enemy;
    };

    // Create several enemies around the arena
    createEnemy(new Vector3(5, 3, 10), 0);
    createEnemy(new Vector3(-5, 3, 10), 1);
    createEnemy(new Vector3(10, 4, 5), 2);
    createEnemy(new Vector3(-10, 4, 5), 3);
    createEnemy(new Vector3(0, 3, 20), 4);

    // Simple enemy floating animation
    let time = 0;
    scene.registerBeforeRender(() => {
      time += 0.01;
      enemies.forEach((enemy, index) => {
        enemy.position.y += Math.sin(time + index) * 0.003;
        enemy.rotation.y += 0.01;
      });
    });

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100vh',
          display: 'block',
          outline: 'none',
        }}
      />

      {/* HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          color: 'white',
          fontFamily: 'monospace',
        }}
      >
        {/* Crosshair */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              width: '100%',
              height: '2px',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              transform: 'translateY(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '0',
              width: '2px',
              height: '100%',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        {/* Score Display */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '24px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          SCORE: {score}
        </div>

        {/* Instructions */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          WASD: Move | Mouse: Look | Click: Shoot
        </div>
      </div>
    </div>
  );
};

export default BabylonScene;
