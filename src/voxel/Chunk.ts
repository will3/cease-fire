export default class Chunk {
    public size = 32;
    private data: number[] = [];
    private origin: number[];

    constructor(origin: number[]) {
        this.origin = origin;
    }

    public set(i: number, j: number, k: number, v: number) {
        const index = this.getIndex(i, j, k);
        this.data[index] = v;
    }

    public get(i: number, j: number, k: number) {
        const index = this.getIndex(i, j, k);
        return this.data[index];
    }

    private getIndex(i: number, j: number, k: number) {
        return (i * this.size * this.size) + (j * this.size) + k;
    }
}
