import { Color, Object3D, Quaternion, Texture, Vector3 } from "three";

import Component from "../core/Component";
export default class Engine extends Component {
    public group: any;
    public object?: Object3D;
    public emitter: any;
    public amount = 1.0;

    public start() {
        // TODO use shared image
        const image = new Image();
        image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
        const texture = new Texture(image);
        image.onload = () => {
            texture.needsUpdate = true;
        };

        const THREE = require("three");
        // @ts-ignore
        window.THREE = THREE;
        const SPE = require("shader-particle-engine");

        this.group = new SPE.Group({
            texture: {
                value: texture,
            },
        });

        this.emitter = new SPE.Emitter({
            color: {
                value: new Color("white"),
            },
            maxAge: {
                spread: 0.05,
                value: 0.15,
            },
            particleCount: 16,
        });

        this.group.addEmitter(this.emitter);
        this.scene.add(this.group.mesh);
    }

    public update() {
        this.group.tick(1 / 60);
        if (this.amount === 0) {
            this.emitter.disable();
        } else {
            this.emitter.enable();
            this.emitter.size.spread = [0, 2.5];
            this.emitter.size.value = [6, 0];
        }

        this.emitter.position.value = this.parent.getWorldPosition(new Vector3());
        const quat = this.parent.getWorldQuaternion(new Quaternion());
        this.emitter.velocity.value =
            new Vector3(0, 0, 1)
                .applyQuaternion(quat)
                .multiplyScalar(20);
    }
}
