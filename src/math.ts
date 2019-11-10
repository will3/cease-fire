import { Quaternion, Vector3 } from "three";

export const clamp = (v: number, min: number, max: number) => {
    if (v < min) {
        return min;
    }
    if (v > max) {
        return max;
    }
    return v;
};

export const random = (min: number, max: number) => {
    return min + (max - min) * Math.random();
};

export const randomQuaternion = () => {
    let x: number;
    let y: number;
    let z: number;
    let u: number;
    let v: number;
    let w: number;
    let s: number;
    do { x = random(-1, 1); y = random(-1, 1); z = x * x + y * y; } while (z > 1);
    do { u = random(-1, 1); v = random(-1, 1); w = u * u + v * v; } while (w > 1);
    s = Math.sqrt((1 - z) / w);
    return new Quaternion(x, y, s * u, s * v);
};

export const randomAxis = () => {
    return new Vector3(0, 0, 1).applyQuaternion(randomQuaternion());
};
