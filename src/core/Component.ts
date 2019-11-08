import { Clock, Object3D, Scene } from "three";
import guid from "uuid/v4";

import { Input } from "./Input";
import Runner from "./Runner";
import { Time } from "./Time";

export default class Component {
    public type!: string;

    public parent!: Object3D;
    public scene!: Scene;
    public input!: Input;
    public clock!: Clock;
    public runner!: Runner;
    public time!: Time;

    public shouldDestroy = false;
    public started = false;

    public isRemote = false;
    public isServer = false;
    public ownerId?: string;
    public id = guid();

    public startIfNeeded() {
        if (this.started) {
            return;
        }
        this.start();
        this.started = true;
    }

    public start() {
        // TODO override
    }
    public update() {
        // TODO override
    }
    public onDestroy() {
        // TODO override
    }
    public serialize(): any { return {}; }
    public deserialize(_: any) {
        // TODO override
    }

    public destroy() {
        this.shouldDestroy = true;
    }

    public addComponent(component: Component) {
        this.runner.addComponent(component);
    }
}
