import { Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, Color, Object3D, AmbientLight, MeshBasicMaterial, Vector3, Clock } from "three";
import CameraController from "./CameraController";
// @ts-ignore
import { EffectComposer, RenderPass, EffectPass, PixelationEffect } from "postprocessing";
import { Input } from "./Input";
import _ from "lodash";
import Ship from "./Ship";
import Runner from "./Runner";
import registry from "./registry";
import io from "socket.io-client";
import Component from "./Component";
import ComponentData from "./ComponentData";
import guid from "uuid/v4";

const socket = io();
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
    composer.render();
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

const clientId = guid();

function spawn(components: Component[]) {
    socket.emit("spawn", _.map(components, c => {
        const data: ComponentData = {
            id: c.id,
            ownerId: clientId,
            type: c.type,
            data: c.serialize()
        }
        return data;
    }));
}

spawn([ship]);