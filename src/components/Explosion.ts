import { Color, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Vector3 } from "three";
import Component from "../core/Component";
import { clamp } from "../math";
import ValueCurve from "../ValueCurve";

export default class Explosion extends Component {
    private static material: MeshBasicMaterial;
    public object = new Object3D();
    public plane = new Mesh();
    public timeToLive = 0.2;
    public scaleCurve = new ValueCurve([0, 1, 0], [0, 0.2, 1]);
    public scale = 5.0;

    private life = 0;

    public start() {
        if (Explosion.material == null) {
            Explosion.material = new MeshBasicMaterial({
                color: new Color(1.0, 1.0, 1.0),
            });
        }
        this.plane.geometry = new PlaneGeometry();
        this.plane.material = Explosion.material;
        this.object.up = new Vector3(0, 1, 0);
        this.object.lookAt(this.camera.position);
        this.parent.add(this.object);
        this.object.add(this.plane);
        this.plane.rotation.z = Math.random() * Math.PI * 2;
    }

    public update() {
        this.life += this.time.deltaTime;
        const r = clamp(this.life / this.timeToLive, 0, 1);
        const scale = this.scaleCurve.get(r) * this.scale;
        this.object.scale.set(scale, scale, scale);

        if (r >= 1) {
            this.destroy();
        }
    }

    public onDestroy() {
        this.parent.remove(this.object);
    }
}