import { Euler, Vector3 } from "three";
import Component from "../core/Component";
import Engine from "./Engine";
import Laser from "./Laser";
import ShipBody from "./ShipBody";
import Turrent from "./Turrent";

export default class ShipControl extends Component {
    public shipBody?: ShipBody;
    public leftEngine?: Engine;
    public rightEngine?: Engine;
    public maxRoll = Math.PI / 5;
    public rotationVelocity = new Vector3();
    public velocity = new Vector3();
    public rotationAcc = new Vector3(0, 0, 0.2);
    public acc = 0.06;
    public fireSpot = 0;
    public moveFriction = 0.9;
    public restFriction = 0.95;
    public maxSpeed = 0.2;
    public turrents: Turrent[] = [];

    public update() {
        const left = this.input.key("a") ? 1.0 : 0.0 - (this.input.key("d") ? 1.0 : 0.0);
        let forward = this.input.key("w") ? 1.0 : 0.0 - (this.input.key("s") ? 1.0 : 0.0);
        const fire = this.input.key("j");

        if (forward < 0) {
            forward = 0;
        }
        if (forward === 0 && left !== 0) {
            forward = 1.0;
        }

        const object = this.shipBody!.object;
        const rotation = object.rotation.clone();
        const forwardVector = new Vector3(0, 0, -1).applyEuler(rotation);

        const targetRoll = left * this.maxRoll;
        const targetRollVelocity = (targetRoll - rotation.z) * 0.1;
        const targetRollAcc = (targetRollVelocity - this.rotationVelocity.z);
        const rollAcc = clamp(targetRollAcc, -this.rotationAcc.z, this.rotationAcc.z);

        this.velocity.add(forwardVector.clone().multiplyScalar(this.acc * forward));
        const friction = forward > 0 ? this.moveFriction : this.restFriction;
        this.velocity.multiplyScalar(friction);

        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.setLength(this.maxSpeed);
        }

        this.rotationVelocity.z += rollAcc;
        rotation.z += this.rotationVelocity.z;

        const speedRatio = this.velocity.length() / this.maxSpeed;
        rotation.y += Math.sin(rotation.z) * 0.1 * speedRatio;

        object.position.add(this.velocity);
        object.rotation.copy(rotation);

        object.position.y = 0;
        object.rotation.x = 0;

        this.leftEngine!.amount = forward;
        this.rightEngine!.amount = forward;

        for (const turrent of this.turrents) {
            turrent.fire = fire;
        }
    }
}

const clamp = (v: number, min: number, max: number) => {
    if (v < min) {
        return min;
    }
    if (v > max) {
        return max;
    }
    return v;
};
