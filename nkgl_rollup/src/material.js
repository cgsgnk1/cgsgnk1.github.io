import { texture } from "./texture.js";

export class material {
    constructor(ka, kd, ks, ph) {
        this.ka = ka;
        this.kd = kd;
        this.ks = ks;
        this.ph = ph;
        this.shader = null;
        this.texture = null;
    }

    addShader(shaderProgram) {
        this.shader = shaderProgram;
    }

    addTexture(fileName) {
        let tex = new texture(fileName);
        this.texture = tex;
    }
}
