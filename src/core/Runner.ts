import _ from "lodash";
import { Camera, Scene } from "three";
import guid from "uuid/v4";
import Client from "../networking/Client";
import Component from "./Component";
import ComponentFactory from "./ComponentFactory";
import ComponentState from "./ComponentState";
import { Input } from "./Input";
import Physics from "./Physics";

const defaultFrameRate = 60;

export interface RunnerOptions {
    scene: Scene;
    input?: Input;
    componentFactory?: ComponentFactory;
    camera?: Camera;
    physics?: Physics;
    isServer: boolean;
}

export default class Runner {
    public components: { [id: string]: Component } = {};
    public client!: Client;
    public id = guid();
    private scene: Scene;
    private componentFactory: ComponentFactory;
    private input: Input;
    private camera: Camera;
    private physics: Physics;
    private isServer: boolean;

    private time = {
        deltaTime: 1 / defaultFrameRate,
        elaspedTime: 0,
    };

    constructor(options: RunnerOptions) {
        this.scene = options.scene;
        this.input = options.input!;
        this.componentFactory = options.componentFactory!;
        this.camera = options.camera!;
        this.physics = options.physics || new Physics();
        this.isServer = options.isServer;
    }

    public restoreComponent(state: ComponentState) {
        const id = state.id;
        if (this.components[id] != null) {
            // TODO update component
            const component = this.components[id];
            component.deserialize(state.state);
            return;
        }

        console.log(`spawn ${JSON.stringify(state)}`);
        const component = this.componentFactory.create(state.type);
        this.injectDeps(component);
        component.isServer = this.isServer;
        component.deserialize(state.state);
        component.id = state.id;
        component.ownerId = state.ownerId;
        this.addComponent(component);
    }

    public getComponent(id: string) {
        return this.components[id];
    }

    public getComponents(type: string) {
        return _(this.components).filter((c) => c.type === type).value();
    }

    public addComponent(component: Component) {
        this.components[component.id] = component;
        this.injectDeps(component);
    }

    public destroyComponent(component: Component) {
        component.shouldDestroy = true;
        component.children.forEach((c) => c.destroy());
    }

    public injectDeps(component: Component) {
        component.parent = component.parent || this.scene;
        component.scene = this.scene;
        component.runner = this;
        component.time = this.time;
        component.input = this.input;
        component.camera = this.camera;
        component.physics = this.physics;
    }

    public update(dt: number) {
        this.physics.update();

        _.forEach(this.components, (component) => {
            component.startIfNeeded();
        });

        _.forEach(this.components, (component) => {
            if (component.started) {
                component.update();
            }
        });

        _(this.components)
            .filter((c) => {
                return c.shouldDestroy;
            })
            .forEach((c) => {
                c.onDestroy();
                c.destroyed = true;
                delete this.components[c.id];
            });

        this.time.deltaTime = dt;
        this.time.elaspedTime += dt;
    }

    public lateUpdate() {
        _.forEach(this.components, (component) => {
            component.lateUpdate();
        });
    }

    public beforeRender() {
        _.forEach(this.components, (component) => {
            component.beforeRender();
        });
    }
}
