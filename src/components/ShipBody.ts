import _ from "lodash";
import { Color, Intersection, Object3D, Quaternion, Sphere, Vector3 } from "three";
import Collider from "../core/Collider";
import Component from "../core/Component";
import { Hitable } from "../Hitable";
import { getMaterial } from "../materials";
import { clamp } from "../math";
import ValueCurve from "../ValueCurve";
import Chunk from "../voxel/Chunk";
import { calcBoundingSphere, calcCenter, countVoxels } from "../voxel/utils";
import ChunkMesh from "./ChunkMesh";
import Piece from "./Piece";
import Ship from "./Ship";

type onRadiusUpdatedCallback = (radius: number) => void;

export default class ShipBody extends Component implements Hitable {
    public inner = new Object3D();
    public pivot = new Object3D();
    public color = new Color(0.2, 0.6, 0.8);
    public chunkMesh!: ChunkMesh;
    public ship!: Ship;
    public readonly center = new Vector3();
    public mass = 0;
    public onRadiusUpdated?: onRadiusUpdatedCallback;

    private object = new Object3D();
    private damageColor = new Color();
    private massDirty = true;

    public start() {
        this.damageColor = this.color.clone().multiplyScalar(0.4);
        this.chunkMesh.material = getMaterial("shipMaterial");

        buildShip(this.chunkMesh.chunk, this.color);

        this.center.copy(calcCenter(this.chunk));

        this.parent.add(this.object);
        this.object.add(this.pivot);
        this.pivot.add(this.inner);
        this.inner.position.copy(this.center.clone().multiplyScalar(-1));
        this.chunkMesh.mesh.userData = {
            componentId: this.id,
            shipId: this.parentComponent == null ? undefined : this.parentComponent.id,
        };

        if (this.onRadiusUpdated != null) {
            this.onRadiusUpdated(calcBoundingSphere(this.chunk).radius);
        }
    }

    public update() {
        if (this.massDirty) {
            this.mass = countVoxels(this.chunk);
            this.massDirty = false;
        }

        if (this.mass === 0) {
            this.ship.destroy();
        }
    }

    public onDestroy() {
        this.parent.remove(this.object);
    }

    public onHit(result: Intersection) {
        const coord = this.chunkMesh.getCoord(result.faceIndex!);
        this.damage(coord, 1);
    }

    public damage(coord: Vector3, amount: number) {
        const pattern = spherePattern(3, new ValueCurve([1, 0.5], [0, 1]));

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
                this.massDirty = true;
                this.chunk.setColor(dc.x, dc.y, dc.z, this.damageColor.clone().lerp(this.color, v));
            }
        }
    }

    public createPiece(coords: Vector3[]) {
        const piece = new Piece();

        piece.chunkMesh.material = getMaterial("shipMaterial");

        for (const coord of coords) {
            const voxel = this.chunk.getVoxel(coord);
            piece.chunkMesh.chunk.set(coord.x, coord.y, coord.z, voxel.v);
            piece.chunkMesh.chunk.setColor(coord.x, coord.y, coord.z, voxel.c);
        }

        piece.object.position.copy(this.chunkMesh.mesh.getWorldPosition(new Vector3()));
        piece.object.quaternion.copy(this.chunkMesh.mesh.getWorldQuaternion(new Quaternion()));

        this.addComponent(piece);

        for (const coord of coords) {
            this.chunk.set(coord.x, coord.y, coord.z, 0);
            this.massDirty = true;
        }

        return piece;
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
