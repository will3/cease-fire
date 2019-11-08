import _ from "lodash";
import { Color, Material, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "three";
import Component from "../core/Component";
import { getMaterial } from "../materials";
import Chunk from "../voxel/Chunk";
import { Mesher } from "../voxel/Mesher";

export default class ShipBody extends Component {
    public object = new Object3D();
    public inner = new Object3D();

    private chunk = new Chunk([0, 0, 0]);
    private material?: Material;

    public start() {
        const voxels = [];
        const wingLength = 11;

        this.material = getMaterial("shipMaterial", () => {
            return new MeshBasicMaterial({
                color: new Color(0.2, 0.6, 0.8),
            });
        });

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

        for (let i = 0; i < wingLength; i++) {
            voxels.push([i, 0, 3]);
            voxels.push([i, 0, 4]);
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

        const center = new Vector3().fromArray(sum).multiplyScalar(1 / voxels.length).add(new Vector3(0.5, 0.5, 0.5));

        voxels.forEach((v) => {
            this.chunk.set(v[0], v[1], v[2], 1);
        });

        const geometry = Mesher.mesh(this.chunk);
        const mesh = new Mesh(geometry, this.material);
        this.parent.add(this.object);
        this.inner.add(mesh);
        this.object.add(this.inner);
        this.inner.position.copy(center.multiplyScalar(-1));
    }
}
