import { Camera, Euler, Object3D, Vector3 } from "three";
import Component from "../core/Component";

export default class CameraController extends Component {
  public camera!: Camera;
  public rotation = new Euler(-Math.PI * 0.3, Math.PI / 4, 0, "YXZ");
  public distance = 50;
  public target: Object3D = new Object3D();
  private currentTarget = new Vector3();
  private followRatio = 0.1;

  public start() {
    this.currentTarget.copy(this.target.position);
  }

  public update() {
    const position = new Vector3(0, 0, 1)
      .applyEuler(this.rotation)
      .multiplyScalar(this.distance)
      .add(this.currentTarget);
    this.camera.position.copy(position);
    this.camera.up = new Vector3(0, 1, 0);
    this.currentTarget = this.target.position
      .clone()
      .sub(this.currentTarget)
      .multiplyScalar(this.followRatio)
      .add(this.currentTarget);
    this.camera.lookAt(this.currentTarget);
  }
}
