import { Object3D, Vector3 } from "three";

import _ from "lodash";
import Component from "../core/Component";
import Engine from "./Engine";
import ShipBody from "./ShipBody";
import ShipControl from "./ShipControl";
import Turrent from "./Turrent";

export default class Ship extends Component {
    public type = "Ship";
    public isRemote = true;
    public body!: ShipBody;
    public turrents: Turrent[] = [];

    public start() {
        this.body = new ShipBody();
        this.addComponent(this.body);

        const leftEngine = new Object3D();
        const rightEngine = new Object3D();
        this.body.inner.add(leftEngine);
        this.body.inner.add(rightEngine);
        const offset = new Vector3(1.5, 1.5, 2.5);
        leftEngine.position.set(1, 0, 5).add(offset);
        rightEngine.position.set(9, 0, 5).add(offset);

        this.turrents = [new Turrent()];

        for (const turrent of this.turrents) {
            this.addComponent(turrent);
            turrent.parent = this.body.object;
        }

        if (!this.isServer) {
            const left = new Engine();
            left.parent = leftEngine;
            this.addComponent(left);

            const right = new Engine();
            right.parent = rightEngine;
            this.addComponent(right);

            if (this.isOwn) {
                const shipControl = new ShipControl();
                shipControl.shipBody = this.body;
                shipControl.leftEngine = left;
                shipControl.rightEngine = right;
                shipControl.turrents = this.turrents;
                this.addComponent(shipControl);
            }
        }
    }

    public serialize(): IShipData {
        this.startIfNeeded();
        return {
            position: this.body.object.position.toArray(),
            rotation: this.body.object.rotation.toArray(),
        };
    }

    public deserialize(data: IShipData) {
        this.startIfNeeded();
        this.body.object.position.fromArray(data.position);
        this.body.object.rotation.fromArray(data.rotation);
    }
}

interface IShipData {
    position: number[];
    rotation: number[];
}
