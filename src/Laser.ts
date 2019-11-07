import Component from "./Component";
import { SpriteMaterial, Sprite, Object3D, Euler, Vector3 } from "three";
import { getMaterial } from "./materials";

export default class Laser extends Component {
    material: SpriteMaterial;
    object = new Object3D();
    velocity = 6;
    velocityScale = 1.0;
    first = true;
    a: Object3D;
    b: Object3D;
    c: Object3D;

    start() {
        this.material = getMaterial("laser", () => new SpriteMaterial({
            color: 0xffffff
        })) as SpriteMaterial;
        this.a = new Sprite(this.material);
        this.b = new Sprite(this.material);
        this.c = new Sprite(this.material);
        this.a.scale.set(2.0, 2.0, 2.0);
        this.b.scale.set(1.4, 1.4, 1.4);
        this.c.scale.set(0.8, 0.8, 0.8);
        this.object.scale.multiplyScalar(1.5);
        this.object.add(this.a, this.b, this.c);
        this.parent.add(this.object);
    }

    update() {
        const forwardVector = new Vector3(0, 0, -1).applyEuler(this.object.rotation);
        this.velocityScale *= 0.97;
        this.object.position.add(forwardVector.multiplyScalar(this.velocity * this.velocityScale));
        const scale = 1.5 * Math.pow(this.velocityScale, 0.4);
        this.object.scale.set(scale, scale, scale);
        this.b.position.set(0, 0, 1.2 * this.velocityScale);
        this.c.position.set(0, 0, 2.4 * this.velocityScale);

        if (this.velocityScale < 0.1) {
            this.destroy();
        }
    }

    onDestroy() {
        this.parent.remove(this.object);
    }
};