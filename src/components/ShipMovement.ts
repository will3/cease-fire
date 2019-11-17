import { Object3D, Vector3 } from "three";
import Component from "../core/Component";
import { clamp } from "../math";
import { Command } from "../networking/common";

export default class ShipMovement extends Component {
    public object!: Object3D;

    public maxRoll = Math.PI / 7;
    public rotationVelocity = new Vector3();
    public velocity = new Vector3();
    public rotationAcc = new Vector3(0, 0, 2);
    public acc = 0.04;
    public moveFriction = 0.9;
    public restFriction = 0.95;
    public maxSpeed = 0.2;
    public engineRunning = false;
    public boost = false;
    public turnSpeed = 0.05;

    public update() {
        this.updateRigidBody();
    }

    public updateCommand(command: Command) {
        const boost = command.data.boost;
        const forward = command.data.forward;
        const left = command.data.left;

        this.boost = boost;

        this.engineRunning = forward > 0;

        const rotation = this.object.rotation.clone();
        const forwardVector = new Vector3(0, 0, -1).applyEuler(rotation);

        const targetRoll = left * this.maxRoll;
        const targetRollVelocity = (targetRoll - rotation.z) * 0.2;
        const targetRollAcc = (targetRollVelocity - this.rotationVelocity.z);
        const rollAcc = clamp(targetRollAcc, -this.rotationAcc.z, this.rotationAcc.z);
        this.rotationVelocity.z += rollAcc;
        const boostFactor = boost ? 2 : 1;
        const acc = forwardVector.clone().multiplyScalar(this.acc * forward).multiplyScalar(boostFactor);
        this.velocity.add(acc);
    }

    private updateRigidBody() {
        const friction = this.engineRunning ? this.moveFriction : this.restFriction;
        this.velocity.multiplyScalar(friction);

        this.object.rotation.z += this.rotationVelocity.z;

        this.object.rotation.y += Math.sin(this.object.rotation.z) * this.turnSpeed;

        this.object.position.add(this.velocity);

        this.object.position.y = 0;
        this.object.rotation.x = 0;
    }
}
