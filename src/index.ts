import { Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, Color, Object3D, AmbientLight, MeshBasicMaterial } from "three";
import Component from "./Component";
import CameraController from "./CameraController";
import ShipBody from "./ShipBody";
import { EffectComposer, RenderPass, EffectPass, BloomEffect, PixelationEffect } from "postprocessing";
import { Input } from "./Input";
import ShipControl from "./ShipControl";
import _ from "lodash";

const scene = new Scene();
const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const components: { [id: string]: Component } = {};

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
    for (let id in components) {
        const component = components[id];
        component.startIfNeeded();
    }

    for (let id in components) {
        const component = components[id];
        component.update();
    }

    // renderer.render(scene, camera);
    composer.render();
    requestAnimationFrame(animate);
    input.clear();

    const componentsToDestroy = _(components).values().filter(v => {
        return v.shouldDestroy;
    }).value();

    for (let i = 0; i < componentsToDestroy.length; i++) {
        const component = componentsToDestroy[i];
        component.onDestroy();
        delete components[component.id];
    }
}

animate();

const addComponent = (component: Component) => {
    components[component.id] = component;
    component.scene = scene;
    component.input = input;
    component.addComponent = addComponent;
}

const cameraController = new CameraController();
cameraController.camera = camera;
cameraController.distance = 200;
addComponent(cameraController);

const shipMaterial = new MeshBasicMaterial({
    color: new Color(0.2, 0.6, 0.8)
});
const ship = new ShipBody();
ship.material = shipMaterial;
addComponent(ship);

const shipControl = new ShipControl();
shipControl.object = ship.object;
addComponent(shipControl);