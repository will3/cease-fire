import { Object3D, Vector3 } from "three";

import _ from "lodash";
import Component from "../core/Component";
import ChunkMesh from "./ChunkMesh";
import EngineParticles from "./EngineParticles";
import ShipBody from "./ShipBody";
import ShipControl from "./ShipControl";
import ShipCutter from "./ShipCutter";
import ShipRigidBody from "./ShipRigidBody";
import Turrent from "./Turrent";

export default class Ship extends Component {
    public type = "Ship";
    public isRemote = true;
    public body!: ShipBody;
    public object = new Object3D();

    public start() {
        this.body = new ShipBody();
        this.body.parent = this.object;
        this.body.ship = this;
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

        const chunkMesh = new ChunkMesh();
        chunkMesh.parent = this.body.inner;
        this.body.chunkMesh = chunkMesh;
        this.addComponent(chunkMesh, true);

        const cutter = new ShipCutter();
        cutter.shipBody = this.body;
        this.addComponent(cutter, true);

        const rigidBody = new ShipRigidBody();
        rigidBody.object = this.object;
        this.addComponent(rigidBody, true);

        if (!this.isServer) {
            const left = new EngineParticles();
            left.parent = leftEngine;
            this.addComponent(left, true);

            const right = new EngineParticles();
            right.parent = rightEngine;
            this.addComponent(right, true);

            if (this.isOwn) {
                const shipControl = new ShipControl();
                shipControl.rigidBody = rigidBody;
                shipControl.leftEngine = left;
                shipControl.rightEngine = right;
                shipControl.turrent = turrent;
                this.addComponent(shipControl, true);
            }
        }

        this.parent.add(this.object);
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
}

interface IShipData {
    position: number[];
    rotation: number[];
}
