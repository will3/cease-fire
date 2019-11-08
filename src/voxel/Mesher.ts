import { Vector3, Geometry, Face3 } from "three";
import { Chunk } from "./Chunk";
export class Mesher {
    static mesh(chunk: Chunk) {
        const size = chunk.size;
        const geometry = new Geometry();
        const vertices: Vector3[] = [];
        const faces: Face3[] = [];
        for (let d = 0; d < 3; d++) {
            for (let i = 0; i < size - 1; i++) {
                for (let j = 0; j < size; j++) {
                    for (let k = 0; k < size; k++) {
                        const a = this.getValue(chunk, i, j, k, d);
                        const b = this.getValue(chunk, i + 1, j, k, d);
                        if (a > 0 == (b > 0)) {
                            continue;
                        }
                        const front = a > 0;
                        const v1 = this.getVector(i + 1, j, k, d);
                        const v2 = this.getVector(i + 1, j + 1, k, d);
                        const v3 = this.getVector(i + 1, j + 1, k + 1, d);
                        const v4 = this.getVector(i + 1, j, k + 1, d);
                        const index = vertices.length;
                        vertices.push(v1, v2, v3, v4);
                        if (front) {
                            faces.push(new Face3(index, index + 1, index + 2), new Face3(index + 2, index + 3, index));
                        }
                        else {
                            faces.push(new Face3(index + 2, index + 1, index), new Face3(index, index + 3, index + 2));
                        }
                    }
                }
            }
        }
        geometry.vertices = vertices;
        geometry.faces = faces;
        geometry.computeFaceNormals();
        return geometry;
    }
    static getValue(chunk: Chunk, i: number, j: number, k: number, d: number) {
        if (d == 0) {
            return chunk.get(i, j, k);
        }
        if (d == 1) {
            return chunk.get(k, i, j);
        }
        return chunk.get(j, k, i);
    }
    static getVector(i: number, j: number, k: number, d: number) {
        if (d == 0) {
            return new Vector3(i, j, k);
        }
        if (d == 1) {
            return new Vector3(k, i, j);
        }
        return new Vector3(j, k, i);
    }
}
