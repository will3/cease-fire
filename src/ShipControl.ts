import Component from "./Component";
import { Object3D, Euler, Vector3 } from "three";
import Laser from "./Laser";

export default class ShipControl extends Component {
    object: Object3D;
    rotation = new Euler(0, 0, 0, "YXZ");
    maxRoll = Math.PI / 5;
    rotationVelocity = new Vector3();
    velocity = new Vector3();
    rotationAcc = new Vector3(0, 0, 0.2);
    acc = 0.12;
    fireAmount = 0;
    fireInterval = 0.1;
    fireSpot = 0;

    update() {
        const left = this.input.key("a") ? 1.0 : 0.0 - (this.input.key("d") ? 1.0 : 0.0);
        let forward = this.input.key("w") ? 1.0 : 0.0 - (this.input.key("s") ? 1.0 : 0.0);
        const fire = this.input.key("j");

        if (forward < 0) {
            forward = 0;
        }
        if (forward == 0 && left !== 0) {
            forward = 1.0;
        }
        const forwardVector = new Vector3(0, 0, -1).applyEuler(this.rotation);

        const targetRoll = left * this.maxRoll;
        const targetRollVelocity = (targetRoll - this.rotation.z) * 0.1;
        const targetRollAcc = (targetRollVelocity - this.rotationVelocity.z);
        const rollAcc = clamp(targetRollAcc, -this.rotationAcc.z, this.rotationAcc.z);

        this.velocity.add(forwardVector.clone().multiplyScalar(this.acc * forward));
        const friction = forward > 0 ? 0.9 : 0.95;
        this.velocity.multiplyScalar(friction);

        this.rotationVelocity.z += rollAcc;
        this.rotation.z += this.rotationVelocity.z;

        const maxSpeed = this.acc / (1 - friction);
        const speedRatio = this.velocity.length() / maxSpeed;
        this.rotation.y += Math.sin(this.rotation.z) * 0.1 * speedRatio;

        this.object.position.add(this.velocity);
        this.object.rotation.copy(this.rotation);

        this.object.position.y = 0;
        this.object.rotation.x = 0;

        this.object.position.set(0, 0, 0);

        if (fire) {
            if (this.fireAmount > this.fireInterval) {
                const laser = new Laser();
                const rotation = new Euler(0, this.rotation.y + (Math.random() - 0.5) * 2.0 * 0.01, 0);
                this.fireSpot %= 3;
                const x = [-0.5, 0, 0.5];
                const dir = new Vector3(x[this.fireSpot], 0, -1).applyEuler(rotation);
                laser.object.rotation.copy(rotation);
                laser.object.position.copy(this.object.position.clone().add(dir.multiplyScalar(2)));
                this.addComponent(laser);
                this.fireAmount = 0;
                this.fireSpot += 1;
            }
        }

        this.fireAmount += 1 / 60;
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