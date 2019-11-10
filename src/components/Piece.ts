import { Object3D, Quaternion, Vector3 } from "three";
import Component from "../core/Component";
import { calcCenter } from "../voxel/utils";
import ChunkMesh from "./ChunkMesh";

export default class Piece extends Component {
    public chunkMesh!: ChunkMesh;
    public velocity = new Vector3();
    public rotationVelocity = new Quaternion();
    public inner = new Object3D();
    public object = new Object3D();

    public start() {
        const center = calcCenter(this.chunkMesh.chunk);
        const offset = center.clone().multiplyScalar(-1);
        this.inner.position.copy(offset);

        this.parent.add(this.object);
        this.object.add(this.inner);

        const worldOffset = offset.clone().applyQuaternion(this.object.quaternion);

        this.object.position.sub(worldOffset);
    }

    public update() {
        this.object.position.add(this.velocity);
        this.object.quaternion.multiply(this.rotationVelocity);
    }
};