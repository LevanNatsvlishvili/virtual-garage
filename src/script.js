import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import GUI from 'lil-gui';

// const gui = new GUI();

// Scene where everything will be rendered
const scene = new THREE.Scene();

const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

let roomSizes = {
  width: 0,
  length: 0,
  height: 0,
};

// Load GLTF House and Setup Collidable Walls
let wallGroup = new THREE.Group(); // Moved out to make it accessible globally for collision detection

gltfLoader.load('/assets/room/scene.gltf', (gltf) => {
  const office = gltf.scene;
  scene.add(office);

  // Get width, length, and height of the room
  const box = new THREE.Box3().setFromObject(office);
  const size = box.getSize(new THREE.Vector3());
  roomSizes.width = size.x;
  roomSizes.height = size.y;
  roomSizes.length = size.z;

  // Now that we have room sizes, create the walls
  const wallGeometryShortWall = new THREE.PlaneGeometry(roomSizes.length, roomSizes.height);
  const wallGeometryLongWall = new THREE.PlaneGeometry(roomSizes.width, roomSizes.height);
  const wallMaterialRed = new THREE.MeshBasicMaterial({ color: 'red', invisible: true });
  const wallMaterialGreen = new THREE.MeshBasicMaterial({ color: 'green' });
  const wallMaterialBlue = new THREE.MeshBasicMaterial({ color: 'blue' });
  const wallMaterialYellow = new THREE.MeshBasicMaterial({ color: 'yellow' });
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  material.transparent = true;
  material.opacity = 0;

  // Create the walls using the room dimensions
  const wallRed = new THREE.Mesh(wallGeometryLongWall, material);
  const wallGreen = new THREE.Mesh(wallGeometryShortWall, material);
  const wallBlue = new THREE.Mesh(wallGeometryShortWall, material);
  const wallYellow = new THREE.Mesh(wallGeometryLongWall, material);

  // Set wall positions and rotations
  wallRed.rotation.x = Math.PI;
  wallRed.position.set(7, roomSizes.height / 2, -1); // Back wall

  wallGreen.rotation.x = Math.PI;
  wallGreen.rotation.y = Math.PI / 2;
  wallGreen.position.set(-5, roomSizes.height / 2, -roomSizes.length / 2); // Left wall

  wallBlue.rotation.x = Math.PI;
  wallBlue.rotation.y = Math.PI / -2;
  wallBlue.position.set(18, roomSizes.height / 2, -roomSizes.length / 2); // Right wall

  wallYellow.rotation.x = Math.PI;
  wallYellow.rotation.y = Math.PI;
  wallYellow.position.set(7, roomSizes.height / 2, -roomSizes.width / 2); // Front wall

  // Add walls to the group and scene
  wallGroup.add(wallRed, wallGreen, wallBlue, wallYellow);
  scene.add(wallGroup);
});

const targetSize = 5; // Set target size for all cars (e.g., 5 units for length)
const carGroup = new THREE.Group();

const cars = [
  {
    name: 'Porsche 911 Targa',
    model: '/assets/cars/porsche_911_targa/scene.gltf',
  },

  {
    name: 'Porsche Cayenne Turbo',
    model: '/assets/cars/porsche_cayenne_turbo/scene.gltf',
  },
];

const carPositions = {
  0: { x: 0, y: 0.8, z: 0, rotation: Math.PI - Math.PI / 3 },
  1: { x: -2, y: 0, z: -10, rotation: Math.PI / 3 },
};

cars.forEach((carModel, index) => {
  gltfLoader.load(carModel.model, (gltf) => {
    const car = gltf.scene;
    const x = carPositions[index].x;
    const y = carPositions[index].y;
    const z = carPositions[index].z;
    const rotation = carPositions[index].rotation;

    // Calculate the bounding box of the car
    const boundingBox = new THREE.Box3().setFromObject(car);
    const size = boundingBox.getSize(new THREE.Vector3());

    // Calculate the current largest dimension (e.g., length)
    const maxDimension = Math.max(size.x, size.y, size.z);

    // Calculate the scale factor to make the car fit the target size
    const scaleFactor = targetSize / maxDimension;

    // Apply uniform scaling to match target size
    car.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Set initial position and rotation
    car.position.set(x, y, z);
    car.rotation.set(0, rotation, 0);

    carGroup.add(car);

    // Add GUI controls for car transformation
    // gui
    //   .add(car.position, 'x')
    //   .min(-10)
    //   .max(10)
    //   .step(0.1)
    //   .name(carModel.name + ' Position X');
    // gui
    //   .add(car.position, 'y')
    //   .min(-10)
    //   .max(10)
    //   .step(0.1)
    //   .name(carModel.name + ' Position Y');
    // gui
    //   .add(car.position, 'z')
    //   .min(-10)
    //   .max(10)
    //   .step(0.1)
    //   .name(carModel.name + ' Position Z');
    // gui
    //   .add(car.rotation, 'y')
    //   .min(-Math.PI)
    //   .max(Math.PI)
    //   .step(0.1)
    //   .name(carModel.name + ' Rotation Y');
  });
});

scene.add(carGroup);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Camera
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight);
camera.position.set(10, 1, -5);
camera.rotation.y = Math.PI / 2;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('.webgl'),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Handle Window Resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Controls
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

// Lock and Unlock Controls
document.addEventListener('click', () => {
  controls.lock(); // Locks the pointer when the user clicks
});

controls.addEventListener('lock', () => {
  console.log('Pointer locked');
});

controls.addEventListener('unlock', () => {
  console.log('Pointer unlocked');
  controls.lock();
});

// Movement Handling
const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
      movement.forward = true;
      break;
    case 'KeyS':
      movement.backward = true;
      break;
    case 'KeyA':
      movement.left = true;
      break;
    case 'KeyD':
      movement.right = true;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
      movement.forward = false;
      break;
    case 'KeyS':
      movement.backward = false;
      break;
    case 'KeyA':
      movement.left = false;
      break;
    case 'KeyD':
      movement.right = false;
      break;
  }
});

// Create Bounding Box for the Camera
const cameraBox = new THREE.Box3().setFromCenterAndSize(camera.position, new THREE.Vector3(1, 2, 1)); // Adjust size as needed

// Tick Function
const clock = new THREE.Clock(); // Add a clock to track time

const tick = () => {
  const delta = clock.getDelta(); // Get the time elapsed since the last frame

  // Update movement based on keys pressed
  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  direction.z = Number(movement.forward) - Number(movement.backward);
  direction.x = Number(movement.right) - Number(movement.left);
  direction.normalize();

  // Save the current position before applying movement
  const prevPosition = camera.position.clone();

  if (movement.forward || movement.backward) {
    velocity.z -= direction.z * 100.0 * delta;
  }
  if (movement.left || movement.right) {
    velocity.x -= direction.x * 100.0 * delta;
  }

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  // Update the Camera's Bounding Box
  cameraBox.setFromCenterAndSize(camera.position, new THREE.Vector3(1, 2, 1));

  // Collision Detection
  let collision = false;
  wallGroup.children.forEach((wall) => {
    const wallBox = new THREE.Box3().setFromObject(wall);
    if (cameraBox.intersectsBox(wallBox)) {
      collision = true;
    }
  });
  carGroup.children.forEach((object) => {
    const objectBox = new THREE.Box3().setFromObject(object);
    if (cameraBox.intersectsBox(objectBox)) {
      collision = true;
    }
  });

  // Revert to Previous Position if Collision Detected
  if (collision) {
    camera.position.copy(prevPosition);
  }

  // Render Scene
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
