import { Camera, Clock, Object3D, Scene } from "three";
import guid from "uuid/v4";

import { Command } from "../networking/common";
import { Input } from "./Input";
import Physics from "./Physics";
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
    public physics!: Physics;

    public shouldDestroy = false;
    public started = false;
    public destroyed = false;
    public get isOwn() {
        return this.ownerId === this.runner.playerId;
    }

    public isRemote = false;
    public isServer = false;
    public ownerId?: string;
    public id = guid();
    public readonly children: Component[] = [];
    public parentComponent?: Component;
    public isShadow = false;
    public destroyByClient = false;

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
    public sendCommand(command: Command) {
        this.runner.client.sendCommand([command]);
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

    public lateUpdate() {
        // TODO override
    }

    public onCommand(command: Command) {
        // TODO override
    }

    public destroy() {
        this.runner.destroyComponent(this);
    }

    public addComponent(component: Component, isChild: boolean = false) {
        this.runner.addComponent(component);
        component.parentComponent = this;
        if (isChild) {
            this.children.push(component);
        }
    }

    public getComponents(type: string) {
        if (this.parentComponent == null) {
            return undefined;
        }
        return this.parentComponent.children.filter((c) => c.type === type);
    }

    public getComponent(type: string) {
        if (this.parentComponent == null) {
            return undefined;
        }
        return this.parentComponent.children.find((c) => c.type === type);
    }
}
