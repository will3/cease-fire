import { Object3D, Sprite, SpriteMaterial, Vector3, Raycaster, Mesh } from "three";

import _ from "lodash";
import Component from "../core/Component";
import { getMaterial } from "../materials";
import Ship from "./Ship";
import ShipBody from "./ShipBody";

export default class Laser extends Component {
    public material?: SpriteMaterial;
    public object = new Object3D();
    public velocity = 6;
    public scale: number[] = [2.0, 1, 0.8, 0.4];
    public offset: number[] = [0, 1.2, 2.4, 3.6];

    private velocityScale = 1.0;
    private sprites: Object3D[] = [];

    public start() {
        this.material = getMaterial("laser", () => new SpriteMaterial({
            color: 0xffffff,
        })) as SpriteMaterial;

        const length = this.scale.length;

        this.sprites = [];
        for (let i = 0; i < length; i++) {
            const s = new Sprite(this.material);
            s.scale.set(this.scale[i], this.scale[i], this.scale[i]);
            s.position.set(0, 0, this.offset[i]);
            this.sprites.push(s);
            this.object.add(s);
        }

        this.object.scale.multiplyScalar(1.5);
        this.parent.add(this.object);
    }

    public update() {
        if (this.velocityScale < 0.1) {
            this.destroy();
            return;
        }

        if (this.updateCollision()) {
            this.destroy();
            return;
        }

        const forwardVector = new Vector3(0, 0, -1).applyEuler(this.object.rotation);
        this.velocityScale *= 0.97;
        this.object.position.add(forwardVector.multiplyScalar(this.velocity * this.velocityScale));
        const scale = 1.5 * Math.pow(this.velocityScale, 0.4);
        this.object.scale.set(scale, scale, scale);
    }

    public onDestroy() {
        this.parent.remove(this.object);
    }

    private updateCollision() {
        const ships = this.findComponents("Ship") as Ship[];

        const objects = _(ships).map((s) => s.body.mesh).filter((m) => m != null).value() as Mesh[];
        const dir = new Vector3(0, 0, -1).applyEuler(this.object.rotation);
        const raycaster = new Raycaster(this.object.position, dir, 0, this.velocity);
        if (objects.length === 0) {
            return false;
        }
        const results = raycaster.intersectObjects(objects);
        if (results.length === 0) {
            return false;
        }
        const result = results[0];

        const compoenntId = result.object.userData.componentId;
        const body = this.getComponent(compoenntId) as ShipBody;
        const coord = body.getCoord(result.faceIndex!);

        body.damage(coord, 1);

        return true;
    }
}
