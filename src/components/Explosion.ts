import {
  Color,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Vector3,
} from "three";
import Component from "../core/Component";
import { clamp } from "../math";
import ValueCurve from "../ValueCurve";

export default class Explosion extends Component {
  public object = new Object3D();
  public plane = new Mesh();
  public timeToLive = 0.3;
  public scaleCurve = new ValueCurve([0, 1, 1, 0.8], [0, 0.2, 0.3, 1]);
  public opacityCurve = new ValueCurve([0, 1.0, 1.0, 0.5], [0, 0.2, 0.3, 1]);
  public scale = 5.0;
  public wait = 0;

  private life = 0;
  private material = new MeshBasicMaterial({
    color: new Color(1.0, 1.0, 1.0),
    transparent: true,
  });

  public start() {
    this.plane.geometry = new PlaneGeometry();
    this.plane.material = this.material;
    this.object.up = new Vector3(0, 1, 0);
    this.object.lookAt(this.camera.position);
    this.parent.add(this.object);
    this.object.add(this.plane);
    this.plane.rotation.z = Math.random() * Math.PI * 2;

    this.object.position.add(
      this.camera.position
        .clone()
        .sub(this.object.position)
        .normalize()
        .multiplyScalar(1)
    );
  }

  public update() {
    this.life += this.time.deltaTime;

    if (this.life < this.wait) {
      return;
    }

    const r = clamp((this.life - this.wait) / this.timeToLive, 0, 1);
    const scale = this.scaleCurve.get(r) * this.scale;
    this.object.scale.set(scale, scale, scale);

    this.material.opacity = this.opacityCurve.get(r);

    if (r >= 1) {
      this.destroy();
    }
  }

  public onDestroy() {
    this.parent.remove(this.object);
    this.material.dispose();
  }
}
