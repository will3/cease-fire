import _ from "lodash";
import { Color, FaceColors, Material, MaterialIdCount, Mesh, MeshBasicMaterial, Object3D, Vector3, VertexColors } from "three";
import Component from "../core/Component";
import { getMaterial } from "../materials";
import { clamp } from "../math";
import ValueCurve from "../ValueCurve";
import Chunk from "../voxel/Chunk";
import { Mesher } from "../voxel/Mesher";
import Explosion from "./Explosion";

export default class ShipBody extends Component {
    public inner = new Object3D();
    public pivot = new Object3D();
    public mesh = new Mesh();
    public color = new Color(0.2, 0.6, 0.8);
    private object = new Object3D();

    private chunk = new Chunk([0, 0, 0]);
    private material!: Material;
    private faceIndexToCoord: { [id: number]: Vector3 } = {};
    private dirty = false;
    private center = new Vector3();

    public start() {
        this.material = getMaterial("shipMaterial", () => {
            return new MeshBasicMaterial({
                vertexColors: FaceColors,
            });
        });

        buildShip(this.chunk, this.color);

        this.mesh.material = this.material;
        this.center = this.calcCenter();

        this.parent.add(this.object);
        this.object.add(this.pivot);
        this.pivot.add(this.inner);
        this.inner.add(this.mesh);
        this.inner.position.copy(this.center);

        this.dirty = true;
    }

    public update() {
        if (this.dirty) {
            const result = Mesher.mesh(this.chunk);
            this.faceIndexToCoord = result.faceIndexToCoord;
            this.mesh.geometry = result.geometry;
            this.mesh.userData = { componentId: this.id };

            this.dirty = false;
        }
    }

    public getCoord(faceIndex: number) {
        return this.faceIndexToCoord[faceIndex];
    }

    public onDestroy() {
        this.parent.remove(this.object);
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
                // this.chunk.set(dc.x, dc.y, dc.z, v);

                if (v === 0) {
                    const explosion = new Explosion();
                    explosion.scale = 4 + Math.random() * 4;
                    this.addComponent(explosion);
                    const position = this.mesh.localToWorld(dc.clone().add(new Vector3(0.5, 0.5, 0.5)));
                    explosion.object.position.copy(position);
                    explosion.wait = 0.05 * index;
                    index++;
                }
            }
        }

        this.dirty = true;
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
