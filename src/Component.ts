import guid from "uuid/v4";
import { Object3D, Scene, Clock } from "three";
import { Input } from "./Input";

export default class Component {
    parent: Object3D;
    scene: Scene;
    input: Input;
    clock: Clock;
    addComponent: (component: Component) => void;
    id = guid();
    shouldDestroy = false;
    private _started = false;
    startIfNeeded() {
        if (this._started) {
            return;
        }
        this.start();
        this._started = true;
    }

    start() { }
    update() { }
    onDestroy() { }

    destroy() {
        this.shouldDestroy = true;
    }
};