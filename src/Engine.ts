import Component from "./Component";
import { Texture, Object3D, ImageUtils, Quaternion, Vector3, Euler } from "three";
import * as THREE from "three";
window["THREE"] = THREE;
import SPE from "shader-particle-engine";

const image = new Image();
image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
const texture = new Texture(image);
image.onload = () => {
    texture.needsUpdate = true;
}

export default class Engine extends Component {
    group: any;
    object: Object3D;
    emitter: any;
    amount = 1.0;

    start() {
        this.group = new SPE.Group({
            texture: {
                value: texture
            }
        });

        this.emitter = new SPE.Emitter({
            maxAge: {
                value: 0.15,
                spread: 0.05
            },
            size: {
                value: [6, 0],
                spread: [0, 2.5]
            },
            color: {
                value: new THREE.Color('white')
            },
            particleCount: 16
        });

        this.group.addEmitter(this.emitter);
        this.scene.add(this.group.mesh);
    }
    update() {
        this.group.tick(1 / 60);
        if (this.amount == 0) {
            this.emitter.disable();
        } else {
            this.emitter.enable();
        }
        this.emitter.position.value = this.parent.getWorldPosition(new Vector3());
        this.emitter.velocity.value = new Vector3(0, 0, 1).applyQuaternion(this.parent.getWorldQuaternion(new Quaternion())).multiplyScalar(20);
    }
}
