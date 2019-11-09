import { Clock, Scene } from "three";
import ComponentFactory from "./ComponentFactory";
import { Input } from "./Input";

export interface RunnerOptions {
    scene: Scene;
    input?: Input;
    clock?: Clock;
    componentFactory?: ComponentFactory;
}
