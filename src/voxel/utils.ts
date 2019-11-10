import _ from "lodash";
import { Vector3 } from "three";
import Chunk from "./Chunk";

export const calcCenter = (chunk: Chunk) => {
    const sum = new Vector3();
    let count = 0;

    _(chunk.map).forEach((l) => {
        if (l.v > 0) {
            sum.add(l.coord);
            count++;
        }
    });

    return sum
        .multiplyScalar(1 / count)
        .add(new Vector3(0.5, 0.5, 0.5));
};
