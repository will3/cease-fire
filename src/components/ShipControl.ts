import { Vector3 } from "three";
import Component from "../core/Component";
import { clamp } from "../math";
import EngineParticles from "./EngineParticles";
import Ship from "./Ship";
import Turrent from "./Turrent";

export default class ShipControl extends Component {
    public leftEngine?: EngineParticles;
    public rightEngine?: EngineParticles;
    public ship!: Ship;

    public turrent?: Turrent;

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

        this.leftEngine!.amount = forward;
        this.rightEngine!.amount = forward;

        if (this.turrent != null) {
            this.turrent.fire = fire;
        }

        this.ship.engineRunning = forward > 0;

        const rotation = this.ship.object.rotation.clone();
        const forwardVector = new Vector3(0, 0, -1).applyEuler(rotation);

        const targetRoll = left * this.ship.maxRoll;
        const targetRollVelocity = (targetRoll - rotation.z) * 0.1;
        const targetRollAcc = (targetRollVelocity - this.ship.rotationVelocity.z);
        const rollAcc = clamp(targetRollAcc, -this.ship.rotationAcc.z, this.ship.rotationAcc.z);
        this.ship.rotationVelocity.z += rollAcc;
        this.ship.velocity.add(forwardVector.clone().multiplyScalar(this.ship.acc * forward));
    }
}
