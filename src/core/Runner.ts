import _ from "lodash";
import { Scene } from "three";
import Component from "./Component";
import { ComponentFactory } from "./ComponentFactory";
import ComponentState from "./ComponentState";
import { Input } from "./Input";
import { RunnerOptions } from "./RunnerOptions";

const defaultFrameRate = 60;

export default class Runner {
    public components: { [id: string]: Component } = {};
    private scene: Scene;
    private input: Input;
    private componentFactory: ComponentFactory;

    private time = {
        deltaTime: 1 / defaultFrameRate,
        elaspedTime: 0,
    };

    constructor(options: RunnerOptions) {
        this.scene = options.scene;
        this.input = options.input!;
        this.componentFactory = options.componentFactory!;
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

    public addComponent(component: Component) {
        this.components[component.id] = component;
        this.injectDeps(component);
    }

    public injectDeps(component: Component) {
        component.parent = component.parent || this.scene;
        component.scene = this.scene;
        component.input = this.input;
        component.runner = this;
        component.time = this.time;
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

        const componentsToDestroy = _(this.components)
            .values()
            .filter((v) => {
                return v.shouldDestroy;
            })
            .value();

        for (const component of componentsToDestroy) {
            component.onDestroy();
            delete this.components[component.id];
        }

        this.time.deltaTime = dt;
        this.time.elaspedTime += dt;
    }
}
