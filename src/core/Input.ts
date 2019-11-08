import keycode from "keycode";

export class Input {
    private keydowns: { [key: string]: boolean } = {};
    private keyups: { [key: string]: boolean } = {};
    private keys: { [key: string]: boolean } = {};
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
}