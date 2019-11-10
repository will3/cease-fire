import { Object3D, Vector3 } from "three";

import _ from "lodash";
import Component from "../core/Component";
import EngineParticles from "./EngineParticles";
import ShipBody from "./ShipBody";
import ShipControl from "./ShipControl";
import Turrent from "./Turrent";

export default class Ship extends Component {
    public type = "Ship";
    public isRemote = true;
    public body!: ShipBody;
    public object = new Object3D();

    public maxRoll = Math.PI / 5;
    public rotationVelocity = new Vector3();
    public velocity = new Vector3();
    public rotationAcc = new Vector3(0, 0, 0.2);
    public acc = 0.04;
    public moveFriction = 0.9;
    public restFriction = 0.95;
    public maxSpeed = 0.2;
    public engineRunning = false;
    public boost = false;
    public turnSpeed = 0.05;

    public start() {
        this.body = new ShipBody();
        this.body.parent = this.object;
        this.addComponent(this.body, true);

        const leftEngine = new Object3D();
        const rightEngine = new Object3D();
        this.body.inner.add(leftEngine);
        this.body.inner.add(rightEngine);
        const offset = new Vector3(1.5, 1.5, 2.5);
        leftEngine.position.set(1, 0, 5).add(offset);
        rightEngine.position.set(9, 0, 5).add(offset);

        const turrent = new Turrent();
        this.addComponent(turrent, true);
        turrent.parent = this.object;

        if (!this.isServer) {
            const left = new EngineParticles();
            left.parent = leftEngine;
            this.addComponent(left, true);

            const right = new EngineParticles();
            right.parent = rightEngine;
            this.addComponent(right, true);

            if (this.isOwn) {
                const shipControl = new ShipControl();
                shipControl.ship = this;
                shipControl.leftEngine = left;
                shipControl.rightEngine = right;
                shipControl.turrent = turrent;
                this.addComponent(shipControl, true);
            }
        }

        this.parent.add(this.object);
    }

    public update() {
        this.updateRigidBody();
    }

    public onDestroy() {
        this.parent.remove(this.object);
    }

    public serialize(): IShipData {
        this.startIfNeeded();
        return {
            position: this.object.position.toArray(),
            rotation: this.object.rotation.toArray(),
        };
    }

    public deserialize(data: IShipData) {
        this.startIfNeeded();
        this.object.position.fromArray(data.position);
        this.object.rotation.fromArray(data.rotation);
    }

    private updateRigidBody() {
        const friction = this.engineRunning ? this.moveFriction : this.restFriction;
        this.velocity.multiplyScalar(friction);

        this.object.rotation.z += this.rotationVelocity.z;

        const speedRatio = this.velocity.length() / this.maxSpeed;
        this.object.rotation.y += Math.sin(this.object.rotation.z) * this.turnSpeed * speedRatio;

        this.object.position.add(this.velocity);

        this.object.position.y = 0;
        this.object.rotation.x = 0;
    }
}

interface IShipData {
    position: number[];
    rotation: number[];
}
