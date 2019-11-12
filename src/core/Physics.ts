import _ from "lodash";
import { Vector3 } from "three";
import Collider from "./Collider";

export default class Physics {
    private map: { [id: string]: Collider } = {};

    public add(body: Collider) {
        this.map[body.id] = body;
    }

    public remove(body: Collider) {
        delete this.map[body.id];
    }

    public update() {
        _(this.map).forEach((a) => {
            _(this.map).forEach((b) => {
                if (a === b) {
                    return;
                }
                this.updateBody(a, b);
            });
        });
    }

    private updateBody(a: Collider, b: Collider) {
        if (a.static) {
            return;
        }
        if (a.onContact == null) {
            return;
        }
        if (a.radius === 0 || b.radius === 0) {
            return;
        }

        const dist = a.position.clone().distanceTo(b.position);
        const minDist = a.radius + b.radius;

        if (dist >= minDist) {
            return;
        }

        const dir = a.position.clone().sub(b.position);
        const force = dir.multiplyScalar((minDist - dist));
        const contact = {
            collider: b,
            force,
        };

        a.onContact(contact);
    }
}

export interface Contact {
    force: Vector3;
    collider: Collider;
}
