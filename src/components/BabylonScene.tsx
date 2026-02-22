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
  LinesMesh,
  TransformNode
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
    camera.speed = 6.5; // Much faster WASD movement
    camera.angularSensibility = 800; // Lower value = higher sensitivity
    camera.minZ = 0.1;

    // Disable inertia for tight, responsive controls
    camera.inertia = 0;

    // Enable collision detection
    camera.checkCollisions = true;
    camera.applyGravity = false; // Disable gravity following camera pitch
    camera.ellipsoid = new Vector3(1, 1, 1);

    // Lock movement to horizontal plane only (don't move up/down when looking up/down)
    camera.lockedTarget = null;

    // WASD + mouse controls
    camera.keysUp = [87]; // W
    camera.keysDown = [83]; // S
    camera.keysLeft = [65]; // A
    camera.keysRight = [68]; // D

    // Create weapon (parented to camera) - Tactical Blaster Rifle
    const weaponRoot = new TransformNode('weaponRoot', scene);
    weaponRoot.parent = camera;
    weaponRoot.position = new Vector3(0.3, -0.3, 0.7);
    weaponRoot.rotation.y = Math.PI / 2; // Rotate 90 degrees to point forward

    // Materials - High detail tactical look
    const weaponBlack = new StandardMaterial('weaponBlack', scene);
    weaponBlack.diffuseColor = new Color3(0.08, 0.08, 0.09);
    weaponBlack.specularColor = new Color3(0.5, 0.5, 0.5);
    weaponBlack.specularPower = 48;

    const weaponMetal = new StandardMaterial('weaponMetal', scene);
    weaponMetal.diffuseColor = new Color3(0.25, 0.25, 0.27);
    weaponMetal.specularColor = new Color3(0.7, 0.7, 0.7);
    weaponMetal.specularPower = 64;

    const scopeMat = new StandardMaterial('scopeMat', scene);
    scopeMat.diffuseColor = new Color3(0.15, 0.15, 0.17);
    scopeMat.specularColor = new Color3(0.4, 0.4, 0.4);
    scopeMat.specularPower = 32;

    const scopeLens = new StandardMaterial('scopeLens', scene);
    scopeLens.diffuseColor = new Color3(0.05, 0.05, 0.15);
    scopeLens.emissiveColor = new Color3(0.1, 0.15, 0.4);
    scopeLens.alpha = 0.8;

    const glowBlue = new StandardMaterial('glowBlue', scene);
    glowBlue.emissiveColor = new Color3(0.15, 0.4, 1);
    glowBlue.diffuseColor = new Color3(0.1, 0.25, 0.6);

    const gripMat = new StandardMaterial('gripMat', scene);
    gripMat.diffuseColor = new Color3(0.22, 0.2, 0.18);

    // Main barrel - long tactical barrel with details
    const barrelMain = MeshBuilder.CreateCylinder(
      'barrelMain',
      { height: 0.8, diameter: 0.06, tessellation: 16 },
      scene
    );
    barrelMain.rotation.z = Math.PI / 2;
    barrelMain.position = new Vector3(0.4, 0.05, 0);
    barrelMain.parent = weaponRoot;
    barrelMain.material = weaponBlack;

    // Barrel shroud with vents
    const barrelShroud = MeshBuilder.CreateCylinder(
      'barrelShroud',
      { height: 0.65, diameter: 0.1, tessellation: 16 },
      scene
    );
    barrelShroud.rotation.z = Math.PI / 2;
    barrelShroud.position = new Vector3(0.25, 0.05, 0);
    barrelShroud.parent = weaponRoot;
    barrelShroud.material = weaponMetal;

    // Barrel vents (cooling vents like Star Wars)
    for (let i = 0; i < 8; i++) {
      const vent = MeshBuilder.CreateBox(
        `vent${i}`,
        { width: 0.04, height: 0.015, depth: 0.11 },
        scene
      );
      vent.position = new Vector3(0.15 + i * 0.08, 0.1, 0);
      vent.parent = weaponRoot;
      vent.material = weaponBlack;
    }

    // Muzzle brake with glow
    const barrel = MeshBuilder.CreateCylinder(
      'barrel',
      { height: 0.08, diameter: 0.08, tessellation: 12 },
      scene
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position = new Vector3(0.82, 0.05, 0);
    barrel.parent = weaponRoot;
    barrel.material = weaponMetal;

    // Glowing muzzle interior
    const muzzleGlow = MeshBuilder.CreateCylinder(
      'muzzleGlow',
      { height: 0.05, diameter: 0.05, tessellation: 10 },
      scene
    );
    muzzleGlow.rotation.z = Math.PI / 2;
    muzzleGlow.position = new Vector3(0.85, 0.05, 0);
    muzzleGlow.parent = weaponRoot;
    muzzleGlow.material = glowBlue;

    // Upper receiver
    const upperReceiver = MeshBuilder.CreateBox(
      'upperReceiver',
      { width: 0.35, height: 0.08, depth: 0.12 },
      scene
    );
    upperReceiver.position = new Vector3(-0.05, 0.08, 0);
    upperReceiver.parent = weaponRoot;
    upperReceiver.material = weaponBlack;

    // Lower receiver
    const lowerReceiver = MeshBuilder.CreateBox(
      'lowerReceiver',
      { width: 0.25, height: 0.12, depth: 0.11 },
      scene
    );
    lowerReceiver.position = new Vector3(-0.1, 0, 0);
    lowerReceiver.parent = weaponRoot;
    lowerReceiver.material = weaponBlack;

    // Top picatinny rail
    const topRail = MeshBuilder.CreateBox(
      'topRail',
      { width: 0.4, height: 0.02, depth: 0.08 },
      scene
    );
    topRail.position = new Vector3(0.05, 0.13, 0);
    topRail.parent = weaponRoot;
    topRail.material = weaponMetal;

    // Rail notches
    for (let i = 0; i < 12; i++) {
      const notch = MeshBuilder.CreateBox(
        `notch${i}`,
        { width: 0.015, height: 0.025, depth: 0.06 },
        scene
      );
      notch.position = new Vector3(-0.15 + i * 0.032, 0.145, 0);
      notch.parent = weaponRoot;
      notch.material = weaponBlack;
    }

    // Scope - main body
    const scopeBody = MeshBuilder.CreateCylinder(
      'scopeBody',
      { height: 0.25, diameter: 0.08, tessellation: 16 },
      scene
    );
    scopeBody.rotation.z = Math.PI / 2;
    scopeBody.position = new Vector3(0.1, 0.22, 0);
    scopeBody.parent = weaponRoot;
    scopeBody.material = scopeMat;

    // Scope front lens
    const scopeFront = MeshBuilder.CreateCylinder(
      'scopeFront',
      { height: 0.03, diameter: 0.065, tessellation: 12 },
      scene
    );
    scopeFront.rotation.z = Math.PI / 2;
    scopeFront.position = new Vector3(0.24, 0.22, 0);
    scopeFront.parent = weaponRoot;
    scopeFront.material = scopeLens;

    // Scope rear lens (glowing)
    const scopeRear = MeshBuilder.CreateCylinder(
      'scopeRear',
      { height: 0.03, diameter: 0.065, tessellation: 12 },
      scene
    );
    scopeRear.rotation.z = Math.PI / 2;
    scopeRear.position = new Vector3(-0.04, 0.22, 0);
    scopeRear.parent = weaponRoot;
    scopeRear.material = scopeLens;

    // Scope mount rings
    const mount1 = MeshBuilder.CreateTorus(
      'mount1',
      { diameter: 0.09, thickness: 0.015, tessellation: 16 },
      scene
    );
    mount1.rotation.y = Math.PI / 2;
    mount1.position = new Vector3(0.15, 0.22, 0);
    mount1.parent = weaponRoot;
    mount1.material = weaponMetal;

    const mount2 = MeshBuilder.CreateTorus(
      'mount2',
      { diameter: 0.09, thickness: 0.015, tessellation: 16 },
      scene
    );
    mount2.rotation.y = Math.PI / 2;
    mount2.position = new Vector3(0.0, 0.22, 0);
    mount2.parent = weaponRoot;
    mount2.material = weaponMetal;

    // Magazine
    const magazine = MeshBuilder.CreateBox(
      'magazine',
      { width: 0.08, height: 0.25, depth: 0.08 },
      scene
    );
    magazine.position = new Vector3(-0.08, -0.1, 0);
    magazine.parent = weaponRoot;
    magazine.material = weaponBlack;

    // Magazine energy indicator
    const magEnergy = MeshBuilder.CreateBox(
      'magEnergy',
      { width: 0.05, height: 0.15, depth: 0.02 },
      scene
    );
    magEnergy.position = new Vector3(-0.08, -0.1, 0.042);
    magEnergy.parent = weaponRoot;
    magEnergy.material = glowBlue;

    // Trigger guard
    const triggerGuard = MeshBuilder.CreateTorus(
      'triggerGuard',
      { diameter: 0.13, thickness: 0.015, tessellation: 16 },
      scene
    );
    triggerGuard.rotation.z = Math.PI / 2;
    triggerGuard.position = new Vector3(-0.12, 0, 0);
    triggerGuard.parent = weaponRoot;
    triggerGuard.material = weaponMetal;

    // Pistol grip
    const grip = MeshBuilder.CreateBox(
      'grip',
      { width: 0.06, height: 0.28, depth: 0.08 },
      scene
    );
    grip.position = new Vector3(-0.15, -0.08, 0);
    grip.rotation.z = 0.15;
    grip.parent = weaponRoot;
    grip.material = gripMat;

    // Stock connector
    const stockConnector = MeshBuilder.CreateCylinder(
      'stockConnector',
      { height: 0.12, diameter: 0.04, tessellation: 12 },
      scene
    );
    stockConnector.position = new Vector3(-0.25, 0.04, 0);
    stockConnector.parent = weaponRoot;
    stockConnector.material = weaponMetal;

    // Compact stock
    const stock = MeshBuilder.CreateBox(
      'stock',
      { width: 0.08, height: 0.18, depth: 0.06 },
      scene
    );
    stock.position = new Vector3(-0.32, 0.04, 0);
    stock.parent = weaponRoot;
    stock.material = weaponBlack;

    // Charging handle
    const chargingHandle = MeshBuilder.CreateBox(
      'chargingHandle',
      { width: 0.04, height: 0.02, depth: 0.025 },
      scene
    );
    chargingHandle.position = new Vector3(-0.05, 0.12, 0.065);
    chargingHandle.parent = weaponRoot;
    chargingHandle.material = weaponMetal;

    // Side detail plates
    const sidePlateL = MeshBuilder.CreateBox(
      'sidePlateL',
      { width: 0.2, height: 0.08, depth: 0.005 },
      scene
    );
    sidePlateL.position = new Vector3(0, 0.05, 0.06);
    sidePlateL.parent = weaponRoot;
    sidePlateL.material = weaponMetal;

    const sidePlateR = MeshBuilder.CreateBox(
      'sidePlateR',
      { width: 0.2, height: 0.08, depth: 0.005 },
      scene
    );
    sidePlateR.position = new Vector3(0, 0.05, -0.06);
    sidePlateR.parent = weaponRoot;
    sidePlateR.material = weaponMetal;

    // Hands positioned on weapon
    const armMat = new StandardMaterial('armMat', scene);
    armMat.diffuseColor = new Color3(0.72, 0.65, 0.58);

    // Left hand on foregrip
    const handLeft = MeshBuilder.CreateBox(
      'handLeft',
      { width: 0.08, height: 0.11, depth: 0.09 },
      scene
    );
    handLeft.position = new Vector3(0.15, -0.05, -0.08);
    handLeft.parent = weaponRoot;
    handLeft.material = armMat;

    // Right hand on grip
    const handRight = MeshBuilder.CreateBox(
      'handRight',
      { width: 0.08, height: 0.11, depth: 0.09 },
      scene
    );
    handRight.position = new Vector3(-0.16, -0.12, 0);
    handRight.parent = weaponRoot;
    handRight.material = armMat;

    // Store weapon state for animations
    const weaponState = {
      isRecoiling: false,
      originalPos: weaponRoot.position.clone(),
      originalRotation: weaponRoot.rotation.clone(),
    };

    // Audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create laser sound effect
    const playLaserSound = () => {
      try {
        const now = audioContext.currentTime;

        // Oscillator for the laser tone
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Laser sound: sweep from high to medium frequency
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        osc.type = 'square';

        // Volume envelope
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
      } catch (e) {
        // Audio context might not be available
      }
    };

    // Create explosion sound effect
    const playExplosionSound = () => {
      try {
        const now = audioContext.currentTime;

        // Explosion: white noise burst
        const bufferSize = audioContext.sampleRate * 0.3;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noiseNode = audioContext.createBufferSource();
        noiseNode.buffer = noiseBuffer;

        const gainEnv = audioContext.createGain();
        noiseNode.connect(gainEnv);
        gainEnv.connect(audioContext.destination);

        // Explosion envelope
        gainEnv.gain.setValueAtTime(0.3, now);
        gainEnv.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        noiseNode.start(now);
        noiseNode.stop(now + 0.3);
      } catch (e) {
        // Audio context might not be available
      }
    };

    // Shooting mechanics
    const activeLasers: LinesMesh[] = [];

    const shoot = () => {
      // Play laser sound
      playLaserSound();

      // Weapon recoil animation
      if (!weaponState.isRecoiling) {
        weaponState.isRecoiling = true;

        // Recoil back
        const recoilDistance = 0.1;
        const recoilDuration = 100; // ms
        const startTime = Date.now();
        const startPos = weaponRoot.position.clone();

        const recoilAnimInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / recoilDuration, 1);

          // Push back then return
          const recoilAmount = Math.sin(progress * Math.PI) * recoilDistance;
          weaponRoot.position.z = startPos.z - recoilAmount;

          if (progress >= 1) {
            clearInterval(recoilAnimInterval);
            weaponRoot.position = startPos;
            weaponState.isRecoiling = false;
          }
        }, 16);
      }

      // Create muzzle flash at barrel tip
      const muzzleFlash = MeshBuilder.CreateSphere(
        'muzzleFlash',
        { diameter: 0.3 },
        scene
      );

      // Position at barrel tip relative to world
      const barrelTipWorldPos = barrel.getAbsolutePosition();
      const offset = Vector3.Forward().scale(0.5);
      muzzleFlash.position = barrelTipWorldPos.add(offset);

      const flashMat = new StandardMaterial('flashMat', scene);
      flashMat.emissiveColor = new Color3(1, 0.8, 0.3);
      flashMat.diffuseColor = new Color3(1, 0.5, 0);
      muzzleFlash.material = flashMat;

      // Fade and scale muzzle flash
      let flashAlpha = 1;
      let flashScale = 1;
      const flashInterval = setInterval(() => {
        flashAlpha -= 0.15;
        flashScale += 0.08;

        muzzleFlash.alpha = flashAlpha;
        muzzleFlash.scaling = new Vector3(flashScale, flashScale, flashScale);

        if (flashAlpha <= 0) {
          clearInterval(flashInterval);
          muzzleFlash.dispose();
        }
      }, 16);

      // Create ray from camera
      const ray = camera.getForwardRay(100);

      // Cast ray and check for hits
      const hit = scene.pickWithRay(ray);

      // Get barrel tip position for laser origin
      const barrelTipPos = barrel.getAbsolutePosition().add(
        camera.getDirection(Vector3.Forward()).scale(0.1)
      );

      // Determine laser end point (hit point or max distance)
      const laserEndPoint = hit?.pickedPoint
        ? hit.pickedPoint.clone()
        : barrelTipPos.add(camera.getDirection(Vector3.Forward()).scale(100));

      // Create laser beam visual from barrel tip
      const laserPoints = [
        barrelTipPos,
        laserEndPoint
      ];

      if (true) { // Always create laser visual

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

          // Play explosion sound
          playExplosionSound();

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

    // Enable gravity in the scene (reduced for faster movement)
    scene.gravity = new Vector3(0, -0.05, 0);
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

    // Create walls around the arena to make an enclosed room
    const wallMaterial = new StandardMaterial('wallMat', scene);
    wallMaterial.diffuseColor = new Color3(0.3, 0.3, 0.35);
    wallMaterial.specularColor = new Color3(0.6, 0.6, 0.6);

    // North wall
    const wallNorth = MeshBuilder.CreateBox('wallNorth', { width: 50, height: 8, depth: 1 }, scene);
    wallNorth.position = new Vector3(0, 4, 25);
    wallNorth.checkCollisions = true;
    wallNorth.material = wallMaterial;

    // South wall
    const wallSouth = MeshBuilder.CreateBox('wallSouth', { width: 50, height: 8, depth: 1 }, scene);
    wallSouth.position = new Vector3(0, 4, -25);
    wallSouth.checkCollisions = true;
    wallSouth.material = wallMaterial;

    // East wall
    const wallEast = MeshBuilder.CreateBox('wallEast', { width: 1, height: 8, depth: 50 }, scene);
    wallEast.position = new Vector3(25, 4, 0);
    wallEast.checkCollisions = true;
    wallEast.material = wallMaterial;

    // West wall
    const wallWest = MeshBuilder.CreateBox('wallWest', { width: 1, height: 8, depth: 50 }, scene);
    wallWest.position = new Vector3(-25, 4, 0);
    wallWest.checkCollisions = true;
    wallWest.material = wallMaterial;

    // Vaulted ceiling
    const ceiling = MeshBuilder.CreateCylinder(
      'ceiling',
      { height: 50, diameter: 60, tessellation: 24, arc: 0.5 },
      scene
    );
    ceiling.rotation.z = Math.PI / 2;
    ceiling.position = new Vector3(0, 8, 0);
    ceiling.checkCollisions = true;

    const ceilingMaterial = new StandardMaterial('ceilingMat', scene);
    ceilingMaterial.diffuseColor = new Color3(0.25, 0.25, 0.28);
    ceilingMaterial.specularColor = new Color3(0.4, 0.4, 0.4);
    ceiling.material = ceilingMaterial;

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
    const playerHeight = 2; // Lock player at this height
    scene.registerBeforeRender(() => {
      time += 0.01;
      enemies.forEach((enemy, index) => {
        enemy.position.y += Math.sin(time + index) * 0.003;
        enemy.rotation.y += 0.01;
      });

      // Lock camera Y position for horizontal-only movement
      camera.position.y = playerHeight;
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
