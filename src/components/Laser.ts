import { Object3D, Sprite, SpriteMaterial, Vector3 } from "three";

import Component from "../core/Component";
import { getMaterial } from "../materials";

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
        const forwardVector = new Vector3(0, 0, -1).applyEuler(this.object.rotation);
        this.velocityScale *= 0.97;
        this.object.position.add(forwardVector.multiplyScalar(this.velocity * this.velocityScale));
        const scale = 1.5 * Math.pow(this.velocityScale, 0.4);
        this.object.scale.set(scale, scale, scale);

        if (this.velocityScale < 0.1) {
            this.destroy();
        }
    }

    public onDestroy() {
        this.parent.remove(this.object);
    }
}
