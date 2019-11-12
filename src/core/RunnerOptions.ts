import { Camera, Clock, Scene } from "three";
import Physics from "./Physics";
import ComponentFactory from "./ComponentFactory";
import { Input } from "./Input";

export interface RunnerOptions {
    scene: Scene;
    input?: Input;
    clock?: Clock;
    componentFactory?: ComponentFactory;
    camera?: Camera;
    physics?: Physics;
}
