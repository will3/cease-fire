import { Clock, Object3D, Scene, Camera } from "three";
import guid from "uuid/v4";

import _ from "lodash";
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
    public camera!: Camera;

    public shouldDestroy = false;
    public started = false;
    public destroyed = false;
    public isOwn = false;

    public isRemote = false;
    public isServer = false;
    public ownerId?: string;
    public id = guid();
    private children: Component[] = [];

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

    public beforeRender() {
        // TODO override
    }

    public destroy() {
        this.shouldDestroy = true;
        this.children.forEach((c) => c.destroy());
    }

    public addComponent(component: Component, isChild: boolean = false) {
        this.runner.addComponent(component);
        if (isChild) {
            this.children.push(component);
        }
    }

    public findComponents(type: string) {
        return this.runner.findComponents(type);
    }

    public getComponent(id: string) {
        return this.runner.getComponent(id);
    }
}
