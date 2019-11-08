import { Camera, Euler, Vector3 } from "three";
import Component from "../core/Component";

export default class CameraController extends Component {
    public camera!: Camera;
    public rotation = new Euler(-Math.PI * 0.3, Math.PI / 4, 0, "YXZ");
    public distance = 50;
    public target = new Vector3();

    public update() {
        const position = new Vector3(0, 0, 1)
            .applyEuler(this.rotation)
            .multiplyScalar(this.distance)
            .add(this.target);
        this.camera.position.copy(position);
        this.camera.up = new Vector3(0, 1, 0);
        this.camera.lookAt(this.target);
    }
}
