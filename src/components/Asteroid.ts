import { Color, DodecahedronGeometry, Material, Mesh, MeshLambertMaterial, Object3D, Quaternion } from "three";
import Component from "../core/Component";
import { randomQuaternion, randomAxis } from "../math";

export default class Asteroid extends Component {
    private static material: Material;

    public object = new Object3D();
    public scale = 6.0;

    private mesh = new Mesh();
    private quatVelocity = new Quaternion();

    public start() {
        this.parent.add(this.object);

        if (Asteroid.material == null) {
            Asteroid.material = new MeshLambertMaterial({
                color: new Color(1.0, 1.0, 1.0),
            });
        }

        this.mesh.geometry = new DodecahedronGeometry();

        for (const vertice of this.mesh.geometry.vertices) {
            vertice.multiplyScalar(Math.random() + 0.5);
        }

        this.mesh.material = Asteroid.material;

        this.mesh.quaternion.copy(randomQuaternion());

        this.object.add(this.mesh);

        this.quatVelocity = new Quaternion().setFromAxisAngle(randomAxis(), 0.01);
    }

    public update() {
        this.object.scale.set(this.scale, this.scale, this.scale);
        this.object.quaternion.multiply(this.quatVelocity);
    }

    public onDestroy() {
        this.parent.remove(this.object);
        this.mesh.geometry.dispose();
    }
}
