export default class ValueCurve {
    public values: number[] = [];
    public intervals: number[] = [];
    constructor(values: number[], intervals: number[]) {
        this.values = values;
        this.intervals = intervals;
    }
    public get(interval: number) {
        if (interval <= 0) {
            return this.values[0];
        }
        if (interval >= 1.0) {
            return this.values[this.values.length - 1];
        }
        for (let i = 0; i < this.intervals.length; i++) {
            const it = this.intervals[i];
            if (it > interval) {
                const a = this.values[i];
                const b = this.values[i + 1];
                const r = (interval - it) / (this.intervals[i + 1] - it);
                return a * (1 - r) + (b * r);
            }
        }
        throw new Error("Should never happen");
    }
}
