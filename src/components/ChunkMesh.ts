import { Material, Mesh, Vector3 } from "three";
import Component from "../core/Component";
import Chunk from "../voxel/Chunk";
import { Mesher } from "../voxel/Mesher";

export default class ChunkMesh extends Component {
    public type = "ChunkMesh";
    public chunk = new Chunk();
    public mesh = new Mesh();
    public material?: Material;
    private faceIndexToCoord: { [id: number]: Vector3 } = {};

    public start() {
        this.parent.add(this.mesh);
    }

    public update() {
        if (this.material != null) {
            this.mesh.material = this.material;
        }
        if (this.chunk.dirty) {
            const result = Mesher.mesh(this.chunk);
            this.faceIndexToCoord = result.faceIndexToCoord;
            this.mesh.geometry = result.geometry;

            this.chunk.dirty = false;
        }
    }

    public onDestroy() {
        this.parent.remove(this.mesh);
    }

    public getCoord(faceIndex: number) {
        return this.faceIndexToCoord[faceIndex];
    }
}