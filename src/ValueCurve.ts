export default class ValueCurve {
  public values: number[] = [];
  public intervals: number[] = [];

  constructor(values: number[] | number, intervals?: number[]) {
    if (typeof values === "number") {
      this.values = [values, values];
      this.intervals = [0, 1];
    } else {
      this.values = values;
      if (intervals == null) {
        intervals = [];
        for (let i = 0; i < this.values.length; i++) {
          intervals[i] = (1 / (this.values.length - 1)) * i;
        }
      }
      this.intervals = intervals;
    }
  }

  public get(t: number) {
    if (t <= 0) {
      return this.values[0];
    }
    if (t >= 1.0) {
      return this.values[this.values.length - 1];
    }

    for (let i = 0; i < this.intervals.length - 1; i++) {
      const t1 = this.intervals[i];
      const t2 = this.intervals[i + 1];
      if (t >= t1 && t < t2) {
        const v1 = this.values[i];
        const v2 = this.values[i + 1];
        const r = (t - t1) / (t2 - t1);
        return v1 * (1 - r) + v2 * r;
      }
    }

    throw new Error("Should never happen");
  }
}
