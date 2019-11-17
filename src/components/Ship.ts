import { Color, Object3D, Vector3 } from "three";

import _ from "lodash";
import Collider from "../core/Collider";
import Component from "../core/Component";
import { Contact } from "../core/Physics";
import { Command } from "../networking/common";
import ChunkMesh from "./ChunkMesh";
import EngineParticles from "./EngineParticles";
import ShipBody from "./ShipBody";
import ShipControl from "./ShipControl";
import ShipCutter from "./ShipCutter";
import ShipMovement from "./ShipMovement";
import Turrent from "./Turrent";

interface EngineParticleData {
    forward: number;
    boost: boolean;
}

export default class Ship extends Component {
    public type = "Ship";
    public isRemote = true;
    public body!: ShipBody;
    public object = new Object3D();
    public collider!: Collider;
    public color = new Color(0.2, 0.6, 0.8);

    private turrent!: Turrent;
    private movement!: ShipMovement;
    private shipControl!: ShipControl;
    private leftEngineParticles!: EngineParticles;
    private rightEngineParticles!: EngineParticles;

    private engineParticleData: EngineParticleData = {
        forward: 0,
        boost: false,
    };

    public start() {
        this.body = new ShipBody();
        this.body.parent = this.object;
        this.body.ship = this;
        this.body.color.copy(this.color);
        this.addComponent(this.body, true);

        this.turrent = new Turrent();
        this.addComponent(this.turrent, true);
        this.turrent.parent = this.object;

        const chunkMesh = new ChunkMesh();
        chunkMesh.parent = this.body.inner;
        this.body.chunkMesh = chunkMesh;
        this.addComponent(chunkMesh, true);

        const cutter = new ShipCutter();
        cutter.shipBody = this.body;
        this.addComponent(cutter, true);

        this.movement = new ShipMovement();
        this.movement.object = this.object;
        this.addComponent(this.movement, true);

        this.collider = new Collider();
        this.addComponent(this.collider, true);
        this.body.onRadiusUpdated = (r) => {
            this.collider.radius = r;
        };
        this.collider.onContact = (contact: Contact) => {
            if (this.body.mass === 0) {
                return;
            }

            if (contact.collider.static) {
                this.movement.velocity
                    .add(contact.force.clone().multiplyScalar(1 / this.body.mass).multiplyScalar(1));
                this.movement.velocity.multiplyScalar(0.8);
            } else {
                this.movement.velocity
                    .add(contact.force.clone().multiplyScalar(1 / this.body.mass).multiplyScalar(0.2));
            }
        };

        if (!this.isServer) {
            const leftEngine = new Object3D();
            const rightEngine = new Object3D();
            this.body.inner.add(leftEngine);
            this.body.inner.add(rightEngine);
            const offset = new Vector3(1.5, 1.5, 2.5);
            leftEngine.position.set(1, 0, 5).add(offset);
            rightEngine.position.set(9, 0, 5).add(offset);

            this.leftEngineParticles = new EngineParticles();
            this.leftEngineParticles.parent = leftEngine;
            this.addComponent(this.leftEngineParticles, true);

            this.rightEngineParticles = new EngineParticles();
            this.rightEngineParticles.parent = rightEngine;
            this.addComponent(this.rightEngineParticles, true);

            if (this.isOwn) {
                this.shipControl = new ShipControl();
                this.shipControl.shipId = this.id;
                this.shipControl.turrent = this.turrent;
                this.addComponent(this.shipControl, true);
            }
        }

        this.parent.add(this.object);
    }

    public update() {
        this.collider.position.copy(this.object.position);
    }

    public onDestroy() {
        this.parent.remove(this.object);
    }

    public serialize(): IShipData {
        this.startIfNeeded();
        return {
            position: this.object.position.toArray(),
            rotation: this.object.rotation.toArray(),
            engineParticleData: _.clone(this.engineParticleData),
        };
    }

    public deserialize(data: IShipData) {
        this.startIfNeeded();
        this.object.position.fromArray(data.position);
        this.object.rotation.fromArray(data.rotation);

        this.engineParticleData = data.engineParticleData;

        if (this.leftEngineParticles != null) {
            this.leftEngineParticles.amount = this.engineParticleData.forward;
            this.leftEngineParticles.boost = this.engineParticleData.boost;
        }

        if (this.rightEngineParticles != null) {
            this.rightEngineParticles.amount = this.engineParticleData.forward;
            this.rightEngineParticles.boost = this.engineParticleData.boost;
        }
    }

    public onCommand(command: Command) {
        if (command.type === "ShipMovement") {
            this.movement.updateCommand(command);
            this.engineParticleData.boost = command.data.boost;
            this.engineParticleData.forward = command.data.forward;
        }
    }
}

interface IShipData {
    position: number[];
    rotation: number[];
    engineParticleData: EngineParticleData;
}
