import {
    AmbientLight,
    Clock,
    Color,
    DirectionalLight,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from "three";
import CameraController from "./components/CameraController";
import {
    EffectComposer,
    EffectPass,
    PixelationEffect,
    RenderPass,
    // @ts-ignore
} from "postprocessing";
import { Input } from "./core/Input";
import _ from "lodash";
import createClient from "./networking/Client";
import Ship from "./components/Ship";
import SocketIOClient from "socket.io-client";
import Runner from "./core/Runner";

const scene = new Scene();
const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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

const clock = new Clock();
clock.start();

function animate() {
    runner.update();
    // renderer.render(scene, camera);
    // composer.render();
    requestAnimationFrame(animate);
    input.clear();
}

const runner = new Runner(false, scene, input, clock);

const cameraController = new CameraController();
cameraController.camera = camera;
cameraController.distance = 200;
runner.addComponent(cameraController);

const ship = new Ship();
runner.addComponent(ship);

animate();

const socket = SocketIOClient();
const client = createClient({
    runner,
    socket,
});

client.spawn(ship);
