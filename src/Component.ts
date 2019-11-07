import guid from "uuid/v4";
import { Scene } from "three";
import { Input } from "./Input";

export default class Component {
    scene: Scene;
    input: Input;
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