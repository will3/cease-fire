import { Object3D, Quaternion, Vector3 } from "three";
import Component from "../core/Component";
import { calcCenter } from "../voxel/utils";
import ChunkMesh from "./ChunkMesh";

export default class Piece extends Component {
    public chunkMesh!: ChunkMesh;
    public object = new Object3D();

    public start() {
        this.parent.add(this.object);
        this.object.add(this.chunkMesh.mesh);
    }
};