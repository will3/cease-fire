import _ from "lodash";
import { Clock, Scene } from "three";
import Component from "./Component";
import { Input } from "./Input";

export default class Runner {
    private components: { [id: string]: Component } = {};
    private scene: Scene;
    private input: Input;
    private clock: Clock;

    constructor(
        scene: Scene,
        input?: Input,
        clock?: Clock,
    ) {
        this.scene = scene;
        this.input = input!;
        this.clock = clock!;
    }

    public addComponent = (component: Component) => {
        this.components[component.id] = component;
        this.injectDeps(component);
    }

    public injectDeps(component: Component) {
        component.parent = component.parent || this.scene;
        component.scene = this.scene;
        component.input = this.input;
        component.runner = this;
        component.clock = this.clock;
    }

    public update() {
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
    }
}
