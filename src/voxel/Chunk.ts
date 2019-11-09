import { Color } from "three";

export default class Chunk {
    public size = 32;
    private data: number[] = [];
    private origin: number[];
    private color: Color[] = [];

    constructor(origin: number[]) {
        this.origin = origin;
    }

    public set(i: number, j: number, k: number, v: number) {
        const index = this.getIndex(i, j, k);
        this.data[index] = v;
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
    }

    public getColor(i: number, j: number, k: number) {
        const index = this.getIndex(i, j, k);
        return this.color[index];
    }

    private getIndex(i: number, j: number, k: number) {
        return (i * this.size * this.size) + (j * this.size) + k;
    }
}
