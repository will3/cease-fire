import _ from "lodash";
import { Camera, Scene } from "three";
import Component from "./Component";
import ComponentFactory from "./ComponentFactory";
import ComponentState from "./ComponentState";
import { Input } from "./Input";
import { RunnerOptions } from "./RunnerOptions";

const defaultFrameRate = 60;

export default class Runner {
    public components: { [id: string]: Component } = {};
    private scene: Scene;
    private componentFactory: ComponentFactory;
    private input: Input;
    private camera: Camera;

    private time = {
        deltaTime: 1 / defaultFrameRate,
        elaspedTime: 0,
    };

    constructor(options: RunnerOptions) {
        this.scene = options.scene;
        this.input = options.input!;
        this.componentFactory = options.componentFactory!;
        this.camera = options.camera!;
    }

    public restoreComponent(state: ComponentState) {
        const id = state.id;
        if (this.components[id] != null) {
            // TODO update component
            return;
        }

        console.log(`spawn ${JSON.stringify(state)}`);
        const component = this.componentFactory.create(state.type);
        this.injectDeps(component);
        component.isServer = true;
        component.deserialize(state.state);
        component.id = state.id;
        component.ownerId = state.ownerId;
        this.addComponent(component);
    }

    public findComponents(type: string) {
        return _(this.components).filter((c) => c.type === type).value();
    }

    public addComponent(component: Component) {
        this.components[component.id] = component;
        this.injectDeps(component);
    }

    public getComponent(id: string) {
        return this.components[id];
    }

    public injectDeps(component: Component) {
        component.parent = component.parent || this.scene;
        component.scene = this.scene;
        component.runner = this;
        component.time = this.time;
        component.input = this.input;
        component.camera = this.camera;
    }

    public update(dt: number) {
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

    public beforeRender() {
        _.forEach(this.components, (component) => {
            component.beforeRender();
        });
    }
}
