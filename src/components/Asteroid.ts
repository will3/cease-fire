import {
    Color,
    DodecahedronGeometry,
    Intersection,
    Material,
    Mesh,
    MeshLambertMaterial,
    Object3D,
    Quaternion,
    Vector2,
} from "three";
import Component from "../core/Component";
import { randomAxis, randomQuaternion } from "../math";
import Noise from "../Noise";
import Explosion from "./Explosion";

export interface Hitable {
    onHit: (result: Intersection) => void;
}

export default class Asteroid extends Component implements Hitable {
    private static material: Material;

    public type = "Asteroid";
    public object = new Object3D();
    public gridCoord = new Vector2();
    public mesh = new Mesh();

    private quatVelocity = new Quaternion();
    private noise = new Noise({
        frequency: 0.5,
        octaves: 2,
    });

    public start() {
        this.parent.add(this.object);
        this.mesh.userData.componentId = this.id;

        if (Asteroid.material == null) {
            Asteroid.material = new MeshLambertMaterial({
                color: new Color(1.0, 1.0, 1.0),
            });
        }

        this.mesh.geometry = new DodecahedronGeometry();

        for (const vertice of this.mesh.geometry.vertices) {
            const v = this.noise.get(vertice.x, vertice.y, vertice.z);
            vertice.multiplyScalar(1.0 + v * 0.5);
            vertice.x *= 1 + Math.random() * 0.61803398875;
        }

        this.mesh.material = Asteroid.material;

        this.mesh.quaternion.copy(randomQuaternion());

        this.object.add(this.mesh);

        const mass = this.object.scale.x * this.object.scale.y * this.object.scale.z;
        this.quatVelocity = new Quaternion().setFromAxisAngle(randomAxis(), 0.2 / mass);
    }

    public update() {
        this.object.quaternion.multiply(this.quatVelocity);
    }

    public onDestroy() {
        this.parent.remove(this.object);
        this.mesh.geometry.dispose();
    }

    get radius() {
        return Math.max(this.object.scale.x, this.object.scale.y, this.object.scale.z);
    }

    public onHit(result: Intersection) {
        const explosion = new Explosion();
        // const position = this.mesh.localToWorld(result.point);
        explosion.object.position.copy(result.point);
        this.addComponent(explosion);
    }
}
