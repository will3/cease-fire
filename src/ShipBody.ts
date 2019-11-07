import Component from "./Component";
import { Vector3, Mesh, Color, MeshBasicMaterial, Object3D, Material } from "three";
import _ from "lodash";
import { Mesher } from "./Mesher";
import { Chunk } from "./Chunk";

export default class ShipBody extends Component {
    chunk = new Chunk([0, 0, 0]);
    object = new Object3D();
    material: Material;
    inner = new Object3D();

    start() {
        const voxels = [];
        const wingLength = 11;

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
        };

        function addCargo(i: number) {
            voxels.push(
                [i, 0, 2],
                [i, 0, 5]);
        };

        for (let i = 0; i < wingLength; i++) {
            voxels.push([i, 0, 3]);
            voxels.push([i, 0, 4]);
        }

        voxels.forEach(v => {
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

        const center = new Vector3().fromArray(sum).multiplyScalar(1 / voxels.length).add(new Vector3(0.5, 0.5, 0.5));

        for (let i = 0; i < voxels.length; i++) {
            const v = voxels[i];
            this.chunk.set(v[0], v[1], v[2], 1);
        }

        const geometry = Mesher.mesh(this.chunk);
        const mesh = new Mesh(geometry, this.material);
        this.parent.add(this.object);
        this.inner.add(mesh);
        this.object.add(this.inner);
        this.inner.position.copy(center.multiplyScalar(-1));
    }
};

