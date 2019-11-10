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
    Vector3,
    Vector2,
} from "three";
import guid from "uuid/v4";
import componentFactory from "./componentFactory";
import CameraController from "./components/CameraController";
import Ship from "./components/Ship";
import { Input } from "./core/Input";
import Runner from "./core/Runner";
import createClient from "./networking/Client";
import Asteroid from "./components/Asteroid";
import Noise from "./Noise";
import { clamp, randomAxis } from "./math";

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

const numGrids = [20, 20];
const gridSize = 10;
const center = new Vector3(numGrids[0] * gridSize * 0.5, 0, numGrids[1] * gridSize * 0.5);

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

const asteroids: { [id: string]: Asteroid } = {};
cameraController.target.copy(center);

for (let i = 0; i < numGrids[0]; i++) {
    for (let j = 0; j < numGrids[1]; j++) {
        const n = new Noise({
            frequency: 1.0,
        });

        const v = n.get(i, 0, j) - 0.5;

        if (v > 0) {
            const asteroid = new Asteroid();
            asteroid.gridCoord = new Vector2(i, j);
            asteroid.object.position.set(i * gridSize, 0, j * gridSize).add(randomAxis().multiplyScalar(gridSize / 2));
            const scale = 2 + clamp(Math.pow(v, 1) * 20, 0, 6);
            asteroid.object.scale.set(scale, scale, scale);

            const id = i + "," + j;
            asteroids[id] = asteroid;
        }
    }
}

const getAsteroid = (coord: Vector2) => {
    const id = coord.x + "," + coord.y;
    return asteroids[id];
};

_(asteroids)
    .filter((a) => {
        const coords = [
            new Vector2(-1, -1),
            new Vector2(-1, 0),
            new Vector2(-1, 1),
            new Vector2(0, -1),
            new Vector2(0, 1),
            new Vector2(1, -1),
            new Vector2(1, 0),
            new Vector2(1, 1),
        ];

        const collided = _(coords)
            .map((c) => c.add(a.gridCoord))
            .map((c) => getAsteroid(c))
            .filter((n) => n != null)
            .find((n) => {
                const dist = n.object.position.clone().sub(a.object.position).length();
                return (a.radius + n.radius + 2) > dist;
            });

        return collided == null;
    })
    .forEach((a) => {
        runner.addComponent(a);
    });
