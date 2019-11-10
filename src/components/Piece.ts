import { Object3D, Quaternion, Vector3 } from "three";
import Component from "../core/Component";
import { calcCenter } from "../voxel/utils";
import ChunkMesh from "./ChunkMesh";

export default class Piece extends Component {
    public readonly chunkMesh: ChunkMesh = new ChunkMesh();
    public readonly object = new Object3D();
    public rotationSpeed = new Quaternion();
    public velocity = new Vector3();
    public timeToLive = 10;
    private life = 0;
    private readonly inner = new Object3D();

    public start() {
        this.addComponent(this.chunkMesh, true);
        this.parent.add(this.object);
        this.object.add(this.inner);
        this.chunkMesh.parent = this.inner;

        const center = calcCenter(this.chunkMesh.chunk);

        this.inner.position.copy(center.clone().multiplyScalar(-1));
        const worldOffset = center.applyQuaternion(this.object.quaternion);
        this.object.position.add(worldOffset);
    }

    public update() {
        this.object.quaternion.multiply(this.rotationSpeed);
        this.object.position.add(this.velocity);

        if (this.life > this.timeToLive) {
            // const explosion = new Explosion();
            // this.addComponent(explosion);
            // explosion.object.position.copy(this.object.position);
            this.destroy();
        }

        this.life += this.time.deltaTime;
    }
};
