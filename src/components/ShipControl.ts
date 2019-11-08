import { Euler, Vector3 } from "three";
import Component from "../core/Component";
import Engine from "./Engine";
import Laser from "./Laser";
import ShipBody from "./ShipBody";

export default class ShipControl extends Component {
    public shipBody?: ShipBody;
    public leftEngine?: Engine;
    public rightEngine?: Engine;
    public rotation = new Euler(0, 0, 0, "YXZ");
    public maxRoll = Math.PI / 5;
    public rotationVelocity = new Vector3();
    public velocity = new Vector3();
    public rotationAcc = new Vector3(0, 0, 0.2);
    public acc = 0.06;
    public fireAmount = 0;
    public fireInterval = 0.1;
    public fireSpot = 0;
    public moveFriction = 0.9;
    public restFriction = 0.95;
    public maxSpeed = 0.2;

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
        const forwardVector = new Vector3(0, 0, -1).applyEuler(this.rotation);

        const targetRoll = left * this.maxRoll;
        const targetRollVelocity = (targetRoll - this.rotation.z) * 0.1;
        const targetRollAcc = (targetRollVelocity - this.rotationVelocity.z);
        const rollAcc = clamp(targetRollAcc, -this.rotationAcc.z, this.rotationAcc.z);

        this.velocity.add(forwardVector.clone().multiplyScalar(this.acc * forward));
        const friction = forward > 0 ? this.moveFriction : this.restFriction;
        this.velocity.multiplyScalar(friction);

        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.setLength(this.maxSpeed);
        }

        this.rotationVelocity.z += rollAcc;
        this.rotation.z += this.rotationVelocity.z;

        const speedRatio = this.velocity.length() / this.maxSpeed;
        this.rotation.y += Math.sin(this.rotation.z) * 0.1 * speedRatio;

        const object = this.shipBody!.object;
        object.position.add(this.velocity);
        object.rotation.copy(this.rotation);

        object.position.y = 0;
        object.rotation.x = 0;

        // object.position.set(0, 0, 0);

        if (fire) {
            if (this.fireAmount > this.fireInterval) {
                const laser = new Laser();
                const rotation = new Euler(0, this.rotation.y + (Math.random() - 0.5) * 2.0 * 0.01, 0);
                this.fireSpot %= 3;
                const x = [-0.5, 0, 0.5];
                const dir = new Vector3(x[this.fireSpot], 0, -1).applyEuler(rotation);
                laser.object.rotation.copy(rotation);
                laser.object.position.copy(object.position.clone().add(dir.multiplyScalar(2)));
                this.addComponent(laser);
                this.fireAmount = 0;
                this.fireSpot += 1;
            }
        }

        this.fireAmount += 1 / 60;

        this.leftEngine!.amount = forward;
        this.rightEngine!.amount = forward;
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
