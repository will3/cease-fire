import _ from "lodash";
import { Color, Material, Mesh, MeshBasicMaterial, Object3D, Vector3, VertexColors, FaceColors } from "three";
import Component from "../core/Component";
import { getMaterial } from "../materials";
import Chunk from "../voxel/Chunk";
import { Mesher } from "../voxel/Mesher";

export default class ShipBody extends Component {
    public object = new Object3D();
    public inner = new Object3D();
    public pivot = new Object3D();
    public mesh = new Mesh();
    public color = new Color(0.2, 0.6, 0.8);

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

    public damage(coord: Vector3) {
        this.chunk.set(coord.x, coord.y, coord.z, 0);
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
