import Component from "./Component";
import { Scene, Clock } from "three";
import { Input } from "./Input";
import _ from "lodash";

export default class Runner {
    components: { [id: string]: Component } = {};
    scene: Scene;
    input: Input;
    clock: Clock;
    isServer: boolean;

    constructor(
        isServer: boolean,
        scene: Scene,
        input?: Input,
        clock?: Clock,
    ) {
        this.isServer = isServer;
        this.scene = scene;
        this.input = input!;
        this.clock = clock!;
    }

    addComponent = (component: Component) => {
        this.components[component.id] = component;
        component.parent = component.parent || this.scene;
        component.scene = this.scene;
        component.input = this.input;
        component.runner = this;
        component.clock = this.clock;
    }

    update() {
        for (let id in this.components) {
            const component = this.components[id];
            component.startIfNeeded();
        }

        for (let id in this.components) {
            const component = this.components[id];
            if (component.started) {
                component.update();
            }
        }

        const componentsToDestroy = _(this.components).values().filter(v => {
            return v.shouldDestroy;
        }).value();

        for (let i = 0; i < componentsToDestroy.length; i++) {
            const component = componentsToDestroy[i];
            component.onDestroy();
            delete this.components[component.id];
        }
    }
};