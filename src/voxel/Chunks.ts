import { Chunk } from "./Chunk";
class Chunks {
    map: {
        [id: string]: Chunk;
    } = {};
    getOrCreateChunk(origin: number[]) {
        const id = origin.join(",");
        if (this.map[id] == null) {
            this.map[id] = new Chunk(origin);
        }
        return this.map[id];
    }
    getOrigin(i: number, j: number, k: number) {
        return [
            Math.floor(i / 16.0),
            Math.floor(j / 16.0),
            Math.floor(k / 16.0)
        ];
    }
    set(i: number, j: number, k: number, v: number) {
        const origin = this.getOrigin(i, j, k);
        const chunk = this.getOrCreateChunk(origin);
        chunk.set(i - origin[0], j - origin[1], k - origin[2], v);
    }
    get(i: number, j: number, k: number) {
        const origin = this.getOrigin(i, j, k);
        const id = origin.join(",");
        const chunk = this.map[id];
        if (chunk == null) {
            return undefined;
        }
        return chunk.get(i - origin[0], j - origin[1], k - origin[2]);
    }
}
