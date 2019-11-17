import { Color, Object3D, Vector3 } from "three";

import _ from "lodash";
import Collider from "../core/Collider";
import Component from "../core/Component";
import { Contact } from "../core/Physics";
import { Command } from "../networking/common";
import ChunkMesh from "./ChunkMesh";
import EngineParticles from "./EngineParticles";
import ShipBody, { Damage } from "./ShipBody";
import ShipControl from "./ShipControl";
import ShipCutter from "./ShipCutter";
import ShipMovement from "./ShipMovement";
import Turrent from "./Turrent";

interface EngineParticleData {
    forward: number;
    boost: boolean;
}

interface ShipData {
    position: number[];
    rotation: number[];
    engineParticleData: EngineParticleData;
    damages: Damage[];
}

export default class Ship extends Component {
    public type = "Ship";
    public isRemote = true;
    public shipBody!: ShipBody;
    public readonly object = new Object3D();
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
        this.shipBody = new ShipBody();
        this.shipBody.parent = this.object;
        this.shipBody.ship = this;
        this.shipBody.color.copy(this.color);
        this.addComponent(this.shipBody, true);

        this.turrent = new Turrent();
        this.addComponent(this.turrent, true);
        this.turrent.parent = this.object;

        const chunkMesh = new ChunkMesh();
        chunkMesh.parent = this.shipBody.inner;
        this.shipBody.chunkMesh = chunkMesh;
        this.addComponent(chunkMesh, true);

        const cutter = new ShipCutter();
        cutter.shipBody = this.shipBody;
        this.addComponent(cutter, true);

        this.movement = new ShipMovement();
        this.movement.object = this.object;
        this.addComponent(this.movement, true);

        if (this.isServer) {
            this.initCollider();
        }

        if (!this.isServer) {
            const leftEngine = new Object3D();
            const rightEngine = new Object3D();
            this.shipBody.inner.add(leftEngine);
            this.shipBody.inner.add(rightEngine);
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
        if (this.collider != null) {
            this.collider.position.copy(this.object.position);
        }
    }

    public onDestroy() {
        this.parent.remove(this.object);
    }

    public serialize(): ShipData {
        this.startIfNeeded();
        return {
            position: this.object.position.toArray(),
            rotation: this.object.rotation.toArray(),
            engineParticleData: _.clone(this.engineParticleData),
            damages: this.shipBody.damages,
        };
    }

    public deserialize(data: ShipData) {
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

        if (this.shipBody != null) {
            this.shipBody.damages = data.damages;
        }
    }

    public onCommand(command: Command) {
        if (command.type === "ShipMovement") {
            this.movement.updateCommand(command);
            this.engineParticleData.boost = command.data.boost;
            this.engineParticleData.forward = command.data.forward;

            this.turrent.fire = command.data.fire;
        }
    }

    private initCollider() {
        this.collider = new Collider();
        this.addComponent(this.collider, true);
        this.shipBody.onRadiusUpdated = (r) => {
            this.collider.radius = r;
        };
        this.collider.onContact = (contact: Contact) => {
            if (this.shipBody.mass === 0) {
                return;
            }

            if (contact.collider.static) {
                this.movement.velocity
                    .add(contact.force.clone().multiplyScalar(1 / this.shipBody.mass).multiplyScalar(1));
                this.movement.velocity.multiplyScalar(0.8);
            } else {
                this.movement.velocity
                    .add(contact.force.clone().multiplyScalar(1 / this.shipBody.mass).multiplyScalar(0.2));
            }
        };
    }
}
