import Chunk from "./Chunk";
export default class Chunks {
  private map: {
    [id: string]: Chunk;
  } = {};

  public getOrCreateChunk(origin: number[]) {
    const id = origin.join(",");
    if (this.map[id] == null) {
      this.map[id] = new Chunk();
    }
    return this.map[id];
  }

  public set(i: number, j: number, k: number, v: number) {
    const origin = this.getOrigin(i, j, k);
    const chunk = this.getOrCreateChunk(origin);
    chunk.set(i - origin[0], j - origin[1], k - origin[2], v);
  }

  public get(i: number, j: number, k: number) {
    const origin = this.getOrigin(i, j, k);
    const id = origin.join(",");
    const chunk = this.map[id];
    if (chunk == null) {
      return undefined;
    }
    return chunk.get(i - origin[0], j - origin[1], k - origin[2]);
  }

  private getOrigin(i: number, j: number, k: number) {
    return [Math.floor(i / 16.0), Math.floor(j / 16.0), Math.floor(k / 16.0)];
  }
}
