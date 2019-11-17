import * as dat from "dat.gui";
import _ from "lodash";
import {
    EffectComposer,
    EffectPass,
    PixelationEffect,
    RenderPass,
    // @ts-ignore
} from "postprocessing";
import SocketIOClient from "socket.io-client";
import Stats from "stats.js";
import {
    AmbientLight,
    Color,
    DirectionalLight,
    PerspectiveCamera,
    Scene,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "three";
import guid from "uuid/v4";
import componentFactory from "./componentFactory";
import AsteroidField from "./components/AsteroidField";
import CameraController from "./components/CameraController";
import Ship from "./components/Ship";
import StarField from "./components/StarField";
import { Input } from "./core/Input";
import Runner from "./core/Runner";
import Client from "./networking/Client";

const scene = new Scene();
const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
renderer.gammaFactor = 1.5;
renderer.gammaOutput = true;
renderer.setClearColor(new Color(0.05, 0.05, 0.05));

renderer.setSize(window.innerWidth, window.innerHeight);
const main = document.getElementById("main")!;
main.appendChild(renderer.domElement);
main.oncontextmenu = () => false;

const directionalLight = new DirectionalLight(new Color(0.9, 0.85, 0.7), 0.8);
directionalLight.position.set(-0.8, 0.5, 0.3);
scene.add(directionalLight);

const backLight = new DirectionalLight(new Color(0.8, 0.8, 1.0), 0.1);
backLight.position.set(0.8, 0, 0);
scene.add(backLight);

const ambientLight = new AmbientLight(new Color(1, 1, 1), 0.1);
scene.add(ambientLight);

let composer: EffectComposer;

const rendering = { pixelation: true };

function updatePostProcessing() {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const passes = [renderPass];

    if (rendering.pixelation) {
        const pixelationPass = new EffectPass(camera, new PixelationEffect(3));
        passes.push(pixelationPass);
    }

    for (const pass of passes) {
        composer.addPass(pass);
    }
    passes[passes.length - 1].renderToScreen = true;
}

updatePostProcessing();

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    updatePostProcessing();
});

const input = new Input();

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
    stats.begin();
    runner.update(1 / 60);
    runner.beforeRender();

    composer.render();

    input.clear();
    runner.lateUpdate();
    stats.end();

    requestAnimationFrame(animate);
}

const runner = new Runner({ scene, input, componentFactory, camera, isServer: false });

const cameraController = new CameraController();
cameraController.camera = camera;
cameraController.distance = 200;
runner.addComponent(cameraController);

const playerId = guid();

const ship = new Ship();
ship.ownerId = playerId;
ship.isOwn = true;
runner.addComponent(ship);

for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
        const s = new Ship();
        runner.addComponent(s);
        s.object.position.set(i * 15, 0, j * 15);
        s.object.rotation.y = Math.random() * 2 * Math.PI;
        s.color = new Color(0.8, 0.6, 0.2);
        // public color = new Color(0.2, 0.6, 0.8);
    }
}

const numGrids = new Vector2(20, 20);
const gridSize = 10;
const center = new Vector3(numGrids.x * gridSize * 0.5, 0, numGrids.y * gridSize * 0.5);

placeShip(ship);

const socket = SocketIOClient("http://localhost:3000");

const client = new Client({
    runner,
    socket,
});
runner.client = client;

client.join(playerId);
client.spawn(ship);

cameraController.target = ship.object;

const asteroidField = new AsteroidField();
asteroidField.numGrids = numGrids;
asteroidField.gridSize = gridSize;
runner.addComponent(asteroidField);

const starField = new StarField();
runner.addComponent(starField);

function placeShip(s: Ship) {
    const position = new Vector3(
        (Math.random() - 0.5) * 2 * 40,
        0,
        (Math.random() - 0.5) * 2 * 40,
    ).add(center);
    s.object.position.copy(position);
    s.object.rotation.y = Math.random() * Math.PI * 2;
}

animate();

const gui = new dat.GUI();
const renderingFolder = gui.addFolder("rendering");
const controller = renderingFolder.add(rendering, "pixelation");
controller.onChange(() => {
    updatePostProcessing();
});
