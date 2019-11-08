import { Clock, Scene } from "three";
import { Input } from "./Input";
import { ComponentFactory } from "./ComponentFactory";
export interface RunnerOptions {
    scene: Scene;
    input?: Input;
    clock?: Clock;
    componentFactory?: ComponentFactory;
}
