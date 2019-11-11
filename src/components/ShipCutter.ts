import _ from "lodash";
import { Plane, Quaternion, Vector3 } from "three";
import Component from "../core/Component";
import { random, randomQuaternion, randomSigned, randomUniformUnitVectors } from "../math";
import { Bounds, calcBounds, calcCenterFromVectors, divideCoords } from "../voxel/utils";
import ShipBody from "./ShipBody";

export interface CutResult { [hash: string]: Vector3[]; }

export default class ShipCutter extends Component {
    public shipBody!: ShipBody;

    public update() {
        if (this.input.keydown("c")) {
            this.testCut();
        }
    }

    public cut(planes: Plane[]): CutResult {
        const map: { [id: string]: { coord: Vector3, results: number[] } } = {};

        _(this.shipBody.chunk.map).forEach((line) => {
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

    private testCut() {
        const bounds = calcBounds(this.shipBody.chunk);
        const count = 3;
        const planes = [];
        for (let i = 0; i < count; i++) {
            planes.push(this.randomCutPlane(bounds));
        }

        const results = this.cut(planes);

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
                return v.sub(this.shipBody.center);
            })
            .map((v) => v.normalize());

        randomUniformUnitVectors(vectors);
        groups.forEach((group, index) => {
            const dir = vectors[index];
            const piece = this.shipBody.createPiece(group);

            const mass = piece.calcMass();
            const rotationInertia = mass * mass;
            piece.rotationSpeed = randomQuaternion(Math.pow(random(0.5, 1), 2) * 2 / rotationInertia);
            piece.velocity = dir.multiplyScalar(random(0.5, 1) * 0.4 / mass);
        });

        this.shipBody.ship.destroy();
    }

    private randomCutPlane(bounds: Bounds) {
        const halfX = (bounds.max.x - bounds.min.x) / 2;
        const x = halfX + halfX * Math.pow(Math.random(), 1.2) * randomSigned();
        const point = this.shipBody.center.clone().setX(x);
        const angle = Math.pow(Math.random(), 1.2) * Math.PI * 2;
        const normal = new Vector3(Math.cos(angle), 0, Math.sin(angle));
        return new Plane()
            .setFromNormalAndCoplanarPoint(normal, point);
    }
}
