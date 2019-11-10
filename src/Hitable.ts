import { Intersection } from "three";
export interface Hitable {
    onHit: (result: Intersection) => void;
}
