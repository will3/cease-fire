import { Quaternion, Vector3 } from "three";
import Component from "../core/Component";
import ChunkMesh from "./ChunkMesh";

export default class Piece extends Component {
    public chunkMesh!: ChunkMesh;
    public velocity = new Vector3();
    public rotationVelocity = new Quaternion();

    public update() {
        const object = this.chunkMesh.mesh;
        object.position.add(this.velocity);
        object.quaternion.multiply(this.rotationVelocity);
    }
};