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
    public ship!: ShipBody;
    public turrents: Turrent[] = [];

    public start() {
        this.ship = new ShipBody();
        this.addComponent(this.ship);

        const leftEngine = new Object3D();
        const rightEngine = new Object3D();
        this.ship.inner.add(leftEngine);
        this.ship.inner.add(rightEngine);
        const offset = new Vector3(1.5, 1.5, 2.5);
        leftEngine.position.set(1, 0, 5).add(offset);
        rightEngine.position.set(9, 0, 5).add(offset);

        this.turrents = [new Turrent()];

        for (const turrent of this.turrents) {
            this.addComponent(turrent);
            turrent.parent = this.ship.object;
        }

        if (!this.isServer) {
            const left = new Engine();
            left.parent = leftEngine;
            this.addComponent(left);

            const right = new Engine();
            right.parent = rightEngine;
            this.addComponent(right);

            const shipControl = new ShipControl();
            shipControl.shipBody = this.ship;
            shipControl.leftEngine = left;
            shipControl.rightEngine = right;
            this.addComponent(shipControl);
        }
    }

    public serialize(): IShipData {
        this.startIfNeeded();
        return {
            position: this.ship.object.position.toArray(),
            rotation: this.ship.object.rotation.toArray(),
        };
    }

    public deserialize(data: IShipData) {
        this.startIfNeeded();
        this.ship.object.position.fromArray(data.position);
        this.ship.object.rotation.fromArray(data.rotation);
    }
}

interface IShipData {
    position: number[];
    rotation: number[];
}
