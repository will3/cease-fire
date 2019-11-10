import _ from "lodash";
import {
    EffectComposer,
    EffectPass,
    PixelationEffect,
    RenderPass,
    // @ts-ignore
} from "postprocessing";
import SocketIOClient from "socket.io-client";
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
import { Input } from "./core/Input";
import Runner from "./core/Runner";
import createClient from "./networking/Client";

const scene = new Scene();
const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const main = document.getElementById("main")!;
main.appendChild(renderer.domElement);
main.oncontextmenu = () => false;

const directionalLight = new DirectionalLight(new Color(0.9, 0.85, 0.7), 0.8);
directionalLight.position.set(-0.8, 0.5, 0.3);
scene.add(directionalLight);

const backLight = new DirectionalLight(new Color(0.8, 0.8, 1.0), 0.15);
backLight.position.set(0.8, 0.5, 0.3);
scene.add(backLight);

const ambientLight = new AmbientLight(new Color(1, 1, 1), 0.1);
scene.add(ambientLight);

const composer = new EffectComposer(renderer);

const pixelationPass = new EffectPass(camera, new PixelationEffect(3));
pixelationPass.renderToScreen = true;

composer.addPass(new RenderPass(scene, camera));
composer.addPass(pixelationPass);

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const input = new Input();

function animate() {
    runner.update(1 / 60);
    // renderer.render(scene, camera);
    composer.render();
    requestAnimationFrame(animate);
    input.clear();
}

const runner = new Runner({ scene, input, componentFactory, camera });

const cameraController = new CameraController();
cameraController.camera = camera;
cameraController.distance = 200;
runner.addComponent(cameraController);

const playerId = guid();

const ship = new Ship();
ship.ownerId = playerId;
ship.isOwn = true;
runner.addComponent(ship);
ship.startIfNeeded();

const numGrids = new Vector2(20, 20);
const gridSize = 10;
const center = new Vector3(numGrids.x * gridSize * 0.5, 0, numGrids.y * gridSize * 0.5);

ship.object.position.set(
    (Math.random() - 0.5) * 2 * 40,
    0,
    (Math.random() - 0.5) * 2 * 40,
).add(center);
ship.object.rotation.y = Math.random() * Math.PI * 2;

animate();

const socket = SocketIOClient("http://localhost:3000");

const client = createClient({
    runner,
    socket,
});

client.join(playerId);
client.spawn(ship);

const enemyShip = new Ship();
runner.addComponent(enemyShip);
enemyShip.startIfNeeded();
enemyShip.object.position.x = 10;

cameraController.target.copy(center);

const asteroidField = new AsteroidField();
asteroidField.numGrids = numGrids;
asteroidField.gridSize = gridSize;
runner.addComponent(asteroidField);
