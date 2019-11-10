import { Color, Vector3 } from "three";

export interface Voxel { coord: Vector3; v: number; c: Color; }

export default class Chunk {
    public size = 32;
    public dirty = false;
    public map: { [id: string]: Voxel } = {};
    private data: number[] = [];
    private color: Color[] = [];

    public set(i: number, j: number, k: number, v: number) {
        const index = this.getIndex(i, j, k);
        this.data[index] = v;
        this.dirty = true;
        const id = this.getId(i, j, k);

        if (this.map[id] == null) {
            this.map[id] = {
                c: new Color(),
                coord: new Vector3(i, j, k),
                v: 0,
            };
        }
        this.map[id].v = v;
    }

    public get(i: number, j: number, k: number) {
        const index = this.getIndex(i, j, k);
        return this.data[index] || 0;
    }

    public add(i: number, j: number, k: number, amount: number) {
        const index = this.getIndex(i, j, k);
        this.data[index] += amount;
    }

    public inBound(i: number, j: number, k: number) {
        return i > 0 && i < this.size &&
            j > 0 && j < this.size &&
            k > 0 && k < this.size;
    }

    public setColor(i: number, j: number, k: number, c: Color) {
        const index = this.getIndex(i, j, k);
        this.color[index] = c;
        this.dirty = true;
        const id = this.getId(i, j, k);
        if (this.map[id] == null) {
            this.map[id] = {
                c: new Color(),
                coord: new Vector3(i, j, k),
                v: 0,
            };
        }
        this.map[id].c = c;
    }

    public getColor(i: number, j: number, k: number) {
        const index = this.getIndex(i, j, k);
        return this.color[index];
    }

    public getVoxel(coord: Vector3): Voxel {
        const id = this.getId(coord.x, coord.y, coord.z);
        return this.map[id];
    }

    private getIndex(i: number, j: number, k: number) {
        return (i * this.size * this.size) + (j * this.size) + k;
    }

    private getId(i: number, j: number, k: number) {
        return i + "," + j + "," + k;
    }
}
