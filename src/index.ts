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
    WebGLRenderer,
} from "three";
import guid from "uuid/v4";
import componentFactory from "./componentFactory";
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

const directionalLight = new DirectionalLight(new Color(0.9, 0.85, 0.7), 0.4);
directionalLight.position.set(0.8, 0.5, 0.3);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new AmbientLight(new Color(1, 1, 1), 0.6);
scene.add(ambientLight);

const composer = new EffectComposer(renderer);

const effectPass = new EffectPass(camera, new PixelationEffect(3));
effectPass.renderToScreen = true;

composer.addPass(new RenderPass(scene, camera));
composer.addPass(effectPass);

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

ship.body.object.position.set(
    (Math.random() - 0.5) * 2 * 40,
    0,
    (Math.random() - 0.5) * 2 * 40,
);
ship.body.object.rotation.y = Math.random() * Math.PI * 2;

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
enemyShip.body.object.position.x = 10;
