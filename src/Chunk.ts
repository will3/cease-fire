export class Chunk {
    data: number[] = [];
    size = 32;
    origin: number[];
    constructor(origin: number[]) {
        this.origin = origin;
    }
    set(i: number, j: number, k: number, v: number) {
        const index = this.getIndex(i, j, k);
        this.data[index] = v;
    }
    get(i: number, j: number, k: number) {
        const index = this.getIndex(i, j, k);
        return this.data[index];
    }
    getIndex(i: number, j: number, k: number) {
        return (i * this.size * this.size) + (j * this.size) + k;
    }
}
