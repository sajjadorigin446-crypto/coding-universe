
import * as THREE from "three";
import {
  createScene,
  getAllSceneInfo,
  getSceneInfo
} from "./scenes.js";

// -----------------------------------------
// ELEMENTS
// -----------------------------------------

const opening = document.getElementById("opening");
const openingCanvas = document.getElementById("openingCanvas");
const enterButton = document.getElementById("enterButton");

const mainPage = document.getElementById("mainPage");
const sceneGrid = document.getElementById("sceneGrid");

const experience = document.getElementById("experience");
const experienceCanvas = document.getElementById("experienceCanvas");

const backButton = document.getElementById("backButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const replayButton = document.getElementById("replayButton");
const fullscreenButton = document.getElementById("fullscreenButton");

const sceneCounter = document.getElementById("sceneCounter");
const sceneCategory = document.getElementById("sceneCategory");
const sceneTitle = document.getElementById("sceneTitle");
const sceneDescription = document.getElementById("sceneDescription");

const music = document.getElementById("backgroundMusic");

// -----------------------------------------
// CONFIGURATION
// -----------------------------------------

const CONFIG = {
  musicSource: "./assets/music/dark-fantasy.mp3",
  musicVolume: 0.35,
  autoRotate: true,
  rotationSpeed: 0.004
};

// If you use a different music filename, change musicSource above.
// The file must be inside assets/music/.

if (music) {
  music.src = CONFIG.musicSource;
  music.loop = true;
  music.volume = CONFIG.musicVolume;
}

// -----------------------------------------
// RENDERERS
// -----------------------------------------

const openingRenderer = new THREE.WebGLRenderer({
  canvas: openingCanvas,
  antialias: true,
  alpha: true
});

openingRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
openingRenderer.setSize(
  openingCanvas.clientWidth || window.innerWidth,
  openingCanvas.clientHeight || window.innerHeight
);
openingRenderer.outputColorSpace = THREE.SRGBColorSpace;
openingRenderer.toneMapping = THREE.ACESFilmicToneMapping;
openingRenderer.toneMappingExposure = 1.25;

const experienceRenderer = new THREE.WebGLRenderer({
  canvas: experienceCanvas,
  antialias: true,
  alpha: true
});

experienceRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
experienceRenderer.outputColorSpace = THREE.SRGBColorSpace;
experienceRenderer.toneMapping = THREE.ACESFilmicToneMapping;
experienceRenderer.toneMappingExposure = 1.25;

// -----------------------------------------
// OPENING 3D WORLD
// -----------------------------------------

const openingScene = new THREE.Scene();
openingScene.background = new THREE.Color(0x05050b);

const openingCamera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

openingCamera.position.set(0, 0, 8);

openingScene.add(new THREE.AmbientLight(0xffffff, 1));

const openingLight = new THREE.PointLight(0xd4af37, 110, 30);
openingLight.position.set(3, 4, 5);
openingScene.add(openingLight);

const violetLight = new THREE.PointLight(0x7c4dff, 80, 25);
violetLight.position.set(-4, -2, 3);
openingScene.add(violetLight);

const openingWorld = new THREE.Group();
openingScene.add(openingWorld);

// Main fantasy object
const openingCore = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.25, 2),
  new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.16,
    emissive: 0x6c4a08,
    emissiveIntensity: 0.8,
    wireframe: false
  })
);
openingWorld.add(openingCore);

// Wireframe shell
const shell = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.65, 2),
  new THREE.MeshBasicMaterial({
    color: 0x7c4dff,
    wireframe: true,
    transparent: true,
    opacity: 0.55
  })
);
openingWorld.add(shell);

// Orbiting rings
const openingRings = [];

for (let i = 0; i < 4; i++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.1 + i * 0.25, 0.018, 12, 140),
    new THREE.MeshBasicMaterial({
      color: [0xd4af37, 0x7c4dff, 0x00d6a0, 0x42e8ff][i]
    })
  );

  ring.rotation.set(i * 0.7, i * 0.45, i * 0.3);
  openingWorld.add(ring);
  openingRings.push(ring);
}

// Floating particles
const particleCount = 1200;
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 22;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);

const openingParticles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    color: 0xd4af37,
    size: 0.035,
    transparent: true,
    opacity: 0.8
  })
);

openingScene.add(openingParticles);

// -----------------------------------------
// SCENE GALLERY
// -----------------------------------------

const sceneNames = getAllSceneInfo();

function buildGallery() {
  if (!sceneGrid) return;

  sceneGrid.innerHTML = "";

  sceneNames.forEach((info, index) => {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "scene-card";
    card.setAttribute("aria-label", `Open ${info[0]}`);

    const number = String(index + 1).padStart(2, "0");

    card.innerHTML = `
      <span class="scene-card-number">${number}</span>
      <span class="scene-card-orb orb-${index + 1}"></span>
      <span class="scene-card-content">
        <span class="scene-card-title">${info[0]}</span>
        <span class="scene-card-description">${info[1]}</span>
        <span class="scene-card-action">EXPLORE SCENE ↗</span>
      </span>
    `;

    card.addEventListener("click", () => openExperience(index));
    sceneGrid.appendChild(card);
  });
}

buildGallery();

// -----------------------------------------
// ACTIVE EXPERIENCE
// -----------------------------------------

let activeScene = null;
let activeIndex = 0;
let experienceRunning = false;
let animationFrame = null;

let pointerDown = false;
let pointerX = 0;
let pointerY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

function updateSceneText(index) {
  const info = getSceneInfo(index);

  if (sceneCounter) {
    sceneCounter.textContent =
      `${String(index + 1).padStart(2, "0")} / 25`;
  }

  if (sceneCategory) {
    sceneCategory.textContent = "MAMUN CODING FANTASY";
  }

  if (sceneTitle) {
    sceneTitle.textContent = info[0];
  }

  if (sceneDescription) {
    sceneDescription.textContent = info[1];
  }
}

function clearActiveScene() {
  if (activeScene) {
    activeScene.scene.traverse(object => {
      if (object.geometry) object.geometry.dispose();

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    activeScene = null;
  }
}

function openExperience(index) {
  activeIndex = Math.max(0, Math.min(24, index));

  clearActiveScene();

  activeScene = createScene(activeIndex);

  experienceRenderer.setSize(
    experience.clientWidth || window.innerWidth,
    experience.clientHeight || window.innerHeight
  );

  activeScene.camera.aspect =
    (experience.clientWidth || window.innerWidth) /
    (experience.clientHeight || window.innerHeight);

  activeScene.camera.updateProjectionMatrix();

  targetRotationX = 0;
  targetRotationY = 0;

  updateSceneText(activeIndex);

  if (mainPage) mainPage.classList.add("hidden");
  if (experience) experience.classList.remove("hidden");

  experienceRunning = true;
  startExperienceAnimation();
}

function closeExperience() {
  experienceRunning = false;

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  clearActiveScene();

  if (experience) experience.classList.add("hidden");
  if (mainPage) mainPage.classList.remove("hidden");
}

function changeScene(direction) {
  let nextIndex = activeIndex + direction;

  if (nextIndex < 0) nextIndex = 24;
  if (nextIndex > 24) nextIndex = 0;

  openExperience(nextIndex);
}

// -----------------------------------------
// EXPERIENCE ANIMATION
// -----------------------------------------

function startExperienceAnimation() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  function animate() {
    if (!experienceRunning || !activeScene) return;

    animationFrame = requestAnimationFrame(animate);

    activeScene.update();

    // Smooth camera-like interaction by rotating the 3D world.
    if (activeScene.world) {
      activeScene.world.rotation.y +=
        (targetRotationY - activeScene.world.rotation.y) * 0.035;

      activeScene.world.rotation.x +=
        (targetRotationX - activeScene.world.rotation.x) * 0.035;
    }

    experienceRenderer.render(
      activeScene.scene,
      activeScene.camera
    );
  }

  animate();
}

// -----------------------------------------
// OPENING ANIMATION
// -----------------------------------------

const openingClock = new THREE.Clock();

function animateOpening() {
  requestAnimationFrame(animateOpening);

  const t = openingClock.getElapsedTime();

  openingCore.rotation.x = t * 0.24;
  openingCore.rotation.y = t * 0.38;

  shell.rotation.x = -t * 0.13;
  shell.rotation.y = t * 0.2;

  openingWorld.rotation.y = Math.sin(t * 0.3) * 0.15;

  openingRings.forEach((ring, index) => {
    ring.rotation.x += 0.0015 * (index + 1);
    ring.rotation.y += 0.001 * (index + 1);
  });

  openingParticles.rotation.y = t * 0.012;
  openingParticles.rotation.x = Math.sin(t * 0.2) * 0.06;

  openingCamera.position.x = Math.sin(t * 0.18) * 0.25;
  openingCamera.position.y = Math.cos(t * 0.2) * 0.18;
  openingCamera.lookAt(0, 0, 0);

  openingRenderer.render(openingScene, openingCamera);
}

animateOpening();

// -----------------------------------------
// ENTER FANTASY
// -----------------------------------------

if (enterButton) {
  enterButton.addEventListener("click", async () => {
    // Music playback is triggered by this user click.
    if (music) {
      try {
        await music.play();
      } catch (error) {
        console.warn("Music could not start. Check the audio file path.", error);
      }
    }

    if (opening) opening.classList.add("opening-exit");

    window.setTimeout(() => {
      if (opening) opening.classList.add("hidden");
      if (mainPage) mainPage.classList.remove("hidden");

      buildGallery();
    }, 850);
  });
}

// -----------------------------------------
// BUTTON CONTROLS
// -----------------------------------------

if (backButton) {
  backButton.addEventListener("click", closeExperience);
}

if (previousButton) {
  previousButton.addEventListener("click", () => changeScene(-1));
}

if (nextButton) {
  nextButton.addEventListener("click", () => changeScene(1));
}

if (replayButton) {
  replayButton.addEventListener("click", () => {
    openExperience(activeIndex);
  });
}

if (fullscreenButton) {
  fullscreenButton.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await experience.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen is not available:", error);
    }
  });
}

// -----------------------------------------
// MOUSE + TOUCH DRAG INTERACTION
// -----------------------------------------

if (experienceCanvas) {
  experienceCanvas.addEventListener("pointerdown", event => {
    pointerDown = true;
    pointerX = event.clientX;
    pointerY = event.clientY;

    experienceCanvas.setPointerCapture(event.pointerId);
  });

  experienceCanvas.addEventListener("pointermove", event => {
    if (!pointerDown || !activeScene) return;

    const deltaX = event.clientX - pointerX;
    const deltaY = event.clientY - pointerY;

    targetRotationY += deltaX * 0.004;
    targetRotationX += deltaY * 0.003;

    pointerX = event.clientX;
    pointerY = event.clientY;
  });

  experienceCanvas.addEventListener("pointerup", () => {
    pointerDown = false;
  });

  experienceCanvas.addEventListener("pointercancel", () => {
    pointerDown = false;
  });

  experienceCanvas.addEventListener("wheel", event => {
    if (!activeScene) return;

    activeScene.camera.position.z = THREE.MathUtils.clamp(
      activeScene.camera.position.z + event.deltaY * 0.004,
      4,
      14
    );
  }, { passive: true });
}

// -----------------------------------------
// KEYBOARD CONTROLS
// -----------------------------------------

window.addEventListener("keydown", event => {
  if (!experienceRunning) return;

  if (event.key === "ArrowRight") changeScene(1);
  if (event.key === "ArrowLeft") changeScene(-1);
  if (event.key === "Escape") closeExperience();
});

// -----------------------------------------
// RESPONSIVE RESIZE
// -----------------------------------------

function resizeRenderers() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  openingCamera.aspect = width / height;
  openingCamera.updateProjectionMatrix();

  openingRenderer.setSize(width, height);

  if (activeScene && experience) {
    const w = experience.clientWidth || width;
    const h = experience.clientHeight || height;

    activeScene.camera.aspect = w / h;
    activeScene.camera.updateProjectionMatrix();

    experienceRenderer.setSize(w, h);
  }
}

window.addEventListener("resize", resizeRenderers);

resizeRenderers();

// -----------------------------------------
// PAGE VISIBILITY PERFORMANCE
// -----------------------------------------

document.addEventListener("visibilitychange", () => {
  if (document.hidden && music && !music.paused) {
    music.pause();
  } else if (!document.hidden && mainPage &&
    !mainPage.classList.contains("hidden") && music) {
    music.play().catch(() => {});
  }
});

console.log("MAMUN CODING FANTASY — 25 scenes loaded.");
