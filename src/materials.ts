import { FaceColors, Material, MeshBasicMaterial, SpriteMaterial } from "three";

const cache: { [key: string]: Material } = {};

export type materialTypes = "shipMaterial" | "laser";

export const getMaterial = (key: materialTypes) => {
    if (cache[key] == null) {
        cache[key] = createMaterial(key);
    }
    return cache[key];
};

const createMaterial = (key: materialTypes) => {
    switch (key) {
        case "shipMaterial":
            return new MeshBasicMaterial({
                vertexColors: FaceColors,
            });
        case "laser":
            return new SpriteMaterial({
                color: 0xffffff,
            });
    }
};
