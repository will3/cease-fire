import Component from "./Component";
import { BoxGeometry, Mesh, MeshLambertMaterial, Color } from "three";

export default class TestCube extends Component {
    start() {
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshLambertMaterial({
            color: new Color(1.0, 1.0, 1.0)
        });
        const mesh = new Mesh(geometry, material);
        this.scene.add(mesh);
    }
};