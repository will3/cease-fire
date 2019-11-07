import { Material } from "three";

const cache: { [key: string]: Material } = {};

export const getMaterial = (key: string, create: () => Material) => {
    if (cache[key] == null) {
        cache[key] = create();
    }
    return cache[key];
};