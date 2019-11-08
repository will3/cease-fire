import Component from "../core/Component";
import ShipBody from "./ShipBody";
import { Object3D, Vector3 } from "three";
import Engine from "./Engine";
import ShipControl from "./ShipControl";

export default class Ship extends Component {
    type = "Ship";
    isRemote = true;
    ship!: ShipBody;

    start() {
        this.ship = new ShipBody();
        this.addComponent(this.ship);

        const leftEngine = new Object3D();
        const rightEngine = new Object3D();
        this.ship.inner.add(leftEngine);
        this.ship.inner.add(rightEngine);
        const offset = new Vector3(1.5, 1.5, 2.5);
        leftEngine.position.set(1, 0, 5).add(offset);
        rightEngine.position.set(9, 0, 5).add(offset);

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

    serialize(): ShipData {
        this.startIfNeeded();
        return {
            position: this.ship.object.position.toArray(),
            rotation: this.ship.object.rotation.toArray()
        };
    }

    deserialize(data: ShipData) {
        this.startIfNeeded();
        this.ship.object.position.fromArray(data.position);
        this.ship.object.rotation.fromArray(data.rotation);
    }
};

interface ShipData {
    position: number[];
    rotation: number[];
};