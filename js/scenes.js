
import * as THREE from "three";

const GOLD = 0xd4af37;
const PALETTE = [
  0xd4af37, 0x7c4dff, 0x00d6a0, 0x268cff, 0xff315c,
  0xc0c0d0, 0xff8c42, 0x42e8ff, 0xe879f9, 0xffffff
];

const sceneInfo = [
  ["Masterclass Cube", "A living geometric dimension."],
  ["Masterclass Flower", "A cosmic flower blooming in space."],
  ["Infinite Knot", "An endless ribbon of impossible geometry."],
  ["Orbital Machine", "A mysterious celestial mechanism."],
  ["Fractal Tree", "A branching universe of living light."],
  ["Liquid Dimension", "A fluid world of shifting matter."],
  ["Mechanical Butterfly", "A machine learning to fly."],
  ["Golden Spiral", "The mathematics of infinity."],
  ["Crystal Collapse", "A crystalline world breaking into light."],
  ["DNA Universe", "Life's code floating through the cosmos."],
  ["Impossible Architecture", "A city beyond the laws of space."],
  ["Gyroscope", "Balance inside a rotating universe."],
  ["Abyss Creature", "An unknown lifeform from the deep."],
  ["Chaotic Pendulum", "Order emerging from chaos."],
  ["Sacred Geometry", "A universe built from perfect patterns."],
  ["Phoenix Rebirth", "A fiery rebirth from cosmic ashes."],
  ["Black Hole", "Light bending into the unknown."],
  ["Liquid Wave", "An ocean of luminous motion."],
  ["Clockwork Heart", "The pulse of a mechanical soul."],
  ["Particle Storm", "A storm of a thousand stars."],
  ["Hybrid Organism", "Nature and technology becoming one."],
  ["Morphing Dimension", "Matter changing its identity."],
  ["Gravity Playground", "A world where gravity dances."],
  ["Portal Engine", "A gateway to another dimension."],
  ["The Final Creation", "The universe becomes art."]
];

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({
  color,
  metalness: 0.65,
  roughness: 0.25,
  ...extra
});

function mesh(geometry, material, parent, position = [0, 0, 0]) {
  const obj = new THREE.Mesh(geometry, material);
  obj.position.set(...position);
  parent.add(obj);
  return obj;
}

function line(points, color, parent, opacity = 0.8) {
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map(p => new THREE.Vector3(...p))
  );
  const material = new THREE.LineBasicMaterial({
    color, transparent: true, opacity
  });
  const object = new THREE.Line(geometry, material);
  parent.add(object);
  return object;
}

function ring(parent, radius, tube, color, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const object = mesh(
    new THREE.TorusGeometry(radius, tube, 16, 120),
    mat(color, { emissive: color, emissiveIntensity: 0.25 }),
    parent,
    position
  );
  object.rotation.set(...rotation);
  return object;
}

function glowBall(parent, position, radius, color) {
  return mesh(
    new THREE.SphereGeometry(radius, 32, 24),
    mat(color, { emissive: color, emissiveIntensity: 1.4, roughness: 0.18 }),
    parent,
    position
  );
}

function addStars(parent, count = 900, spread = 32, color = 0xffffff) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color, size: 0.045, transparent: true, opacity: 0.85 })
  );
  parent.add(points);
  return points;
}

function addLights(scene, color) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));

  const key = new THREE.PointLight(color, 95, 35);
  key.position.set(5, 5, 7);
  scene.add(key);

  const fill = new THREE.PointLight(0x5140ff, 45, 30);
  fill.position.set(-6, -2, 4);
  scene.add(fill);

  const rim = new THREE.PointLight(0xffffff, 55, 25);
  rim.position.set(0, 6, -7);
  scene.add(rim);
}

function createCube(g, c) {
  const cube = mesh(new THREE.BoxGeometry(2.1, 2.1, 2.1), mat(c, {
    metalness: 0.85, roughness: 0.12, wireframe: false
  }), g);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(2.18, 2.18, 2.18)),
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  g.add(edges);

  for (let i = 0; i < 6; i++) {
    const orb = glowBall(g, [
      Math.cos(i * Math.PI / 3) * 2.8,
      Math.sin(i * Math.PI / 3) * 2.8,
      Math.sin(i * 1.7) * 1.2
    ], 0.13, PALETTE[i]);
    orb.userData.float = i;
  }
}

function createFlower(g) {
  const stem = mesh(new THREE.CylinderGeometry(0.07, 0.11, 2.7, 12), mat(0x18a66b), g, [0, -1.25, 0]);
  stem.rotation.z = -0.12;

  const center = glowBall(g, [0, 0.15, 0], 0.42, GOLD);
  center.userData.pulse = true;

  for (let i = 0; i < 16; i++) {
    const angle = i * Math.PI * 2 / 16;
    const petal = mesh(
      new THREE.SphereGeometry(0.48, 24, 18),
      mat(PALETTE[i % PALETTE.length], { emissive: PALETTE[i % PALETTE.length], emissiveIntensity: 0.18 }),
      g,
      [Math.cos(angle) * 0.82, 0.18 + Math.sin(angle) * 0.82, 0]
    );
    petal.scale.set(0.75, 1.55, 0.35);
    petal.rotation.z = -angle;
    petal.userData.petal = i;
  }

  for (let i = 0; i < 5; i++) {
    const leaf = mesh(new THREE.SphereGeometry(0.32, 16, 12), mat(0x00b879), g,
      [Math.sin(i * 2) * 0.55, -0.8 - i * 0.28, 0]);
    leaf.scale.set(1.8, 0.45, 0.4);
    leaf.rotation.z = i * 0.7;
  }
}

function createKnot(g, c) {
  for (let k = 0; k < 3; k++) {
    const pts = [];
    for (let i = 0; i <= 500; i++) {
      const t = i / 500 * Math.PI * 2;
      const r = 1.55 + 0.48 * Math.cos(5 * t + k * 2.1);
      pts.push([
        r * Math.cos(3 * t + k * 2.1),
        r * Math.sin(2 * t + k),
        0.75 * Math.sin(5 * t + k)
      ]);
    }
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
    mesh(new THREE.TubeGeometry(curve, 500, 0.075, 10, false),
      mat(PALETTE[k + 1], { emissive: PALETTE[k + 1], emissiveIntensity: 0.6 }), g);
  }
}

function createMachine(g) {
  for (let i = 0; i < 7; i++) {
    const r = 0.75 + i * 0.32;
    const obj = ring(g, r, 0.035 + (i % 2) * 0.025, PALETTE[i], [0, 0, 0],
      [i * 0.43, i * 0.31, i * 0.19]);
    obj.userData.spin = i % 2 ? 1 : -1;
  }
  glowBall(g, [0, 0, 0], 0.35, GOLD);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const p = glowBall(g, [Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0], 0.1, 0x42e8ff);
    p.userData.orbit = i;
  }
}

function createFractalTree(g) {
  function branch(start, length, angle, depth) {
    if (depth === 0) return;
    const end = [
      start[0] + Math.sin(angle) * length,
      start[1] + Math.cos(angle) * length,
      start[2]
    ];
    const mid = start.map((v, i) => (v + end[i]) / 2);
    const b = mesh(new THREE.CylinderGeometry(length * 0.045, length * 0.07, length, 7),
      mat(depth < 3 ? 0x20d68b : GOLD), g, mid);
    b.rotation.z = angle;
    branch(end, length * 0.73, angle - 0.55, depth - 1);
    branch(end, length * 0.73, angle + 0.55, depth - 1);
    if (depth <= 2) glowBall(g, end, 0.09, 0x42e8ff);
  }
  branch([0, -2.5, 0], 1.4, 0, 6);
}

function createLiquid(g) {
  const geo = new THREE.PlaneGeometry(8, 8, 65, 65);
  const positions = geo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i);
    positions.setZ(i, Math.sin(x * 1.7) * 0.25 + Math.cos(y * 1.4) * 0.25);
  }
  geo.computeVertexNormals();
  const water = mesh(geo, new THREE.MeshStandardMaterial({
    color: 0x075b9b, metalness: 0.8, roughness: 0.16,
    emissive: 0x062b55, emissiveIntensity: 0.55,
    side: THREE.DoubleSide, wireframe: false
  }), g, [0, -1.7, 0]);
  water.rotation.x = -0.15;
  water.userData.wave = true;

  for (let i = 0; i < 12; i++) {
    const b = glowBall(g, [
      Math.sin(i * 3) * 2.7,
      Math.cos(i * 2) * 1.3,
      Math.sin(i) * 1.7
    ], 0.12 + (i % 3) * 0.06, PALETTE[i % PALETTE.length]);
    b.userData.float = i;
  }
}

function createButterfly(g) {
  const body = mesh(new THREE.CapsuleGeometry(0.13, 1.2, 5, 10), mat(GOLD), g);
  body.rotation.x = Math.PI / 2;

  for (let side of [-1, 1]) {
    for (let j = 0; j < 2; j++) {
      const wing = mesh(new THREE.SphereGeometry(0.75, 24, 16),
        mat(j ? 0x7c4dff : 0x00d6a0, { emissive: j ? 0x7c4dff : 0x00d6a0, emissiveIntensity: 0.35 }),
        g, [side * (0.72 + j * 0.3), j ? 0.45 : -0.4, 0]);
      wing.scale.set(1.1, 0.72, 0.12);
      wing.rotation.z = side * (j ? -0.55 : 0.5);
      wing.userData.wing = side * (j + 1);
    }
  }
  for (let i = 0; i < 2; i++) {
    const antenna = line([[0, 0.7, 0], [Math.sin(i) * 0.45, 1.5, 0.1]], GOLD, g);
    antenna.userData.antenna = i;
  }
}

function createSpiral(g) {
  for (let k = 0; k < 3; k++) {
    const pts = [];
    for (let i = 0; i < 700; i++) {
      const t = i / 700 * Math.PI * 9;
      const r = 0.1 + t * 0.075;
      pts.push([Math.cos(t + k * 2.1) * r, Math.sin(t + k * 2.1) * r, k * 0.35 - 0.35]);
    }
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
    mesh(new THREE.TubeGeometry(curve, 700, 0.035, 8, false),
      mat(PALETTE[k], { emissive: PALETTE[k], emissiveIntensity: 0.7 }), g);
  }
}

function createCrystal(g) {
  for (let i = 0; i < 28; i++) {
    const crystal = mesh(new THREE.OctahedronGeometry(0.25 + Math.random() * 0.7, 0),
      mat(PALETTE[i % PALETTE.length], { metalness: 0.9, roughness: 0.08, emissive: PALETTE[i % PALETTE.length], emissiveIntensity: 0.2 }),
      g,
      [(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3]);
    crystal.userData.spin = Math.random() * 0.02;
    crystal.userData.float = i;
  }
}

function createDNA(g) {
  for (let strand = 0; strand < 2; strand++) {
    const pts = [];
    for (let i = 0; i <= 220; i++) {
      const t = i / 220 * Math.PI * 5;
      const a = t + strand * Math.PI;
      pts.push([Math.cos(a) * 1.25, i / 220 * 5 - 2.5, Math.sin(a) * 1.25]);
    }
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
    mesh(new THREE.TubeGeometry(curve, 300, 0.055, 8, false),
      mat(strand ? 0x42e8ff : 0xff4da6, { emissive: strand ? 0x42e8ff : 0xff4da6, emissiveIntensity: 0.65 }), g);
  }
  for (let i = 0; i < 28; i++) {
    const t = i / 28 * Math.PI * 5;
    const y = i / 28 * 5 - 2.5;
    line([[Math.cos(t) * 1.25, y, Math.sin(t) * 1.25],
      [Math.cos(t + Math.PI) * 1.25, y, Math.sin(t + Math.PI) * 1.25]], GOLD, g, 0.7);
  }
}

function createArchitecture(g) {
  for (let i = 0; i < 13; i++) {
    const h = 0.8 + Math.random() * 3.4;
    const x = (i % 5 - 2) * 1.1;
    const z = (Math.floor(i / 5) - 1) * 1.1;
    const tower = mesh(new THREE.BoxGeometry(0.55, h, 0.55),
      mat(PALETTE[i % PALETTE.length]), g, [x, -1.5 + h / 2, z]);
    tower.rotation.y = i * 0.27;
    ring(g, 0.36, 0.025, GOLD, [x, -1.5 + h, z], [Math.PI / 2, 0, 0]);
  }
}

function createGyroscope(g) {
  for (let i = 0; i < 5; i++) {
    const r = ring(g, 0.75 + i * 0.25, 0.055, PALETTE[i],
      [0, 0, 0], [i * 0.52, i * 0.37, i * 0.21]);
    r.userData.spin = i % 2 ? -1 : 1;
  }
  glowBall(g, [0, 0, 0], 0.28, 0xffffff);
}

function createCreature(g) {
  const body = mesh(new THREE.SphereGeometry(1, 40, 30),
    mat(0x153c65, { metalness: 0.85, roughness: 0.16, emissive: 0x071a55, emissiveIntensity: 0.6 }), g);
  body.scale.set(1.35, 0.75, 0.8);
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    const tentacle = line([
      [Math.cos(a) * 0.7, Math.sin(a) * 0.5, 0],
      [Math.cos(a) * 1.4, Math.sin(a) * 1.1, 0.3],
      [Math.cos(a) * 2.1, Math.sin(a) * 1.5, Math.sin(i) * 0.8]
    ], PALETTE[i % PALETTE.length]);
    tentacle.userData.tentacle = i;
    glowBall(g, [Math.cos(a) * 0.55, Math.sin(a) * 0.3, 0.65], 0.12, 0xff315c);
  }
}

function createPendulum(g) {
  for (let i = 0; i < 5; i++) {
    const rod = mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.8, 8),
      mat(0xc0c0d0), g, [i * 0.45 - 0.9, 0, 0]);
    rod.userData.pendulum = i;
    const bob = glowBall(g, [i * 0.45 - 0.9, -1.4, 0], 0.2, PALETTE[i]);
    bob.userData.bob = i;
  }
  ring(g, 1.7, 0.035, GOLD, [0, 1.65, 0]);
}

function createSacred(g) {
  for (let i = 0; i < 7; i++) {
    const r = 0.55 + i * 0.28;
    for (let j = 0; j < 6; j++) {
      const a = j * Math.PI / 3;
      ring(g, r, 0.018, PALETTE[(i + j) % PALETTE.length],
        [Math.cos(a) * 0.35, Math.sin(a) * 0.35, i * 0.04],
        [0, 0, a]);
    }
  }
  const geo = new THREE.IcosahedronGeometry(1.25, 1);
  const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true }));
  g.add(wire);
}

function createPhoenix(g) {
  const core = glowBall(g, [0, -0.2, 0], 0.48, 0xff4b16);
  core.userData.pulse = true;
  for (let side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const feather = mesh(new THREE.ConeGeometry(0.16, 1.2 + i * 0.07, 8),
        mat(i % 2 ? 0xff8c42 : 0xff315c, { emissive: 0xff3b10, emissiveIntensity: 0.8 }),
        g, [side * (0.45 + i * 0.22), 0.1 + i * 0.17, 0]);
      feather.rotation.z = side * (Math.PI / 2 - i * 0.12);
      feather.userData.feather = side * i;
    }
  }
  for (let i = 0; i < 22; i++) {
    const ember = glowBall(g, [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2], 0.045, 0xff8c42);
    ember.userData.float = i;
  }
}

function createBlackHole(g) {
  const hole = mesh(new THREE.SphereGeometry(0.9, 48, 36),
    new THREE.MeshBasicMaterial({ color: 0x020208 }), g);
  for (let i = 0; i < 8; i++) {
    const r = ring(g, 1.15 + i * 0.2, 0.045, i % 2 ? 0x7c4dff : 0xff8c42,
      [0, 0, 0], [0.25 + i * 0.12, 0.15, i * 0.08]);
    r.userData.spin = i % 2 ? 1 : -1;
  }
  for (let i = 0; i < 18; i++) {
    const star = glowBall(g, [Math.cos(i) * (2 + i * 0.08), Math.sin(i * 2) * 1.8, Math.sin(i) * 1.2], 0.055, 0xffffff);
    star.userData.orbit = i;
  }
}

function createWave(g) {
  const group = new THREE.Group();
  g.add(group);
  for (let i = 0; i < 15; i++) {
    const pts = [];
    for (let j = 0; j <= 150; j++) {
      const x = (j / 150 - 0.5) * 7;
      const y = Math.sin(j * 0.12 + i * 0.42) * (0.3 + i * 0.035);
      pts.push([x, y + i * 0.17 - 1.2, Math.cos(j * 0.06 + i) * 0.35]);
    }
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
    mesh(new THREE.TubeGeometry(curve, 180, 0.025, 6, false),
      mat(PALETTE[i % PALETTE.length], { emissive: PALETTE[i % PALETTE.length], emissiveIntensity: 0.7 }), group);
  }
  group.userData.waveGroup = true;
}

function createHeart(g) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.65);
  shape.bezierCurveTo(-2, 0.6, -1.5, 1.7, 0, 1.1);
  shape.bezierCurveTo(1.5, 1.7, 2, 0.6, 0, -0.65);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.45, bevelEnabled: true, bevelSegments: 5, steps: 2, bevelSize: 0.12, bevelThickness: 0.12 });
  const heart = mesh(geo, mat(0xb51d4c, { emissive: 0x610c2b, emissiveIntensity: 0.8 }), g);
  heart.scale.set(0.7, 0.7, 0.7);
  for (let i = 0; i < 9; i++) {
    const gear = ring(g, 0.25 + (i % 3) * 0.12, 0.035, GOLD,
      [(i % 3 - 1) * 0.65, Math.floor(i / 3) * 0.55 - 0.5, 0.45]);
    gear.userData.spin = i % 2 ? 1 : -1;
  }
}

function createParticleStorm(g) {
  const count = 1800;
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    velocities.push(Math.random() * 0.02 + 0.004);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0x9adfff, size: 0.035, transparent: true, opacity: 0.9
  }));
  points.userData.velocities = velocities;
  points.userData.storm = true;
  g.add(points);
  glowBall(g, [0, 0, 0], 0.28, GOLD);
}

function createHybrid(g) {
  const trunk = mesh(new THREE.CylinderGeometry(0.2, 0.42, 2.8, 10), mat(0x187a59), g, [0, -0.5, 0]);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const branch = mesh(new THREE.CylinderGeometry(0.045, 0.12, 1.7, 8),
      mat(i % 2 ? 0x00d6a0 : GOLD), g,
      [Math.cos(a) * 0.9, 0.6 + Math.sin(i) * 0.3, Math.sin(a) * 0.9]);
    branch.rotation.z = Math.cos(a) * 0.8;
    branch.rotation.x = Math.sin(a) * 0.8;
    glowBall(g, [Math.cos(a) * 1.7, 1.25, Math.sin(a) * 1.7], 0.23, PALETTE[i]);
  }
  ring(g, 1.7, 0.04, 0x42e8ff, [0, 0, 0], [Math.PI / 2, 0, 0]);
}

function createMorph(g) {
  const objects = [];
  objects.push(mesh(new THREE.IcosahedronGeometry(1.25, 2), mat(0x7c4dff), g));
  objects.push(mesh(new THREE.TorusKnotGeometry(0.85, 0.23, 180, 18, 3, 5), mat(0x00d6a0), g));
  objects.push(mesh(new THREE.OctahedronGeometry(1.5, 1), mat(0xff8c42), g));
  objects.forEach((o, i) => {
    o.visible = i === 0;
    o.userData.morphIndex = i;
  });
  g.userData.morphObjects = objects;
}

function createGravity(g) {
  glowBall(g, [0, 0, 0], 0.38, GOLD);
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    const r = 1.1 + (i % 5) * 0.3;
    const orb = glowBall(g, [Math.cos(a) * r, Math.sin(a * 2) * 1.3, Math.sin(a) * r], 0.09 + (i % 3) * 0.035, PALETTE[i % PALETTE.length]);
    orb.userData.gravity = i;
  }
  for (let i = 0; i < 4; i++) ring(g, 1.2 + i * 0.45, 0.018, PALETTE[i], [0, 0, 0], [i * 0.45, i * 0.7, 0]);
}

function createPortal(g) {
  for (let i = 0; i < 5; i++) {
    const portal = ring(g, 1.1 + i * 0.19, 0.045, PALETTE[i],
      [0, 0, -i * 0.18], [0, 0, i * 0.16]);
    portal.userData.spin = i % 2 ? -1 : 1;
  }
  const core = mesh(new THREE.CircleGeometry(1, 64),
    new THREE.MeshBasicMaterial({ color: 0x160c38, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    g, [0, 0, -0.8]);
  core.userData.portal = true;
  for (let i = 0; i < 18; i++) {
    glowBall(g, [Math.cos(i) * 2.3, Math.sin(i * 2) * 1.8, -1], 0.06, PALETTE[i % PALETTE.length]);
  }
}

function createFinal(g) {
  for (let i = 0; i < 12; i++) {
    const geo = new THREE.IcosahedronGeometry(0.25 + i * 0.07, 1);
    const obj = mesh(geo, mat(PALETTE[i % PALETTE.length], {
      emissive: PALETTE[i % PALETTE.length], emissiveIntensity: 0.45
    }), g, [
      Math.cos(i * 2.4) * (0.5 + i * 0.14),
      Math.sin(i * 2.4) * (0.5 + i * 0.14),
      Math.sin(i * 0.8) * 1.2
    ]);
    obj.userData.spin = 0.008 + i * 0.001;
  }
  const core = glowBall(g, [0, 0, 0], 0.5, GOLD);
  core.userData.pulse = true;
  for (let i = 0; i < 4; i++) ring(g, 1.6 + i * 0.3, 0.025, PALETTE[i + 1], [0, 0, 0], [i * 0.55, i * 0.4, i * 0.3]);
}

const builders = [
  createCube, createFlower, createKnot, createMachine, createFractalTree,
  createLiquid, createButterfly, createSpiral, createCrystal, createDNA,
  createArchitecture, createGyroscope, createCreature, createPendulum,
  createSacred, createPhoenix, createBlackHole, createWave, createHeart,
  createParticleStorm, createHybrid, createMorph, createGravity, createPortal,
  createFinal
];

export function getSceneInfo(index) {
  return sceneInfo[index] || sceneInfo[0];
}

export function getAllSceneInfo() {
  return sceneInfo;
}

export function createScene(index = 0) {
  const scene = new THREE.Scene();
  const color = PALETTE[index % PALETTE.length];

  scene.background = new THREE.Color(0x05050b);
  scene.fog = new THREE.FogExp2(0x05050b, 0.025);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0.3, 8.5);
  camera.lookAt(0, 0, 0);

  addLights(scene, color);

  const world = new THREE.Group();
  scene.add(world);

  const stars = addStars(world, 1100, 40);
  const builder = builders[index] || createCube;
  builder(world, color);

  const clock = new THREE.Clock();

  function update() {
    const t = clock.getElapsedTime();

    world.rotation.y += 0.0025;
    world.rotation.x = Math.sin(t * 0.22) * 0.07;

    world.traverse(obj => {
      if (obj.userData.spin) {
        obj.rotation.z += obj.userData.spin * 0.01;
        obj.rotation.y += obj.userData.spin * 0.004;
      }

      if (obj.userData.float !== undefined) {
        obj.position.y += Math.sin(t * 1.4 + obj.userData.float) * 0.002;
      }

      if (obj.userData.pulse) {
        const s = 1 + Math.sin(t * 2.2) * 0.1;
        obj.scale.setScalar(s);
      }

      if (obj.userData.wing) {
        obj.rotation.z = Math.sin(t * 8) * 0.5 * Math.sign(obj.userData.wing);
      }

      if (obj.userData.pendulum !== undefined) {
        const i = obj.userData.pendulum;
        const angle = Math.sin(t * 2.1 + i * 0.55) * 0.55;
        obj.rotation.z = angle;
      }

      if (obj.userData.bob !== undefined) {
        const i = obj.userData.bob;
        obj.position.x = i * 0.45 - 0.9 + Math.sin(t * 2.1 + i * 0.55) * 1.1;
        obj.position.y = -1.4;
      }

      if (obj.userData.storm) {
        const p = obj.geometry.attributes.position;
        const v = obj.userData.velocities;
        for (let i = 0; i < p.count; i++) {
          let y = p.getY(i) + v[i];
          if (y > 4) y = -4;
          p.setY(i, y);
        }
        p.needsUpdate = true;
      }

      if (obj.userData.wave) {
        const p = obj.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i);
          p.setZ(i, Math.sin(x * 1.7 + t * 1.3) * 0.25 + Math.cos(y * 1.4 + t) * 0.25);
        }
        p.needsUpdate = true;
        obj.geometry.computeVertexNormals();
      }

      if (obj.userData.waveGroup) {
        obj.position.y = Math.sin(t * 0.8) * 0.12;
      }

      if (obj.userData.morphObjects) {
        const active = Math.floor(t / 3) % obj.userData.morphObjects.length;
        obj.userData.morphObjects.forEach((item, i) => item.visible = i === active);
      }

      if (obj.userData.portal) {
        obj.rotation.z = t * 0.4;
      }
    });

    stars.rotation.y = t * 0.008;
  }

  return { scene, camera, world, update, info: getSceneInfo(index) };
}
