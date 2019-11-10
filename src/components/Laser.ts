import { Object3D, Sprite, SpriteMaterial, Vector3, Raycaster, Mesh } from "three";

import _ from "lodash";
import Component from "../core/Component";
import { getMaterial } from "../materials";
import Ship from "./Ship";
import ShipBody from "./ShipBody";
import Asteroid from "./Asteroid";

export default class Laser extends Component {
    private static material: SpriteMaterial;
    public object = new Object3D();
    public velocity = 6;
    public scale: number[] = [2.0, 1, 0.8, 0.4];
    public offset: number[] = [0, 1.2, 2.4, 3.6];
    public baseScale = 1.5;
    public timeToLive = 3;
    private life = 0;
    private sprites: Object3D[] = [];

    public start() {
        if (Laser.material == null) {
            Laser.material = getMaterial("laser", () => new SpriteMaterial({
                color: 0xffffff,
            })) as SpriteMaterial;
        }

        const length = this.scale.length;

        this.sprites = [];
        for (let i = 0; i < length; i++) {
            const s = new Sprite(Laser.material);
            s.scale.set(this.scale[i], this.scale[i], this.scale[i]);
            s.position.set(0, 0, this.offset[i]);
            this.sprites.push(s);
            this.object.add(s);
        }

        this.object.scale.multiplyScalar(this.baseScale);
        this.parent.add(this.object);
    }

    public update() {
        this.life += this.time.deltaTime;
        if (this.life > this.timeToLive) {
            this.destroy();
            return;
        }

        if (this.updateCollision()) {
            this.destroy();
            return;
        }

        const forwardVector = new Vector3(0, 0, -1).applyEuler(this.object.rotation);
        this.object.position.add(forwardVector.multiplyScalar(this.velocity));
    }

    public onDestroy() {
        this.parent.remove(this.object);
    }

    private updateCollision() {
        return this.updateCollisionShip() || this.updateCollisionAsteroid();
    }

    private updateCollisionShip() {
        const ships = this.findComponents("Ship") as Ship[];

        const objects = _(ships).map((s) => s.body.mesh).filter((m) => m != null).value() as Mesh[];
        const dir = new Vector3(0, 0, -1).applyEuler(this.object.rotation);
        const up = new Vector3(0, 1, 0);
        const right = dir.clone().cross(up);
        const result = this.raycast(dir, objects, new Vector3()) ||
            this.raycast(dir, objects, right.clone().multiplyScalar(0.5)) ||
            this.raycast(dir, objects, right.clone().multiplyScalar(-0.5));

        if (result != null) {
            const compoenntId = result.object.userData.componentId;
            const body = this.getComponent(compoenntId) as ShipBody;
            const coord = body.getCoord(result.faceIndex!);

            body.damage(coord, 1);
        }

        return result != null;
    }

    private raycast(dir: Vector3, objects: Object3D[], offset = new Vector3()) {
        const raycaster = new Raycaster(this.object.position.clone().add(offset), dir, 0, this.velocity);
        if (objects.length === 0) {
            return undefined;
        }
        const results = raycaster.intersectObjects(objects);
        if (results.length === 0) {
            return undefined;
        }

        return results[0];
    }

    private updateCollisionAsteroid() {
        const asteroids = this.findComponents("Asteroid") as Asteroid[];

        const objects = _(asteroids).map((s) => s.mesh).value() as Object3D[];
        const dir = new Vector3(0, 0, -1).applyEuler(this.object.rotation);
        const result = this.raycast(dir, objects);

        if (result != null) {
            const componentId = result.object.userData.componentId;
            const asteroid = this.getComponent(componentId) as Asteroid;
            asteroid.onHit(result);
        }

        return result != null;
    }
}
