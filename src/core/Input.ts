import keycode from "keycode";
import { Vector2 } from "three";

export class Input {
    public mousePosition = new Vector2();

    private keydowns: { [key: string]: boolean } = {};
    private keyups: { [key: string]: boolean } = {};
    private keys: { [key: string]: boolean } = {};
    private mousedowns: { [key: number]: boolean } = {};
    private mouseups: { [key: number]: boolean } = {};
    private mouses: { [key: number]: boolean } = {};

    constructor() {
        window.addEventListener("keydown", (e) => {
            const key = keycode(e);
            if (!this.keys[key]) {
                this.keydowns[key] = true;
            }
            this.keys[key] = true;
        });
        window.addEventListener("keyup", (e) => {
            const key = keycode(e);
            this.keyups[key] = true;
            this.keys[key] = false;
        });
        window.addEventListener("mousedown", (e) => {
            this.mousedowns[e.which] = true;
            if (!this.mouses[e.which]) {
                this.mousedowns[e.which] = true;
            }
            this.mouses[e.which] = true;
        });
        window.addEventListener("mouseup", (e) => {
            this.mouseups[e.which] = true;
            this.mouses[e.which] = false;
        });
        window.addEventListener("mousemove", (e) => {
            this.mousePosition.set(e.x, e.y);
        });
    }
    public clear() {
        this.keydowns = {};
        this.keyups = {};
    }
    public key(key: string) {
        return this.keys[key] || false;
    }
    public keydown(key: string) {
        return this.keydowns[key] || false;
    }
    public keyup(key: string) {
        return this.keyups[key] || false;
    }
    public mouse(key: number) {
        return this.mouses[key] || false;
    }
    public mousedown(key: number) {
        return this.mousedowns[key] || false;
    }
    public mouseup(key: number) {
        return this.mouseups[key] || false;
    }
}
