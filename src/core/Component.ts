import guid from "uuid/v4";
import { Object3D, Scene, Clock } from "three";
import { Input } from "./Input";
import Runner from "./Runner";

export default class Component {
    type!: string;

    parent!: Object3D;
    scene!: Scene;
    input!: Input;
    clock!: Clock;
    runner!: Runner;

    shouldDestroy = false;
    started = false;

    isRemote = false;
    isServer = false;
    ownerId?: string;
    id = guid();

    startIfNeeded() {
        if (this.started) {
            return;
        }
        this.start();
        this.started = true;
    }

    start() { }
    update() { }
    onDestroy() { }
    serialize(): any { return {}; }
    deserialize(data: any) { }

    destroy() {
        this.shouldDestroy = true;
    }

    addComponent(component: Component) {
        this.runner.addComponent(component);
    };
};