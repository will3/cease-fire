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

export const calcCenterFromVectors = (vectors: Vector3[]) => {
    return vectors
        .reduce((sum, a) => {
            return sum.add(a);
        }, new Vector3())
        .multiplyScalar(1 / vectors.length)
        .add(new Vector3(0.5, 0.5, 0.5));
}

export interface Bounds {
    max: Vector3,
    min: Vector3,
}

export const calcBounds = (chunk: Chunk): Bounds => {
    const min = new Vector3(Infinity, Infinity, Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);
    for (const id in chunk.map) {
        const line = chunk.map[id];
        if (line.v <= 0) {
            continue;
        }

        min.min(line.coord);
        max.max(line.coord);
    }

    max.add(new Vector3(1, 1, 1));

    return {
        max,
        min,
    };
};

export const divideCoords = (coords: Vector3[]): Vector3[][] => {
    let count = 0;

    const map: { [id: string]: { coord: Vector3, visited: boolean } } = {};

    for (const coord of coords) {
        const id = getId(coord);
        map[id] = {
            coord,
            visited: false,
        };
    }

    const leads: { [id: string]: Vector3 } = {};
    const groups: Vector3[][] = [];
    let group: Vector3[] = [];

    const initLead = () => {
        const coord = _(map).filter((v) => !v.visited).value()[0].coord;
        const id = getId(coord);
        leads[id] = coord;
        group.push(coord);
        map[id].visited = true;
        count++;
    };

    const maxIteration = 100;

    while (count < coords.length) {
        if (Object.keys(leads).length === 0) {
            initLead();
        }
        const lead = leads[Object.keys(leads)[0]];
        const left = lead.clone().add(new Vector3(-1, 0, 0));
        const right = lead.clone().add(new Vector3(1, 0, 0));
        const bottom = lead.clone().add(new Vector3(0, -1, 0));
        const top = lead.clone().add(new Vector3(0, 1, 0));
        const back = lead.clone().add(new Vector3(0, 0, -1));
        const front = lead.clone().add(new Vector3(0, 0, 1));
        const neighbours = [left, right, bottom, top, back, front];

        for (const neighbour of neighbours) {
            const id = getId(neighbour);

            if (map[id] == null) {
                continue;
            }
            if (map[id].visited) {
                continue;
            }

            if (leads[id] != null) {
                continue;
            }

            leads[id] = neighbour;
            group.push(neighbour);
            map[id].visited = true;
            count++;
        }

        delete leads[getId(lead)];

        if (Object.keys(leads).length === 0) {
            groups.push(group);
            group = [];
        }

        if (count > maxIteration) {
            throw new Error("Reached max iteration??");
            break;
        }
    }

    if (group.length > 0) {
        groups.push(group);
    }

    const total = _(groups).map((g) => g.length).sum();
    if (total !== coords.length) {
        throw new Error("Total doesn't match up");
    }

    return groups;
};

const getId = (coord: Vector3) => {
    return coord.toArray().join(",");
};