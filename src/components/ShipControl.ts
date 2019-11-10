import { Vector3 } from "three";
import Component from "../core/Component";
import { clamp } from "../math";
import EngineParticles from "./EngineParticles";
import Ship from "./Ship";
import Turrent from "./Turrent";

export default class ShipControl extends Component {
    public leftEngine!: EngineParticles;
    public rightEngine!: EngineParticles;
    public ship!: Ship;

    public turrent?: Turrent;

    public update() {
        const left = this.input.key("a") ? 1.0 : 0.0 - (this.input.key("d") ? 1.0 : 0.0);
        let forward = this.input.key("w") ? 1.0 : 0.0 - (this.input.key("s") ? 1.0 : 0.0);
        const fire = this.input.key("j");
        const boost = this.input.key("k");

        if (forward < 0) {
            forward = 0;
        }
        if (forward === 0 && left !== 0) {
            forward = 0.5;
        }

        if (boost) {
            forward = 1.0;
        }

        this.leftEngine.amount = forward;
        this.rightEngine.amount = forward;
        this.leftEngine.boost = boost;
        this.rightEngine.boost = boost;

        this.ship.boost = boost;

        if (this.turrent != null) {
            this.turrent.fire = fire;
        }

        this.ship.engineRunning = forward > 0;

        const rotation = this.ship.object.rotation.clone();
        const forwardVector = new Vector3(0, 0, -1).applyEuler(rotation);

        const targetRoll = left * this.ship.maxRoll;
        const targetRollVelocity = (targetRoll - rotation.z) * 0.2;
        const targetRollAcc = (targetRollVelocity - this.ship.rotationVelocity.z);
        const rollAcc = clamp(targetRollAcc, -this.ship.rotationAcc.z, this.ship.rotationAcc.z);
        this.ship.rotationVelocity.z += rollAcc;
        const boostFactor = boost ? 2 : 1;
        const acc = forwardVector.clone().multiplyScalar(this.ship.acc * forward).multiplyScalar(boostFactor);
        this.ship.velocity.add(acc);
    }
}
