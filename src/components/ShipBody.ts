import _ from "lodash";
import { Color, Intersection, Object3D, Plane, Quaternion, Vector3 } from "three";
import Component from "../core/Component";
import { Hitable } from "../Hitable";
import { getMaterial } from "../materials";
import { clamp, random, randomQuaternion, randomSigned, randomUniformUnitVectors } from "../math";
import ValueCurve from "../ValueCurve";
import Chunk from "../voxel/Chunk";
import { Bounds, calcBounds, calcCenter, calcCenterFromVectors, divideCoords } from "../voxel/utils";
import ChunkMesh from "./ChunkMesh";
import Piece from "./Piece";
import Ship from "./Ship";

interface CutResult { [hash: string]: Vector3[]; }

export default class ShipBody extends Component implements Hitable {
    public inner = new Object3D();
    public pivot = new Object3D();
    public color = new Color(0.2, 0.6, 0.8);
    public chunkMesh!: ChunkMesh;
    public ship!: Ship;

    private object = new Object3D();
    private center = new Vector3();
    private damageColor = new Color();

    public start() {
        this.damageColor = this.color.clone().multiplyScalar(0.4);
        this.chunkMesh.material = getMaterial("shipMaterial");

        buildShip(this.chunkMesh.chunk, this.color);

        this.center = calcCenter(this.chunk);

        this.parent.add(this.object);
        this.object.add(this.pivot);
        this.pivot.add(this.inner);
        this.inner.position.copy(this.center.clone().multiplyScalar(-1));
        this.chunkMesh.mesh.userData = { componentId: this.id };
    }

    public update() {
        if (this.input.keydown("c")) {
            this.testCut();
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
                this.chunk.setColor(dc.x, dc.y, dc.z, this.damageColor.clone().lerp(this.color, v));
            }
        }
    }

    get chunk() {
        return this.chunkMesh.chunk;
    }

    private testCut() {
        const bounds = calcBounds(this.chunk);
        const count = 3;
        const planes = [];
        for (let i = 0; i < count; i++) {
            planes.push(this.randomCutPlane(bounds));
        }

        const results = this.cut(planes);

        // this.colorizeCutResult(results);

        this.createPieces(results);
    }

    private createPieces(results: CutResult) {
        const groups = _(results).map((list) => divideCoords(list)).reduce((list, a) => {
            list = list.concat(a);
            return list;
        }, [] as Vector3[][]);

        const vectors = groups
            .map((group) => {
                return calcCenterFromVectors(group);
            })
            .map((v) => {
                return v.sub(this.center);
            })
            .map((v) => v.normalize());

        randomUniformUnitVectors(vectors);

        groups.forEach((group, index) => {
            this.createPiece(group, vectors[index]);
        });

        this.ship.destroy();
    }

    private createPiece(coords: Vector3[], dir: Vector3) {
        const piece = new Piece();

        piece.chunkMesh.material = getMaterial("shipMaterial");

        for (const coord of coords) {
            const voxel = this.chunk.getVoxel(coord);
            piece.chunkMesh.chunk.set(coord.x, coord.y, coord.z, voxel.v);
            piece.chunkMesh.chunk.setColor(coord.x, coord.y, coord.z, voxel.c);
        }

        piece.object.position.copy(this.chunkMesh.mesh.getWorldPosition(new Vector3()));
        piece.object.quaternion.copy(this.chunkMesh.mesh.getWorldQuaternion(new Quaternion()));

        const mass = Math.pow(coords.length, 0.4);
        const rotationInertia = mass * mass;
        piece.rotationSpeed = randomQuaternion(Math.pow(random(0.5, 1), 2) * 2 / rotationInertia);
        piece.velocity = dir.multiplyScalar(random(0.5, 1) * 0.4 / mass);

        this.addComponent(piece);
    }

    private randomCutPlane(bounds: Bounds) {
        const halfX = (bounds.max.x - bounds.min.x) / 2;
        const x = halfX + halfX * Math.pow(Math.random(), 1.2) * randomSigned();
        const point = this.center.clone().setX(x);
        const angle = Math.pow(Math.random(), 1.2) * Math.PI * 2;
        const normal = new Vector3(Math.cos(angle), 0, Math.sin(angle));
        return new Plane()
            .setFromNormalAndCoplanarPoint(normal, point);
    }

    private colorizeCutResult(results: CutResult) {
        for (const hash in results) {
            const color = new Color(Math.random(), Math.random(), Math.random());
            const list = results[hash];
            for (const coord of list) {
                this.chunk.setColor(coord.x, coord.y, coord.z, color);
            }
        }
    }

    private cut(planes: Plane[]) {
        const map: { [id: string]: { coord: Vector3, results: number[] } } = {};

        _(this.chunk.map).forEach((line) => {
            const coord = line.coord;
            const id = coord.toArray().join(",");
            map[id] = { coord, results: [] };
            for (let i = 0; i < planes.length; i++) {
                const plane = planes[i];
                const distance = plane.distanceToPoint(line.coord.clone().add(new Vector3(0.5, 0.5, 0.5)));
                const side = distance < 0 ? 0 : 1;
                map[id].results[i] = side;
            }
        });

        const results: CutResult = {};

        for (const id in map) {
            const item = map[id];
            const hash = item.results.join("-");
            if (results[hash] == null) {
                results[hash] = [];
            }
            results[hash].push(item.coord);
        }

        return results;
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
