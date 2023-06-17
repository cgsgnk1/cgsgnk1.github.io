import { gl } from "./render.js";

export class texture {
    constructor(fileName) {
        this.glId = gl.createTexture();

        this.image = new Image();
        this.image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.glId);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
        this.image.src = fileName;
    }
}
