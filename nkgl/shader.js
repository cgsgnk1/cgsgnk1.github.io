import { loadFileAsync } from "./utils.js";
import { gl } from "./render.js";

export class shader {
    constructor(shaderFolder) {
        const vs = loadFileAsync(`./${shaderFolder}/${shaderFolder}.vert`);
        const fs = loadFileAsync(`./${shaderFolder}/${shaderFolder}.frag`);

        Promise.all([vs, fs]).then((res) => {
            this.vs = res[0];
            this.fs = res[1];
        });
    }

    load(type, source) {
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);
    
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert("Shader not compiled!");
        }
    
        return shader;
    }

    attach() {
        const vertexSh = this.load(gl.VERTEX_SHADER, this.vs);
        const fragmentSh = this.load(gl.FRAGMENT_SHADER, this.fs);

        const shaderProgram = gl.createProgram();

        gl.attachShader(shaderProgram, vertexSh);
        gl.attachShader(shaderProgram, fragmentSh);
        gl.linkProgram(shaderProgram);
        
        return shaderProgram;
    }
}
