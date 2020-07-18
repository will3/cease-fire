import seedrandom from "seedrandom";
import SimplexNoise from "simplex-noise";

export interface NoiseOptions {
  frequency?: number;
  octaves?: number;
  persistence?: number;
  lacunarity?: number;
  seed?: string;
}

export default class Noise {
  private noise: SimplexNoise;
  private frequency: number;
  private octaves: number;
  private persistence: number;
  private lacunarity: number;
  private seed: string;
  private offset: number;

  constructor(options: NoiseOptions = {}) {
    this.frequency = options.frequency || 0.01;
    this.octaves = options.octaves || 5;
    this.persistence = options.persistence || 0.5;
    this.lacunarity = options.lacunarity || 2;
    this.seed = options.seed || "1337";
    const rng = seedrandom(this.seed);
    this.offset = rng() % 1.1;
    this.noise = new SimplexNoise(this.seed);
  }
  public get(i: number, j: number, k: number) {
    let a = 1.0;
    let f = this.frequency;
    let v = 0;
    let max = 0;
    for (let l = 0; l < this.octaves; l++) {
      max += a;

      v += this._get(i, j, k, f) * a;
      a *= this.persistence;
      f *= this.lacunarity;
    }
    return v / max;
  }

  private _get(i: number, j: number, k: number, f: number) {
    const offset = this.offset * 100000;
    return this.noise.noise3D(i * f, (j + offset) * f, k * f);
  }
}
