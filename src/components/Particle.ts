import { Sprite } from "three";
import ValueCurve from "../ValueCurve";
export class Particle {
    public dead = true;
    public object = new Sprite();
    public life = 0.0;
    public timeToLive = 0.0;
    public scale = new ValueCurve(1);

    constructor() {
        this.object.visible = false;
    }

    public kill() {
        this.object.visible = false;
        this.life = 0.0;
        this.dead = true;
    }

    public born() {
        this.object.visible = true;
        this.dead = false;
    }
}
