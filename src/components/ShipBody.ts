import _ from "lodash";
import { Color, FaceColors, HSL, Intersection, Material, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "three";
import Component from "../core/Component";
import { Hitable } from "../Hitable";
import { getMaterial } from "../materials";
import { clamp } from "../math";
import ValueCurve from "../ValueCurve";
import Chunk from "../voxel/Chunk";
import ChunkMesh from "./ChunkMesh";
import Explosion from "./Explosion";

export default class ShipBody extends Component implements Hitable {
    public inner = new Object3D();
    public pivot = new Object3D();
    public color = new Color(0.2, 0.6, 0.8);
    public chunkMesh!: ChunkMesh;

    private object = new Object3D();
    private center = new Vector3();
    private damageColor = new Color();

    public start() {
        this.damageColor = this.color.clone().multiplyScalar(0.4);
        this.chunkMesh.material = getMaterial("shipMaterial", () => {
            return new MeshBasicMaterial({
                vertexColors: FaceColors,
            });
        });

        buildShip(this.chunkMesh.chunk, this.color);

        this.center = this.calcCenter();

        this.parent.add(this.object);
        this.object.add(this.pivot);
        this.pivot.add(this.inner);
        this.inner.position.copy(this.center);
        this.chunkMesh.mesh.userData = { componentId: this.id };
    }

    public onDestroy() {
        this.parent.remove(this.object);
    }

    public onHit(result: Intersection) {
        const coord = this.chunkMesh.getCoord(result.faceIndex!);
        this.damage(coord, 1);
    }

    public damage(coord: Vector3, amount: number) {
        const pattern = spherePattern(2.5, new ValueCurve([1, 0], [0, 1]));

        let index = 0;
        for (const p of pattern) {
            const dc = new Vector3(p[0], p[1], p[2]).add(coord);
            if (this.chunk.inBound(dc.x, dc.y, dc.z)) {
                let v = this.chunk.get(dc.x, dc.y, dc.z);
                if (v <= 0) {
                    continue;
                }
                v -= p[3];
                v = clamp(v, 0, 1);
                this.chunk.set(dc.x, dc.y, dc.z, v);
                this.chunk.setColor(dc.x, dc.y, dc.z, this.damageColor.clone().lerp(this.color, v));

                if (v === 0) {
                    const explosion = new Explosion();
                    explosion.scale = 4 + Math.random() * 4;
                    this.addComponent(explosion);
                    const position = this.chunkMesh.mesh.localToWorld(dc.clone().add(new Vector3(0.5, 0.5, 0.5)));
                    explosion.object.position.copy(position);
                    explosion.wait = 0.05 * index;
                    index++;
                }
            }
        }
    }

    private calcCenter() {
        const sum = new Vector3();
        let count = 0;
        for (let i = 0; i < this.chunk.size; i++) {
            for (let j = 0; j < this.chunk.size; j++) {
                for (let k = 0; k < this.chunk.size; k++) {
                    const v = this.chunk.get(i, j, k);
                    if (v > 0) {
                        sum.x += i;
                        sum.y += j;
                        sum.z += k;
                        count++;
                    }
                }
            }
        }

        return sum
            .multiplyScalar(1 / count)
            .add(new Vector3(0.5, 0.5, 0.5))
            .multiplyScalar(-1);
    }

    get chunk() {
        return this.chunkMesh.chunk;
    }
}

const spherePattern = (radius: number, valueCurve: ValueCurve) => {
    const r = Math.ceil(radius);
    const list = [];
    for (let i = -r; i <= r; i++) {
        for (let j = -r; j <= r; j++) {
            for (let k = -r; k <= r; k++) {
                const dist = Math.sqrt(i * i + j * j + k * k);
                if (dist > radius) {
                    continue;
                }
                const it = dist / radius;
                const v = valueCurve.get(it);
                list.push([i, j, k, v]);
            }
        }
    }

    return list;
};

const buildShip = (chunk: Chunk, color: Color) => {
    const voxels: number[][] = [];
    const wingLength = 11;

    addWing();
    addWeapon(1);
    addCargo(4);
    addCargo(6);
    addWeapon(9);

    function addWeapon(i: number) {
        voxels.push(
            [i, 0, 1],
            [i, 0, 2],
            [i, 0, 5],
        );
    }

    function addCargo(i: number) {
        voxels.push(
            [i, 0, 2],
            [i, 0, 5]);
    }

    function addWing() {
        for (let i = 0; i < wingLength; i++) {
            voxels.push([i, 0, 3]);
            voxels.push([i, 0, 4]);
        }
    }

    voxels.forEach((v) => {
        v[0] += 1;
        v[1] += 1;
        v[2] += 1;
    });

    const sum = _.reduce(voxels, (a: number[], v: number[]) => {
        a[0] += v[0];
        a[1] += v[1];
        a[2] += v[2];
        return a;
    }, [0, 0, 0]);

    voxels.forEach((v) => {
        chunk.set(v[0], v[1], v[2], 1);
        chunk.setColor(v[0], v[1], v[2], color);
    });
};
