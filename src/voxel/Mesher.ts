import { Face3, Geometry, Vector3, Color } from "three";
import Chunk from "./Chunk";
export class Mesher {
    public static mesh(chunk: Chunk) {
        const size = chunk.size;
        const geometry = new Geometry();
        const vertices: Vector3[] = [];
        const faces: Face3[] = [];
        const faceIndexToCoord: { [id: number]: Vector3 } = {};
        const colors: Color[] = [];

        for (let d = 0; d < 3; d++) {
            for (let i = 0; i < size - 1; i++) {
                for (let j = 0; j < size; j++) {
                    for (let k = 0; k < size; k++) {
                        const a = this.getValue(chunk, i, j, k, d);
                        const b = this.getValue(chunk, i + 1, j, k, d);
                        if (a > 0 === (b > 0)) {
                            continue;
                        }
                        const front = a > 0;
                        const v1 = this.getVector(i + 1, j, k, d);
                        const v2 = this.getVector(i + 1, j + 1, k, d);
                        const v3 = this.getVector(i + 1, j + 1, k + 1, d);
                        const v4 = this.getVector(i + 1, j, k + 1, d);
                        const index = vertices.length;
                        vertices.push(v1, v2, v3, v4);

                        const coord = front ? this.getVector(i, j, k, d) : this.getVector(i + 1, j, k, d);
                        const faceIndex = faces.length;

                        faceIndexToCoord[faceIndex] = coord;
                        faceIndexToCoord[faceIndex + 1] = coord;

                        const color = chunk.getColor(coord.x, coord.y, coord.z);

                        if (front) {
                            faces.push(
                                new Face3(index, index + 1, index + 2, undefined, color),
                                new Face3(index + 2, index + 3, index, undefined, color),
                            );
                        } else {
                            faces.push(
                                new Face3(index + 2, index + 1, index, undefined, color),
                                new Face3(index, index + 3, index + 2, undefined, color),
                            );
                        }
                    }
                }
            }
        }

        geometry.vertices = vertices;
        geometry.faces = faces;
        geometry.computeFaceNormals();

        return { geometry, faceIndexToCoord };
    }

    private static getValue(chunk: Chunk, i: number, j: number, k: number, d: number) {
        switch (d) {
            case 0:
                return chunk.get(i, j, k);
            case 1:
                return chunk.get(k, i, j);
            default:
                return chunk.get(j, k, i);
        }
    }
    private static getVector(i: number, j: number, k: number, d: number) {
        switch (d) {
            case 0:
                return new Vector3(i, j, k);
            case 1:
                return new Vector3(k, i, j);
            default:
                return new Vector3(j, k, i);
        }
    }
}
