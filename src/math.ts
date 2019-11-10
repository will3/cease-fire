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

export const randomQuaternion = (mag: number = 1): Quaternion => {
    if (mag !== 1) {
        const angle = mag * Math.random() * 2 - mag;
        return new Quaternion().setFromAxisAngle(randomAxis(), angle);
    }
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

export const randomUnitVector = () => {
    return new Vector3(1, 0, 0).applyQuaternion(randomQuaternion());
};

export const randomSigned = () => {
    return Math.random() > 0.5 ? 1 : -1;
};

export const randomUniformUnitVectors = (points: Vector3[], numSimulations = 3) => {
    const simulate = () => {
        for (const a of points) {
            for (const b of points) {
                if (a === b) {
                    continue;
                }

                const dir = b.clone().sub(a).normalize();
                const dist = b.clone().sub(a).length();
                const offset = dir.setLength(1 / dist / dist * 0.1);
                b.add(offset).normalize();
                a.sub(offset).normalize();
            }
        }
    };

    for (let i = 0; i < numSimulations; i++) {
        simulate();
    }

    return points;
};
