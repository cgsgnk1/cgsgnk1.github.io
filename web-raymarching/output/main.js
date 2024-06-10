var app = (function (exports) {
    'use strict';

    /* Koptelov Nikita, 10-1, 05.06.2024 */
    class Timer {
        startTime;
        oldTime;
        oldTimeFPS;
        pauseTime;
        frameCounter;
        global;
        constructor() {
            this.startTime = this.oldTime = this.oldTimeFPS = Date.now();
            this.pauseTime = this.frameCounter = 0;
            this.global = {
                fps: 0,
                globalTime: 0,
                globalDeltaTime: 0,
                time: 0,
                deltaTime: 0,
                isPause: false,
            };
        }
        response() {
            const t = Date.now();
            this.global.globalTime = t - this.startTime;
            this.global.globalDeltaTime = t - this.oldTime;
            if (this.global.isPause) {
                this.global.deltaTime = 0;
                this.pauseTime += t - this.oldTime;
            }
            else {
                this.global.deltaTime = this.global.globalDeltaTime;
                this.global.time = t - this.pauseTime - this.startTime;
            }
            this.frameCounter++;
            if (t - this.oldTimeFPS > 300) {
                this.global.fps = this.frameCounter / ((t - this.oldTimeFPS) / 1000.0);
                this.oldTimeFPS = t;
                this.frameCounter = 0;
                let fps = document.getElementById("fps");
                if (fps) {
                    fps.innerText = "NK1 Ray Marching; FPS: " + this.global.fps.toString();
                }
            }
            this.oldTime = t;
        }
    }

    /* Koptelov Nikita, 10-1, 05.06.2024 */
    class Shader {
        shaderFolder; /* Shader folder name */
        shaderProgram; /* WebGL program ID */
        shaders;
        numOfUBOs = 0;
        gl;
        constructor(gl, shaderFolder) {
            this.shaderFolder = shaderFolder;
            this.shaderProgram = -1;
            this.shaders = {
                vertex: 0,
                vertexValid: false,
                fragment: 0,
                fragmentValid: false,
            };
            this.gl = gl;
        }
        async load() {
            let vert = await fetch("main_shader/vert.glsl?nocache" + Date.now().toString());
            let shaderv = await vert.text();
            let frag = await fetch("main_shader/frag.glsl?nocache" + Date.now().toString());
            let shaderf = await frag.text();
            this.createShaderProgram({
                vertexCode: shaderv,
                fragmentCode: shaderf,
            });
        }
        use() {
            this.gl.useProgram(this.shaderProgram);
        }
        free() {
            if (this.shaders.vertex)
                this.gl.deleteShader(this.shaders.vertex);
            if (this.shaders.fragment)
                this.gl.deleteShader(this.shaders.fragment);
        }
        compileShader(shaderType, shaderSource) {
            const shader = this.gl.createShader(shaderType);
            if (!shader) {
                return null;
            }
            let shaderLog = document.getElementById("shaderLog");
            this.gl.shaderSource(shader, shaderSource);
            this.gl.compileShader(shader);
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                // alert(
                //   `An error occurred compiling the shaders: ${this.gl.getShaderInfoLog(shader)}`
                // );
                if (shaderLog) {
                    shaderLog.innerText += this.gl.getShaderInfoLog(shader);
                }
                this.gl.deleteShader(shader);
                return null;
            }
            return shader;
        }
        createShaderProgram(shaderCode) {
            let table1 = document.getElementById("table1");
            let shaderLog = document.getElementById("shaderLog");
            if (shaderLog) {
                shaderLog.innerText = "";
            }
            /****
             * Vertex shader compilation
             ****/
            {
                this.shaders.vertex = this.compileShader(this.gl.VERTEX_SHADER, shaderCode.vertexCode);
            }
            if (table1) {
                let vertexColor, vertexText;
                if (!this.shaders.vertex) {
                    vertexColor = "#FF0000";
                    vertexText = "Failed";
                }
                else {
                    vertexColor = "#00FF00";
                    vertexText = "Compiled";
                }
                table1.rows[1].cells[0].innerHTML = vertexText;
                table1.rows[1].cells[0].bgColor = vertexColor;
            }
            /****
             * Fragment shader compilation
             ****/
            {
                this.shaders.fragment = this.compileShader(this.gl.FRAGMENT_SHADER, shaderCode.fragmentCode);
            }
            if (table1) {
                let fragmentColor, fragmentText;
                if (!this.shaders.fragment) {
                    fragmentColor = "#FF0000";
                    fragmentText = "Failed";
                }
                else {
                    fragmentColor = "#00FF00";
                    fragmentText = "Compiled";
                }
                table1.rows[1].cells[1].innerHTML = fragmentText;
                table1.rows[1].cells[1].bgColor = fragmentColor;
            }
            if (!this.shaders.vertex || !this.shaders.fragment)
                return;
            /* Create WebGL2 program */
            let shaderProgram = this.gl.createProgram();
            if (!shaderProgram)
                return;
            this.gl.attachShader(shaderProgram, this.shaders.vertex);
            this.gl.attachShader(shaderProgram, this.shaders.fragment);
            this.gl.linkProgram(shaderProgram);
            if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
                alert(`Unable to initialize the shader program: ${this.gl.getProgramInfoLog(shaderProgram)}`);
                shaderProgram = -1;
            }
            else {
                console.log(`Shader ${this.shaderFolder} has been successfully compiled and loaded!`);
            }
            this.shaderProgram = shaderProgram;
        }
    }

    /* Koptelov Nikita, 10-1, 05.06.2024 */
    class Buffer {
        bufferID;
        gl;
        constructor(gl) {
            this.gl = gl;
            this.bufferID = this.gl.createBuffer();
        }
        bindData(arr, bufferType, drawType) {
            this.gl.bindBuffer(bufferType, this.bufferID);
            this.gl.bufferData(bufferType, new Float32Array(arr), drawType);
        }
    }

    /* Koptelov Nikita, 10-1, 05.06.2024 */
    const d2r = (x) => {
        return (x * Math.PI) / 180;
    };
    class Vec3 {
        x;
        y;
        z;
        constructor(...args) {
            if (arguments.length == 3) {
                this.x = arguments[0];
                this.y = arguments[1];
                this.z = arguments[2];
            }
            else if (arguments.length == 1) {
                this.x = this.y = this.z = arguments[0];
            }
            else {
                this.x = this.y = this.z = arguments[0];
            }
        }
        add(v) {
            return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
        }
        sub(v) {
            return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
        }
        mul(n) {
            return new Vec3(this.x * n, this.y * n, this.z * n);
        }
        dot(v) {
            return this.x * v.x + this.y * v.y + v.z * this.z;
        }
        cross(v) {
            return new Vec3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
        }
        len() {
            let len = this.dot(this);
            if (len == 1 || len == 0) {
                return len;
            }
            return Math.sqrt(len);
        }
        len2() {
            return this.dot(this);
        }
        normalize() {
            return this.mul(1 / this.len());
        }
        pointTransform(m) {
            return new Vec3(this.x * m.a[0][0] + this.y * m.a[1][0] + this.z * m.a[2][0] + m.a[3][0], this.x * m.a[0][1] + this.y * m.a[1][1] + this.z * m.a[2][1] + m.a[3][1], this.x * m.a[0][2] + this.y * m.a[1][2] + this.z * m.a[2][2] + m.a[3][2]);
        }
        toArray() {
            return [this.x, this.y, this.z];
        }
        representate() {
            return `<${this.x},${this.y},${this.z}>`;
        }
        check() {
            console.log(this);
        }
    }
    function vec3Set(...args) {
        if (arguments.length == 1) {
            let x = arguments[0];
            if (typeof x == "object") {
                return new Vec3(x[0], x[1], x[2]);
            }
            else {
                return new Vec3(x, x, x);
            }
        }
        else if (arguments.length == 3) {
            let x = arguments[0], y = arguments[1], z = arguments[2];
            return new Vec3(x, y, z);
        }
        return new Vec3(0, 0, 0);
    }
    class Mat4 {
        a;
        constructor(...args) {
            if (arguments.length != 16) {
                if (arguments.length == 1) {
                    let arr = arguments[0];
                    this.a = [
                        [arr[0], arr[1], arr[2], arr[3]],
                        [arr[4], arr[5], arr[6], arr[7]],
                        [arr[8], arr[9], arr[10], arr[11]],
                        [arr[12], arr[13], arr[14], arr[15]],
                    ];
                }
                this.a = [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1],
                ];
                return;
            }
            this.a = [
                [arguments[0], arguments[1], arguments[2], arguments[3]],
                [arguments[4], arguments[5], arguments[6], arguments[7]],
                [arguments[8], arguments[9], arguments[10], arguments[11]],
                [arguments[12], arguments[13], arguments[14], arguments[15]],
            ];
        }
        static createFromArray(arr) {
            let m = new Mat4();
            m.a = [
                [arr[0], arr[1], arr[2], arr[3]],
                [arr[4], arr[5], arr[6], arr[7]],
                [arr[8], arr[9], arr[10], arr[11]],
                [arr[12], arr[13], arr[14], arr[15]],
            ];
            return m;
        }
        static determ3x3(a00, a01, a02, a10, a11, a12, a20, a21, a22) {
            return (a00 * a11 * a22 +
                a01 * a12 * a20 +
                a02 * a10 * a21 -
                a00 * a12 * a21 -
                a01 * a10 * a22 -
                a02 * a11 * a20);
        }
        mul(obj) {
            let r = new Mat4();
            r.a[0][0] =
                this.a[0][0] * obj.a[0][0] +
                    this.a[0][1] * obj.a[1][0] +
                    this.a[0][2] * obj.a[2][0] +
                    this.a[0][3] * obj.a[3][0];
            r.a[0][1] =
                this.a[0][0] * obj.a[0][1] +
                    this.a[0][1] * obj.a[1][1] +
                    this.a[0][2] * obj.a[2][1] +
                    this.a[0][3] * obj.a[3][1];
            r.a[0][2] =
                this.a[0][0] * obj.a[0][2] +
                    this.a[0][1] * obj.a[1][2] +
                    this.a[0][2] * obj.a[2][2] +
                    this.a[0][3] * obj.a[3][2];
            r.a[0][3] =
                this.a[0][0] * obj.a[0][3] +
                    this.a[0][1] * obj.a[1][3] +
                    this.a[0][2] * obj.a[2][3] +
                    this.a[0][3] * obj.a[3][3];
            r.a[1][0] =
                this.a[1][0] * obj.a[0][0] +
                    this.a[1][1] * obj.a[1][0] +
                    this.a[1][2] * obj.a[2][0] +
                    this.a[1][3] * obj.a[3][0];
            r.a[1][1] =
                this.a[1][0] * obj.a[0][1] +
                    this.a[1][1] * obj.a[1][1] +
                    this.a[1][2] * obj.a[2][1] +
                    this.a[1][3] * obj.a[3][1];
            r.a[1][2] =
                this.a[1][0] * obj.a[0][2] +
                    this.a[1][1] * obj.a[1][2] +
                    this.a[1][2] * obj.a[2][2] +
                    this.a[1][3] * obj.a[3][2];
            r.a[1][3] =
                this.a[1][0] * obj.a[0][3] +
                    this.a[1][1] * obj.a[1][3] +
                    this.a[1][2] * obj.a[2][3] +
                    this.a[1][3] * obj.a[3][3];
            r.a[2][0] =
                this.a[2][0] * obj.a[0][0] +
                    this.a[2][1] * obj.a[1][0] +
                    this.a[2][2] * obj.a[2][0] +
                    this.a[2][3] * obj.a[3][0];
            r.a[2][1] =
                this.a[2][0] * obj.a[0][1] +
                    this.a[2][1] * obj.a[1][1] +
                    this.a[2][2] * obj.a[2][1] +
                    this.a[2][3] * obj.a[3][1];
            r.a[2][2] =
                this.a[2][0] * obj.a[0][2] +
                    this.a[2][1] * obj.a[1][2] +
                    this.a[2][2] * obj.a[2][2] +
                    this.a[2][3] * obj.a[3][2];
            r.a[2][3] =
                this.a[2][0] * obj.a[0][3] +
                    this.a[2][1] * obj.a[1][3] +
                    this.a[2][2] * obj.a[2][3] +
                    this.a[2][3] * obj.a[3][3];
            r.a[3][0] =
                this.a[3][0] * obj.a[0][0] +
                    this.a[3][1] * obj.a[1][0] +
                    this.a[3][2] * obj.a[2][0] +
                    this.a[3][3] * obj.a[3][0];
            r.a[3][1] =
                this.a[3][0] * obj.a[0][1] +
                    this.a[3][1] * obj.a[1][1] +
                    this.a[3][2] * obj.a[2][1] +
                    this.a[3][3] * obj.a[3][1];
            r.a[3][2] =
                this.a[3][0] * obj.a[0][2] +
                    this.a[3][1] * obj.a[1][2] +
                    this.a[3][2] * obj.a[2][2] +
                    this.a[3][3] * obj.a[3][2];
            r.a[3][3] =
                this.a[3][0] * obj.a[0][3] +
                    this.a[3][1] * obj.a[1][3] +
                    this.a[3][2] * obj.a[2][3] +
                    this.a[3][3] * obj.a[3][3];
            return r;
        }
        determ() {
            return (+this.a[0][0] *
                Mat4.determ3x3(this.a[1][1], this.a[1][2], this.a[1][3], this.a[2][1], this.a[2][2], this.a[2][3], this.a[3][1], this.a[3][2], this.a[3][3]) +
                -this.a[0][1] *
                    Mat4.determ3x3(this.a[1][0], this.a[1][2], this.a[1][3], this.a[2][0], this.a[2][2], this.a[2][3], this.a[3][0], this.a[3][2], this.a[3][3]) +
                +this.a[0][2] *
                    Mat4.determ3x3(this.a[1][0], this.a[1][1], this.a[1][3], this.a[2][0], this.a[2][1], this.a[2][3], this.a[3][0], this.a[3][1], this.a[3][3]) +
                -this.a[0][3] *
                    Mat4.determ3x3(this.a[1][0], this.a[1][1], this.a[1][2], this.a[2][0], this.a[2][1], this.a[2][2], this.a[3][0], this.a[3][1], this.a[3][2]));
        }
        transpose() {
            let m = new Mat4();
            m.a[0][0] = this.a[0][0];
            m.a[0][1] = this.a[1][0];
            m.a[0][2] = this.a[2][0];
            m.a[0][3] = this.a[3][0];
            m.a[1][0] = this.a[0][1];
            m.a[1][1] = this.a[1][1];
            m.a[1][2] = this.a[2][1];
            m.a[1][3] = this.a[3][1];
            m.a[2][0] = this.a[0][2];
            m.a[2][1] = this.a[1][2];
            m.a[2][2] = this.a[2][2];
            m.a[2][3] = this.a[3][2];
            m.a[3][0] = this.a[0][3];
            m.a[3][1] = this.a[1][3];
            m.a[3][2] = this.a[2][3];
            m.a[3][3] = this.a[3][3];
            return m;
        }
        inverse() {
            let m = new Mat4(), det = this.determ();
            if (det == 0) {
                return Mat4.identity();
            }
            m.a[0][0] =
                +Mat4.determ3x3(this.a[1][1], this.a[1][2], this.a[1][3], this.a[2][1], this.a[2][2], this.a[2][3], this.a[3][1], this.a[3][2], this.a[3][3]) / det;
            m.a[1][0] =
                -Mat4.determ3x3(this.a[1][0], this.a[1][2], this.a[1][3], this.a[2][0], this.a[2][2], this.a[2][3], this.a[3][0], this.a[3][2], this.a[3][3]) / det;
            m.a[2][0] =
                +Mat4.determ3x3(this.a[1][0], this.a[1][1], this.a[1][3], this.a[2][0], this.a[2][1], this.a[2][3], this.a[3][0], this.a[3][1], this.a[3][3]) / det;
            m.a[3][0] =
                +Mat4.determ3x3(this.a[1][0], this.a[1][1], this.a[1][2], this.a[2][0], this.a[2][1], this.a[2][2], this.a[3][0], this.a[3][1], this.a[3][2]) / det;
            m.a[0][1] =
                -Mat4.determ3x3(this.a[0][1], this.a[0][2], this.a[0][3], this.a[2][1], this.a[2][2], this.a[2][3], this.a[3][1], this.a[3][2], this.a[3][3]) / det;
            m.a[1][1] =
                +Mat4.determ3x3(this.a[0][0], this.a[0][2], this.a[0][3], this.a[2][0], this.a[2][2], this.a[2][3], this.a[3][0], this.a[3][2], this.a[3][3]) / det;
            m.a[2][1] =
                -Mat4.determ3x3(this.a[0][0], this.a[0][1], this.a[0][3], this.a[2][0], this.a[2][1], this.a[2][3], this.a[3][0], this.a[3][1], this.a[3][3]) / det;
            m.a[3][1] =
                -Mat4.determ3x3(this.a[0][0], this.a[0][1], this.a[0][2], this.a[2][0], this.a[2][1], this.a[2][2], this.a[3][0], this.a[3][1], this.a[3][2]) / det;
            m.a[0][2] =
                +Mat4.determ3x3(this.a[0][1], this.a[0][2], this.a[0][3], this.a[1][1], this.a[1][2], this.a[1][3], this.a[3][1], this.a[3][2], this.a[3][3]) / det;
            m.a[1][2] =
                -Mat4.determ3x3(this.a[0][0], this.a[0][2], this.a[0][3], this.a[1][0], this.a[1][2], this.a[1][3], this.a[3][0], this.a[3][2], this.a[3][3]) / det;
            m.a[2][2] =
                +Mat4.determ3x3(this.a[0][0], this.a[0][1], this.a[0][3], this.a[1][0], this.a[1][1], this.a[1][3], this.a[3][0], this.a[3][1], this.a[3][3]) / det;
            m.a[3][2] =
                +Mat4.determ3x3(this.a[0][0], this.a[0][1], this.a[0][2], this.a[1][0], this.a[1][1], this.a[1][2], this.a[3][0], this.a[3][1], this.a[3][2]) / det;
            m.a[0][3] =
                +Mat4.determ3x3(this.a[0][1], this.a[0][2], this.a[0][3], this.a[1][1], this.a[1][2], this.a[1][3], this.a[2][1], this.a[2][2], this.a[2][3]) / det;
            m.a[1][3] =
                -Mat4.determ3x3(this.a[0][0], this.a[0][2], this.a[0][3], this.a[1][0], this.a[1][2], this.a[1][3], this.a[2][0], this.a[2][2], this.a[2][3]) / det;
            m.a[2][3] =
                +Mat4.determ3x3(this.a[0][0], this.a[0][1], this.a[0][3], this.a[1][0], this.a[1][1], this.a[1][3], this.a[2][0], this.a[2][1], this.a[2][3]) / det;
            m.a[3][3] =
                +Mat4.determ3x3(this.a[0][0], this.a[0][1], this.a[0][2], this.a[1][0], this.a[1][1], this.a[1][2], this.a[2][0], this.a[2][1], this.a[2][2]) / det;
            return m;
        }
        static identity() {
            let m = new Mat4();
            m.a[0] = [1, 0, 0, 0];
            m.a[1] = [0, 1, 0, 0];
            m.a[2] = [0, 0, 1, 0];
            m.a[3] = [0, 0, 0, 1];
            return m;
        }
        static scale(v) {
            let m = new Mat4();
            m.a[0] = [v.x, 0, 0, 0];
            m.a[1] = [0, v.y, 0, 0];
            m.a[2] = [0, 0, v.z, 0];
            m.a[3] = [0, 0, 0, 1];
            return m;
        }
        static translate(v) {
            let m = new Mat4();
            m.a[0] = [1, 0, 0, 0];
            m.a[1] = [0, 1, 0, 0];
            m.a[2] = [0, 0, 1, 0];
            m.a[3] = [v.x, v.y, v.z, 1];
            return m;
        }
        static rotateX(angle) {
            let m = new Mat4();
            let a = d2r(angle), s = Math.sin(a), c = Math.cos(a);
            m = Mat4.identity();
            m.a[1][1] = c;
            m.a[1][2] = s;
            m.a[2][1] = -s;
            m.a[2][2] = c;
            return m;
        }
        static rotateY(angle) {
            let m = new Mat4();
            let a = d2r(angle), s = Math.sin(a), c = Math.cos(a);
            m = Mat4.identity();
            m.a[0][0] = c;
            m.a[0][2] = -s;
            m.a[2][0] = s;
            m.a[2][2] = c;
            return m;
        }
        static rotateZ(angle) {
            let m = new Mat4();
            let a = d2r(angle), s = Math.sin(a), c = Math.cos(a);
            m = Mat4.identity();
            m.a[0][0] = c;
            m.a[0][2] = s;
            m.a[2][0] = -s;
            m.a[2][2] = c;
            return m;
        }
        static rotate(v, angle) {
            let m = new Mat4();
            let a = d2r(angle), s = Math.sin(a), c = Math.cos(a);
            let r = v.normalize();
            m.a[0][0] = c + r.x * r.x * (1 - c);
            m.a[0][1] = r.x * r.y * (1 - c) + r.z * s;
            m.a[0][2] = r.x * r.z * (1 - c) - r.y * s;
            m.a[0][3] = 0;
            m.a[1][0] = r.y * r.x * (1 - c) - r.z * s;
            m.a[1][1] = c + r.y * r.y * (1 - c);
            m.a[1][2] = r.y * r.z * (1 - c) + r.z * s;
            m.a[1][3] = 0;
            m.a[2][0] = r.z * r.x * (1 - c) + r.y * s;
            m.a[2][1] = r.z * r.y * (1 - c) - r.x * s;
            m.a[2][2] = c + r.z * r.z * (1 - c);
            m.a[2][3] = 0;
            m.a[3][0] = 0;
            m.a[3][1] = 0;
            m.a[3][2] = 0;
            m.a[3][3] = 1;
            return m;
        }
        static view(loc, at, up1) {
            let m = new Mat4();
            let dir = at.sub(loc).normalize(), right = dir.cross(up1).normalize(), up = right.cross(dir);
            m.a[0] = [right.x, up.x, -dir.x, 0];
            m.a[1] = [right.y, up.y, -dir.y, 0];
            m.a[2] = [right.z, up.z, -dir.z, 0];
            m.a[3] = [-loc.dot(right), -loc.dot(up), loc.dot(dir), 1];
            return m;
        }
        static frustum(l, r, b, t, n, f) {
            let m = new Mat4();
            m.a[0] = [(2 * n) / (r - l), 0, 0, 0];
            m.a[1] = [0, (2 * n) / (t - b), 0, 0];
            m.a[2] = [(r + l) / (r - l), (t + b) / (t - b), (f + n) / (n - f), -1];
            m.a[3] = [0, 0, (2 * n * f) / (n - f), 0];
            return m;
        }
        toArray() {
            return [
                this.a[0][0],
                this.a[0][1],
                this.a[0][2],
                this.a[0][3],
                this.a[1][0],
                this.a[1][1],
                this.a[1][2],
                this.a[1][3],
                this.a[2][0],
                this.a[2][1],
                this.a[2][2],
                this.a[2][3],
                this.a[3][0],
                this.a[3][1],
                this.a[3][2],
                this.a[3][3],
            ];
        }
        check() {
            console.log(this.a[0], this.a[1], this.a[2], this.a[3]);
        }
    }

    /* Koptelov Nikita, 10-1, 05.06.2024 */
    class UBO {
        buffer;
        size;
        binding;
        gl;
        constructor(gl, size, binding, shader) {
            this.gl = gl;
            this.size = size;
            let index = gl.getUniformBlockIndex(shader.shaderProgram, binding);
            gl.uniformBlockBinding(shader.shaderProgram, index, shader.numOfUBOs);
            this.binding = shader.numOfUBOs;
            shader.numOfUBOs++;
            this.buffer = new Buffer(gl);
            gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer.bufferID);
            gl.bufferData(gl.UNIFORM_BUFFER, size, gl.STATIC_DRAW);
            gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);
        }
        update(arr) {
            this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this.buffer.bufferID);
            this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, arr);
            this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);
        }
        apply() {
            this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, this.binding, this.buffer.bufferID);
        }
        resize(size) {
            this.size = size;
            this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this.buffer.bufferID);
            this.gl.bufferData(this.gl.UNIFORM_BUFFER, this.size, this.gl.STATIC_DRAW);
            this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);
        }
    }

    /* Koptelov Nikita, 10-1, 05.06.2024 */
    class Shape {
        data; // 24 * 8
        index;
        ambient = new Vec3(0);
        diffuse = new Vec3(0);
        specular = new Vec3(0);
        trans = 0;
        phong = 0;
        static materialSizeInBytes = 48;
        static dataSizeInBytes = 80; // 5 * 4 * 4, 5x vec4
        static sizeInBytes = Shape.materialSizeInBytes + Shape.dataSizeInBytes;
        static amount = 0;
        static globalShapeTypes = {
            numbers: [1, 2, 3, 4],
            names: ["Sphere", "Plane", "Box", "Torus"],
            createFromArrayFunctions: [
                createSphereFromArrayAndMaterial,
                createPlaneFromArrayAndMaterial,
                createBoxFromArrayAndMaterial,
                createTorusFromArrayAndMaterial,
            ],
            createFromUBODataFunctions: [
                createSphereFromUBOData,
                createPlaneFromUBOData,
                createBoxFromUBOData,
                createTorusFromUBOData,
            ],
            descriptions: [
                "template: <centerX> <centerY> <centerZ> <radius>",
                "template: <pointX> <pointY> <pointZ> <normalX> <normalY> <normalZ>",
                "template: <centerX> <centerY> <centerZ> <sizeX> <sizeY> <sizeZ>",
                "template: <centerX> <centerY> <centerZ> <bigRadius> <smallRadius>",
            ],
        };
        getRepresentateStringBegin() {
            return `[ Shape ${this.index} ]: `;
        }
        static materialLib = {
            red: {
                ambient: new Vec3(0.567, 0, 0),
                diffuse: new Vec3(0.5, 0.5, 0.5),
                specular: new Vec3(0.5, 0.5, 0.5),
                trans: 0,
                phong: 100,
            },
            green: {
                ambient: new Vec3(0, 0.867, 0),
                diffuse: new Vec3(0.5, 0.5, 0.5),
                specular: new Vec3(0.5, 0.5, 0.5),
                trans: 0,
                phong: 10,
            },
            blue: {
                ambient: new Vec3(0, 0, 0.567),
                diffuse: new Vec3(0.5, 0.5, 0.5),
                specular: new Vec3(0.5, 0.5, 0.5),
                trans: 0,
                phong: 10,
            },
        };
        constructor(type, data, material) {
            this.data = new Array(Shape.sizeInBytes / 4);
            if (material != undefined) {
                // Ambient
                this.data[0] = material.ambient.x;
                this.data[1] = material.ambient.y;
                this.data[2] = material.ambient.z;
                // Type
                this.data[3] = type;
                // Diffuse
                this.data[4] = material.diffuse.x;
                this.data[5] = material.diffuse.y;
                this.data[6] = material.diffuse.z;
                // Trans
                this.data[7] = material.trans;
                // Specular
                this.data[8] = material.specular.x;
                this.data[9] = material.specular.y;
                this.data[10] = material.specular.z;
                // Phong
                this.data[11] = material.phong;
                this.ambient = material.ambient;
                this.diffuse = material.diffuse;
                this.specular = material.specular;
                this.trans = material.trans;
                this.phong = material.phong;
            }
            else {
                for (let i = 0; i < Shape.materialSizeInBytes / 4; i++) {
                    this.data[i] = 0;
                }
            }
            // Additional data
            let numOfFloats = (Shape.sizeInBytes - Shape.materialSizeInBytes) / 4;
            let floatsStart = Shape.materialSizeInBytes / 4;
            let i = 0;
            for (; i < Math.min(numOfFloats, data.length); i++) {
                this.data[floatsStart + i] = data[i];
            }
            for (; i < 20; i++) {
                this.data[floatsStart + i] = 0;
            }
            this.index = -1;
        }
        getType() {
            return this.data[3];
        }
        getMaterial() {
            return {
                ambient: this.ambient,
                diffuse: this.diffuse,
                specular: this.specular,
                trans: this.trans,
                phong: this.phong,
            };
        }
        representate(scene) {
            return "Some shape";
        }
    }
    class Sphere extends Shape {
        static amount = 0;
        center;
        radius;
        constructor(center, radius, material) {
            super(1, [
                center.x,
                center.y,
                center.z,
                radius,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ], material);
            this.center = center;
            this.radius = radius;
            Sphere.amount++;
        }
        representate() {
            if (this.index == undefined) {
                return "???";
            }
            return (this.getRepresentateStringBegin() +
                `type: sphere, center: ${this.center.representate()}, radius: ${this.radius}`);
        }
    }
    class Plane extends Shape {
        point;
        normal;
        constructor(point, normal, material) {
            super(2, [
                point.x,
                point.y,
                point.z,
                0,
                normal.x,
                normal.y,
                normal.z,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ], material);
            this.point = point;
            this.normal = normal;
        }
        representate(scene) {
            if (this.index == undefined) {
                return "???";
            }
            return (this.getRepresentateStringBegin() +
                `type: plane, point: ${this.point.representate()}, normal: ${this.normal.representate()}`);
        }
    }
    class Box extends Shape {
        center;
        box;
        constructor(center, box, material) {
            super(3, [
                center.x,
                center.y,
                center.z,
                0,
                box.x,
                box.y,
                box.z,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ], material);
            this.center = center;
            this.box = box;
        }
        representate(scene) {
            if (this.index == undefined) {
                return "???";
            }
            return (this.getRepresentateStringBegin() +
                `type: box, center: ${this.center.representate()}, box: ${this.box.representate()}`);
        }
    }
    class Torus extends Shape {
        center;
        r1;
        r2;
        constructor(center, r1, r2, material) {
            super(4, [
                center.x,
                center.y,
                center.z,
                0,
                r1,
                r2,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ], material);
            this.center = center;
            this.r1 = r1;
            this.r2 = r2;
        }
        representate(scene) {
            if (this.index == undefined) {
                return "???";
            }
            return (this.getRepresentateStringBegin() +
                `type: torus, center: ${this.center.representate()}, r1: ${this.r1}, r2: ${this.r2}`);
        }
    }
    /*****
     * Functions of creating from array and UBO
     *****/
    function createMaterialFromUBOData(arr) {
        return {
            ambient: new Vec3(arr[0], arr[1], arr[2]),
            diffuse: new Vec3(arr[4], arr[5], arr[6]),
            specular: new Vec3(arr[8], arr[9], arr[10]),
            trans: arr[7],
            phong: arr[11],
        };
    }
    function createSphereFromArrayAndMaterial(arr, material) {
        if (arr.length != 4) {
            return undefined;
        }
        return new Sphere(new Vec3(arr[0], arr[1], arr[2]), arr[3], material);
    }
    function createSphereFromUBOData(arr) {
        if (arr.length != Shape.sizeInBytes / 4) {
            return undefined;
        }
        let off = Shape.materialSizeInBytes / 4;
        return new Sphere(new Vec3(arr[off + 0], arr[off + 1], arr[off + 2]), arr[off + 3], createMaterialFromUBOData(arr));
    }
    function createPlaneFromArrayAndMaterial(arr, material) {
        if (arr.length != 6) {
            return undefined;
        }
        return new Plane(new Vec3(arr[0], arr[1], arr[2]), new Vec3(arr[3], arr[4], arr[5]), material);
    }
    function createPlaneFromUBOData(arr) {
        if (arr.length != Shape.sizeInBytes / 4) {
            return undefined;
        }
        let off = Shape.materialSizeInBytes / 4;
        return new Plane(new Vec3(arr[off + 0], arr[off + 1], arr[off + 2]), new Vec3(arr[off + 4], arr[off + 5], arr[off + 6]), createMaterialFromUBOData(arr));
    }
    function createBoxFromArrayAndMaterial(arr, material) {
        if (arr.length != 6) {
            return undefined;
        }
        return new Box(new Vec3(arr[0], arr[1], arr[2]), new Vec3(arr[3], arr[4], arr[5]), material);
    }
    function createBoxFromUBOData(arr) {
        if (arr.length != Shape.sizeInBytes / 4) {
            return undefined;
        }
        let off = Shape.materialSizeInBytes / 4;
        return new Box(new Vec3(arr[off + 0], arr[off + 1], arr[off + 2]), new Vec3(arr[off + 4], arr[off + 5], arr[off + 6]), createMaterialFromUBOData(arr));
    }
    function createTorusFromArrayAndMaterial(arr, material) {
        if (arr.length != 5) {
            return undefined;
        }
        return new Torus(new Vec3(arr[0], arr[1], arr[2]), arr[3], arr[4], material);
    }
    function createTorusFromUBOData(arr) {
        if (arr.length != Shape.sizeInBytes / 4) {
            return undefined;
        }
        let off = Shape.materialSizeInBytes / 4;
        return new Torus(new Vec3(arr[off + 0], arr[off + 1], arr[off + 2]), arr[off + 4], arr[off + 5], createMaterialFromUBOData(arr));
    }

    /* Koptelov Nikita, 10-1, 06.06.2024 */
    class Camera {
        projSize;
        projDist;
        projFarClip;
        frameW;
        frameH;
        /* wp: number;
           hp: number; */
        matrView;
        matrProj;
        matrVP;
        loc;
        at;
        dir;
        up;
        right;
        angleY;
        angleXZ;
        static sizeinBytes = 272;
        constructor(w, h) {
            this.projSize = 0.1;
            this.projDist = 0.1;
            this.projFarClip = 50000;
            this.frameW = w;
            this.frameH = h;
            /* this.wp = 0.1;
            this.hp = 0.1; */
            this.matrView = new Mat4();
            this.matrProj = new Mat4();
            this.matrVP = new Mat4();
            this.loc = new Vec3();
            this.at = new Vec3();
            this.dir = new Vec3();
            this.up = new Vec3();
            this.right = new Vec3();
            this.angleY = 0;
            this.angleXZ = 0;
        }
        set(loc, at, up) {
            this.matrView = Mat4.view(loc, at, up);
            this.loc = loc;
            this.at = at;
            this.dir = vec3Set(-this.matrView.a[0][2], -this.matrView.a[1][2], -this.matrView.a[2][2]);
            this.up = vec3Set(this.matrView.a[0][1], this.matrView.a[1][1], this.matrView.a[2][1]);
            this.right = vec3Set(this.matrView.a[0][0], this.matrView.a[1][0], this.matrView.a[2][0]);
            this.matrVP = this.matrView.mul(this.matrProj);
        }
        proj() {
            let rx, ry;
            rx = this.projSize;
            ry = rx;
            if (this.frameW > this.frameH) {
                rx *= this.frameW / this.frameH;
            }
            else {
                ry *= this.frameH / this.frameW;
            }
            this.matrProj = Mat4.frustum(-rx / 2, rx / 2, -ry / 2, ry / 2, this.projDist, this.projFarClip);
            this.matrVP = this.matrView.mul(this.matrProj);
        }
        resize(nw, nh) {
            this.frameW = nw;
            this.frameH = nh;
            this.proj();
        }
        updateFromArray(arr) {
            this.loc = new Vec3(arr[0], arr[1], arr[2]);
            this.frameW = arr[3];
            this.dir = new Vec3(arr[4], arr[5], arr[6]);
            this.frameH = arr[7];
            this.at = new Vec3(arr[8], arr[9], arr[10]);
            this.projDist = arr[11];
            this.right = new Vec3(arr[12], arr[13], arr[14]);
            this.angleY = arr[15];
            this.up = new Vec3(arr[16], arr[17], arr[18]);
            this.angleXZ = arr[19];
            let mat4Arr = new Array(16);
            for (let i = 20; i < 36; i++) {
                mat4Arr[20 - i] = arr[i];
            }
            this.matrView = Mat4.createFromArray(mat4Arr);
            for (let i = 36; i < 52; i++) {
                mat4Arr[36 - i] = arr[i];
            }
            this.matrProj = Mat4.createFromArray(mat4Arr);
            for (let i = 52; i < 68; i++) {
                mat4Arr[52 - i] = arr[i];
            }
            this.matrVP = Mat4.createFromArray(mat4Arr);
        }
        toArray(change, offset) {
            change.arr[offset + 0] = this.loc.x;
            change.arr[offset + 1] = this.loc.y;
            change.arr[offset + 2] = this.loc.z;
            change.arr[offset + 3] = this.frameW;
            change.arr[offset + 4] = this.dir.x;
            change.arr[offset + 5] = this.dir.y;
            change.arr[offset + 6] = this.dir.z;
            change.arr[offset + 7] = this.frameH;
            change.arr[offset + 8] = this.at.x;
            change.arr[offset + 9] = this.at.y;
            change.arr[offset + 10] = this.at.z;
            change.arr[offset + 11] = this.projDist;
            change.arr[offset + 12] = this.right.x;
            change.arr[offset + 13] = this.right.y;
            change.arr[offset + 14] = this.right.z;
            change.arr[offset + 15] = this.angleY;
            change.arr[offset + 16] = this.up.x;
            change.arr[offset + 17] = this.up.y;
            change.arr[offset + 18] = this.up.z;
            change.arr[offset + 19] = this.angleXZ;
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    change.arr[offset + 20 + row * 4 + col] = this.matrView.a[row][col];
                }
            }
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    change.arr[offset + 35 + row * 4 + col] = this.matrProj.a[row][col];
                }
            }
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    change.arr[offset + 51 + row * 4 + col] = this.matrVP.a[row][col];
                }
            }
        }
    }

    /* Koptelov Nikita, 10-1, 05.06.2024 */
    class Scene {
        globalShapes;
        camera;
        shapesUBO;
        cameraUBO;
        shapesUBOArray;
        cameraUBOArray;
        static maxShapes = 64;
        amountOfShapes = 0;
        constructor(gl, shader, camera) {
            this.globalShapes = [];
            this.shapesUBO = new UBO(gl, Scene.maxShapes * Shape.sizeInBytes, "shapesUBO", shader);
            this.shapesUBOArray = new Array((Scene.maxShapes * Shape.sizeInBytes) / 4);
            this.cameraUBO = new UBO(gl, Camera.sizeinBytes, "cameraUBO", shader);
            this.cameraUBOArray = new Array(Camera.sizeinBytes / 4);
            for (let i = 0; i < this.cameraUBOArray.length; i++) {
                this.shapesUBOArray[i] = 0;
            }
            this.camera = camera;
            this.#cameraToArray({ arr: this.cameraUBOArray }, 0);
        }
        add(shape) {
            let i = this.amountOfShapes;
            this.globalShapes[i] = shape;
            this.globalShapes[i].index = i;
            this.amountOfShapes++;
            this.shapesUpdate();
        }
        edit(shape, index) {
            this.globalShapes[index] = shape;
            this.globalShapes[index].index = index;
            this.shapesUpdate();
        }
        remove(index) {
            if (index > this.amountOfShapes - 1) {
                return;
            }
            this.globalShapes[index] = new Shape(0, []);
            for (let i = index + 1; i < this.amountOfShapes; i++) {
                this.globalShapes[i - 1] = this.globalShapes[i];
            }
            this.globalShapes.pop();
            this.amountOfShapes--;
            this.shapesUpdate();
        }
        shapesUpdate() {
            this.#shapesToArray({ arr: this.shapesUBOArray }, 0, this.shapesUBOArray.length);
            this.shapesUBO.update(new Float32Array(this.shapesUBOArray));
        }
        cameraUpdate() {
            this.#cameraToArray({ arr: this.cameraUBOArray }, 0);
            this.cameraUBO.update(new Float32Array(this.cameraUBOArray));
        }
        #shapesToArray(change, offset, end) {
            let k = 0;
            this.globalShapes.forEach((element) => {
                for (let i = 0; i < Shape.sizeInBytes / 4; i++) {
                    change.arr[offset + k] = element.data[i];
                    k++;
                }
            });
            for (; offset + k < end; k++) {
                change.arr[offset + k] = 0;
            }
        }
        #cameraToArray(change, offset) {
            this.camera.toArray(change, offset);
        }
    }

    /* Koptelov Nikita, 10-1, 05.06.2024 */
    function colorToDecimal(color) {
        let res = new Vec3();
        // color: "#834d18"
        res.x = eval("0x" + color[1] + color[2]) / 255.0;
        res.y = eval("0x" + color[3] + color[4]) / 255.0;
        res.z = eval("0x" + color[5] + color[6]) / 255.0;
        return res;
    }
    function materialGet() {
        const ambient = document.querySelector("#ambientPicker");
        const diffuse = document.querySelector("#diffusePicker");
        const spec = document.querySelector("#specularPicker");
        const trans = document.querySelector("#transPicker");
        const phong = document.querySelector("#phongPicker");
        return {
            ambient: colorToDecimal(ambient.value),
            diffuse: colorToDecimal(diffuse.value),
            specular: colorToDecimal(spec.value),
            trans: Number(trans.value),
            phong: Number(phong.value),
        };
    }
    /* UI class */
    class UI {
        static scene = undefined;
        static initialize() {
            /* HTML elements query select */
            const shapeSelect1 = document.querySelector("#shapeSelect1");
            const shapeEditButton = document.querySelector("#shapeEditButton");
            const shapeDeleteButton = document.querySelector("#shapeDeleteButton");
            // const helpTextParagraph = document.querySelector(
            //   "#helpText"
            // ) as HTMLParagraphElement | null;
            const sceneSaveButton = document.querySelector("#sceneSaveButton");
            const sceneSelect = document.querySelector("#sceneSelect");
            const shapeTemplates = document.querySelector("#shapeTemplates");
            if (!shapeSelect1 ||
                !shapeEditButton ||
                !shapeDeleteButton ||
                // !helpTextParagraph ||
                !sceneSaveButton ||
                !sceneSelect ||
                !shapeTemplates) {
                return;
            }
            /* End of 'HTML elements query select' */
            /**********
             * * * * *
             * * * * *
             * Templates load
             * * * * *
             * * * * *
             * * * * *
             **********/
            let tmpl = "";
            for (let i = 0; i < Shape.globalShapeTypes.names.length; i++) {
                tmpl +=
                    Shape.globalShapeTypes.names[i] +
                        ": " +
                        Shape.globalShapeTypes.descriptions[i] +
                        "\n";
            }
            shapeTemplates.innerText = tmpl;
            /**********
             * * * * *
             * * * * *
             * Scenes load
             * * * * *
             * * * * *
             * * * * *
             **********/
            let forbidden = [
                "length",
                "clear",
                "getItem",
                "key",
                "removeItem",
                "setItem",
            ];
            for (const scene in window.localStorage) {
                let b = forbidden.find((value) => {
                    return value == scene;
                });
                if (!b) {
                    sceneSelect.options.add(new Option(scene));
                }
            }
            // Set first scene as default
            if (sceneSelect.options.length != 0) {
                sceneSelect.options[sceneSelect.options.length - 1].selected = true;
            }
            /**********
             * * * * *
             * * * * *
             * Shape select input
             * * * * *
             * * * * *
             * * * * *
             **********/
            shapeSelect1.addEventListener("change", (event) => {
                const shapeSelectDiv = document.querySelector("#shapeSelectDiv");
                if (!shapeSelectDiv) {
                    return;
                }
                if (shapeSelect1.value == "new...") {
                    if (document.getElementById("justBr") == null) {
                        let a = document.createElement("a");
                        a.innerHTML = "&nbsp";
                        a.id = "justBr";
                        shapeSelectDiv.appendChild(a);
                        const shapeSelect2 = document.createElement("select");
                        shapeSelect2.className = "bigText";
                        shapeSelect2.id = "shapeSelect2";
                        let names = Shape.globalShapeTypes.names;
                        for (let name of names) {
                            let opt = document.createElement("option");
                            opt.text = name;
                            shapeSelect2.prepend(opt);
                        }
                        shapeSelectDiv.appendChild(shapeSelect2);
                        /*
                        shapeSelect2.addEventListener("change", (event) => {
                          for (let i = 0; i < Shape.globalShapeTypes.names.length; i++) {
                            if (shapeSelect2.value == Shape.globalShapeTypes.names[i]) {
                              helpTextParagraph.textContent =
                                Shape.globalShapeTypes.descriptions[i];
                            }
                          }
                        });
              
                        shapeSelect2.dispatchEvent(new Event("change"));
                        */
                    }
                }
                else {
                    const shapeSelect2 = document.querySelector("#shapeSelect2");
                    const justBr = document.querySelector("#justBr");
                    if (shapeSelect2) {
                        shapeSelectDiv.removeChild(shapeSelect2);
                    }
                    if (justBr) {
                        shapeSelectDiv.removeChild(justBr);
                    }
                }
            });
            /* End of 'ShapeSelect1 add event listener' */
            /**********
             * * * * *
             * * * * *
             * Shape edit button
             * * * * *
             * * * * *
             * * * * *
             **********/
            shapeEditButton.addEventListener("click", (event) => {
                if (UI.scene == undefined) {
                    return;
                }
                const shapeSelect1 = document.querySelector("#shapeSelect1");
                if (!shapeSelect1) {
                    return;
                }
                const shapeEditInput = document.querySelector("#shapeEditInput");
                if (!shapeEditInput) {
                    return;
                }
                const userData = shapeEditInput.value.split(" ").map((value) => {
                    return Number(value);
                });
                if (shapeSelect1.value != "new...") {
                    // shapeSelect1.value != "new..."
                    let idx = Number(shapeSelect1.value.split(" ")[2]);
                    let type = UI.scene.globalShapes[idx].getType();
                    for (let i = 0; i < Shape.globalShapeTypes.numbers.length; i++) {
                        if (type == Shape.globalShapeTypes.numbers[i]) {
                            this.editShape(Shape.globalShapeTypes.createFromArrayFunctions[i](userData, materialGet()), idx);
                        }
                    }
                }
                else {
                    // shapeSelect1.value == "new..."
                    const shapeSelect2 = document.querySelector("#shapeSelect2");
                    if (!shapeSelect2) {
                        return;
                    }
                    let type = shapeSelect2.value;
                    for (let i = 0; i < Shape.globalShapeTypes.names.length; i++) {
                        if (type == Shape.globalShapeTypes.names[i]) {
                            this.addShapeToScene(Shape.globalShapeTypes.createFromArrayFunctions[i](userData, materialGet()));
                        }
                    }
                    let newOption = document.getElementById("new");
                    if (newOption) {
                        newOption.selected = true;
                        shapeSelect1.dispatchEvent(new Event("change"));
                    }
                }
            });
            shapeDeleteButton.addEventListener("click", (event) => {
                const shapeSelect1 = document.querySelector("#shapeSelect1");
                if (!shapeSelect1 || shapeSelect1.value == "new...") {
                    return;
                }
                let idx = Number(shapeSelect1.value.split(" ")[2]);
                this.deleteShapeFromScene(idx);
            });
            /***
             * Format of saving scene:
             *   - first of (Scene.maxShapes * Shape.sizeInBytes / 4) numbers - shape data
             *   - next to it, (Camera.sizeInBytes / 4) numbers - camera data
             ***/
            sceneSaveButton.addEventListener("click", (event) => {
                if (UI.scene == undefined) {
                    return;
                }
                const sceneNameInput = document.querySelector("#sceneNameInput");
                if (!sceneNameInput || sceneNameInput.value == "") {
                    return;
                }
                if (window.localStorage.getItem(sceneNameInput.value) == undefined) {
                    let opt = new Option(sceneNameInput.value);
                    opt.selected = true;
                    sceneSelect.options.add(new Option(sceneNameInput.value));
                }
                window.localStorage.setItem(sceneNameInput.value, UI.scene.shapesUBOArray.concat(UI.scene.cameraUBOArray).toString());
            });
            sceneSelect.addEventListener("change", (event) => {
                if (UI.scene == undefined) {
                    return;
                }
                const received = window.localStorage.getItem(sceneSelect.value);
                if (!received) {
                    return;
                }
                const shapesAndCameraData = received.split(",").map((str) => {
                    return Number(str);
                });
                let i = 0;
                let n = 0;
                UI.clear();
                for (; i < (Scene.maxShapes * Shape.sizeInBytes) / 4; i += Shape.sizeInBytes / 4) {
                    const type = shapesAndCameraData[i + 3];
                    console.log(type);
                    if (type == 0) {
                        break;
                    }
                    let arr = shapesAndCameraData.slice(i, i + Shape.sizeInBytes / 4);
                    console.log(arr);
                    UI.addShapeToScene(Shape.globalShapeTypes.createFromUBODataFunctions[type - 1](arr));
                    n++;
                }
                console.log(`"Shapes loaded: ${n}"`);
                UI.scene.cameraUBOArray = shapesAndCameraData.slice((Scene.maxShapes * Shape.sizeInBytes) / 4);
                UI.scene.camera.updateFromArray(UI.scene.cameraUBOArray);
                UI.scene.cameraUpdate();
                shapeSelect1.dispatchEvent(new Event("change"));
            });
            // Let's have some fun
            /*
            const planeCheckerButton = document.querySelector(
              "#planeCheckerButton"
            ) as HTMLButtonElement;
        
            planeCheckerButton.addEventListener("click", (event) => {
              if (UI.scene == undefined) {
                return;
              }
              UI.scene.globalShapes.forEach((shape) => {
                if (shape.data[3] == 2) {
                  if (shape.data[Shape.materialSizeInBytes / 4 + 7] == 0) {
                    shape.data[Shape.materialSizeInBytes / 4 + 7] = 1;
                  } else {
                    shape.data[Shape.materialSizeInBytes / 4 + 7] = 0;
                  }
                }
              });
            });
            */
        }
        static bindScene(scene) {
            UI.scene = scene;
        }
        static addShapeToScene(shape) {
            if (UI.scene == undefined || shape == undefined) {
                return;
            }
            UI.scene.add(shape);
            const shapeSelect1 = document.querySelector("#shapeSelect1");
            let option = document.createElement("option");
            option.text = shape.representate(UI.scene);
            option.id = shape.representate(UI.scene);
            option.defaultSelected = true;
            shapeSelect1.prepend(option);
        }
        static editShape(shape, idx) {
            if (UI.scene == undefined || shape == undefined) {
                return;
            }
            let id = UI.scene.globalShapes[idx].representate(UI.scene);
            let optionToChange = document.getElementById(id);
            UI.scene.edit(shape, idx);
            if (optionToChange) {
                optionToChange.text = optionToChange.id = UI.scene.globalShapes[idx].representate(UI.scene);
            }
        }
        static deleteShapeFromScene(deleteIndex) {
            if (UI.scene == undefined || deleteIndex > UI.scene.amountOfShapes - 1) {
                return;
            }
            const shapeSelect1 = document.querySelector("#shapeSelect1");
            let optionsArray = [];
            for (let option of shapeSelect1.options) {
                if (option.value != "new...") {
                    optionsArray.push(option);
                }
            }
            for (let option of optionsArray) {
                let idx = Number(option.text.split(" ")[2]);
                if (idx > deleteIndex) {
                    UI.scene.globalShapes[idx].index--;
                    option.text = option.id = UI.scene.globalShapes[idx].representate(UI.scene);
                }
                else if (idx == deleteIndex) {
                    shapeSelect1.removeChild(option);
                }
            }
            UI.scene.remove(deleteIndex);
            shapeSelect1.dispatchEvent(new Event("change"));
            // console.log(optionsArray);
        }
        static saveSceneToLocalStorage(name) {
            if (window.localStorage.getItem(name) != undefined) {
                return;
            }
            const sceneSaveButton = document.querySelector("#sceneSaveButton");
            const sceneNameInput = document.querySelector("#sceneNameInput");
            if (!sceneSaveButton || !sceneNameInput) {
                return;
            }
            sceneNameInput.value = name;
            sceneSaveButton.dispatchEvent(new Event("click"));
        }
        static clear() {
            if (UI.scene == undefined) {
                return;
            }
            let am = UI.scene.amountOfShapes;
            for (let i = 0; i < am; i++) {
                UI.deleteShapeFromScene(0);
            }
        }
    }

    /* Koptelov Nikita, 10-1, 07.06.2024 */
    class Input {
        keys;
        keysClick;
        constructor() {
            this.keys = {};
            this.keysClick = {};
            window.addEventListener("keydown", (event) => {
                this.keys[event.key] = true;
            });
            window.addEventListener("keyup", (event) => {
                this.keys[event.key] = false;
                this.keysClick[event.key] = false;
            });
        }
        response() {
            for (let key in this.keys) {
                if (!this.keys[key] && !this.keysClick[key]) {
                    this.keysClick[key] = true;
                }
                else {
                    this.keysClick[key] = false;
                }
            }
        }
        checkKeys(key) {
            if (!this.keys[key]) {
                return false;
            }
            return true;
        }
        checkKeysClick(key) {
            if (!this.keysClick[key]) {
                return false;
            }
            return true;
        }
    }

    /* Koptelov Nikita, 10-1, 05.06.2024 */
    let gl;
    /* Global scene data */
    const globalShaderReloadTime = 100000000; // in seconds (one time in 3 years)
    let globalBuffer;
    let globalShader;
    let globalScene;
    let globalTimer = new Timer();
    let globalCamera;
    /* Scene UBO:
     * vec4 sync;
     * ---- offset: 4
     * vec4 camLocFrameW;
     * vec4 camDirFrameH;
     * vec4 camAtProjDist;
     * vec4 camRightWp;
     * vec4 camUpHp;
     * ---- +24 floats ---> 96 bytes
     * mat4 matrView;
     * mat4 matrProj;
     * mat4 matrVP;
     * ---- +48 floats ---> 192 bytes
     * ---- offset: 48 + 24 = 72, 288 bytes
     * ShapeData shapeData[64];
     * ---- +64 * Shape.sizeInBytes
     */
    let globalTimerUBO;
    let globalTimerUBOBuf;
    let globalInput = new Input();
    function initializeGL() {
        const canvas = document.querySelector("#glCanvas");
        if (!canvas)
            return;
        let ctx = canvas.getContext("webgl2");
        if (!ctx)
            return;
        gl = ctx;
        globalCamera = new Camera(canvas.width, canvas.height);
        globalCamera.set(vec3Set(0, 1, -5), vec3Set(0), vec3Set(0, 1, 0));
    }
    function drawScene() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const numComponents = 2; // pull out 2 values per iteration
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, globalBuffer.bufferID);
        gl.vertexAttribPointer(gl.getAttribLocation(globalShader.shaderProgram, "inPos"), numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(gl.getAttribLocation(globalShader.shaderProgram, "inPos"));
        globalShader.use();
        /* UBO update & apply */
        globalTimerUBOBuf[0] = globalTimer.global.time;
        globalTimerUBOBuf[1] = globalTimer.global.globalTime;
        globalTimerUBOBuf[2] = globalTimer.global.deltaTime;
        globalTimerUBOBuf[3] = globalTimer.global.globalDeltaTime;
        globalTimerUBO.update(new Float32Array(globalTimerUBOBuf));
        globalTimerUBO.apply();
        globalScene.cameraUpdate();
        globalScene.cameraUBO.apply();
        globalScene.shapesUBO.apply();
        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }
    async function main() {
        initializeGL();
        UI.initialize();
        globalShader = new Shader(gl, "main_shader");
        await globalShader.load();
        globalScene = new Scene(gl, globalShader, globalCamera);
        let sphereDefault = new Sphere(new Vec3(0, 1, 0), 1.0, Shape.materialLib["red"]);
        let planeDefault = new Plane(new Vec3(0, 0, 0), new Vec3(0, 1, 0), Shape.materialLib["blue"]);
        let torusDefault = new Torus(new Vec3(1, 0.2, -2), 0.5, 0.2, Shape.materialLib["green"]);
        UI.bindScene(globalScene);
        UI.addShapeToScene(sphereDefault);
        UI.addShapeToScene(planeDefault);
        UI.addShapeToScene(torusDefault);
        UI.saveSceneToLocalStorage("default");
        /*
        UI.addShapeToScene(
          new Sphere(new Vec3(6, 1, 6), 1, Shape.materialLib["green"])
        );
      
        UI.addShapeToScene(
          new Sphere(new Vec3(8, 1, 8), 1, Shape.materialLib["green"])
        );
      
        UI.addShapeToScene(
          new Sphere(new Vec3(10, 1, 10), 1, Shape.materialLib["green"])
        );
      
        UI.addShapeToScene(
          new Sphere(new Vec3(12, 1, 12), 1, Shape.materialLib["green"])
        );
        */
        gl.clearColor(131 / 255, 77 / 255, 24 / 255, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        /* Prepare ray marching scene resources */
        globalBuffer = new Buffer(gl);
        globalBuffer.bindData([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0], gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        globalTimerUBO = new UBO(gl, 16, "timerUBO", globalShader);
        globalTimerUBOBuf = new Array(4);
        for (let i = 0; i < globalTimerUBOBuf.length; i++) {
            globalTimerUBOBuf[i] = 0;
        }
        let shaderReloadTime = 0;
        const draw = async () => {
            globalTimer.response();
            document.dispatchEvent(new Event("keydown"));
            inputHandle();
            if (shaderReloadTime > globalShaderReloadTime * 1000) {
                shaderReloadTime = 0;
                await globalShader.load();
            }
            shaderReloadTime += globalTimer.global.globalDeltaTime;
            drawScene();
            window.requestAnimationFrame(draw);
        };
        draw();
    }
    window.addEventListener("load", () => {
        // writeFileSync("a.txt", "123");
        main();
    });
    window.addEventListener("wheel", (event) => {
        let dir = globalCamera.loc.normalize();
        globalCamera.loc = globalCamera.loc.add(dir.mul(((globalTimer.global.globalDeltaTime / 1000.0) *
            event.deltaY *
            globalCamera.loc.len()) /
            20.0));
        globalCamera.set(globalCamera.loc, new Vec3(0), new Vec3(0, 1, 0));
    });
    function inputHandle() {
        let dir = new Vec3(0, 0, 1);
        dir = dir.pointTransform(Mat4.rotateY(globalCamera.angleY));
        globalCamera.dir = dir;
        if (globalInput.checkKeys("d")) {
            globalCamera.angleY += (globalTimer.global.globalDeltaTime / 777.0) * 50;
        }
        if (globalInput.checkKeys("a")) {
            globalCamera.angleY -= (globalTimer.global.globalDeltaTime / 777.0) * 50;
        }
        if (globalInput.checkKeys("ArrowUp")) {
            globalCamera.angleXZ += (globalTimer.global.globalDeltaTime / 777.0) * 50;
        }
        if (globalInput.checkKeys("ArrowDown")) {
            globalCamera.angleXZ -= (globalTimer.global.globalDeltaTime / 777.0) * 50;
        }
        if (globalInput.checkKeys("w")) {
            globalCamera.loc = globalCamera.loc.add(dir.mul(globalTimer.global.globalDeltaTime / 333.0
            // Number(globalInput.checkKeys("Shift")) * 0.2
            ));
        }
        if (globalInput.checkKeys("s")) {
            globalCamera.loc = globalCamera.loc.add(dir.mul(-globalTimer.global.globalDeltaTime / 333.0
            // Number(globalInput.checkKeys("Shift")) * 0.2
            ));
        }
    }

    exports.main = main;

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vdGltZXIudHMiLCIuLi9zaGFkZXIudHMiLCIuLi9idWZmZXIudHMiLCIuLi9tdGgudHMiLCIuLi91Ym8udHMiLCIuLi9zaGFwZXMudHMiLCIuLi9jYW1lcmEudHMiLCIuLi9zY2VuZS50cyIsIi4uL3VpLnRzIiwiLi4vaW5wdXQudHMiLCIuLi9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIEtvcHRlbG92IE5pa2l0YSwgMTAtMSwgMDUuMDYuMjAyNCAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIFRpbWVyIHtcclxuICBzdGFydFRpbWU6IG51bWJlcjtcclxuICBvbGRUaW1lOiBudW1iZXI7XHJcbiAgb2xkVGltZUZQUzogbnVtYmVyO1xyXG4gIHBhdXNlVGltZTogbnVtYmVyO1xyXG4gIGZyYW1lQ291bnRlcjogbnVtYmVyO1xyXG4gIGdsb2JhbDoge1xyXG4gICAgZnBzOiBudW1iZXI7XHJcbiAgICBnbG9iYWxUaW1lOiBudW1iZXI7XHJcbiAgICBnbG9iYWxEZWx0YVRpbWU6IG51bWJlcjtcclxuICAgIHRpbWU6IG51bWJlcjtcclxuICAgIGRlbHRhVGltZTogbnVtYmVyO1xyXG4gICAgaXNQYXVzZTogYm9vbGVhbjtcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5vbGRUaW1lID0gdGhpcy5vbGRUaW1lRlBTID0gRGF0ZS5ub3coKTtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5mcmFtZUNvdW50ZXIgPSAwO1xyXG4gICAgdGhpcy5nbG9iYWwgPSB7XHJcbiAgICAgIGZwczogMCxcclxuICAgICAgZ2xvYmFsVGltZTogMCxcclxuICAgICAgZ2xvYmFsRGVsdGFUaW1lOiAwLFxyXG4gICAgICB0aW1lOiAwLFxyXG4gICAgICBkZWx0YVRpbWU6IDAsXHJcbiAgICAgIGlzUGF1c2U6IGZhbHNlLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlc3BvbnNlKCkge1xyXG4gICAgY29uc3QgdCA9IERhdGUubm93KCk7XHJcblxyXG4gICAgdGhpcy5nbG9iYWwuZ2xvYmFsVGltZSA9IHQgLSB0aGlzLnN0YXJ0VGltZTtcclxuICAgIHRoaXMuZ2xvYmFsLmdsb2JhbERlbHRhVGltZSA9IHQgLSB0aGlzLm9sZFRpbWU7XHJcbiAgICBpZiAodGhpcy5nbG9iYWwuaXNQYXVzZSkge1xyXG4gICAgICB0aGlzLmdsb2JhbC5kZWx0YVRpbWUgPSAwO1xyXG4gICAgICB0aGlzLnBhdXNlVGltZSArPSB0IC0gdGhpcy5vbGRUaW1lO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5nbG9iYWwuZGVsdGFUaW1lID0gdGhpcy5nbG9iYWwuZ2xvYmFsRGVsdGFUaW1lO1xyXG4gICAgICB0aGlzLmdsb2JhbC50aW1lID0gdCAtIHRoaXMucGF1c2VUaW1lIC0gdGhpcy5zdGFydFRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5mcmFtZUNvdW50ZXIrKztcclxuXHJcbiAgICBpZiAodCAtIHRoaXMub2xkVGltZUZQUyA+IDMwMCkge1xyXG4gICAgICB0aGlzLmdsb2JhbC5mcHMgPSB0aGlzLmZyYW1lQ291bnRlciAvICgodCAtIHRoaXMub2xkVGltZUZQUykgLyAxMDAwLjApO1xyXG4gICAgICB0aGlzLm9sZFRpbWVGUFMgPSB0O1xyXG4gICAgICB0aGlzLmZyYW1lQ291bnRlciA9IDA7XHJcblxyXG4gICAgICBsZXQgZnBzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNcIik7XHJcbiAgICAgIGlmIChmcHMpIHtcclxuICAgICAgICBmcHMuaW5uZXJUZXh0ID0gXCJOSzEgUmF5IE1hcmNoaW5nOyBGUFM6IFwiICsgdGhpcy5nbG9iYWwuZnBzLnRvU3RyaW5nKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMub2xkVGltZSA9IHQ7XHJcbiAgfVxyXG59XHJcbiIsIi8qIEtvcHRlbG92IE5pa2l0YSwgMTAtMSwgMDUuMDYuMjAyNCAqL1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJU2hhZGVyQ29kZSB7XHJcbiAgdmVydGV4Q29kZTogc3RyaW5nO1xyXG4gIGZyYWdtZW50Q29kZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2hhZGVyIHtcclxuICBzaGFkZXJGb2xkZXI6IHN0cmluZzsgLyogU2hhZGVyIGZvbGRlciBuYW1lICovXHJcbiAgc2hhZGVyUHJvZ3JhbTogV2ViR0xQcm9ncmFtOyAvKiBXZWJHTCBwcm9ncmFtIElEICovXHJcbiAgc2hhZGVyczoge1xyXG4gICAgdmVydGV4OiBXZWJHTFNoYWRlciB8IG51bGw7XHJcbiAgICB2ZXJ0ZXhWYWxpZDogYm9vbGVhbjtcclxuICAgIGZyYWdtZW50OiBXZWJHTFNoYWRlciB8IG51bGw7XHJcbiAgICBmcmFnbWVudFZhbGlkOiBib29sZWFuO1xyXG4gIH07XHJcbiAgbnVtT2ZVQk9zOiBudW1iZXIgPSAwO1xyXG4gIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xyXG5cclxuICBjb25zdHJ1Y3RvcihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgc2hhZGVyRm9sZGVyOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuc2hhZGVyRm9sZGVyID0gc2hhZGVyRm9sZGVyO1xyXG4gICAgdGhpcy5zaGFkZXJQcm9ncmFtID0gLTE7XHJcbiAgICB0aGlzLnNoYWRlcnMgPSB7XHJcbiAgICAgIHZlcnRleDogMCxcclxuICAgICAgdmVydGV4VmFsaWQ6IGZhbHNlLFxyXG4gICAgICBmcmFnbWVudDogMCxcclxuICAgICAgZnJhZ21lbnRWYWxpZDogZmFsc2UsXHJcbiAgICB9O1xyXG4gICAgdGhpcy5nbCA9IGdsO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgbG9hZCgpIHtcclxuICAgIGxldCB2ZXJ0ID0gYXdhaXQgZmV0Y2goXHJcbiAgICAgIFwibWFpbl9zaGFkZXIvdmVydC5nbHNsP25vY2FjaGVcIiArIERhdGUubm93KCkudG9TdHJpbmcoKVxyXG4gICAgKTtcclxuICAgIGxldCBzaGFkZXJ2ID0gYXdhaXQgdmVydC50ZXh0KCk7XHJcblxyXG4gICAgbGV0IGZyYWcgPSBhd2FpdCBmZXRjaChcclxuICAgICAgXCJtYWluX3NoYWRlci9mcmFnLmdsc2w/bm9jYWNoZVwiICsgRGF0ZS5ub3coKS50b1N0cmluZygpXHJcbiAgICApO1xyXG4gICAgbGV0IHNoYWRlcmYgPSBhd2FpdCBmcmFnLnRleHQoKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0ZVNoYWRlclByb2dyYW0oe1xyXG4gICAgICB2ZXJ0ZXhDb2RlOiBzaGFkZXJ2LFxyXG4gICAgICBmcmFnbWVudENvZGU6IHNoYWRlcmYsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHVzZSgpIHtcclxuICAgIHRoaXMuZ2wudXNlUHJvZ3JhbSh0aGlzLnNoYWRlclByb2dyYW0pO1xyXG4gIH1cclxuXHJcbiAgZnJlZSgpIHtcclxuICAgIGlmICh0aGlzLnNoYWRlcnMudmVydGV4KSB0aGlzLmdsLmRlbGV0ZVNoYWRlcih0aGlzLnNoYWRlcnMudmVydGV4KTtcclxuICAgIGlmICh0aGlzLnNoYWRlcnMuZnJhZ21lbnQpIHRoaXMuZ2wuZGVsZXRlU2hhZGVyKHRoaXMuc2hhZGVycy5mcmFnbWVudCk7XHJcbiAgfVxyXG5cclxuICBjb21waWxlU2hhZGVyKHNoYWRlclR5cGU6IG51bWJlciwgc2hhZGVyU291cmNlOiBzdHJpbmcpOiBXZWJHTFNoYWRlciB8IG51bGwge1xyXG4gICAgY29uc3Qgc2hhZGVyID0gdGhpcy5nbC5jcmVhdGVTaGFkZXIoc2hhZGVyVHlwZSk7XHJcbiAgICBpZiAoIXNoYWRlcikge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc2hhZGVyTG9nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaGFkZXJMb2dcIik7XHJcblxyXG4gICAgdGhpcy5nbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzaGFkZXJTb3VyY2UpO1xyXG4gICAgdGhpcy5nbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XHJcbiAgICBpZiAoIXRoaXMuZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgdGhpcy5nbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgLy8gYWxlcnQoXHJcbiAgICAgIC8vICAgYEFuIGVycm9yIG9jY3VycmVkIGNvbXBpbGluZyB0aGUgc2hhZGVyczogJHt0aGlzLmdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKX1gXHJcbiAgICAgIC8vICk7XHJcbiAgICAgIGlmIChzaGFkZXJMb2cpIHtcclxuICAgICAgICBzaGFkZXJMb2cuaW5uZXJUZXh0ICs9IHRoaXMuZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZ2wuZGVsZXRlU2hhZGVyKHNoYWRlcik7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzaGFkZXI7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVTaGFkZXJQcm9ncmFtKHNoYWRlckNvZGU6IElTaGFkZXJDb2RlKSB7XHJcbiAgICBsZXQgdGFibGUxID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZTFcIikgYXMgSFRNTFRhYmxlRWxlbWVudCB8IG51bGw7XHJcblxyXG4gICAgbGV0IHNoYWRlckxvZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hhZGVyTG9nXCIpO1xyXG4gICAgaWYgKHNoYWRlckxvZykge1xyXG4gICAgICBzaGFkZXJMb2cuaW5uZXJUZXh0ID0gXCJcIjtcclxuICAgIH1cclxuXHJcbiAgICAvKioqKlxyXG4gICAgICogVmVydGV4IHNoYWRlciBjb21waWxhdGlvblxyXG4gICAgICoqKiovXHJcbiAgICB7XHJcbiAgICAgIHRoaXMuc2hhZGVycy52ZXJ0ZXggPSB0aGlzLmNvbXBpbGVTaGFkZXIoXHJcbiAgICAgICAgdGhpcy5nbC5WRVJURVhfU0hBREVSLFxyXG4gICAgICAgIHNoYWRlckNvZGUudmVydGV4Q29kZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZTEpIHtcclxuICAgICAgbGV0IHZlcnRleENvbG9yOiBzdHJpbmcsIHZlcnRleFRleHQ6IHN0cmluZztcclxuXHJcbiAgICAgIGlmICghdGhpcy5zaGFkZXJzLnZlcnRleCkge1xyXG4gICAgICAgIHZlcnRleENvbG9yID0gXCIjRkYwMDAwXCI7XHJcbiAgICAgICAgdmVydGV4VGV4dCA9IFwiRmFpbGVkXCI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmVydGV4Q29sb3IgPSBcIiMwMEZGMDBcIjtcclxuICAgICAgICB2ZXJ0ZXhUZXh0ID0gXCJDb21waWxlZFwiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0YWJsZTEucm93c1sxXS5jZWxsc1swXS5pbm5lckhUTUwgPSB2ZXJ0ZXhUZXh0O1xyXG4gICAgICB0YWJsZTEucm93c1sxXS5jZWxsc1swXS5iZ0NvbG9yID0gdmVydGV4Q29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqKipcclxuICAgICAqIEZyYWdtZW50IHNoYWRlciBjb21waWxhdGlvblxyXG4gICAgICoqKiovXHJcbiAgICB7XHJcbiAgICAgIHRoaXMuc2hhZGVycy5mcmFnbWVudCA9IHRoaXMuY29tcGlsZVNoYWRlcihcclxuICAgICAgICB0aGlzLmdsLkZSQUdNRU5UX1NIQURFUixcclxuICAgICAgICBzaGFkZXJDb2RlLmZyYWdtZW50Q29kZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZTEpIHtcclxuICAgICAgbGV0IGZyYWdtZW50Q29sb3I6IHN0cmluZywgZnJhZ21lbnRUZXh0OiBzdHJpbmc7XHJcblxyXG4gICAgICBpZiAoIXRoaXMuc2hhZGVycy5mcmFnbWVudCkge1xyXG4gICAgICAgIGZyYWdtZW50Q29sb3IgPSBcIiNGRjAwMDBcIjtcclxuICAgICAgICBmcmFnbWVudFRleHQgPSBcIkZhaWxlZFwiO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZyYWdtZW50Q29sb3IgPSBcIiMwMEZGMDBcIjtcclxuICAgICAgICBmcmFnbWVudFRleHQgPSBcIkNvbXBpbGVkXCI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRhYmxlMS5yb3dzWzFdLmNlbGxzWzFdLmlubmVySFRNTCA9IGZyYWdtZW50VGV4dDtcclxuICAgICAgdGFibGUxLnJvd3NbMV0uY2VsbHNbMV0uYmdDb2xvciA9IGZyYWdtZW50Q29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLnNoYWRlcnMudmVydGV4IHx8ICF0aGlzLnNoYWRlcnMuZnJhZ21lbnQpIHJldHVybjtcclxuXHJcbiAgICAvKiBDcmVhdGUgV2ViR0wyIHByb2dyYW0gKi9cclxuICAgIGxldCBzaGFkZXJQcm9ncmFtID0gdGhpcy5nbC5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgICBpZiAoIXNoYWRlclByb2dyYW0pIHJldHVybjtcclxuXHJcbiAgICB0aGlzLmdsLmF0dGFjaFNoYWRlcihzaGFkZXJQcm9ncmFtLCB0aGlzLnNoYWRlcnMudmVydGV4KTtcclxuICAgIHRoaXMuZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIHRoaXMuc2hhZGVycy5mcmFnbWVudCk7XHJcbiAgICB0aGlzLmdsLmxpbmtQcm9ncmFtKHNoYWRlclByb2dyYW0pO1xyXG5cclxuICAgIGlmICghdGhpcy5nbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHNoYWRlclByb2dyYW0sIHRoaXMuZ2wuTElOS19TVEFUVVMpKSB7XHJcbiAgICAgIGFsZXJ0KFxyXG4gICAgICAgIGBVbmFibGUgdG8gaW5pdGlhbGl6ZSB0aGUgc2hhZGVyIHByb2dyYW06ICR7dGhpcy5nbC5nZXRQcm9ncmFtSW5mb0xvZyhcclxuICAgICAgICAgIHNoYWRlclByb2dyYW1cclxuICAgICAgICApfWBcclxuICAgICAgKTtcclxuICAgICAgc2hhZGVyUHJvZ3JhbSA9IC0xO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgYFNoYWRlciAke3RoaXMuc2hhZGVyRm9sZGVyfSBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgY29tcGlsZWQgYW5kIGxvYWRlZCFgXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zaGFkZXJQcm9ncmFtID0gc2hhZGVyUHJvZ3JhbTtcclxuICB9XHJcbn1cclxuIiwiLyogS29wdGVsb3YgTmlraXRhLCAxMC0xLCAwNS4wNi4yMDI0ICovXHJcblxyXG5leHBvcnQgY2xhc3MgQnVmZmVyIHtcclxuICBidWZmZXJJRDogV2ViR0xCdWZmZXIgfCBudWxsO1xyXG4gIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xyXG5cclxuICBjb25zdHJ1Y3RvcihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xyXG4gICAgdGhpcy5nbCA9IGdsO1xyXG4gICAgdGhpcy5idWZmZXJJRCA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XHJcbiAgfVxyXG5cclxuICBiaW5kRGF0YShhcnI6IGFueSwgYnVmZmVyVHlwZTogbnVtYmVyLCBkcmF3VHlwZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIoYnVmZmVyVHlwZSwgdGhpcy5idWZmZXJJRCk7XHJcbiAgICB0aGlzLmdsLmJ1ZmZlckRhdGEoYnVmZmVyVHlwZSwgbmV3IEZsb2F0MzJBcnJheShhcnIpLCBkcmF3VHlwZSk7XHJcbiAgfVxyXG59XHJcbiIsIi8qIEtvcHRlbG92IE5pa2l0YSwgMTAtMSwgMDUuMDYuMjAyNCAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IGQyciA9ICh4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG4gIHJldHVybiAoeCAqIE1hdGguUEkpIC8gMTgwO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHIyZCA9ICh4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG4gIHJldHVybiAoeCAqIDE4MCkgLyBNYXRoLlBJO1xyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIFZlYzIge1xyXG4gIHg6IG51bWJlcjtcclxuICB5OiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3M6IG51bWJlcltdKSB7XHJcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XHJcbiAgICAgIHRoaXMueCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgdGhpcy55ID0gYXJndW1lbnRzWzFdO1xyXG4gICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcclxuICAgICAgdGhpcy54ID0gdGhpcy55ID0gYXJndW1lbnRzWzBdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy54ID0gdGhpcy55ID0gMDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFkZCh2OiBWZWMyKTogVmVjMiB7XHJcbiAgICByZXR1cm4gbmV3IFZlYzIodGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnkpO1xyXG4gIH1cclxuXHJcbiAgc3ViKHY6IFZlYzIpOiBWZWMyIHtcclxuICAgIHJldHVybiBuZXcgVmVjMih0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSk7XHJcbiAgfVxyXG5cclxuICBtdWwobjogbnVtYmVyKTogVmVjMiB7XHJcbiAgICByZXR1cm4gbmV3IFZlYzIodGhpcy54ICogbiwgdGhpcy55ICogbik7XHJcbiAgfVxyXG5cclxuICBkb3QodjogVmVjMik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55O1xyXG4gIH1cclxuXHJcbiAgbGVuKCk6IG51bWJlciB7XHJcbiAgICBsZXQgbGVuID0gdGhpcy5kb3QodGhpcyk7XHJcblxyXG4gICAgaWYgKGxlbiA9PSAxIHx8IGxlbiA9PSAwKSB7XHJcbiAgICAgIHJldHVybiBsZW47XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGxlbik7XHJcbiAgfVxyXG5cclxuICBsZW4yKCk6IE51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5kb3QodGhpcyk7XHJcbiAgfVxyXG5cclxuICBub3JtYWxpemUoKTogVmVjMiB7XHJcbiAgICByZXR1cm4gdGhpcy5tdWwoMSAvIHRoaXMubGVuKCkpO1xyXG4gIH1cclxuXHJcbiAgdG9BcnJheSgpOiBudW1iZXJbXSB7XHJcbiAgICByZXR1cm4gW3RoaXMueCwgdGhpcy55XTtcclxuICB9XHJcblxyXG4gIGNoZWNrKCk6IHZvaWQge1xyXG4gICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmVjMlNldCguLi5hcmdzOiBudW1iZXJbXSk6IFZlYzIge1xyXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcclxuICAgIGxldCB4ID0gYXJndW1lbnRzWzBdO1xyXG5cclxuICAgIGlmICh0eXBlb2YgeCA9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgIHJldHVybiBuZXcgVmVjMih4WzBdLCB4WzFdKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBuZXcgVmVjMih4LCB4KTtcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMikge1xyXG4gICAgbGV0IHggPSBhcmd1bWVudHNbMF0sXHJcbiAgICAgIHkgPSBhcmd1bWVudHNbMV07XHJcblxyXG4gICAgcmV0dXJuIG5ldyBWZWMyKHgsIHkpO1xyXG4gIH1cclxuICByZXR1cm4gbmV3IFZlYzIoMCwgMCk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBWZWMzIHtcclxuICB4OiBudW1iZXI7XHJcbiAgeTogbnVtYmVyO1xyXG4gIHo6IG51bWJlcjtcclxuXHJcbiAgY29uc3RydWN0b3IoLi4uYXJnczogbnVtYmVyW10pIHtcclxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDMpIHtcclxuICAgICAgdGhpcy54ID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICB0aGlzLnkgPSBhcmd1bWVudHNbMV07XHJcbiAgICAgIHRoaXMueiA9IGFyZ3VtZW50c1syXTtcclxuICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgIHRoaXMueCA9IHRoaXMueSA9IHRoaXMueiA9IGFyZ3VtZW50c1swXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMueCA9IHRoaXMueSA9IHRoaXMueiA9IGFyZ3VtZW50c1swXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFkZCh2OiBWZWMzKTogVmVjMyB7XHJcbiAgICByZXR1cm4gbmV3IFZlYzModGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueik7XHJcbiAgfVxyXG5cclxuICBzdWIodjogVmVjMyk6IFZlYzMge1xyXG4gICAgcmV0dXJuIG5ldyBWZWMzKHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55LCB0aGlzLnogLSB2LnopO1xyXG4gIH1cclxuXHJcbiAgbXVsKG46IG51bWJlcik6IFZlYzMge1xyXG4gICAgcmV0dXJuIG5ldyBWZWMzKHRoaXMueCAqIG4sIHRoaXMueSAqIG4sIHRoaXMueiAqIG4pO1xyXG4gIH1cclxuXHJcbiAgZG90KHY6IFZlYzMpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueSArIHYueiAqIHRoaXMuejtcclxuICB9XHJcblxyXG4gIGNyb3NzKHY6IFZlYzMpOiBWZWMzIHtcclxuICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgdGhpcy55ICogdi56IC0gdGhpcy56ICogdi55LFxyXG4gICAgICB0aGlzLnogKiB2LnggLSB0aGlzLnggKiB2LnosXHJcbiAgICAgIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGxlbigpOiBudW1iZXIge1xyXG4gICAgbGV0IGxlbiA9IHRoaXMuZG90KHRoaXMpO1xyXG5cclxuICAgIGlmIChsZW4gPT0gMSB8fCBsZW4gPT0gMCkge1xyXG4gICAgICByZXR1cm4gbGVuO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE1hdGguc3FydChsZW4pO1xyXG4gIH1cclxuXHJcbiAgbGVuMigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZG90KHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgbm9ybWFsaXplKCk6IFZlYzMge1xyXG4gICAgcmV0dXJuIHRoaXMubXVsKDEgLyB0aGlzLmxlbigpKTtcclxuICB9XHJcblxyXG4gIHBvaW50VHJhbnNmb3JtKG06IE1hdDQpOiBWZWMzIHtcclxuICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgdGhpcy54ICogbS5hWzBdWzBdICsgdGhpcy55ICogbS5hWzFdWzBdICsgdGhpcy56ICogbS5hWzJdWzBdICsgbS5hWzNdWzBdLFxyXG4gICAgICB0aGlzLnggKiBtLmFbMF1bMV0gKyB0aGlzLnkgKiBtLmFbMV1bMV0gKyB0aGlzLnogKiBtLmFbMl1bMV0gKyBtLmFbM11bMV0sXHJcbiAgICAgIHRoaXMueCAqIG0uYVswXVsyXSArIHRoaXMueSAqIG0uYVsxXVsyXSArIHRoaXMueiAqIG0uYVsyXVsyXSArIG0uYVszXVsyXVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHRvQXJyYXkoKTogbnVtYmVyW10ge1xyXG4gICAgcmV0dXJuIFt0aGlzLngsIHRoaXMueSwgdGhpcy56XTtcclxuICB9XHJcblxyXG4gIHJlcHJlc2VudGF0ZSgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGA8JHt0aGlzLnh9LCR7dGhpcy55fSwke3RoaXMuen0+YDtcclxuICB9XHJcblxyXG4gIGNoZWNrKCk6IHZvaWQge1xyXG4gICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmVjM1NldCguLi5hcmdzOiBudW1iZXJbXSk6IFZlYzMge1xyXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcclxuICAgIGxldCB4ID0gYXJndW1lbnRzWzBdO1xyXG5cclxuICAgIGlmICh0eXBlb2YgeCA9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgIHJldHVybiBuZXcgVmVjMyh4WzBdLCB4WzFdLCB4WzJdKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBuZXcgVmVjMyh4LCB4LCB4KTtcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMykge1xyXG4gICAgbGV0IHggPSBhcmd1bWVudHNbMF0sXHJcbiAgICAgIHkgPSBhcmd1bWVudHNbMV0sXHJcbiAgICAgIHogPSBhcmd1bWVudHNbMl07XHJcblxyXG4gICAgcmV0dXJuIG5ldyBWZWMzKHgsIHksIHopO1xyXG4gIH1cclxuICByZXR1cm4gbmV3IFZlYzMoMCwgMCwgMCk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBWZWM0IHtcclxuICB4OiBudW1iZXI7XHJcbiAgeTogbnVtYmVyO1xyXG4gIHo6IG51bWJlcjtcclxuICB3OiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3M6IG51bWJlcltdKSB7XHJcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSA0KSB7XHJcbiAgICAgIHRoaXMueCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgdGhpcy55ID0gYXJndW1lbnRzWzFdO1xyXG4gICAgICB0aGlzLnogPSBhcmd1bWVudHNbMl07XHJcbiAgICAgIHRoaXMudyA9IGFyZ3VtZW50c1szXTtcclxuICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgIHRoaXMueCA9IHRoaXMueSA9IHRoaXMueiA9IHRoaXMudyA9IGFyZ3VtZW50c1swXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMueCA9IHRoaXMueSA9IHRoaXMueiA9IHRoaXMudyA9IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB0b0FycmF5KCk6IG51bWJlcltdIHtcclxuICAgIHJldHVybiBbdGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53XTtcclxuICB9XHJcblxyXG4gIGNoZWNrKCk6IHZvaWQge1xyXG4gICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgfVxyXG5cclxuICBhZGQodjogVmVjNCk6IFZlYzQge1xyXG4gICAgcmV0dXJuIG5ldyBWZWM0KHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55LCB0aGlzLnogKyB2LnosIHRoaXMudyArIHYudyk7XHJcbiAgfVxyXG5cclxuICBtdWwobjogbnVtYmVyKTogVmVjNCB7XHJcbiAgICByZXR1cm4gbmV3IFZlYzQodGhpcy54ICogbiwgdGhpcy55ICogbiwgdGhpcy56ICogbiwgdGhpcy53ICogbik7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmVjNFNldCguLi5hcmdzOiBudW1iZXJbXSk6IFZlYzQge1xyXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcclxuICAgIGxldCB4ID0gYXJndW1lbnRzWzBdO1xyXG5cclxuICAgIHJldHVybiBuZXcgVmVjNCh4LCB4LCB4LCB4KTtcclxuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNCkge1xyXG4gICAgbGV0IHggPSBhcmd1bWVudHNbMF0sXHJcbiAgICAgIHkgPSBhcmd1bWVudHNbMV0sXHJcbiAgICAgIHogPSBhcmd1bWVudHNbMl0sXHJcbiAgICAgIHcgPSBhcmd1bWVudHNbM107XHJcblxyXG4gICAgcmV0dXJuIG5ldyBWZWM0KHgsIHksIHosIHcpO1xyXG4gIH1cclxuICByZXR1cm4gbmV3IFZlYzQoMCwgMCwgMCwgMCk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNYXQ0IHtcclxuICBhOiBudW1iZXJbXVtdO1xyXG5cclxuICBjb25zdHJ1Y3RvciguLi5hcmdzOiBudW1iZXJbXSkge1xyXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggIT0gMTYpIHtcclxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgIGxldCBhcnIgPSBhcmd1bWVudHNbMF07XHJcblxyXG4gICAgICAgIHRoaXMuYSA9IFtcclxuICAgICAgICAgIFthcnJbMF0sIGFyclsxXSwgYXJyWzJdLCBhcnJbM11dLFxyXG4gICAgICAgICAgW2Fycls0XSwgYXJyWzVdLCBhcnJbNl0sIGFycls3XV0sXHJcbiAgICAgICAgICBbYXJyWzhdLCBhcnJbOV0sIGFyclsxMF0sIGFyclsxMV1dLFxyXG4gICAgICAgICAgW2FyclsxMl0sIGFyclsxM10sIGFyclsxNF0sIGFyclsxNV1dLFxyXG4gICAgICAgIF07XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5hID0gW1xyXG4gICAgICAgIFsxLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMSwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDEsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAxXSxcclxuICAgICAgXTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hID0gW1xyXG4gICAgICBbYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdXSxcclxuICAgICAgW2FyZ3VtZW50c1s0XSwgYXJndW1lbnRzWzVdLCBhcmd1bWVudHNbNl0sIGFyZ3VtZW50c1s3XV0sXHJcbiAgICAgIFthcmd1bWVudHNbOF0sIGFyZ3VtZW50c1s5XSwgYXJndW1lbnRzWzEwXSwgYXJndW1lbnRzWzExXV0sXHJcbiAgICAgIFthcmd1bWVudHNbMTJdLCBhcmd1bWVudHNbMTNdLCBhcmd1bWVudHNbMTRdLCBhcmd1bWVudHNbMTVdXSxcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY3JlYXRlRnJvbUFycmF5KGFycjogbnVtYmVyW10pOiBNYXQ0IHtcclxuICAgIGxldCBtID0gbmV3IE1hdDQoKTtcclxuICAgIG0uYSA9IFtcclxuICAgICAgW2FyclswXSwgYXJyWzFdLCBhcnJbMl0sIGFyclszXV0sXHJcbiAgICAgIFthcnJbNF0sIGFycls1XSwgYXJyWzZdLCBhcnJbN11dLFxyXG4gICAgICBbYXJyWzhdLCBhcnJbOV0sIGFyclsxMF0sIGFyclsxMV1dLFxyXG4gICAgICBbYXJyWzEyXSwgYXJyWzEzXSwgYXJyWzE0XSwgYXJyWzE1XV0sXHJcbiAgICBdO1xyXG5cclxuICAgIHJldHVybiBtO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRldGVybTN4MyhcclxuICAgIGEwMDogbnVtYmVyLFxyXG4gICAgYTAxOiBudW1iZXIsXHJcbiAgICBhMDI6IG51bWJlcixcclxuICAgIGExMDogbnVtYmVyLFxyXG4gICAgYTExOiBudW1iZXIsXHJcbiAgICBhMTI6IG51bWJlcixcclxuICAgIGEyMDogbnVtYmVyLFxyXG4gICAgYTIxOiBudW1iZXIsXHJcbiAgICBhMjI6IG51bWJlclxyXG4gICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBhMDAgKiBhMTEgKiBhMjIgK1xyXG4gICAgICBhMDEgKiBhMTIgKiBhMjAgK1xyXG4gICAgICBhMDIgKiBhMTAgKiBhMjEgLVxyXG4gICAgICBhMDAgKiBhMTIgKiBhMjEgLVxyXG4gICAgICBhMDEgKiBhMTAgKiBhMjIgLVxyXG4gICAgICBhMDIgKiBhMTEgKiBhMjBcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBtdWwob2JqOiBNYXQ0KTogTWF0NCB7XHJcbiAgICBsZXQgciA9IG5ldyBNYXQ0KCk7XHJcblxyXG4gICAgci5hWzBdWzBdID1cclxuICAgICAgdGhpcy5hWzBdWzBdICogb2JqLmFbMF1bMF0gK1xyXG4gICAgICB0aGlzLmFbMF1bMV0gKiBvYmouYVsxXVswXSArXHJcbiAgICAgIHRoaXMuYVswXVsyXSAqIG9iai5hWzJdWzBdICtcclxuICAgICAgdGhpcy5hWzBdWzNdICogb2JqLmFbM11bMF07XHJcblxyXG4gICAgci5hWzBdWzFdID1cclxuICAgICAgdGhpcy5hWzBdWzBdICogb2JqLmFbMF1bMV0gK1xyXG4gICAgICB0aGlzLmFbMF1bMV0gKiBvYmouYVsxXVsxXSArXHJcbiAgICAgIHRoaXMuYVswXVsyXSAqIG9iai5hWzJdWzFdICtcclxuICAgICAgdGhpcy5hWzBdWzNdICogb2JqLmFbM11bMV07XHJcblxyXG4gICAgci5hWzBdWzJdID1cclxuICAgICAgdGhpcy5hWzBdWzBdICogb2JqLmFbMF1bMl0gK1xyXG4gICAgICB0aGlzLmFbMF1bMV0gKiBvYmouYVsxXVsyXSArXHJcbiAgICAgIHRoaXMuYVswXVsyXSAqIG9iai5hWzJdWzJdICtcclxuICAgICAgdGhpcy5hWzBdWzNdICogb2JqLmFbM11bMl07XHJcblxyXG4gICAgci5hWzBdWzNdID1cclxuICAgICAgdGhpcy5hWzBdWzBdICogb2JqLmFbMF1bM10gK1xyXG4gICAgICB0aGlzLmFbMF1bMV0gKiBvYmouYVsxXVszXSArXHJcbiAgICAgIHRoaXMuYVswXVsyXSAqIG9iai5hWzJdWzNdICtcclxuICAgICAgdGhpcy5hWzBdWzNdICogb2JqLmFbM11bM107XHJcblxyXG4gICAgci5hWzFdWzBdID1cclxuICAgICAgdGhpcy5hWzFdWzBdICogb2JqLmFbMF1bMF0gK1xyXG4gICAgICB0aGlzLmFbMV1bMV0gKiBvYmouYVsxXVswXSArXHJcbiAgICAgIHRoaXMuYVsxXVsyXSAqIG9iai5hWzJdWzBdICtcclxuICAgICAgdGhpcy5hWzFdWzNdICogb2JqLmFbM11bMF07XHJcblxyXG4gICAgci5hWzFdWzFdID1cclxuICAgICAgdGhpcy5hWzFdWzBdICogb2JqLmFbMF1bMV0gK1xyXG4gICAgICB0aGlzLmFbMV1bMV0gKiBvYmouYVsxXVsxXSArXHJcbiAgICAgIHRoaXMuYVsxXVsyXSAqIG9iai5hWzJdWzFdICtcclxuICAgICAgdGhpcy5hWzFdWzNdICogb2JqLmFbM11bMV07XHJcblxyXG4gICAgci5hWzFdWzJdID1cclxuICAgICAgdGhpcy5hWzFdWzBdICogb2JqLmFbMF1bMl0gK1xyXG4gICAgICB0aGlzLmFbMV1bMV0gKiBvYmouYVsxXVsyXSArXHJcbiAgICAgIHRoaXMuYVsxXVsyXSAqIG9iai5hWzJdWzJdICtcclxuICAgICAgdGhpcy5hWzFdWzNdICogb2JqLmFbM11bMl07XHJcblxyXG4gICAgci5hWzFdWzNdID1cclxuICAgICAgdGhpcy5hWzFdWzBdICogb2JqLmFbMF1bM10gK1xyXG4gICAgICB0aGlzLmFbMV1bMV0gKiBvYmouYVsxXVszXSArXHJcbiAgICAgIHRoaXMuYVsxXVsyXSAqIG9iai5hWzJdWzNdICtcclxuICAgICAgdGhpcy5hWzFdWzNdICogb2JqLmFbM11bM107XHJcblxyXG4gICAgci5hWzJdWzBdID1cclxuICAgICAgdGhpcy5hWzJdWzBdICogb2JqLmFbMF1bMF0gK1xyXG4gICAgICB0aGlzLmFbMl1bMV0gKiBvYmouYVsxXVswXSArXHJcbiAgICAgIHRoaXMuYVsyXVsyXSAqIG9iai5hWzJdWzBdICtcclxuICAgICAgdGhpcy5hWzJdWzNdICogb2JqLmFbM11bMF07XHJcblxyXG4gICAgci5hWzJdWzFdID1cclxuICAgICAgdGhpcy5hWzJdWzBdICogb2JqLmFbMF1bMV0gK1xyXG4gICAgICB0aGlzLmFbMl1bMV0gKiBvYmouYVsxXVsxXSArXHJcbiAgICAgIHRoaXMuYVsyXVsyXSAqIG9iai5hWzJdWzFdICtcclxuICAgICAgdGhpcy5hWzJdWzNdICogb2JqLmFbM11bMV07XHJcblxyXG4gICAgci5hWzJdWzJdID1cclxuICAgICAgdGhpcy5hWzJdWzBdICogb2JqLmFbMF1bMl0gK1xyXG4gICAgICB0aGlzLmFbMl1bMV0gKiBvYmouYVsxXVsyXSArXHJcbiAgICAgIHRoaXMuYVsyXVsyXSAqIG9iai5hWzJdWzJdICtcclxuICAgICAgdGhpcy5hWzJdWzNdICogb2JqLmFbM11bMl07XHJcblxyXG4gICAgci5hWzJdWzNdID1cclxuICAgICAgdGhpcy5hWzJdWzBdICogb2JqLmFbMF1bM10gK1xyXG4gICAgICB0aGlzLmFbMl1bMV0gKiBvYmouYVsxXVszXSArXHJcbiAgICAgIHRoaXMuYVsyXVsyXSAqIG9iai5hWzJdWzNdICtcclxuICAgICAgdGhpcy5hWzJdWzNdICogb2JqLmFbM11bM107XHJcblxyXG4gICAgci5hWzNdWzBdID1cclxuICAgICAgdGhpcy5hWzNdWzBdICogb2JqLmFbMF1bMF0gK1xyXG4gICAgICB0aGlzLmFbM11bMV0gKiBvYmouYVsxXVswXSArXHJcbiAgICAgIHRoaXMuYVszXVsyXSAqIG9iai5hWzJdWzBdICtcclxuICAgICAgdGhpcy5hWzNdWzNdICogb2JqLmFbM11bMF07XHJcblxyXG4gICAgci5hWzNdWzFdID1cclxuICAgICAgdGhpcy5hWzNdWzBdICogb2JqLmFbMF1bMV0gK1xyXG4gICAgICB0aGlzLmFbM11bMV0gKiBvYmouYVsxXVsxXSArXHJcbiAgICAgIHRoaXMuYVszXVsyXSAqIG9iai5hWzJdWzFdICtcclxuICAgICAgdGhpcy5hWzNdWzNdICogb2JqLmFbM11bMV07XHJcblxyXG4gICAgci5hWzNdWzJdID1cclxuICAgICAgdGhpcy5hWzNdWzBdICogb2JqLmFbMF1bMl0gK1xyXG4gICAgICB0aGlzLmFbM11bMV0gKiBvYmouYVsxXVsyXSArXHJcbiAgICAgIHRoaXMuYVszXVsyXSAqIG9iai5hWzJdWzJdICtcclxuICAgICAgdGhpcy5hWzNdWzNdICogb2JqLmFbM11bMl07XHJcblxyXG4gICAgci5hWzNdWzNdID1cclxuICAgICAgdGhpcy5hWzNdWzBdICogb2JqLmFbMF1bM10gK1xyXG4gICAgICB0aGlzLmFbM11bMV0gKiBvYmouYVsxXVszXSArXHJcbiAgICAgIHRoaXMuYVszXVsyXSAqIG9iai5hWzJdWzNdICtcclxuICAgICAgdGhpcy5hWzNdWzNdICogb2JqLmFbM11bM107XHJcblxyXG4gICAgcmV0dXJuIHI7XHJcbiAgfVxyXG5cclxuICBkZXRlcm0oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICt0aGlzLmFbMF1bMF0gKlxyXG4gICAgICAgIE1hdDQuZGV0ZXJtM3gzKFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzFdLFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzNdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzFdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzJdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzNdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzFdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzJdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzNdXHJcbiAgICAgICAgKSArXHJcbiAgICAgIC10aGlzLmFbMF1bMV0gKlxyXG4gICAgICAgIE1hdDQuZGV0ZXJtM3gzKFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzBdLFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzNdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzBdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzJdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzNdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzBdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzJdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzNdXHJcbiAgICAgICAgKSArXHJcbiAgICAgICt0aGlzLmFbMF1bMl0gKlxyXG4gICAgICAgIE1hdDQuZGV0ZXJtM3gzKFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzBdLFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzFdLFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzNdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzBdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzFdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzNdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzBdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzFdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzNdXHJcbiAgICAgICAgKSArXHJcbiAgICAgIC10aGlzLmFbMF1bM10gKlxyXG4gICAgICAgIE1hdDQuZGV0ZXJtM3gzKFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzBdLFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzFdLFxyXG4gICAgICAgICAgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzBdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzFdLFxyXG4gICAgICAgICAgdGhpcy5hWzJdWzJdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzBdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzFdLFxyXG4gICAgICAgICAgdGhpcy5hWzNdWzJdXHJcbiAgICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHRyYW5zcG9zZSgpOiBNYXQ0IHtcclxuICAgIGxldCBtID0gbmV3IE1hdDQoKTtcclxuXHJcbiAgICBtLmFbMF1bMF0gPSB0aGlzLmFbMF1bMF07XHJcbiAgICBtLmFbMF1bMV0gPSB0aGlzLmFbMV1bMF07XHJcbiAgICBtLmFbMF1bMl0gPSB0aGlzLmFbMl1bMF07XHJcbiAgICBtLmFbMF1bM10gPSB0aGlzLmFbM11bMF07XHJcblxyXG4gICAgbS5hWzFdWzBdID0gdGhpcy5hWzBdWzFdO1xyXG4gICAgbS5hWzFdWzFdID0gdGhpcy5hWzFdWzFdO1xyXG4gICAgbS5hWzFdWzJdID0gdGhpcy5hWzJdWzFdO1xyXG4gICAgbS5hWzFdWzNdID0gdGhpcy5hWzNdWzFdO1xyXG5cclxuICAgIG0uYVsyXVswXSA9IHRoaXMuYVswXVsyXTtcclxuICAgIG0uYVsyXVsxXSA9IHRoaXMuYVsxXVsyXTtcclxuICAgIG0uYVsyXVsyXSA9IHRoaXMuYVsyXVsyXTtcclxuICAgIG0uYVsyXVszXSA9IHRoaXMuYVszXVsyXTtcclxuXHJcbiAgICBtLmFbM11bMF0gPSB0aGlzLmFbMF1bM107XHJcbiAgICBtLmFbM11bMV0gPSB0aGlzLmFbMV1bM107XHJcbiAgICBtLmFbM11bMl0gPSB0aGlzLmFbMl1bM107XHJcbiAgICBtLmFbM11bM10gPSB0aGlzLmFbM11bM107XHJcblxyXG4gICAgcmV0dXJuIG07XHJcbiAgfVxyXG5cclxuICBpbnZlcnNlKCk6IE1hdDQge1xyXG4gICAgbGV0IG0gPSBuZXcgTWF0NCgpLFxyXG4gICAgICBkZXQgPSB0aGlzLmRldGVybSgpO1xyXG5cclxuICAgIGlmIChkZXQgPT0gMCkge1xyXG4gICAgICByZXR1cm4gTWF0NC5pZGVudGl0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG0uYVswXVswXSA9XHJcbiAgICAgICtNYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMV1bMV0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsxXVszXSxcclxuICAgICAgICB0aGlzLmFbMl1bMV0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsyXVszXSxcclxuICAgICAgICB0aGlzLmFbM11bMV0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzJdLFxyXG4gICAgICAgIHRoaXMuYVszXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVsxXVswXSA9XHJcbiAgICAgIC1NYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMV1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsxXVszXSxcclxuICAgICAgICB0aGlzLmFbMl1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsyXVszXSxcclxuICAgICAgICB0aGlzLmFbM11bMF0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzJdLFxyXG4gICAgICAgIHRoaXMuYVszXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVsyXVswXSA9XHJcbiAgICAgICtNYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMV1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsxXVszXSxcclxuICAgICAgICB0aGlzLmFbMl1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsyXVszXSxcclxuICAgICAgICB0aGlzLmFbM11bMF0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzFdLFxyXG4gICAgICAgIHRoaXMuYVszXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVszXVswXSA9XHJcbiAgICAgICtNYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMV1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsxXVsyXSxcclxuICAgICAgICB0aGlzLmFbMl1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsyXVsyXSxcclxuICAgICAgICB0aGlzLmFbM11bMF0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzFdLFxyXG4gICAgICAgIHRoaXMuYVszXVsyXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVswXVsxXSA9XHJcbiAgICAgIC1NYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMV0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzJdLFxyXG4gICAgICAgIHRoaXMuYVswXVszXSxcclxuICAgICAgICB0aGlzLmFbMl1bMV0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsyXVszXSxcclxuICAgICAgICB0aGlzLmFbM11bMV0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzJdLFxyXG4gICAgICAgIHRoaXMuYVszXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVsxXVsxXSA9XHJcbiAgICAgICtNYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzJdLFxyXG4gICAgICAgIHRoaXMuYVswXVszXSxcclxuICAgICAgICB0aGlzLmFbMl1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsyXVszXSxcclxuICAgICAgICB0aGlzLmFbM11bMF0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzJdLFxyXG4gICAgICAgIHRoaXMuYVszXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVsyXVsxXSA9XHJcbiAgICAgIC1NYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzFdLFxyXG4gICAgICAgIHRoaXMuYVswXVszXSxcclxuICAgICAgICB0aGlzLmFbMl1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsyXVszXSxcclxuICAgICAgICB0aGlzLmFbM11bMF0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzFdLFxyXG4gICAgICAgIHRoaXMuYVszXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVszXVsxXSA9XHJcbiAgICAgIC1NYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzFdLFxyXG4gICAgICAgIHRoaXMuYVswXVsyXSxcclxuICAgICAgICB0aGlzLmFbMl1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsyXVsyXSxcclxuICAgICAgICB0aGlzLmFbM11bMF0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzFdLFxyXG4gICAgICAgIHRoaXMuYVszXVsyXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVswXVsyXSA9XHJcbiAgICAgICtNYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMV0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzJdLFxyXG4gICAgICAgIHRoaXMuYVswXVszXSxcclxuICAgICAgICB0aGlzLmFbMV1bMV0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsxXVszXSxcclxuICAgICAgICB0aGlzLmFbM11bMV0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzJdLFxyXG4gICAgICAgIHRoaXMuYVszXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVsxXVsyXSA9XHJcbiAgICAgIC1NYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzJdLFxyXG4gICAgICAgIHRoaXMuYVswXVszXSxcclxuICAgICAgICB0aGlzLmFbMV1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsxXVszXSxcclxuICAgICAgICB0aGlzLmFbM11bMF0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzJdLFxyXG4gICAgICAgIHRoaXMuYVszXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVsyXVsyXSA9XHJcbiAgICAgICtNYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzFdLFxyXG4gICAgICAgIHRoaXMuYVswXVszXSxcclxuICAgICAgICB0aGlzLmFbMV1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsxXVszXSxcclxuICAgICAgICB0aGlzLmFbM11bMF0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzFdLFxyXG4gICAgICAgIHRoaXMuYVszXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVszXVsyXSA9XHJcbiAgICAgICtNYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzFdLFxyXG4gICAgICAgIHRoaXMuYVswXVsyXSxcclxuICAgICAgICB0aGlzLmFbMV1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsxXVsyXSxcclxuICAgICAgICB0aGlzLmFbM11bMF0sXHJcbiAgICAgICAgdGhpcy5hWzNdWzFdLFxyXG4gICAgICAgIHRoaXMuYVszXVsyXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVswXVszXSA9XHJcbiAgICAgICtNYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMV0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzJdLFxyXG4gICAgICAgIHRoaXMuYVswXVszXSxcclxuICAgICAgICB0aGlzLmFbMV1bMV0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsxXVszXSxcclxuICAgICAgICB0aGlzLmFbMl1bMV0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsyXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVsxXVszXSA9XHJcbiAgICAgIC1NYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzJdLFxyXG4gICAgICAgIHRoaXMuYVswXVszXSxcclxuICAgICAgICB0aGlzLmFbMV1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsxXVszXSxcclxuICAgICAgICB0aGlzLmFbMl1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzJdLFxyXG4gICAgICAgIHRoaXMuYVsyXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVsyXVszXSA9XHJcbiAgICAgICtNYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzFdLFxyXG4gICAgICAgIHRoaXMuYVswXVszXSxcclxuICAgICAgICB0aGlzLmFbMV1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsxXVszXSxcclxuICAgICAgICB0aGlzLmFbMl1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsyXVszXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIG0uYVszXVszXSA9XHJcbiAgICAgICtNYXQ0LmRldGVybTN4MyhcclxuICAgICAgICB0aGlzLmFbMF1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzBdWzFdLFxyXG4gICAgICAgIHRoaXMuYVswXVsyXSxcclxuICAgICAgICB0aGlzLmFbMV1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzFdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsxXVsyXSxcclxuICAgICAgICB0aGlzLmFbMl1bMF0sXHJcbiAgICAgICAgdGhpcy5hWzJdWzFdLFxyXG4gICAgICAgIHRoaXMuYVsyXVsyXVxyXG4gICAgICApIC8gZGV0O1xyXG5cclxuICAgIHJldHVybiBtO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGlkZW50aXR5KCk6IE1hdDQge1xyXG4gICAgbGV0IG0gPSBuZXcgTWF0NCgpO1xyXG5cclxuICAgIG0uYVswXSA9IFsxLCAwLCAwLCAwXTtcclxuICAgIG0uYVsxXSA9IFswLCAxLCAwLCAwXTtcclxuICAgIG0uYVsyXSA9IFswLCAwLCAxLCAwXTtcclxuICAgIG0uYVszXSA9IFswLCAwLCAwLCAxXTtcclxuXHJcbiAgICByZXR1cm4gbTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzY2FsZSh2OiBWZWMzKTogTWF0NCB7XHJcbiAgICBsZXQgbSA9IG5ldyBNYXQ0KCk7XHJcblxyXG4gICAgbS5hWzBdID0gW3YueCwgMCwgMCwgMF07XHJcbiAgICBtLmFbMV0gPSBbMCwgdi55LCAwLCAwXTtcclxuICAgIG0uYVsyXSA9IFswLCAwLCB2LnosIDBdO1xyXG4gICAgbS5hWzNdID0gWzAsIDAsIDAsIDFdO1xyXG5cclxuICAgIHJldHVybiBtO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHRyYW5zbGF0ZSh2OiBWZWMzKTogTWF0NCB7XHJcbiAgICBsZXQgbSA9IG5ldyBNYXQ0KCk7XHJcblxyXG4gICAgbS5hWzBdID0gWzEsIDAsIDAsIDBdO1xyXG4gICAgbS5hWzFdID0gWzAsIDEsIDAsIDBdO1xyXG4gICAgbS5hWzJdID0gWzAsIDAsIDEsIDBdO1xyXG4gICAgbS5hWzNdID0gW3YueCwgdi55LCB2LnosIDFdO1xyXG5cclxuICAgIHJldHVybiBtO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJvdGF0ZVgoYW5nbGU6IG51bWJlcik6IE1hdDQge1xyXG4gICAgbGV0IG0gPSBuZXcgTWF0NCgpO1xyXG5cclxuICAgIGxldCBhID0gZDJyKGFuZ2xlKSxcclxuICAgICAgcyA9IE1hdGguc2luKGEpLFxyXG4gICAgICBjID0gTWF0aC5jb3MoYSk7XHJcbiAgICBtID0gTWF0NC5pZGVudGl0eSgpO1xyXG5cclxuICAgIG0uYVsxXVsxXSA9IGM7XHJcbiAgICBtLmFbMV1bMl0gPSBzO1xyXG4gICAgbS5hWzJdWzFdID0gLXM7XHJcbiAgICBtLmFbMl1bMl0gPSBjO1xyXG5cclxuICAgIHJldHVybiBtO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJvdGF0ZVkoYW5nbGU6IG51bWJlcik6IE1hdDQge1xyXG4gICAgbGV0IG0gPSBuZXcgTWF0NCgpO1xyXG5cclxuICAgIGxldCBhID0gZDJyKGFuZ2xlKSxcclxuICAgICAgcyA9IE1hdGguc2luKGEpLFxyXG4gICAgICBjID0gTWF0aC5jb3MoYSk7XHJcbiAgICBtID0gTWF0NC5pZGVudGl0eSgpO1xyXG5cclxuICAgIG0uYVswXVswXSA9IGM7XHJcbiAgICBtLmFbMF1bMl0gPSAtcztcclxuICAgIG0uYVsyXVswXSA9IHM7XHJcbiAgICBtLmFbMl1bMl0gPSBjO1xyXG5cclxuICAgIHJldHVybiBtO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJvdGF0ZVooYW5nbGU6IG51bWJlcik6IE1hdDQge1xyXG4gICAgbGV0IG0gPSBuZXcgTWF0NCgpO1xyXG5cclxuICAgIGxldCBhID0gZDJyKGFuZ2xlKSxcclxuICAgICAgcyA9IE1hdGguc2luKGEpLFxyXG4gICAgICBjID0gTWF0aC5jb3MoYSk7XHJcbiAgICBtID0gTWF0NC5pZGVudGl0eSgpO1xyXG5cclxuICAgIG0uYVswXVswXSA9IGM7XHJcbiAgICBtLmFbMF1bMl0gPSBzO1xyXG4gICAgbS5hWzJdWzBdID0gLXM7XHJcbiAgICBtLmFbMl1bMl0gPSBjO1xyXG5cclxuICAgIHJldHVybiBtO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJvdGF0ZSh2OiBWZWMzLCBhbmdsZTogbnVtYmVyKTogTWF0NCB7XHJcbiAgICBsZXQgbSA9IG5ldyBNYXQ0KCk7XHJcblxyXG4gICAgbGV0IGEgPSBkMnIoYW5nbGUpLFxyXG4gICAgICBzID0gTWF0aC5zaW4oYSksXHJcbiAgICAgIGMgPSBNYXRoLmNvcyhhKTtcclxuICAgIGxldCByID0gdi5ub3JtYWxpemUoKTtcclxuXHJcbiAgICBtLmFbMF1bMF0gPSBjICsgci54ICogci54ICogKDEgLSBjKTtcclxuICAgIG0uYVswXVsxXSA9IHIueCAqIHIueSAqICgxIC0gYykgKyByLnogKiBzO1xyXG4gICAgbS5hWzBdWzJdID0gci54ICogci56ICogKDEgLSBjKSAtIHIueSAqIHM7XHJcbiAgICBtLmFbMF1bM10gPSAwO1xyXG5cclxuICAgIG0uYVsxXVswXSA9IHIueSAqIHIueCAqICgxIC0gYykgLSByLnogKiBzO1xyXG4gICAgbS5hWzFdWzFdID0gYyArIHIueSAqIHIueSAqICgxIC0gYyk7XHJcbiAgICBtLmFbMV1bMl0gPSByLnkgKiByLnogKiAoMSAtIGMpICsgci56ICogcztcclxuICAgIG0uYVsxXVszXSA9IDA7XHJcblxyXG4gICAgbS5hWzJdWzBdID0gci56ICogci54ICogKDEgLSBjKSArIHIueSAqIHM7XHJcbiAgICBtLmFbMl1bMV0gPSByLnogKiByLnkgKiAoMSAtIGMpIC0gci54ICogcztcclxuICAgIG0uYVsyXVsyXSA9IGMgKyByLnogKiByLnogKiAoMSAtIGMpO1xyXG4gICAgbS5hWzJdWzNdID0gMDtcclxuXHJcbiAgICBtLmFbM11bMF0gPSAwO1xyXG4gICAgbS5hWzNdWzFdID0gMDtcclxuICAgIG0uYVszXVsyXSA9IDA7XHJcbiAgICBtLmFbM11bM10gPSAxO1xyXG5cclxuICAgIHJldHVybiBtO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHZpZXcobG9jOiBWZWMzLCBhdDogVmVjMywgdXAxOiBWZWMzKTogTWF0NCB7XHJcbiAgICBsZXQgbSA9IG5ldyBNYXQ0KCk7XHJcblxyXG4gICAgbGV0IGRpciA9IGF0LnN1Yihsb2MpLm5vcm1hbGl6ZSgpLFxyXG4gICAgICByaWdodCA9IGRpci5jcm9zcyh1cDEpLm5vcm1hbGl6ZSgpLFxyXG4gICAgICB1cCA9IHJpZ2h0LmNyb3NzKGRpcik7XHJcblxyXG4gICAgbS5hWzBdID0gW3JpZ2h0LngsIHVwLngsIC1kaXIueCwgMF07XHJcbiAgICBtLmFbMV0gPSBbcmlnaHQueSwgdXAueSwgLWRpci55LCAwXTtcclxuICAgIG0uYVsyXSA9IFtyaWdodC56LCB1cC56LCAtZGlyLnosIDBdO1xyXG4gICAgbS5hWzNdID0gWy1sb2MuZG90KHJpZ2h0KSwgLWxvYy5kb3QodXApLCBsb2MuZG90KGRpciksIDFdO1xyXG5cclxuICAgIHJldHVybiBtO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGZydXN0dW0oXHJcbiAgICBsOiBudW1iZXIsXHJcbiAgICByOiBudW1iZXIsXHJcbiAgICBiOiBudW1iZXIsXHJcbiAgICB0OiBudW1iZXIsXHJcbiAgICBuOiBudW1iZXIsXHJcbiAgICBmOiBudW1iZXJcclxuICApOiBNYXQ0IHtcclxuICAgIGxldCBtID0gbmV3IE1hdDQoKTtcclxuXHJcbiAgICBtLmFbMF0gPSBbKDIgKiBuKSAvIChyIC0gbCksIDAsIDAsIDBdO1xyXG4gICAgbS5hWzFdID0gWzAsICgyICogbikgLyAodCAtIGIpLCAwLCAwXTtcclxuICAgIG0uYVsyXSA9IFsociArIGwpIC8gKHIgLSBsKSwgKHQgKyBiKSAvICh0IC0gYiksIChmICsgbikgLyAobiAtIGYpLCAtMV07XHJcbiAgICBtLmFbM10gPSBbMCwgMCwgKDIgKiBuICogZikgLyAobiAtIGYpLCAwXTtcclxuXHJcbiAgICByZXR1cm4gbTtcclxuICB9XHJcblxyXG4gIHRvQXJyYXkoKTogbnVtYmVyW10ge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgdGhpcy5hWzBdWzBdLFxyXG4gICAgICB0aGlzLmFbMF1bMV0sXHJcbiAgICAgIHRoaXMuYVswXVsyXSxcclxuICAgICAgdGhpcy5hWzBdWzNdLFxyXG4gICAgICB0aGlzLmFbMV1bMF0sXHJcbiAgICAgIHRoaXMuYVsxXVsxXSxcclxuICAgICAgdGhpcy5hWzFdWzJdLFxyXG4gICAgICB0aGlzLmFbMV1bM10sXHJcbiAgICAgIHRoaXMuYVsyXVswXSxcclxuICAgICAgdGhpcy5hWzJdWzFdLFxyXG4gICAgICB0aGlzLmFbMl1bMl0sXHJcbiAgICAgIHRoaXMuYVsyXVszXSxcclxuICAgICAgdGhpcy5hWzNdWzBdLFxyXG4gICAgICB0aGlzLmFbM11bMV0sXHJcbiAgICAgIHRoaXMuYVszXVsyXSxcclxuICAgICAgdGhpcy5hWzNdWzNdLFxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIGNoZWNrKCk6IHZvaWQge1xyXG4gICAgY29uc29sZS5sb2codGhpcy5hWzBdLCB0aGlzLmFbMV0sIHRoaXMuYVsyXSwgdGhpcy5hWzNdKTtcclxuICB9XHJcbn1cclxuIiwiLyogS29wdGVsb3YgTmlraXRhLCAxMC0xLCAwNS4wNi4yMDI0ICovXHJcblxyXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiLi9idWZmZXJcIjtcclxuaW1wb3J0IHsgU2hhZGVyIH0gZnJvbSBcIi4vc2hhZGVyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgVUJPIHtcclxuICBidWZmZXI6IEJ1ZmZlcjtcclxuICBzaXplOiBudW1iZXI7XHJcbiAgYmluZGluZzogbnVtYmVyO1xyXG5cclxuICBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCxcclxuICAgIHNpemU6IG51bWJlcixcclxuICAgIGJpbmRpbmc6IHN0cmluZyxcclxuICAgIHNoYWRlcjogU2hhZGVyXHJcbiAgKSB7XHJcbiAgICB0aGlzLmdsID0gZ2w7XHJcbiAgICB0aGlzLnNpemUgPSBzaXplO1xyXG5cclxuICAgIGxldCBpbmRleCA9IGdsLmdldFVuaWZvcm1CbG9ja0luZGV4KHNoYWRlci5zaGFkZXJQcm9ncmFtLCBiaW5kaW5nKTtcclxuICAgIGdsLnVuaWZvcm1CbG9ja0JpbmRpbmcoc2hhZGVyLnNoYWRlclByb2dyYW0sIGluZGV4LCBzaGFkZXIubnVtT2ZVQk9zKTtcclxuICAgIHRoaXMuYmluZGluZyA9IHNoYWRlci5udW1PZlVCT3M7XHJcbiAgICBzaGFkZXIubnVtT2ZVQk9zKys7XHJcblxyXG4gICAgdGhpcy5idWZmZXIgPSBuZXcgQnVmZmVyKGdsKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYnVmZmVyLmJ1ZmZlcklEKTtcclxuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuVU5JRk9STV9CVUZGRVIsIHNpemUsIGdsLlNUQVRJQ19EUkFXKTtcclxuICAgIGdsLmJpbmRCdWZmZXIodGhpcy5nbC5VTklGT1JNX0JVRkZFUiwgbnVsbCk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoYXJyOiBGbG9hdDMyQXJyYXkpOiB2b2lkIHtcclxuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLlVOSUZPUk1fQlVGRkVSLCB0aGlzLmJ1ZmZlci5idWZmZXJJRCk7XHJcbiAgICB0aGlzLmdsLmJ1ZmZlclN1YkRhdGEodGhpcy5nbC5VTklGT1JNX0JVRkZFUiwgMCwgYXJyKTtcclxuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLlVOSUZPUk1fQlVGRkVSLCBudWxsKTtcclxuICB9XHJcblxyXG4gIGFwcGx5KCk6IHZvaWQge1xyXG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyQmFzZShcclxuICAgICAgdGhpcy5nbC5VTklGT1JNX0JVRkZFUixcclxuICAgICAgdGhpcy5iaW5kaW5nLFxyXG4gICAgICB0aGlzLmJ1ZmZlci5idWZmZXJJRFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHJlc2l6ZShzaXplOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMuc2l6ZSA9IHNpemU7XHJcblxyXG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYnVmZmVyLmJ1ZmZlcklEKTtcclxuICAgIHRoaXMuZ2wuYnVmZmVyRGF0YSh0aGlzLmdsLlVOSUZPUk1fQlVGRkVSLCB0aGlzLnNpemUsIHRoaXMuZ2wuU1RBVElDX0RSQVcpO1xyXG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuVU5JRk9STV9CVUZGRVIsIG51bGwpO1xyXG4gIH1cclxufVxyXG4iLCIvKiBLb3B0ZWxvdiBOaWtpdGEsIDEwLTEsIDA1LjA2LjIwMjQgKi9cclxuXHJcbmltcG9ydCB7IG9mZiB9IGZyb20gXCJwcm9jZXNzXCI7XHJcbmltcG9ydCB7IFZlYzMsIFZlYzQsIHZlYzRTZXQgfSBmcm9tIFwiLi9tdGhcIjtcclxuaW1wb3J0IHsgU2NlbmUgfSBmcm9tIFwiLi9zY2VuZVwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJTWF0ZXJpYWwge1xyXG4gIGFtYmllbnQ6IFZlYzM7XHJcbiAgZGlmZnVzZTogVmVjMztcclxuICBzcGVjdWxhcjogVmVjMztcclxuICB0cmFuczogbnVtYmVyO1xyXG4gIHBob25nOiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBJRHluYW1pYyB7XHJcbiAgW2tleTogc3RyaW5nXTogYW55O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2hhcGUge1xyXG4gIGRhdGE6IEFycmF5PG51bWJlcj47IC8vIDI0ICogOFxyXG4gIGluZGV4OiBudW1iZXI7XHJcbiAgYW1iaWVudDogVmVjMyA9IG5ldyBWZWMzKDApO1xyXG4gIGRpZmZ1c2U6IFZlYzMgPSBuZXcgVmVjMygwKTtcclxuICBzcGVjdWxhcjogVmVjMyA9IG5ldyBWZWMzKDApO1xyXG4gIHRyYW5zOiBudW1iZXIgPSAwO1xyXG4gIHBob25nOiBudW1iZXIgPSAwO1xyXG5cclxuICBzdGF0aWMgbWF0ZXJpYWxTaXplSW5CeXRlcyA9IDQ4O1xyXG4gIHN0YXRpYyBkYXRhU2l6ZUluQnl0ZXMgPSA4MDsgLy8gNSAqIDQgKiA0LCA1eCB2ZWM0XHJcbiAgc3RhdGljIHNpemVJbkJ5dGVzID0gU2hhcGUubWF0ZXJpYWxTaXplSW5CeXRlcyArIFNoYXBlLmRhdGFTaXplSW5CeXRlcztcclxuICBzdGF0aWMgYW1vdW50OiBudW1iZXIgPSAwO1xyXG4gIHN0YXRpYyBnbG9iYWxTaGFwZVR5cGVzOiBJRHluYW1pYyA9IHtcclxuICAgIG51bWJlcnM6IFsxLCAyLCAzLCA0XSxcclxuICAgIG5hbWVzOiBbXCJTcGhlcmVcIiwgXCJQbGFuZVwiLCBcIkJveFwiLCBcIlRvcnVzXCJdLFxyXG4gICAgY3JlYXRlRnJvbUFycmF5RnVuY3Rpb25zOiBbXHJcbiAgICAgIGNyZWF0ZVNwaGVyZUZyb21BcnJheUFuZE1hdGVyaWFsLFxyXG4gICAgICBjcmVhdGVQbGFuZUZyb21BcnJheUFuZE1hdGVyaWFsLFxyXG4gICAgICBjcmVhdGVCb3hGcm9tQXJyYXlBbmRNYXRlcmlhbCxcclxuICAgICAgY3JlYXRlVG9ydXNGcm9tQXJyYXlBbmRNYXRlcmlhbCxcclxuICAgIF0sXHJcbiAgICBjcmVhdGVGcm9tVUJPRGF0YUZ1bmN0aW9uczogW1xyXG4gICAgICBjcmVhdGVTcGhlcmVGcm9tVUJPRGF0YSxcclxuICAgICAgY3JlYXRlUGxhbmVGcm9tVUJPRGF0YSxcclxuICAgICAgY3JlYXRlQm94RnJvbVVCT0RhdGEsXHJcbiAgICAgIGNyZWF0ZVRvcnVzRnJvbVVCT0RhdGEsXHJcbiAgICBdLFxyXG4gICAgZGVzY3JpcHRpb25zOiBbXHJcbiAgICAgIFwidGVtcGxhdGU6IDxjZW50ZXJYPiA8Y2VudGVyWT4gPGNlbnRlclo+IDxyYWRpdXM+XCIsXHJcbiAgICAgIFwidGVtcGxhdGU6IDxwb2ludFg+IDxwb2ludFk+IDxwb2ludFo+IDxub3JtYWxYPiA8bm9ybWFsWT4gPG5vcm1hbFo+XCIsXHJcbiAgICAgIFwidGVtcGxhdGU6IDxjZW50ZXJYPiA8Y2VudGVyWT4gPGNlbnRlclo+IDxzaXplWD4gPHNpemVZPiA8c2l6ZVo+XCIsXHJcbiAgICAgIFwidGVtcGxhdGU6IDxjZW50ZXJYPiA8Y2VudGVyWT4gPGNlbnRlclo+IDxiaWdSYWRpdXM+IDxzbWFsbFJhZGl1cz5cIixcclxuICAgIF0sXHJcbiAgfTtcclxuXHJcbiAgZ2V0UmVwcmVzZW50YXRlU3RyaW5nQmVnaW4oKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgWyBTaGFwZSAke3RoaXMuaW5kZXh9IF06IGA7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbWF0ZXJpYWxMaWI6IElEeW5hbWljID0ge1xyXG4gICAgcmVkOiB7XHJcbiAgICAgIGFtYmllbnQ6IG5ldyBWZWMzKDAuNTY3LCAwLCAwKSxcclxuICAgICAgZGlmZnVzZTogbmV3IFZlYzMoMC41LCAwLjUsIDAuNSksXHJcbiAgICAgIHNwZWN1bGFyOiBuZXcgVmVjMygwLjUsIDAuNSwgMC41KSxcclxuICAgICAgdHJhbnM6IDAsXHJcbiAgICAgIHBob25nOiAxMDAsXHJcbiAgICB9LFxyXG4gICAgZ3JlZW46IHtcclxuICAgICAgYW1iaWVudDogbmV3IFZlYzMoMCwgMC44NjcsIDApLFxyXG4gICAgICBkaWZmdXNlOiBuZXcgVmVjMygwLjUsIDAuNSwgMC41KSxcclxuICAgICAgc3BlY3VsYXI6IG5ldyBWZWMzKDAuNSwgMC41LCAwLjUpLFxyXG4gICAgICB0cmFuczogMCxcclxuICAgICAgcGhvbmc6IDEwLFxyXG4gICAgfSxcclxuICAgIGJsdWU6IHtcclxuICAgICAgYW1iaWVudDogbmV3IFZlYzMoMCwgMCwgMC41NjcpLFxyXG4gICAgICBkaWZmdXNlOiBuZXcgVmVjMygwLjUsIDAuNSwgMC41KSxcclxuICAgICAgc3BlY3VsYXI6IG5ldyBWZWMzKDAuNSwgMC41LCAwLjUpLFxyXG4gICAgICB0cmFuczogMCxcclxuICAgICAgcGhvbmc6IDEwLFxyXG4gICAgfSxcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0eXBlOiBudW1iZXIsIGRhdGE6IG51bWJlcltdLCBtYXRlcmlhbD86IElNYXRlcmlhbCkge1xyXG4gICAgdGhpcy5kYXRhID0gbmV3IEFycmF5KFNoYXBlLnNpemVJbkJ5dGVzIC8gNCk7XHJcblxyXG4gICAgaWYgKG1hdGVyaWFsICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAvLyBBbWJpZW50XHJcbiAgICAgIHRoaXMuZGF0YVswXSA9IG1hdGVyaWFsLmFtYmllbnQueDtcclxuICAgICAgdGhpcy5kYXRhWzFdID0gbWF0ZXJpYWwuYW1iaWVudC55O1xyXG4gICAgICB0aGlzLmRhdGFbMl0gPSBtYXRlcmlhbC5hbWJpZW50Lno7XHJcblxyXG4gICAgICAvLyBUeXBlXHJcbiAgICAgIHRoaXMuZGF0YVszXSA9IHR5cGU7XHJcblxyXG4gICAgICAvLyBEaWZmdXNlXHJcbiAgICAgIHRoaXMuZGF0YVs0XSA9IG1hdGVyaWFsLmRpZmZ1c2UueDtcclxuICAgICAgdGhpcy5kYXRhWzVdID0gbWF0ZXJpYWwuZGlmZnVzZS55O1xyXG4gICAgICB0aGlzLmRhdGFbNl0gPSBtYXRlcmlhbC5kaWZmdXNlLno7XHJcblxyXG4gICAgICAvLyBUcmFuc1xyXG4gICAgICB0aGlzLmRhdGFbN10gPSBtYXRlcmlhbC50cmFucztcclxuXHJcbiAgICAgIC8vIFNwZWN1bGFyXHJcbiAgICAgIHRoaXMuZGF0YVs4XSA9IG1hdGVyaWFsLnNwZWN1bGFyLng7XHJcbiAgICAgIHRoaXMuZGF0YVs5XSA9IG1hdGVyaWFsLnNwZWN1bGFyLnk7XHJcbiAgICAgIHRoaXMuZGF0YVsxMF0gPSBtYXRlcmlhbC5zcGVjdWxhci56O1xyXG5cclxuICAgICAgLy8gUGhvbmdcclxuICAgICAgdGhpcy5kYXRhWzExXSA9IG1hdGVyaWFsLnBob25nO1xyXG5cclxuICAgICAgdGhpcy5hbWJpZW50ID0gbWF0ZXJpYWwuYW1iaWVudDtcclxuICAgICAgdGhpcy5kaWZmdXNlID0gbWF0ZXJpYWwuZGlmZnVzZTtcclxuICAgICAgdGhpcy5zcGVjdWxhciA9IG1hdGVyaWFsLnNwZWN1bGFyO1xyXG4gICAgICB0aGlzLnRyYW5zID0gbWF0ZXJpYWwudHJhbnM7XHJcbiAgICAgIHRoaXMucGhvbmcgPSBtYXRlcmlhbC5waG9uZztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgU2hhcGUubWF0ZXJpYWxTaXplSW5CeXRlcyAvIDQ7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZGF0YVtpXSA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGRpdGlvbmFsIGRhdGFcclxuICAgIGxldCBudW1PZkZsb2F0cyA9IChTaGFwZS5zaXplSW5CeXRlcyAtIFNoYXBlLm1hdGVyaWFsU2l6ZUluQnl0ZXMpIC8gNDtcclxuICAgIGxldCBmbG9hdHNTdGFydCA9IFNoYXBlLm1hdGVyaWFsU2l6ZUluQnl0ZXMgLyA0O1xyXG4gICAgbGV0IGkgPSAwO1xyXG5cclxuICAgIGZvciAoOyBpIDwgTWF0aC5taW4obnVtT2ZGbG9hdHMsIGRhdGEubGVuZ3RoKTsgaSsrKSB7XHJcbiAgICAgIHRoaXMuZGF0YVtmbG9hdHNTdGFydCArIGldID0gZGF0YVtpXTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKDsgaSA8IDIwOyBpKyspIHtcclxuICAgICAgdGhpcy5kYXRhW2Zsb2F0c1N0YXJ0ICsgaV0gPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICB9XHJcblxyXG4gIGdldFR5cGUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmRhdGFbM107XHJcbiAgfVxyXG5cclxuICBnZXRNYXRlcmlhbCgpOiBJTWF0ZXJpYWwge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYW1iaWVudDogdGhpcy5hbWJpZW50LFxyXG4gICAgICBkaWZmdXNlOiB0aGlzLmRpZmZ1c2UsXHJcbiAgICAgIHNwZWN1bGFyOiB0aGlzLnNwZWN1bGFyLFxyXG4gICAgICB0cmFuczogdGhpcy50cmFucyxcclxuICAgICAgcGhvbmc6IHRoaXMucGhvbmcsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVwcmVzZW50YXRlKHNjZW5lOiBTY2VuZSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gXCJTb21lIHNoYXBlXCI7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU3BoZXJlIGV4dGVuZHMgU2hhcGUge1xyXG4gIHN0YXRpYyBhbW91bnQ6IG51bWJlciA9IDA7XHJcbiAgY2VudGVyOiBWZWMzO1xyXG4gIHJhZGl1czogbnVtYmVyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihjZW50ZXI6IFZlYzMsIHJhZGl1czogbnVtYmVyLCBtYXRlcmlhbDogSU1hdGVyaWFsKSB7XHJcbiAgICBzdXBlcihcclxuICAgICAgMSxcclxuICAgICAgW1xyXG4gICAgICAgIGNlbnRlci54LFxyXG4gICAgICAgIGNlbnRlci55LFxyXG4gICAgICAgIGNlbnRlci56LFxyXG4gICAgICAgIHJhZGl1cyxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICBdLFxyXG4gICAgICBtYXRlcmlhbFxyXG4gICAgKTtcclxuICAgIHRoaXMuY2VudGVyID0gY2VudGVyO1xyXG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcbiAgICBTcGhlcmUuYW1vdW50Kys7XHJcbiAgfVxyXG5cclxuICBvdmVycmlkZSByZXByZXNlbnRhdGUoKTogc3RyaW5nIHtcclxuICAgIGlmICh0aGlzLmluZGV4ID09IHVuZGVmaW5lZCkge1xyXG4gICAgICByZXR1cm4gXCI/Pz9cIjtcclxuICAgIH1cclxuICAgIHJldHVybiAoXHJcbiAgICAgIHRoaXMuZ2V0UmVwcmVzZW50YXRlU3RyaW5nQmVnaW4oKSArXHJcbiAgICAgIGB0eXBlOiBzcGhlcmUsIGNlbnRlcjogJHt0aGlzLmNlbnRlci5yZXByZXNlbnRhdGUoKX0sIHJhZGl1czogJHt0aGlzLnJhZGl1c31gXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBsYW5lIGV4dGVuZHMgU2hhcGUge1xyXG4gIHBvaW50OiBWZWMzO1xyXG4gIG5vcm1hbDogVmVjMztcclxuXHJcbiAgY29uc3RydWN0b3IocG9pbnQ6IFZlYzMsIG5vcm1hbDogVmVjMywgbWF0ZXJpYWw6IElNYXRlcmlhbCkge1xyXG4gICAgc3VwZXIoXHJcbiAgICAgIDIsXHJcbiAgICAgIFtcclxuICAgICAgICBwb2ludC54LFxyXG4gICAgICAgIHBvaW50LnksXHJcbiAgICAgICAgcG9pbnQueixcclxuICAgICAgICAwLFxyXG4gICAgICAgIG5vcm1hbC54LFxyXG4gICAgICAgIG5vcm1hbC55LFxyXG4gICAgICAgIG5vcm1hbC56LFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgIF0sXHJcbiAgICAgIG1hdGVyaWFsXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMucG9pbnQgPSBwb2ludDtcclxuICAgIHRoaXMubm9ybWFsID0gbm9ybWFsO1xyXG4gIH1cclxuXHJcbiAgb3ZlcnJpZGUgcmVwcmVzZW50YXRlKHNjZW5lOiBTY2VuZSk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy5pbmRleCA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuIFwiPz8/XCI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICB0aGlzLmdldFJlcHJlc2VudGF0ZVN0cmluZ0JlZ2luKCkgK1xyXG4gICAgICBgdHlwZTogcGxhbmUsIHBvaW50OiAke3RoaXMucG9pbnQucmVwcmVzZW50YXRlKCl9LCBub3JtYWw6ICR7dGhpcy5ub3JtYWwucmVwcmVzZW50YXRlKCl9YFxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCb3ggZXh0ZW5kcyBTaGFwZSB7XHJcbiAgY2VudGVyOiBWZWMzO1xyXG4gIGJveDogVmVjMztcclxuXHJcbiAgY29uc3RydWN0b3IoY2VudGVyOiBWZWMzLCBib3g6IFZlYzMsIG1hdGVyaWFsOiBJTWF0ZXJpYWwpIHtcclxuICAgIHN1cGVyKFxyXG4gICAgICAzLFxyXG4gICAgICBbXHJcbiAgICAgICAgY2VudGVyLngsXHJcbiAgICAgICAgY2VudGVyLnksXHJcbiAgICAgICAgY2VudGVyLnosXHJcbiAgICAgICAgMCxcclxuICAgICAgICBib3gueCxcclxuICAgICAgICBib3gueSxcclxuICAgICAgICBib3gueixcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICBdLFxyXG4gICAgICBtYXRlcmlhbFxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmNlbnRlciA9IGNlbnRlcjtcclxuICAgIHRoaXMuYm94ID0gYm94O1xyXG4gIH1cclxuXHJcbiAgb3ZlcnJpZGUgcmVwcmVzZW50YXRlKHNjZW5lOiBTY2VuZSk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy5pbmRleCA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuIFwiPz8/XCI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICB0aGlzLmdldFJlcHJlc2VudGF0ZVN0cmluZ0JlZ2luKCkgK1xyXG4gICAgICBgdHlwZTogYm94LCBjZW50ZXI6ICR7dGhpcy5jZW50ZXIucmVwcmVzZW50YXRlKCl9LCBib3g6ICR7dGhpcy5ib3gucmVwcmVzZW50YXRlKCl9YFxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUb3J1cyBleHRlbmRzIFNoYXBlIHtcclxuICBjZW50ZXI6IFZlYzM7XHJcbiAgcjE6IG51bWJlcjtcclxuICByMjogbnVtYmVyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihjZW50ZXI6IFZlYzMsIHIxOiBudW1iZXIsIHIyOiBudW1iZXIsIG1hdGVyaWFsOiBJTWF0ZXJpYWwpIHtcclxuICAgIHN1cGVyKFxyXG4gICAgICA0LFxyXG4gICAgICBbXHJcbiAgICAgICAgY2VudGVyLngsXHJcbiAgICAgICAgY2VudGVyLnksXHJcbiAgICAgICAgY2VudGVyLnosXHJcbiAgICAgICAgMCxcclxuICAgICAgICByMSxcclxuICAgICAgICByMixcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgIF0sXHJcbiAgICAgIG1hdGVyaWFsXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuY2VudGVyID0gY2VudGVyO1xyXG4gICAgdGhpcy5yMSA9IHIxO1xyXG4gICAgdGhpcy5yMiA9IHIyO1xyXG4gIH1cclxuXHJcbiAgb3ZlcnJpZGUgcmVwcmVzZW50YXRlKHNjZW5lOiBTY2VuZSk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy5pbmRleCA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuIFwiPz8/XCI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICB0aGlzLmdldFJlcHJlc2VudGF0ZVN0cmluZ0JlZ2luKCkgK1xyXG4gICAgICBgdHlwZTogdG9ydXMsIGNlbnRlcjogJHt0aGlzLmNlbnRlci5yZXByZXNlbnRhdGUoKX0sIHIxOiAke3RoaXMucjF9LCByMjogJHt0aGlzLnIyfWBcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKioqKipcclxuICogRnVuY3Rpb25zIG9mIGNyZWF0aW5nIGZyb20gYXJyYXkgYW5kIFVCT1xyXG4gKioqKiovXHJcblxyXG5mdW5jdGlvbiBjcmVhdGVNYXRlcmlhbEZyb21VQk9EYXRhKGFycjogbnVtYmVyW10pOiBJTWF0ZXJpYWwge1xyXG4gIHJldHVybiB7XHJcbiAgICBhbWJpZW50OiBuZXcgVmVjMyhhcnJbMF0sIGFyclsxXSwgYXJyWzJdKSxcclxuICAgIGRpZmZ1c2U6IG5ldyBWZWMzKGFycls0XSwgYXJyWzVdLCBhcnJbNl0pLFxyXG4gICAgc3BlY3VsYXI6IG5ldyBWZWMzKGFycls4XSwgYXJyWzldLCBhcnJbMTBdKSxcclxuICAgIHRyYW5zOiBhcnJbN10sXHJcbiAgICBwaG9uZzogYXJyWzExXSxcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTcGhlcmVGcm9tQXJyYXlBbmRNYXRlcmlhbChcclxuICBhcnI6IG51bWJlcltdLFxyXG4gIG1hdGVyaWFsOiBJTWF0ZXJpYWxcclxuKTogU3BoZXJlIHwgdW5kZWZpbmVkIHtcclxuICBpZiAoYXJyLmxlbmd0aCAhPSA0KSB7XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIH1cclxuICByZXR1cm4gbmV3IFNwaGVyZShuZXcgVmVjMyhhcnJbMF0sIGFyclsxXSwgYXJyWzJdKSwgYXJyWzNdLCBtYXRlcmlhbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVNwaGVyZUZyb21VQk9EYXRhKGFycjogbnVtYmVyW10pOiBTcGhlcmUgfCB1bmRlZmluZWQge1xyXG4gIGlmIChhcnIubGVuZ3RoICE9IFNoYXBlLnNpemVJbkJ5dGVzIC8gNCkge1xyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICB9XHJcbiAgbGV0IG9mZiA9IFNoYXBlLm1hdGVyaWFsU2l6ZUluQnl0ZXMgLyA0O1xyXG4gIHJldHVybiBuZXcgU3BoZXJlKFxyXG4gICAgbmV3IFZlYzMoYXJyW29mZiArIDBdLCBhcnJbb2ZmICsgMV0sIGFycltvZmYgKyAyXSksXHJcbiAgICBhcnJbb2ZmICsgM10sXHJcbiAgICBjcmVhdGVNYXRlcmlhbEZyb21VQk9EYXRhKGFycilcclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQbGFuZUZyb21BcnJheUFuZE1hdGVyaWFsKFxyXG4gIGFycjogbnVtYmVyW10sXHJcbiAgbWF0ZXJpYWw6IElNYXRlcmlhbFxyXG4pOiBQbGFuZSB8IHVuZGVmaW5lZCB7XHJcbiAgaWYgKGFyci5sZW5ndGggIT0gNikge1xyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICB9XHJcbiAgcmV0dXJuIG5ldyBQbGFuZShcclxuICAgIG5ldyBWZWMzKGFyclswXSwgYXJyWzFdLCBhcnJbMl0pLFxyXG4gICAgbmV3IFZlYzMoYXJyWzNdLCBhcnJbNF0sIGFycls1XSksXHJcbiAgICBtYXRlcmlhbFxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVBsYW5lRnJvbVVCT0RhdGEoYXJyOiBudW1iZXJbXSk6IFBsYW5lIHwgdW5kZWZpbmVkIHtcclxuICBpZiAoYXJyLmxlbmd0aCAhPSBTaGFwZS5zaXplSW5CeXRlcyAvIDQpIHtcclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgfVxyXG4gIGxldCBvZmYgPSBTaGFwZS5tYXRlcmlhbFNpemVJbkJ5dGVzIC8gNDtcclxuICByZXR1cm4gbmV3IFBsYW5lKFxyXG4gICAgbmV3IFZlYzMoYXJyW29mZiArIDBdLCBhcnJbb2ZmICsgMV0sIGFycltvZmYgKyAyXSksXHJcbiAgICBuZXcgVmVjMyhhcnJbb2ZmICsgNF0sIGFycltvZmYgKyA1XSwgYXJyW29mZiArIDZdKSxcclxuICAgIGNyZWF0ZU1hdGVyaWFsRnJvbVVCT0RhdGEoYXJyKVxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUJveEZyb21BcnJheUFuZE1hdGVyaWFsKFxyXG4gIGFycjogbnVtYmVyW10sXHJcbiAgbWF0ZXJpYWw6IElNYXRlcmlhbFxyXG4pOiBCb3ggfCB1bmRlZmluZWQge1xyXG4gIGlmIChhcnIubGVuZ3RoICE9IDYpIHtcclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgQm94KFxyXG4gICAgbmV3IFZlYzMoYXJyWzBdLCBhcnJbMV0sIGFyclsyXSksXHJcbiAgICBuZXcgVmVjMyhhcnJbM10sIGFycls0XSwgYXJyWzVdKSxcclxuICAgIG1hdGVyaWFsXHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQm94RnJvbVVCT0RhdGEoYXJyOiBudW1iZXJbXSk6IEJveCB8IHVuZGVmaW5lZCB7XHJcbiAgaWYgKGFyci5sZW5ndGggIT0gU2hhcGUuc2l6ZUluQnl0ZXMgLyA0KSB7XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIH1cclxuICBsZXQgb2ZmID0gU2hhcGUubWF0ZXJpYWxTaXplSW5CeXRlcyAvIDQ7XHJcbiAgcmV0dXJuIG5ldyBCb3goXHJcbiAgICBuZXcgVmVjMyhhcnJbb2ZmICsgMF0sIGFycltvZmYgKyAxXSwgYXJyW29mZiArIDJdKSxcclxuICAgIG5ldyBWZWMzKGFycltvZmYgKyA0XSwgYXJyW29mZiArIDVdLCBhcnJbb2ZmICsgNl0pLFxyXG4gICAgY3JlYXRlTWF0ZXJpYWxGcm9tVUJPRGF0YShhcnIpXHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlVG9ydXNGcm9tQXJyYXlBbmRNYXRlcmlhbChcclxuICBhcnI6IG51bWJlcltdLFxyXG4gIG1hdGVyaWFsOiBJTWF0ZXJpYWxcclxuKTogVG9ydXMgfCB1bmRlZmluZWQge1xyXG4gIGlmIChhcnIubGVuZ3RoICE9IDUpIHtcclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgVG9ydXMobmV3IFZlYzMoYXJyWzBdLCBhcnJbMV0sIGFyclsyXSksIGFyclszXSwgYXJyWzRdLCBtYXRlcmlhbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVRvcnVzRnJvbVVCT0RhdGEoYXJyOiBudW1iZXJbXSk6IFRvcnVzIHwgdW5kZWZpbmVkIHtcclxuICBpZiAoYXJyLmxlbmd0aCAhPSBTaGFwZS5zaXplSW5CeXRlcyAvIDQpIHtcclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgfVxyXG4gIGxldCBvZmYgPSBTaGFwZS5tYXRlcmlhbFNpemVJbkJ5dGVzIC8gNDtcclxuICByZXR1cm4gbmV3IFRvcnVzKFxyXG4gICAgbmV3IFZlYzMoYXJyW29mZiArIDBdLCBhcnJbb2ZmICsgMV0sIGFycltvZmYgKyAyXSksXHJcbiAgICBhcnJbb2ZmICsgNF0sXHJcbiAgICBhcnJbb2ZmICsgNV0sXHJcbiAgICBjcmVhdGVNYXRlcmlhbEZyb21VQk9EYXRhKGFycilcclxuICApO1xyXG59XHJcbiIsIi8qIEtvcHRlbG92IE5pa2l0YSwgMTAtMSwgMDYuMDYuMjAyNCAqL1xyXG5cclxuaW1wb3J0IHsgVmVjNCwgdmVjNFNldCwgVmVjMywgdmVjM1NldCwgTWF0NCB9IGZyb20gXCIuL210aFwiO1xyXG5pbXBvcnQgeyBJQXJyYXlDaGFuZ2VyIH0gZnJvbSBcIi4vdG9vbHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDYW1lcmEge1xyXG4gIHByb2pTaXplOiBudW1iZXI7XHJcbiAgcHJvakRpc3Q6IG51bWJlcjtcclxuICBwcm9qRmFyQ2xpcDogbnVtYmVyO1xyXG4gIGZyYW1lVzogbnVtYmVyO1xyXG4gIGZyYW1lSDogbnVtYmVyO1xyXG4gIC8qIHdwOiBudW1iZXI7XHJcbiAgICAgaHA6IG51bWJlcjsgKi9cclxuICBtYXRyVmlldzogTWF0NDtcclxuICBtYXRyUHJvajogTWF0NDtcclxuICBtYXRyVlA6IE1hdDQ7XHJcbiAgbG9jOiBWZWMzO1xyXG4gIGF0OiBWZWMzO1xyXG4gIGRpcjogVmVjMztcclxuICB1cDogVmVjMztcclxuICByaWdodDogVmVjMztcclxuICBhbmdsZVk6IG51bWJlcjtcclxuICBhbmdsZVhaOiBudW1iZXI7XHJcbiAgc3RhdGljIHNpemVpbkJ5dGVzOiBudW1iZXIgPSAyNzI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHc6IG51bWJlciwgaDogbnVtYmVyKSB7XHJcbiAgICB0aGlzLnByb2pTaXplID0gMC4xO1xyXG4gICAgdGhpcy5wcm9qRGlzdCA9IDAuMTtcclxuICAgIHRoaXMucHJvakZhckNsaXAgPSA1MDAwMDtcclxuXHJcbiAgICB0aGlzLmZyYW1lVyA9IHc7XHJcbiAgICB0aGlzLmZyYW1lSCA9IGg7XHJcbiAgICAvKiB0aGlzLndwID0gMC4xO1xyXG4gICAgdGhpcy5ocCA9IDAuMTsgKi9cclxuXHJcbiAgICB0aGlzLm1hdHJWaWV3ID0gbmV3IE1hdDQoKTtcclxuICAgIHRoaXMubWF0clByb2ogPSBuZXcgTWF0NCgpO1xyXG4gICAgdGhpcy5tYXRyVlAgPSBuZXcgTWF0NCgpO1xyXG5cclxuICAgIHRoaXMubG9jID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYXQgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy5kaXIgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy51cCA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLnJpZ2h0ID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICB0aGlzLmFuZ2xlWSA9IDA7XHJcbiAgICB0aGlzLmFuZ2xlWFogPSAwO1xyXG4gIH1cclxuXHJcbiAgc2V0KGxvYzogVmVjMywgYXQ6IFZlYzMsIHVwOiBWZWMzKTogdm9pZCB7XHJcbiAgICB0aGlzLm1hdHJWaWV3ID0gTWF0NC52aWV3KGxvYywgYXQsIHVwKTtcclxuICAgIHRoaXMubG9jID0gbG9jO1xyXG4gICAgdGhpcy5hdCA9IGF0O1xyXG4gICAgdGhpcy5kaXIgPSB2ZWMzU2V0KFxyXG4gICAgICAtdGhpcy5tYXRyVmlldy5hWzBdWzJdLFxyXG4gICAgICAtdGhpcy5tYXRyVmlldy5hWzFdWzJdLFxyXG4gICAgICAtdGhpcy5tYXRyVmlldy5hWzJdWzJdXHJcbiAgICApO1xyXG4gICAgdGhpcy51cCA9IHZlYzNTZXQoXHJcbiAgICAgIHRoaXMubWF0clZpZXcuYVswXVsxXSxcclxuICAgICAgdGhpcy5tYXRyVmlldy5hWzFdWzFdLFxyXG4gICAgICB0aGlzLm1hdHJWaWV3LmFbMl1bMV1cclxuICAgICk7XHJcbiAgICB0aGlzLnJpZ2h0ID0gdmVjM1NldChcclxuICAgICAgdGhpcy5tYXRyVmlldy5hWzBdWzBdLFxyXG4gICAgICB0aGlzLm1hdHJWaWV3LmFbMV1bMF0sXHJcbiAgICAgIHRoaXMubWF0clZpZXcuYVsyXVswXVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLm1hdHJWUCA9IHRoaXMubWF0clZpZXcubXVsKHRoaXMubWF0clByb2opO1xyXG4gIH1cclxuXHJcbiAgcHJvaigpOiB2b2lkIHtcclxuICAgIGxldCByeCwgcnk7XHJcblxyXG4gICAgcnggPSB0aGlzLnByb2pTaXplO1xyXG4gICAgcnkgPSByeDtcclxuXHJcbiAgICBpZiAodGhpcy5mcmFtZVcgPiB0aGlzLmZyYW1lSCkge1xyXG4gICAgICByeCAqPSB0aGlzLmZyYW1lVyAvIHRoaXMuZnJhbWVIO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcnkgKj0gdGhpcy5mcmFtZUggLyB0aGlzLmZyYW1lVztcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1hdHJQcm9qID0gTWF0NC5mcnVzdHVtKFxyXG4gICAgICAtcnggLyAyLFxyXG4gICAgICByeCAvIDIsXHJcbiAgICAgIC1yeSAvIDIsXHJcbiAgICAgIHJ5IC8gMixcclxuICAgICAgdGhpcy5wcm9qRGlzdCxcclxuICAgICAgdGhpcy5wcm9qRmFyQ2xpcFxyXG4gICAgKTtcclxuICAgIHRoaXMubWF0clZQID0gdGhpcy5tYXRyVmlldy5tdWwodGhpcy5tYXRyUHJvaik7XHJcbiAgfVxyXG5cclxuICByZXNpemUobnc6IG51bWJlciwgbmg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgdGhpcy5mcmFtZVcgPSBudztcclxuICAgIHRoaXMuZnJhbWVIID0gbmg7XHJcbiAgICB0aGlzLnByb2ooKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZUZyb21BcnJheShhcnI6IG51bWJlcltdKTogdm9pZCB7XHJcbiAgICB0aGlzLmxvYyA9IG5ldyBWZWMzKGFyclswXSwgYXJyWzFdLCBhcnJbMl0pO1xyXG4gICAgdGhpcy5mcmFtZVcgPSBhcnJbM107XHJcblxyXG4gICAgdGhpcy5kaXIgPSBuZXcgVmVjMyhhcnJbNF0sIGFycls1XSwgYXJyWzZdKTtcclxuICAgIHRoaXMuZnJhbWVIID0gYXJyWzddO1xyXG5cclxuICAgIHRoaXMuYXQgPSBuZXcgVmVjMyhhcnJbOF0sIGFycls5XSwgYXJyWzEwXSk7XHJcbiAgICB0aGlzLnByb2pEaXN0ID0gYXJyWzExXTtcclxuXHJcbiAgICB0aGlzLnJpZ2h0ID0gbmV3IFZlYzMoYXJyWzEyXSwgYXJyWzEzXSwgYXJyWzE0XSk7XHJcbiAgICB0aGlzLmFuZ2xlWSA9IGFyclsxNV07XHJcblxyXG4gICAgdGhpcy51cCA9IG5ldyBWZWMzKGFyclsxNl0sIGFyclsxN10sIGFyclsxOF0pO1xyXG4gICAgdGhpcy5hbmdsZVhaID0gYXJyWzE5XTtcclxuXHJcbiAgICBsZXQgbWF0NEFyciA9IG5ldyBBcnJheTxudW1iZXI+KDE2KTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMjA7IGkgPCAzNjsgaSsrKSB7XHJcbiAgICAgIG1hdDRBcnJbMjAgLSBpXSA9IGFycltpXTtcclxuICAgIH1cclxuICAgIHRoaXMubWF0clZpZXcgPSBNYXQ0LmNyZWF0ZUZyb21BcnJheShtYXQ0QXJyKTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMzY7IGkgPCA1MjsgaSsrKSB7XHJcbiAgICAgIG1hdDRBcnJbMzYgLSBpXSA9IGFycltpXTtcclxuICAgIH1cclxuICAgIHRoaXMubWF0clByb2ogPSBNYXQ0LmNyZWF0ZUZyb21BcnJheShtYXQ0QXJyKTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gNTI7IGkgPCA2ODsgaSsrKSB7XHJcbiAgICAgIG1hdDRBcnJbNTIgLSBpXSA9IGFycltpXTtcclxuICAgIH1cclxuICAgIHRoaXMubWF0clZQID0gTWF0NC5jcmVhdGVGcm9tQXJyYXkobWF0NEFycik7XHJcbiAgfVxyXG5cclxuICB0b0FycmF5KGNoYW5nZTogSUFycmF5Q2hhbmdlciwgb2Zmc2V0OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGNoYW5nZS5hcnJbb2Zmc2V0ICsgMF0gPSB0aGlzLmxvYy54O1xyXG4gICAgY2hhbmdlLmFycltvZmZzZXQgKyAxXSA9IHRoaXMubG9jLnk7XHJcbiAgICBjaGFuZ2UuYXJyW29mZnNldCArIDJdID0gdGhpcy5sb2MuejtcclxuICAgIGNoYW5nZS5hcnJbb2Zmc2V0ICsgM10gPSB0aGlzLmZyYW1lVztcclxuXHJcbiAgICBjaGFuZ2UuYXJyW29mZnNldCArIDRdID0gdGhpcy5kaXIueDtcclxuICAgIGNoYW5nZS5hcnJbb2Zmc2V0ICsgNV0gPSB0aGlzLmRpci55O1xyXG4gICAgY2hhbmdlLmFycltvZmZzZXQgKyA2XSA9IHRoaXMuZGlyLno7XHJcbiAgICBjaGFuZ2UuYXJyW29mZnNldCArIDddID0gdGhpcy5mcmFtZUg7XHJcblxyXG4gICAgY2hhbmdlLmFycltvZmZzZXQgKyA4XSA9IHRoaXMuYXQueDtcclxuICAgIGNoYW5nZS5hcnJbb2Zmc2V0ICsgOV0gPSB0aGlzLmF0Lnk7XHJcbiAgICBjaGFuZ2UuYXJyW29mZnNldCArIDEwXSA9IHRoaXMuYXQuejtcclxuICAgIGNoYW5nZS5hcnJbb2Zmc2V0ICsgMTFdID0gdGhpcy5wcm9qRGlzdDtcclxuXHJcbiAgICBjaGFuZ2UuYXJyW29mZnNldCArIDEyXSA9IHRoaXMucmlnaHQueDtcclxuICAgIGNoYW5nZS5hcnJbb2Zmc2V0ICsgMTNdID0gdGhpcy5yaWdodC55O1xyXG4gICAgY2hhbmdlLmFycltvZmZzZXQgKyAxNF0gPSB0aGlzLnJpZ2h0Lno7XHJcbiAgICBjaGFuZ2UuYXJyW29mZnNldCArIDE1XSA9IHRoaXMuYW5nbGVZO1xyXG5cclxuICAgIGNoYW5nZS5hcnJbb2Zmc2V0ICsgMTZdID0gdGhpcy51cC54O1xyXG4gICAgY2hhbmdlLmFycltvZmZzZXQgKyAxN10gPSB0aGlzLnVwLnk7XHJcbiAgICBjaGFuZ2UuYXJyW29mZnNldCArIDE4XSA9IHRoaXMudXAuejtcclxuICAgIGNoYW5nZS5hcnJbb2Zmc2V0ICsgMTldID0gdGhpcy5hbmdsZVhaO1xyXG5cclxuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IDQ7IHJvdysrKSB7XHJcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDQ7IGNvbCsrKSB7XHJcbiAgICAgICAgY2hhbmdlLmFycltvZmZzZXQgKyAyMCArIHJvdyAqIDQgKyBjb2xdID0gdGhpcy5tYXRyVmlldy5hW3Jvd11bY29sXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IDQ7IHJvdysrKSB7XHJcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDQ7IGNvbCsrKSB7XHJcbiAgICAgICAgY2hhbmdlLmFycltvZmZzZXQgKyAzNSArIHJvdyAqIDQgKyBjb2xdID0gdGhpcy5tYXRyUHJvai5hW3Jvd11bY29sXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IDQ7IHJvdysrKSB7XHJcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDQ7IGNvbCsrKSB7XHJcbiAgICAgICAgY2hhbmdlLmFycltvZmZzZXQgKyA1MSArIHJvdyAqIDQgKyBjb2xdID0gdGhpcy5tYXRyVlAuYVtyb3ddW2NvbF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiLyogS29wdGVsb3YgTmlraXRhLCAxMC0xLCAwNS4wNi4yMDI0ICovXHJcblxyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gXCIuL3NoYXBlc1wiO1xyXG5pbXBvcnQgeyBJQXJyYXlDaGFuZ2VyIH0gZnJvbSBcIi4vdG9vbHNcIjtcclxuaW1wb3J0IHsgVUJPIH0gZnJvbSBcIi4vdWJvXCI7XHJcbmltcG9ydCB7IFNoYWRlciB9IGZyb20gXCIuL3NoYWRlclwiO1xyXG5pbXBvcnQgeyBDYW1lcmEgfSBmcm9tIFwiLi9jYW1lcmFcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBTY2VuZSB7XHJcbiAgZ2xvYmFsU2hhcGVzOiBBcnJheTxTaGFwZT47XHJcbiAgY2FtZXJhOiBDYW1lcmE7XHJcblxyXG4gIHNoYXBlc1VCTzogVUJPO1xyXG4gIGNhbWVyYVVCTzogVUJPO1xyXG5cclxuICBzaGFwZXNVQk9BcnJheTogbnVtYmVyW107XHJcbiAgY2FtZXJhVUJPQXJyYXk6IG51bWJlcltdO1xyXG5cclxuICBzdGF0aWMgbWF4U2hhcGVzOiBudW1iZXIgPSA2NDtcclxuICBhbW91bnRPZlNoYXBlczogbnVtYmVyID0gMDtcclxuXHJcbiAgY29uc3RydWN0b3IoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIHNoYWRlcjogU2hhZGVyLCBjYW1lcmE6IENhbWVyYSkge1xyXG4gICAgdGhpcy5nbG9iYWxTaGFwZXMgPSBbXTtcclxuICAgIHRoaXMuc2hhcGVzVUJPID0gbmV3IFVCTyhcclxuICAgICAgZ2wsXHJcbiAgICAgIFNjZW5lLm1heFNoYXBlcyAqIFNoYXBlLnNpemVJbkJ5dGVzLFxyXG4gICAgICBcInNoYXBlc1VCT1wiLFxyXG4gICAgICBzaGFkZXJcclxuICAgICk7XHJcbiAgICB0aGlzLnNoYXBlc1VCT0FycmF5ID0gbmV3IEFycmF5PG51bWJlcj4oXHJcbiAgICAgIChTY2VuZS5tYXhTaGFwZXMgKiBTaGFwZS5zaXplSW5CeXRlcykgLyA0XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuY2FtZXJhVUJPID0gbmV3IFVCTyhnbCwgQ2FtZXJhLnNpemVpbkJ5dGVzLCBcImNhbWVyYVVCT1wiLCBzaGFkZXIpO1xyXG4gICAgdGhpcy5jYW1lcmFVQk9BcnJheSA9IG5ldyBBcnJheTxudW1iZXI+KENhbWVyYS5zaXplaW5CeXRlcyAvIDQpO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jYW1lcmFVQk9BcnJheS5sZW5ndGg7IGkrKykge1xyXG4gICAgICB0aGlzLnNoYXBlc1VCT0FycmF5W2ldID0gMDtcclxuICAgIH1cclxuICAgIHRoaXMuY2FtZXJhID0gY2FtZXJhO1xyXG4gICAgdGhpcy4jY2FtZXJhVG9BcnJheSh7IGFycjogdGhpcy5jYW1lcmFVQk9BcnJheSB9LCAwKTtcclxuICB9XHJcblxyXG4gIGFkZChzaGFwZTogYW55KTogdm9pZCB7XHJcbiAgICBsZXQgaSA9IHRoaXMuYW1vdW50T2ZTaGFwZXM7XHJcblxyXG4gICAgdGhpcy5nbG9iYWxTaGFwZXNbaV0gPSBzaGFwZTtcclxuICAgIHRoaXMuZ2xvYmFsU2hhcGVzW2ldLmluZGV4ID0gaTtcclxuXHJcbiAgICB0aGlzLmFtb3VudE9mU2hhcGVzKys7XHJcblxyXG4gICAgdGhpcy5zaGFwZXNVcGRhdGUoKTtcclxuICB9XHJcblxyXG4gIGVkaXQoc2hhcGU6IGFueSwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgdGhpcy5nbG9iYWxTaGFwZXNbaW5kZXhdID0gc2hhcGU7XHJcbiAgICB0aGlzLmdsb2JhbFNoYXBlc1tpbmRleF0uaW5kZXggPSBpbmRleDtcclxuXHJcbiAgICB0aGlzLnNoYXBlc1VwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgcmVtb3ZlKGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmIChpbmRleCA+IHRoaXMuYW1vdW50T2ZTaGFwZXMgLSAxKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdsb2JhbFNoYXBlc1tpbmRleF0gPSBuZXcgU2hhcGUoMCwgW10pO1xyXG4gICAgZm9yIChsZXQgaSA9IGluZGV4ICsgMTsgaSA8IHRoaXMuYW1vdW50T2ZTaGFwZXM7IGkrKykge1xyXG4gICAgICB0aGlzLmdsb2JhbFNoYXBlc1tpIC0gMV0gPSB0aGlzLmdsb2JhbFNoYXBlc1tpXTtcclxuICAgIH1cclxuICAgIHRoaXMuZ2xvYmFsU2hhcGVzLnBvcCgpO1xyXG4gICAgdGhpcy5hbW91bnRPZlNoYXBlcy0tO1xyXG5cclxuICAgIHRoaXMuc2hhcGVzVXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICBzaGFwZXNVcGRhdGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLiNzaGFwZXNUb0FycmF5KFxyXG4gICAgICB7IGFycjogdGhpcy5zaGFwZXNVQk9BcnJheSB9LFxyXG4gICAgICAwLFxyXG4gICAgICB0aGlzLnNoYXBlc1VCT0FycmF5Lmxlbmd0aFxyXG4gICAgKTtcclxuICAgIHRoaXMuc2hhcGVzVUJPLnVwZGF0ZShuZXcgRmxvYXQzMkFycmF5KHRoaXMuc2hhcGVzVUJPQXJyYXkpKTtcclxuICB9XHJcblxyXG4gIGNhbWVyYVVwZGF0ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuI2NhbWVyYVRvQXJyYXkoeyBhcnI6IHRoaXMuY2FtZXJhVUJPQXJyYXkgfSwgMCk7XHJcbiAgICB0aGlzLmNhbWVyYVVCTy51cGRhdGUobmV3IEZsb2F0MzJBcnJheSh0aGlzLmNhbWVyYVVCT0FycmF5KSk7XHJcbiAgfVxyXG5cclxuICAjc2hhcGVzVG9BcnJheShjaGFuZ2U6IElBcnJheUNoYW5nZXIsIG9mZnNldDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgbGV0IGsgPSAwO1xyXG5cclxuICAgIHRoaXMuZ2xvYmFsU2hhcGVzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBTaGFwZS5zaXplSW5CeXRlcyAvIDQ7IGkrKykge1xyXG4gICAgICAgIGNoYW5nZS5hcnJbb2Zmc2V0ICsga10gPSBlbGVtZW50LmRhdGFbaV07XHJcbiAgICAgICAgaysrO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmb3IgKDsgb2Zmc2V0ICsgayA8IGVuZDsgaysrKSB7XHJcbiAgICAgIGNoYW5nZS5hcnJbb2Zmc2V0ICsga10gPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgI2NhbWVyYVRvQXJyYXkoY2hhbmdlOiBJQXJyYXlDaGFuZ2VyLCBvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgdGhpcy5jYW1lcmEudG9BcnJheShjaGFuZ2UsIG9mZnNldCk7XHJcbiAgfVxyXG59XHJcbiIsIi8qIEtvcHRlbG92IE5pa2l0YSwgMTAtMSwgMDUuMDYuMjAyNCAqL1xyXG5cclxuaW1wb3J0IHsgSU1hdGVyaWFsLCBTaGFwZSB9IGZyb20gXCIuL3NoYXBlc1wiO1xyXG5pbXBvcnQgeyBWZWMzIH0gZnJvbSBcIi4vbXRoXCI7XHJcbmltcG9ydCB7IFNjZW5lIH0gZnJvbSBcIi4vc2NlbmVcIjtcclxuXHJcbmludGVyZmFjZSBJRHluYW1pYyB7XHJcbiAgW2tleTogc3RyaW5nXTogYW55O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb2xvclRvRGVjaW1hbChjb2xvcjogc3RyaW5nKTogVmVjMyB7XHJcbiAgbGV0IHJlcyA9IG5ldyBWZWMzKCk7XHJcblxyXG4gIC8vIGNvbG9yOiBcIiM4MzRkMThcIlxyXG4gIHJlcy54ID0gZXZhbChcIjB4XCIgKyBjb2xvclsxXSArIGNvbG9yWzJdKSAvIDI1NS4wO1xyXG4gIHJlcy55ID0gZXZhbChcIjB4XCIgKyBjb2xvclszXSArIGNvbG9yWzRdKSAvIDI1NS4wO1xyXG4gIHJlcy56ID0gZXZhbChcIjB4XCIgKyBjb2xvcls1XSArIGNvbG9yWzZdKSAvIDI1NS4wO1xyXG5cclxuICByZXR1cm4gcmVzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRlcmlhbEdldCgpOiBJTWF0ZXJpYWwge1xyXG4gIGNvbnN0IGFtYmllbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FtYmllbnRQaWNrZXJcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICBjb25zdCBkaWZmdXNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkaWZmdXNlUGlja2VyXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgY29uc3Qgc3BlYyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3BlY3VsYXJQaWNrZXJcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICBjb25zdCB0cmFucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdHJhbnNQaWNrZXJcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICBjb25zdCBwaG9uZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGhvbmdQaWNrZXJcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGFtYmllbnQ6IGNvbG9yVG9EZWNpbWFsKGFtYmllbnQudmFsdWUpLFxyXG4gICAgZGlmZnVzZTogY29sb3JUb0RlY2ltYWwoZGlmZnVzZS52YWx1ZSksXHJcbiAgICBzcGVjdWxhcjogY29sb3JUb0RlY2ltYWwoc3BlYy52YWx1ZSksXHJcbiAgICB0cmFuczogTnVtYmVyKHRyYW5zLnZhbHVlKSxcclxuICAgIHBob25nOiBOdW1iZXIocGhvbmcudmFsdWUpLFxyXG4gIH07XHJcbn1cclxuXHJcbi8qIFVJIGNsYXNzICovXHJcbmV4cG9ydCBjbGFzcyBVSSB7XHJcbiAgc3RhdGljIHNjZW5lOiBTY2VuZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgc3RhdGljIGluaXRpYWxpemUoKTogdm9pZCB7XHJcbiAgICAvKiBIVE1MIGVsZW1lbnRzIHF1ZXJ5IHNlbGVjdCAqL1xyXG4gICAgY29uc3Qgc2hhcGVTZWxlY3QxID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgXCIjc2hhcGVTZWxlY3QxXCJcclxuICAgICkgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcblxyXG4gICAgY29uc3Qgc2hhcGVFZGl0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgXCIjc2hhcGVFZGl0QnV0dG9uXCJcclxuICAgICkgYXMgSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsO1xyXG5cclxuICAgIGNvbnN0IHNoYXBlRGVsZXRlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgXCIjc2hhcGVEZWxldGVCdXR0b25cIlxyXG4gICAgKSBhcyBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGw7XHJcblxyXG4gICAgLy8gY29uc3QgaGVscFRleHRQYXJhZ3JhcGggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgLy8gICBcIiNoZWxwVGV4dFwiXHJcbiAgICAvLyApIGFzIEhUTUxQYXJhZ3JhcGhFbGVtZW50IHwgbnVsbDtcclxuXHJcbiAgICBjb25zdCBzY2VuZVNhdmVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICBcIiNzY2VuZVNhdmVCdXR0b25cIlxyXG4gICAgKSBhcyBIVE1MUGFyYWdyYXBoRWxlbWVudCB8IG51bGw7XHJcblxyXG4gICAgY29uc3Qgc2NlbmVTZWxlY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICBcIiNzY2VuZVNlbGVjdFwiXHJcbiAgICApIGFzIEhUTUxTZWxlY3RFbGVtZW50IHwgbnVsbDtcclxuXHJcbiAgICBjb25zdCBzaGFwZVRlbXBsYXRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgIFwiI3NoYXBlVGVtcGxhdGVzXCJcclxuICAgICkgYXMgSFRNTFBhcmFncmFwaEVsZW1lbnQgfCBudWxsO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgIXNoYXBlU2VsZWN0MSB8fFxyXG4gICAgICAhc2hhcGVFZGl0QnV0dG9uIHx8XHJcbiAgICAgICFzaGFwZURlbGV0ZUJ1dHRvbiB8fFxyXG4gICAgICAvLyAhaGVscFRleHRQYXJhZ3JhcGggfHxcclxuICAgICAgIXNjZW5lU2F2ZUJ1dHRvbiB8fFxyXG4gICAgICAhc2NlbmVTZWxlY3QgfHxcclxuICAgICAgIXNoYXBlVGVtcGxhdGVzXHJcbiAgICApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLyogRW5kIG9mICdIVE1MIGVsZW1lbnRzIHF1ZXJ5IHNlbGVjdCcgKi9cclxuXHJcbiAgICAvKioqKioqKioqKlxyXG4gICAgICogKiAqICogKlxyXG4gICAgICogKiAqICogKlxyXG4gICAgICogVGVtcGxhdGVzIGxvYWRcclxuICAgICAqICogKiAqICpcclxuICAgICAqICogKiAqICpcclxuICAgICAqICogKiAqICpcclxuICAgICAqKioqKioqKioqL1xyXG4gICAgbGV0IHRtcGw6IHN0cmluZyA9IFwiXCI7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFNoYXBlLmdsb2JhbFNoYXBlVHlwZXMubmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdG1wbCArPVxyXG4gICAgICAgIFNoYXBlLmdsb2JhbFNoYXBlVHlwZXMubmFtZXNbaV0gK1xyXG4gICAgICAgIFwiOiBcIiArXHJcbiAgICAgICAgU2hhcGUuZ2xvYmFsU2hhcGVUeXBlcy5kZXNjcmlwdGlvbnNbaV0gK1xyXG4gICAgICAgIFwiXFxuXCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2hhcGVUZW1wbGF0ZXMuaW5uZXJUZXh0ID0gdG1wbDtcclxuXHJcbiAgICAvKioqKioqKioqKlxyXG4gICAgICogKiAqICogKlxyXG4gICAgICogKiAqICogKlxyXG4gICAgICogU2NlbmVzIGxvYWRcclxuICAgICAqICogKiAqICpcclxuICAgICAqICogKiAqICpcclxuICAgICAqICogKiAqICpcclxuICAgICAqKioqKioqKioqL1xyXG4gICAgbGV0IGZvcmJpZGRlbiA9IFtcclxuICAgICAgXCJsZW5ndGhcIixcclxuICAgICAgXCJjbGVhclwiLFxyXG4gICAgICBcImdldEl0ZW1cIixcclxuICAgICAgXCJrZXlcIixcclxuICAgICAgXCJyZW1vdmVJdGVtXCIsXHJcbiAgICAgIFwic2V0SXRlbVwiLFxyXG4gICAgXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IHNjZW5lIGluIHdpbmRvdy5sb2NhbFN0b3JhZ2UpIHtcclxuICAgICAgbGV0IGIgPSBmb3JiaWRkZW4uZmluZCgodmFsdWUpID0+IHtcclxuICAgICAgICByZXR1cm4gdmFsdWUgPT0gc2NlbmU7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCFiKSB7XHJcbiAgICAgICAgc2NlbmVTZWxlY3Qub3B0aW9ucy5hZGQobmV3IE9wdGlvbihzY2VuZSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IGZpcnN0IHNjZW5lIGFzIGRlZmF1bHRcclxuICAgIGlmIChzY2VuZVNlbGVjdC5vcHRpb25zLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgIHNjZW5lU2VsZWN0Lm9wdGlvbnNbc2NlbmVTZWxlY3Qub3B0aW9ucy5sZW5ndGggLSAxXS5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqKioqKioqKipcclxuICAgICAqICogKiAqICpcclxuICAgICAqICogKiAqICpcclxuICAgICAqIFNoYXBlIHNlbGVjdCBpbnB1dFxyXG4gICAgICogKiAqICogKlxyXG4gICAgICogKiAqICogKlxyXG4gICAgICogKiAqICogKlxyXG4gICAgICoqKioqKioqKiovXHJcbiAgICBzaGFwZVNlbGVjdDEuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgY29uc3Qgc2hhcGVTZWxlY3REaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgIFwiI3NoYXBlU2VsZWN0RGl2XCJcclxuICAgICAgKSBhcyBIVE1MRGl2RWxlbWVudCB8IG51bGw7XHJcblxyXG4gICAgICBpZiAoIXNoYXBlU2VsZWN0RGl2KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2hhcGVTZWxlY3QxLnZhbHVlID09IFwibmV3Li4uXCIpIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJqdXN0QnJcIikgPT0gbnVsbCkge1xyXG4gICAgICAgICAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICAgICAgICAgIGEuaW5uZXJIVE1MID0gXCImbmJzcFwiO1xyXG4gICAgICAgICAgYS5pZCA9IFwianVzdEJyXCI7XHJcblxyXG4gICAgICAgICAgc2hhcGVTZWxlY3REaXYuYXBwZW5kQ2hpbGQoYSk7XHJcblxyXG4gICAgICAgICAgY29uc3Qgc2hhcGVTZWxlY3QyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKTtcclxuICAgICAgICAgIHNoYXBlU2VsZWN0Mi5jbGFzc05hbWUgPSBcImJpZ1RleHRcIjtcclxuICAgICAgICAgIHNoYXBlU2VsZWN0Mi5pZCA9IFwic2hhcGVTZWxlY3QyXCI7XHJcblxyXG4gICAgICAgICAgbGV0IG5hbWVzID0gU2hhcGUuZ2xvYmFsU2hhcGVUeXBlcy5uYW1lcztcclxuXHJcbiAgICAgICAgICBmb3IgKGxldCBuYW1lIG9mIG5hbWVzKSB7XHJcbiAgICAgICAgICAgIGxldCBvcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xyXG4gICAgICAgICAgICBvcHQudGV4dCA9IG5hbWU7XHJcbiAgICAgICAgICAgIHNoYXBlU2VsZWN0Mi5wcmVwZW5kKG9wdCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzaGFwZVNlbGVjdERpdi5hcHBlbmRDaGlsZChzaGFwZVNlbGVjdDIpO1xyXG5cclxuICAgICAgICAgIC8qXHJcbiAgICAgICAgICBzaGFwZVNlbGVjdDIuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBTaGFwZS5nbG9iYWxTaGFwZVR5cGVzLm5hbWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHNoYXBlU2VsZWN0Mi52YWx1ZSA9PSBTaGFwZS5nbG9iYWxTaGFwZVR5cGVzLm5hbWVzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICBoZWxwVGV4dFBhcmFncmFwaC50ZXh0Q29udGVudCA9XHJcbiAgICAgICAgICAgICAgICAgIFNoYXBlLmdsb2JhbFNoYXBlVHlwZXMuZGVzY3JpcHRpb25zW2ldO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgc2hhcGVTZWxlY3QyLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIpKTtcclxuICAgICAgICAgICovXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHNoYXBlU2VsZWN0MiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICBcIiNzaGFwZVNlbGVjdDJcIlxyXG4gICAgICAgICkgYXMgSFRNTFNlbGVjdEVsZW1lbnQgfCBudWxsO1xyXG4gICAgICAgIGNvbnN0IGp1c3RCciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjanVzdEJyXCIpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKHNoYXBlU2VsZWN0Mikge1xyXG4gICAgICAgICAgc2hhcGVTZWxlY3REaXYucmVtb3ZlQ2hpbGQoc2hhcGVTZWxlY3QyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGp1c3RCcikge1xyXG4gICAgICAgICAgc2hhcGVTZWxlY3REaXYucmVtb3ZlQ2hpbGQoanVzdEJyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLyogRW5kIG9mICdTaGFwZVNlbGVjdDEgYWRkIGV2ZW50IGxpc3RlbmVyJyAqL1xyXG5cclxuICAgIC8qKioqKioqKioqXHJcbiAgICAgKiAqICogKiAqXHJcbiAgICAgKiAqICogKiAqXHJcbiAgICAgKiBTaGFwZSBlZGl0IGJ1dHRvblxyXG4gICAgICogKiAqICogKlxyXG4gICAgICogKiAqICogKlxyXG4gICAgICogKiAqICogKlxyXG4gICAgICoqKioqKioqKiovXHJcbiAgICBzaGFwZUVkaXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xyXG4gICAgICBpZiAoVUkuc2NlbmUgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBzaGFwZVNlbGVjdDEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgIFwiI3NoYXBlU2VsZWN0MVwiXHJcbiAgICAgICkgYXMgSFRNTFNlbGVjdEVsZW1lbnQgfCBudWxsO1xyXG5cclxuICAgICAgaWYgKCFzaGFwZVNlbGVjdDEpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHNoYXBlRWRpdElucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICBcIiNzaGFwZUVkaXRJbnB1dFwiXHJcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcblxyXG4gICAgICBpZiAoIXNoYXBlRWRpdElucHV0KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCB1c2VyRGF0YSA9IHNoYXBlRWRpdElucHV0LnZhbHVlLnNwbGl0KFwiIFwiKS5tYXAoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKHNoYXBlU2VsZWN0MS52YWx1ZSAhPSBcIm5ldy4uLlwiKSB7XHJcbiAgICAgICAgLy8gc2hhcGVTZWxlY3QxLnZhbHVlICE9IFwibmV3Li4uXCJcclxuICAgICAgICBsZXQgaWR4ID0gTnVtYmVyKHNoYXBlU2VsZWN0MS52YWx1ZS5zcGxpdChcIiBcIilbMl0pO1xyXG4gICAgICAgIGxldCB0eXBlID0gVUkuc2NlbmUuZ2xvYmFsU2hhcGVzW2lkeF0uZ2V0VHlwZSgpO1xyXG4gICAgICAgIGxldCBlZGl0ZWRTaGFwZTogU2hhcGUgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgU2hhcGUuZ2xvYmFsU2hhcGVUeXBlcy5udW1iZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAodHlwZSA9PSBTaGFwZS5nbG9iYWxTaGFwZVR5cGVzLm51bWJlcnNbaV0pIHtcclxuICAgICAgICAgICAgdGhpcy5lZGl0U2hhcGUoXHJcbiAgICAgICAgICAgICAgU2hhcGUuZ2xvYmFsU2hhcGVUeXBlcy5jcmVhdGVGcm9tQXJyYXlGdW5jdGlvbnNbaV0oXHJcbiAgICAgICAgICAgICAgICB1c2VyRGF0YSxcclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsR2V0KClcclxuICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgIGlkeFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBzaGFwZVNlbGVjdDEudmFsdWUgPT0gXCJuZXcuLi5cIlxyXG4gICAgICAgIGNvbnN0IHNoYXBlU2VsZWN0MiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICBcIiNzaGFwZVNlbGVjdDJcIlxyXG4gICAgICAgICkgYXMgSFRNTFNlbGVjdEVsZW1lbnQgfCBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIXNoYXBlU2VsZWN0Mikge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHR5cGUgPSBzaGFwZVNlbGVjdDIudmFsdWU7XHJcbiAgICAgICAgbGV0IGNyZWF0ZWRTaGFwZTogU2hhcGUgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgU2hhcGUuZ2xvYmFsU2hhcGVUeXBlcy5uYW1lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKHR5cGUgPT0gU2hhcGUuZ2xvYmFsU2hhcGVUeXBlcy5uYW1lc1tpXSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZFNoYXBlVG9TY2VuZShcclxuICAgICAgICAgICAgICBTaGFwZS5nbG9iYWxTaGFwZVR5cGVzLmNyZWF0ZUZyb21BcnJheUZ1bmN0aW9uc1tpXShcclxuICAgICAgICAgICAgICAgIHVzZXJEYXRhLFxyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWxHZXQoKVxyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBuZXdPcHRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgICAgICAgIFwibmV3XCJcclxuICAgICAgICApIGFzIEhUTUxPcHRpb25FbGVtZW50IHwgbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKG5ld09wdGlvbikge1xyXG4gICAgICAgICAgbmV3T3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgIHNoYXBlU2VsZWN0MS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzaGFwZURlbGV0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNoYXBlU2VsZWN0MSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgXCIjc2hhcGVTZWxlY3QxXCJcclxuICAgICAgKSBhcyBIVE1MU2VsZWN0RWxlbWVudCB8IG51bGw7XHJcblxyXG4gICAgICBpZiAoIXNoYXBlU2VsZWN0MSB8fCBzaGFwZVNlbGVjdDEudmFsdWUgPT0gXCJuZXcuLi5cIikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IGlkeCA9IE51bWJlcihzaGFwZVNlbGVjdDEudmFsdWUuc3BsaXQoXCIgXCIpWzJdKTtcclxuXHJcbiAgICAgIHRoaXMuZGVsZXRlU2hhcGVGcm9tU2NlbmUoaWR4KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKipcclxuICAgICAqIEZvcm1hdCBvZiBzYXZpbmcgc2NlbmU6XHJcbiAgICAgKiAgIC0gZmlyc3Qgb2YgKFNjZW5lLm1heFNoYXBlcyAqIFNoYXBlLnNpemVJbkJ5dGVzIC8gNCkgbnVtYmVycyAtIHNoYXBlIGRhdGFcclxuICAgICAqICAgLSBuZXh0IHRvIGl0LCAoQ2FtZXJhLnNpemVJbkJ5dGVzIC8gNCkgbnVtYmVycyAtIGNhbWVyYSBkYXRhXHJcbiAgICAgKioqL1xyXG4gICAgc2NlbmVTYXZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcclxuICAgICAgaWYgKFVJLnNjZW5lID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgc2NlbmVOYW1lSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgIFwiI3NjZW5lTmFtZUlucHV0XCJcclxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50IHwgbnVsbDtcclxuXHJcbiAgICAgIGlmICghc2NlbmVOYW1lSW5wdXQgfHwgc2NlbmVOYW1lSW5wdXQudmFsdWUgPT0gXCJcIikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShzY2VuZU5hbWVJbnB1dC52YWx1ZSkgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgbGV0IG9wdCA9IG5ldyBPcHRpb24oc2NlbmVOYW1lSW5wdXQudmFsdWUpO1xyXG4gICAgICAgIG9wdC5zZWxlY3RlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHNjZW5lU2VsZWN0Lm9wdGlvbnMuYWRkKG5ldyBPcHRpb24oc2NlbmVOYW1lSW5wdXQudmFsdWUpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFxyXG4gICAgICAgIHNjZW5lTmFtZUlucHV0LnZhbHVlLFxyXG4gICAgICAgIFVJLnNjZW5lLnNoYXBlc1VCT0FycmF5LmNvbmNhdChVSS5zY2VuZS5jYW1lcmFVQk9BcnJheSkudG9TdHJpbmcoKVxyXG4gICAgICApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgc2NlbmVTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgaWYgKFVJLnNjZW5lID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcmVjZWl2ZWQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oc2NlbmVTZWxlY3QudmFsdWUpO1xyXG4gICAgICBpZiAoIXJlY2VpdmVkKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBzaGFwZXNBbmRDYW1lcmFEYXRhID0gcmVjZWl2ZWQuc3BsaXQoXCIsXCIpLm1hcCgoc3RyKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIE51bWJlcihzdHIpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGxldCBpID0gMDtcclxuICAgICAgbGV0IG4gPSAwO1xyXG5cclxuICAgICAgVUkuY2xlYXIoKTtcclxuXHJcbiAgICAgIGZvciAoXHJcbiAgICAgICAgO1xyXG4gICAgICAgIGkgPCAoU2NlbmUubWF4U2hhcGVzICogU2hhcGUuc2l6ZUluQnl0ZXMpIC8gNDtcclxuICAgICAgICBpICs9IFNoYXBlLnNpemVJbkJ5dGVzIC8gNFxyXG4gICAgICApIHtcclxuICAgICAgICBjb25zdCB0eXBlID0gc2hhcGVzQW5kQ2FtZXJhRGF0YVtpICsgM107XHJcbiAgICAgICAgY29uc29sZS5sb2codHlwZSk7XHJcblxyXG4gICAgICAgIGlmICh0eXBlID09IDApIHtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYXJyID0gc2hhcGVzQW5kQ2FtZXJhRGF0YS5zbGljZShpLCBpICsgU2hhcGUuc2l6ZUluQnl0ZXMgLyA0KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhhcnIpO1xyXG5cclxuICAgICAgICBVSS5hZGRTaGFwZVRvU2NlbmUoXHJcbiAgICAgICAgICBTaGFwZS5nbG9iYWxTaGFwZVR5cGVzLmNyZWF0ZUZyb21VQk9EYXRhRnVuY3Rpb25zW3R5cGUgLSAxXShhcnIpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbisrO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnNvbGUubG9nKGBcIlNoYXBlcyBsb2FkZWQ6ICR7bn1cImApO1xyXG4gICAgICBVSS5zY2VuZS5jYW1lcmFVQk9BcnJheSA9IHNoYXBlc0FuZENhbWVyYURhdGEuc2xpY2UoXHJcbiAgICAgICAgKFNjZW5lLm1heFNoYXBlcyAqIFNoYXBlLnNpemVJbkJ5dGVzKSAvIDRcclxuICAgICAgKTtcclxuICAgICAgVUkuc2NlbmUuY2FtZXJhLnVwZGF0ZUZyb21BcnJheShVSS5zY2VuZS5jYW1lcmFVQk9BcnJheSk7XHJcbiAgICAgIFVJLnNjZW5lLmNhbWVyYVVwZGF0ZSgpO1xyXG5cclxuICAgICAgc2hhcGVTZWxlY3QxLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIpKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExldCdzIGhhdmUgc29tZSBmdW5cclxuXHJcbiAgICAvKlxyXG4gICAgY29uc3QgcGxhbmVDaGVja2VyQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgXCIjcGxhbmVDaGVja2VyQnV0dG9uXCJcclxuICAgICkgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcblxyXG4gICAgcGxhbmVDaGVja2VyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcclxuICAgICAgaWYgKFVJLnNjZW5lID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBVSS5zY2VuZS5nbG9iYWxTaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcclxuICAgICAgICBpZiAoc2hhcGUuZGF0YVszXSA9PSAyKSB7XHJcbiAgICAgICAgICBpZiAoc2hhcGUuZGF0YVtTaGFwZS5tYXRlcmlhbFNpemVJbkJ5dGVzIC8gNCArIDddID09IDApIHtcclxuICAgICAgICAgICAgc2hhcGUuZGF0YVtTaGFwZS5tYXRlcmlhbFNpemVJbkJ5dGVzIC8gNCArIDddID0gMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNoYXBlLmRhdGFbU2hhcGUubWF0ZXJpYWxTaXplSW5CeXRlcyAvIDQgKyA3XSA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgKi9cclxuICB9XHJcblxyXG4gIHN0YXRpYyBiaW5kU2NlbmUoc2NlbmU6IFNjZW5lKTogdm9pZCB7XHJcbiAgICBVSS5zY2VuZSA9IHNjZW5lO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGFkZFNoYXBlVG9TY2VuZShzaGFwZTogU2hhcGUgfCB1bmRlZmluZWQpOiB2b2lkIHtcclxuICAgIGlmIChVSS5zY2VuZSA9PSB1bmRlZmluZWQgfHwgc2hhcGUgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBVSS5zY2VuZS5hZGQoc2hhcGUpO1xyXG5cclxuICAgIGNvbnN0IHNoYXBlU2VsZWN0MSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgIFwiI3NoYXBlU2VsZWN0MVwiXHJcbiAgICApIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xyXG5cclxuICAgIGxldCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xyXG4gICAgb3B0aW9uLnRleHQgPSBzaGFwZS5yZXByZXNlbnRhdGUoVUkuc2NlbmUpO1xyXG4gICAgb3B0aW9uLmlkID0gc2hhcGUucmVwcmVzZW50YXRlKFVJLnNjZW5lKTtcclxuICAgIG9wdGlvbi5kZWZhdWx0U2VsZWN0ZWQgPSB0cnVlO1xyXG5cclxuICAgIHNoYXBlU2VsZWN0MS5wcmVwZW5kKG9wdGlvbik7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZWRpdFNoYXBlKHNoYXBlOiBTaGFwZSB8IHVuZGVmaW5lZCwgaWR4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmIChVSS5zY2VuZSA9PSB1bmRlZmluZWQgfHwgc2hhcGUgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCBpZCA9IFVJLnNjZW5lLmdsb2JhbFNoYXBlc1tpZHhdLnJlcHJlc2VudGF0ZShVSS5zY2VuZSk7XHJcbiAgICBsZXQgb3B0aW9uVG9DaGFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgICAgaWRcclxuICAgICkgYXMgSFRNTE9wdGlvbkVsZW1lbnQgfCBudWxsO1xyXG5cclxuICAgIFVJLnNjZW5lLmVkaXQoc2hhcGUsIGlkeCk7XHJcblxyXG4gICAgaWYgKG9wdGlvblRvQ2hhbmdlKSB7XHJcbiAgICAgIG9wdGlvblRvQ2hhbmdlLnRleHQgPSBvcHRpb25Ub0NoYW5nZS5pZCA9IFVJLnNjZW5lLmdsb2JhbFNoYXBlc1tcclxuICAgICAgICBpZHhcclxuICAgICAgXS5yZXByZXNlbnRhdGUoVUkuc2NlbmUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRlbGV0ZVNoYXBlRnJvbVNjZW5lKGRlbGV0ZUluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmIChVSS5zY2VuZSA9PSB1bmRlZmluZWQgfHwgZGVsZXRlSW5kZXggPiBVSS5zY2VuZS5hbW91bnRPZlNoYXBlcyAtIDEpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNoYXBlU2VsZWN0MSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgIFwiI3NoYXBlU2VsZWN0MVwiXHJcbiAgICApIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xyXG5cclxuICAgIGxldCBvcHRpb25zQXJyYXkgPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBvcHRpb24gb2Ygc2hhcGVTZWxlY3QxLm9wdGlvbnMpIHtcclxuICAgICAgaWYgKG9wdGlvbi52YWx1ZSAhPSBcIm5ldy4uLlwiKSB7XHJcbiAgICAgICAgb3B0aW9uc0FycmF5LnB1c2gob3B0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IG9wdGlvbiBvZiBvcHRpb25zQXJyYXkpIHtcclxuICAgICAgbGV0IGlkeCA9IE51bWJlcihvcHRpb24udGV4dC5zcGxpdChcIiBcIilbMl0pO1xyXG5cclxuICAgICAgaWYgKGlkeCA+IGRlbGV0ZUluZGV4KSB7XHJcbiAgICAgICAgVUkuc2NlbmUuZ2xvYmFsU2hhcGVzW2lkeF0uaW5kZXgtLTtcclxuXHJcbiAgICAgICAgb3B0aW9uLnRleHQgPSBvcHRpb24uaWQgPSBVSS5zY2VuZS5nbG9iYWxTaGFwZXNbaWR4XS5yZXByZXNlbnRhdGUoXHJcbiAgICAgICAgICBVSS5zY2VuZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSBpZiAoaWR4ID09IGRlbGV0ZUluZGV4KSB7XHJcbiAgICAgICAgc2hhcGVTZWxlY3QxLnJlbW92ZUNoaWxkKG9wdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIFVJLnNjZW5lLnJlbW92ZShkZWxldGVJbmRleCk7XHJcblxyXG4gICAgc2hhcGVTZWxlY3QxLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIpKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnNBcnJheSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc2F2ZVNjZW5lVG9Mb2NhbFN0b3JhZ2UobmFtZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKG5hbWUpICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2NlbmVTYXZlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgXCIjc2NlbmVTYXZlQnV0dG9uXCJcclxuICAgICkgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcbiAgICBjb25zdCBzY2VuZU5hbWVJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgIFwiI3NjZW5lTmFtZUlucHV0XCJcclxuICAgICkgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcblxyXG4gICAgaWYgKCFzY2VuZVNhdmVCdXR0b24gfHwgIXNjZW5lTmFtZUlucHV0KSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZU5hbWVJbnB1dC52YWx1ZSA9IG5hbWU7XHJcbiAgICBzY2VuZVNhdmVCdXR0b24uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjbGlja1wiKSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICBpZiAoVUkuc2NlbmUgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgYW0gPSBVSS5zY2VuZS5hbW91bnRPZlNoYXBlcztcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYW07IGkrKykge1xyXG4gICAgICBVSS5kZWxldGVTaGFwZUZyb21TY2VuZSgwKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiLyogS29wdGVsb3YgTmlraXRhLCAxMC0xLCAwNy4wNi4yMDI0ICovXHJcblxyXG5pbnRlcmZhY2UgSUR5bmFtaWMge1xyXG4gIFtrZXk6IHN0cmluZ106IGFueTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIElucHV0IHtcclxuICBrZXlzOiBJRHluYW1pYztcclxuICBrZXlzQ2xpY2s6IElEeW5hbWljO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMua2V5cyA9IHt9O1xyXG4gICAgdGhpcy5rZXlzQ2xpY2sgPSB7fTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgIHRoaXMua2V5c1tldmVudC5rZXldID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgdGhpcy5rZXlzW2V2ZW50LmtleV0gPSBmYWxzZTtcclxuICAgICAgdGhpcy5rZXlzQ2xpY2tbZXZlbnQua2V5XSA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICByZXNwb25zZSgpIHtcclxuICAgIGZvciAobGV0IGtleSBpbiB0aGlzLmtleXMpIHtcclxuICAgICAgaWYgKCF0aGlzLmtleXNba2V5XSAmJiAhdGhpcy5rZXlzQ2xpY2tba2V5XSkge1xyXG4gICAgICAgIHRoaXMua2V5c0NsaWNrW2tleV0gPSB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMua2V5c0NsaWNrW2tleV0gPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2hlY2tLZXlzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXRoaXMua2V5c1trZXldKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgY2hlY2tLZXlzQ2xpY2soa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICghdGhpcy5rZXlzQ2xpY2tba2V5XSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuIiwiLyogS29wdGVsb3YgTmlraXRhLCAxMC0xLCAwNS4wNi4yMDI0ICovXHJcblxyXG4vLyBXQVNEXHJcbi8vIEZyYW1lIHNpemUgY2hhbmdlXHJcbi8vIFNldCBvYmplY3RzIG9uIHNjZW5lXHJcblxyXG4vKiBJbXBvcnRzICovXHJcbmltcG9ydCB7IHdyaXRlRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHsgVGltZXIgfSBmcm9tIFwiLi90aW1lclwiO1xyXG5pbXBvcnQgeyBTaGFkZXIgfSBmcm9tIFwiLi9zaGFkZXJcIjtcclxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIi4vYnVmZmVyXCI7XHJcbmltcG9ydCB7IFZlYzIsIHZlYzJTZXQsIFZlYzMsIHZlYzNTZXQsIFZlYzQsIHZlYzRTZXQsIE1hdDQgfSBmcm9tIFwiLi9tdGhcIjtcclxuaW1wb3J0IHsgVUJPIH0gZnJvbSBcIi4vdWJvXCI7XHJcbmltcG9ydCB7IFNoYXBlLCBTcGhlcmUsIFBsYW5lLCBUb3J1cyB9IGZyb20gXCIuL3NoYXBlc1wiO1xyXG5pbXBvcnQgeyBTY2VuZSB9IGZyb20gXCIuL3NjZW5lXCI7XHJcbmltcG9ydCB7IFVJIH0gZnJvbSBcIi4vdWlcIjtcclxuaW1wb3J0IHsgQ2FtZXJhIH0gZnJvbSBcIi4vY2FtZXJhXCI7XHJcbmltcG9ydCB7IElucHV0IH0gZnJvbSBcIi4vaW5wdXRcIjtcclxuaW1wb3J0IHsgRmlsZXIgfSBmcm9tIFwiLi90b29sc1wiO1xyXG5cclxubGV0IGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xyXG5cclxuLyogRHJhdyBzY2VuZSBpbnRlcmZhY2UgKi9cclxuaW50ZXJmYWNlIElEcmF3U2NlbmVEYXRhIHtcclxuICBzaGFkZXI6IFNoYWRlcjtcclxuICBidWZmZXI6IEJ1ZmZlcjtcclxuICB1Ym9zOiBVQk9bXTtcclxufVxyXG5cclxuLyogR2xvYmFsIHNjZW5lIGRhdGEgKi9cclxuY29uc3QgZ2xvYmFsU2hhZGVyUmVsb2FkVGltZSA9IDEwMDAwMDAwMDsgLy8gaW4gc2Vjb25kcyAob25lIHRpbWUgaW4gMyB5ZWFycylcclxubGV0IGdsb2JhbEJ1ZmZlcjogQnVmZmVyO1xyXG5sZXQgZ2xvYmFsU2hhZGVyOiBTaGFkZXI7XHJcblxyXG5sZXQgZ2xvYmFsU2NlbmU6IFNjZW5lO1xyXG5sZXQgZ2xvYmFsVGltZXIgPSBuZXcgVGltZXIoKTtcclxubGV0IGdsb2JhbENhbWVyYTogQ2FtZXJhO1xyXG5cclxuLyogU2NlbmUgVUJPOlxyXG4gKiB2ZWM0IHN5bmM7XHJcbiAqIC0tLS0gb2Zmc2V0OiA0XHJcbiAqIHZlYzQgY2FtTG9jRnJhbWVXO1xyXG4gKiB2ZWM0IGNhbURpckZyYW1lSDtcclxuICogdmVjNCBjYW1BdFByb2pEaXN0O1xyXG4gKiB2ZWM0IGNhbVJpZ2h0V3A7XHJcbiAqIHZlYzQgY2FtVXBIcDtcclxuICogLS0tLSArMjQgZmxvYXRzIC0tLT4gOTYgYnl0ZXNcclxuICogbWF0NCBtYXRyVmlldztcclxuICogbWF0NCBtYXRyUHJvajtcclxuICogbWF0NCBtYXRyVlA7XHJcbiAqIC0tLS0gKzQ4IGZsb2F0cyAtLS0+IDE5MiBieXRlc1xyXG4gKiAtLS0tIG9mZnNldDogNDggKyAyNCA9IDcyLCAyODggYnl0ZXNcclxuICogU2hhcGVEYXRhIHNoYXBlRGF0YVs2NF07XHJcbiAqIC0tLS0gKzY0ICogU2hhcGUuc2l6ZUluQnl0ZXNcclxuICovXHJcbmxldCBnbG9iYWxUaW1lclVCTzogVUJPO1xyXG5sZXQgZ2xvYmFsVGltZXJVQk9CdWY6IEFycmF5PG51bWJlcj47XHJcblxyXG5sZXQgZ2xvYmFsSW5wdXQgPSBuZXcgSW5wdXQoKTtcclxuXHJcbmZ1bmN0aW9uIGluaXRpYWxpemVHTCgpOiB2b2lkIHtcclxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgXCIjZ2xDYW52YXNcIlxyXG4gICkgYXMgSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsO1xyXG4gIGlmICghY2FudmFzKSByZXR1cm47XHJcblxyXG4gIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdsMlwiKTtcclxuICBpZiAoIWN0eCkgcmV0dXJuO1xyXG5cclxuICBnbCA9IGN0eDtcclxuXHJcbiAgZ2xvYmFsQ2FtZXJhID0gbmV3IENhbWVyYShjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gIGdsb2JhbENhbWVyYS5zZXQodmVjM1NldCgwLCAxLCAtNSksIHZlYzNTZXQoMCksIHZlYzNTZXQoMCwgMSwgMCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3U2NlbmUoKTogdm9pZCB7XHJcbiAgZ2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApOyAvLyBDbGVhciB0byBibGFjaywgZnVsbHkgb3BhcXVlXHJcbiAgZ2wuY2xlYXJEZXB0aCgxLjApOyAvLyBDbGVhciBldmVyeXRoaW5nXHJcbiAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpOyAvLyBFbmFibGUgZGVwdGggdGVzdGluZ1xyXG4gIGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpOyAvLyBOZWFyIHRoaW5ncyBvYnNjdXJlIGZhciB0aGluZ3NcclxuICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XHJcblxyXG4gIGNvbnN0IG51bUNvbXBvbmVudHMgPSAyOyAvLyBwdWxsIG91dCAyIHZhbHVlcyBwZXIgaXRlcmF0aW9uXHJcbiAgY29uc3QgdHlwZSA9IGdsLkZMT0FUOyAvLyB0aGUgZGF0YSBpbiB0aGUgYnVmZmVyIGlzIDMyYml0IGZsb2F0c1xyXG4gIGNvbnN0IG5vcm1hbGl6ZSA9IGZhbHNlOyAvLyBkb24ndCBub3JtYWxpemVcclxuICBjb25zdCBzdHJpZGUgPSAwOyAvLyBob3cgbWFueSBieXRlcyB0byBnZXQgZnJvbSBvbmUgc2V0IG9mIHZhbHVlcyB0byB0aGUgbmV4dFxyXG4gIC8vIDAgPSB1c2UgdHlwZSBhbmQgbnVtQ29tcG9uZW50cyBhYm92ZVxyXG4gIGNvbnN0IG9mZnNldCA9IDA7IC8vIGhvdyBtYW55IGJ5dGVzIGluc2lkZSB0aGUgYnVmZmVyIHRvIHN0YXJ0IGZyb21cclxuICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZ2xvYmFsQnVmZmVyLmJ1ZmZlcklEKTtcclxuICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKFxyXG4gICAgZ2wuZ2V0QXR0cmliTG9jYXRpb24oZ2xvYmFsU2hhZGVyLnNoYWRlclByb2dyYW0sIFwiaW5Qb3NcIiksXHJcbiAgICBudW1Db21wb25lbnRzLFxyXG4gICAgdHlwZSxcclxuICAgIG5vcm1hbGl6ZSxcclxuICAgIHN0cmlkZSxcclxuICAgIG9mZnNldFxyXG4gICk7XHJcbiAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoXHJcbiAgICBnbC5nZXRBdHRyaWJMb2NhdGlvbihnbG9iYWxTaGFkZXIuc2hhZGVyUHJvZ3JhbSwgXCJpblBvc1wiKVxyXG4gICk7XHJcblxyXG4gIGdsb2JhbFNoYWRlci51c2UoKTtcclxuXHJcbiAgLyogVUJPIHVwZGF0ZSAmIGFwcGx5ICovXHJcbiAgZ2xvYmFsVGltZXJVQk9CdWZbMF0gPSBnbG9iYWxUaW1lci5nbG9iYWwudGltZTtcclxuICBnbG9iYWxUaW1lclVCT0J1ZlsxXSA9IGdsb2JhbFRpbWVyLmdsb2JhbC5nbG9iYWxUaW1lO1xyXG4gIGdsb2JhbFRpbWVyVUJPQnVmWzJdID0gZ2xvYmFsVGltZXIuZ2xvYmFsLmRlbHRhVGltZTtcclxuICBnbG9iYWxUaW1lclVCT0J1ZlszXSA9IGdsb2JhbFRpbWVyLmdsb2JhbC5nbG9iYWxEZWx0YVRpbWU7XHJcbiAgZ2xvYmFsVGltZXJVQk8udXBkYXRlKG5ldyBGbG9hdDMyQXJyYXkoZ2xvYmFsVGltZXJVQk9CdWYpKTtcclxuICBnbG9iYWxUaW1lclVCTy5hcHBseSgpO1xyXG5cclxuICBnbG9iYWxTY2VuZS5jYW1lcmFVcGRhdGUoKTtcclxuICBnbG9iYWxTY2VuZS5jYW1lcmFVQk8uYXBwbHkoKTtcclxuXHJcbiAgZ2xvYmFsU2NlbmUuc2hhcGVzVUJPLmFwcGx5KCk7XHJcblxyXG4gIHtcclxuICAgIGNvbnN0IG9mZnNldCA9IDA7XHJcbiAgICBjb25zdCB2ZXJ0ZXhDb3VudCA9IDQ7XHJcbiAgICBnbC5kcmF3QXJyYXlzKGdsLlRSSUFOR0xFX1NUUklQLCBvZmZzZXQsIHZlcnRleENvdW50KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYWluKCkge1xyXG4gIGluaXRpYWxpemVHTCgpO1xyXG4gIFVJLmluaXRpYWxpemUoKTtcclxuXHJcbiAgZ2xvYmFsU2hhZGVyID0gbmV3IFNoYWRlcihnbCwgXCJtYWluX3NoYWRlclwiKTtcclxuICBhd2FpdCBnbG9iYWxTaGFkZXIubG9hZCgpO1xyXG5cclxuICBnbG9iYWxTY2VuZSA9IG5ldyBTY2VuZShnbCwgZ2xvYmFsU2hhZGVyLCBnbG9iYWxDYW1lcmEpO1xyXG5cclxuICBsZXQgc3BoZXJlRGVmYXVsdCA9IG5ldyBTcGhlcmUoXHJcbiAgICBuZXcgVmVjMygwLCAxLCAwKSxcclxuICAgIDEuMCxcclxuICAgIFNoYXBlLm1hdGVyaWFsTGliW1wicmVkXCJdXHJcbiAgKTtcclxuXHJcbiAgbGV0IHBsYW5lRGVmYXVsdCA9IG5ldyBQbGFuZShcclxuICAgIG5ldyBWZWMzKDAsIDAsIDApLFxyXG4gICAgbmV3IFZlYzMoMCwgMSwgMCksXHJcbiAgICBTaGFwZS5tYXRlcmlhbExpYltcImJsdWVcIl1cclxuICApO1xyXG5cclxuICBsZXQgdG9ydXNEZWZhdWx0ID0gbmV3IFRvcnVzKFxyXG4gICAgbmV3IFZlYzMoMSwgMC4yLCAtMiksXHJcbiAgICAwLjUsXHJcbiAgICAwLjIsXHJcbiAgICBTaGFwZS5tYXRlcmlhbExpYltcImdyZWVuXCJdXHJcbiAgKTtcclxuXHJcbiAgVUkuYmluZFNjZW5lKGdsb2JhbFNjZW5lKTtcclxuXHJcbiAgVUkuYWRkU2hhcGVUb1NjZW5lKHNwaGVyZURlZmF1bHQpO1xyXG4gIFVJLmFkZFNoYXBlVG9TY2VuZShwbGFuZURlZmF1bHQpO1xyXG4gIFVJLmFkZFNoYXBlVG9TY2VuZSh0b3J1c0RlZmF1bHQpO1xyXG5cclxuICBVSS5zYXZlU2NlbmVUb0xvY2FsU3RvcmFnZShcImRlZmF1bHRcIik7XHJcblxyXG4gIC8qXHJcbiAgVUkuYWRkU2hhcGVUb1NjZW5lKFxyXG4gICAgbmV3IFNwaGVyZShuZXcgVmVjMyg2LCAxLCA2KSwgMSwgU2hhcGUubWF0ZXJpYWxMaWJbXCJncmVlblwiXSlcclxuICApO1xyXG5cclxuICBVSS5hZGRTaGFwZVRvU2NlbmUoXHJcbiAgICBuZXcgU3BoZXJlKG5ldyBWZWMzKDgsIDEsIDgpLCAxLCBTaGFwZS5tYXRlcmlhbExpYltcImdyZWVuXCJdKVxyXG4gICk7XHJcblxyXG4gIFVJLmFkZFNoYXBlVG9TY2VuZShcclxuICAgIG5ldyBTcGhlcmUobmV3IFZlYzMoMTAsIDEsIDEwKSwgMSwgU2hhcGUubWF0ZXJpYWxMaWJbXCJncmVlblwiXSlcclxuICApO1xyXG5cclxuICBVSS5hZGRTaGFwZVRvU2NlbmUoXHJcbiAgICBuZXcgU3BoZXJlKG5ldyBWZWMzKDEyLCAxLCAxMiksIDEsIFNoYXBlLm1hdGVyaWFsTGliW1wiZ3JlZW5cIl0pXHJcbiAgKTtcclxuICAqL1xyXG5cclxuICBnbC5jbGVhckNvbG9yKDEzMSAvIDI1NSwgNzcgLyAyNTUsIDI0IC8gMjU1LCAxKTtcclxuICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUKTtcclxuXHJcbiAgLyogUHJlcGFyZSByYXkgbWFyY2hpbmcgc2NlbmUgcmVzb3VyY2VzICovXHJcbiAgZ2xvYmFsQnVmZmVyID0gbmV3IEJ1ZmZlcihnbCk7XHJcbiAgZ2xvYmFsQnVmZmVyLmJpbmREYXRhKFxyXG4gICAgWzEuMCwgMS4wLCAtMS4wLCAxLjAsIDEuMCwgLTEuMCwgLTEuMCwgLTEuMF0sXHJcbiAgICBnbC5BUlJBWV9CVUZGRVIsXHJcbiAgICBnbC5TVEFUSUNfRFJBV1xyXG4gICk7XHJcblxyXG4gIGdsb2JhbFRpbWVyVUJPID0gbmV3IFVCTyhnbCwgMTYsIFwidGltZXJVQk9cIiwgZ2xvYmFsU2hhZGVyKTtcclxuICBnbG9iYWxUaW1lclVCT0J1ZiA9IG5ldyBBcnJheTxudW1iZXI+KDQpO1xyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGdsb2JhbFRpbWVyVUJPQnVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBnbG9iYWxUaW1lclVCT0J1ZltpXSA9IDA7XHJcbiAgfVxyXG5cclxuICBsZXQgc2hhZGVyUmVsb2FkVGltZSA9IDA7XHJcblxyXG4gIGNvbnN0IGRyYXcgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBnbG9iYWxUaW1lci5yZXNwb25zZSgpO1xyXG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJrZXlkb3duXCIpKTtcclxuICAgIGlucHV0SGFuZGxlKCk7XHJcblxyXG4gICAgaWYgKHNoYWRlclJlbG9hZFRpbWUgPiBnbG9iYWxTaGFkZXJSZWxvYWRUaW1lICogMTAwMCkge1xyXG4gICAgICBzaGFkZXJSZWxvYWRUaW1lID0gMDtcclxuICAgICAgYXdhaXQgZ2xvYmFsU2hhZGVyLmxvYWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaGFkZXJSZWxvYWRUaW1lICs9IGdsb2JhbFRpbWVyLmdsb2JhbC5nbG9iYWxEZWx0YVRpbWU7XHJcbiAgICBkcmF3U2NlbmUoKTtcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XHJcbiAgfTtcclxuXHJcbiAgZHJhdygpO1xyXG59XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKCkgPT4ge1xyXG4gIC8vIHdyaXRlRmlsZVN5bmMoXCJhLnR4dFwiLCBcIjEyM1wiKTtcclxuICBtYWluKCk7XHJcbn0pO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZXZlbnQpID0+IHtcclxuICBsZXQgZGlyID0gZ2xvYmFsQ2FtZXJhLmxvYy5ub3JtYWxpemUoKTtcclxuICBnbG9iYWxDYW1lcmEubG9jID0gZ2xvYmFsQ2FtZXJhLmxvYy5hZGQoXHJcbiAgICBkaXIubXVsKFxyXG4gICAgICAoKGdsb2JhbFRpbWVyLmdsb2JhbC5nbG9iYWxEZWx0YVRpbWUgLyAxMDAwLjApICpcclxuICAgICAgICBldmVudC5kZWx0YVkgKlxyXG4gICAgICAgIGdsb2JhbENhbWVyYS5sb2MubGVuKCkpIC9cclxuICAgICAgICAyMC4wXHJcbiAgICApXHJcbiAgKTtcclxuICBnbG9iYWxDYW1lcmEuc2V0KGdsb2JhbENhbWVyYS5sb2MsIG5ldyBWZWMzKDApLCBuZXcgVmVjMygwLCAxLCAwKSk7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gaW5wdXRIYW5kbGUoKSB7XHJcbiAgbGV0IGRpciA9IG5ldyBWZWMzKDAsIDAsIDEpO1xyXG5cclxuICBkaXIgPSBkaXIucG9pbnRUcmFuc2Zvcm0oTWF0NC5yb3RhdGVZKGdsb2JhbENhbWVyYS5hbmdsZVkpKTtcclxuXHJcbiAgZ2xvYmFsQ2FtZXJhLmRpciA9IGRpcjtcclxuXHJcbiAgaWYgKGdsb2JhbElucHV0LmNoZWNrS2V5cyhcImRcIikpIHtcclxuICAgIGdsb2JhbENhbWVyYS5hbmdsZVkgKz0gKGdsb2JhbFRpbWVyLmdsb2JhbC5nbG9iYWxEZWx0YVRpbWUgLyA3NzcuMCkgKiA1MDtcclxuICB9XHJcbiAgaWYgKGdsb2JhbElucHV0LmNoZWNrS2V5cyhcImFcIikpIHtcclxuICAgIGdsb2JhbENhbWVyYS5hbmdsZVkgLT0gKGdsb2JhbFRpbWVyLmdsb2JhbC5nbG9iYWxEZWx0YVRpbWUgLyA3NzcuMCkgKiA1MDtcclxuICB9XHJcblxyXG4gIGlmIChnbG9iYWxJbnB1dC5jaGVja0tleXMoXCJBcnJvd1VwXCIpKSB7XHJcbiAgICBnbG9iYWxDYW1lcmEuYW5nbGVYWiArPSAoZ2xvYmFsVGltZXIuZ2xvYmFsLmdsb2JhbERlbHRhVGltZSAvIDc3Ny4wKSAqIDUwO1xyXG4gIH1cclxuICBpZiAoZ2xvYmFsSW5wdXQuY2hlY2tLZXlzKFwiQXJyb3dEb3duXCIpKSB7XHJcbiAgICBnbG9iYWxDYW1lcmEuYW5nbGVYWiAtPSAoZ2xvYmFsVGltZXIuZ2xvYmFsLmdsb2JhbERlbHRhVGltZSAvIDc3Ny4wKSAqIDUwO1xyXG4gIH1cclxuXHJcbiAgaWYgKGdsb2JhbElucHV0LmNoZWNrS2V5cyhcIndcIikpIHtcclxuICAgIGdsb2JhbENhbWVyYS5sb2MgPSBnbG9iYWxDYW1lcmEubG9jLmFkZChcclxuICAgICAgZGlyLm11bChcclxuICAgICAgICBnbG9iYWxUaW1lci5nbG9iYWwuZ2xvYmFsRGVsdGFUaW1lIC8gMzMzLjBcclxuICAgICAgICAvLyBOdW1iZXIoZ2xvYmFsSW5wdXQuY2hlY2tLZXlzKFwiU2hpZnRcIikpICogMC4yXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBpZiAoZ2xvYmFsSW5wdXQuY2hlY2tLZXlzKFwic1wiKSkge1xyXG4gICAgZ2xvYmFsQ2FtZXJhLmxvYyA9IGdsb2JhbENhbWVyYS5sb2MuYWRkKFxyXG4gICAgICBkaXIubXVsKFxyXG4gICAgICAgIC1nbG9iYWxUaW1lci5nbG9iYWwuZ2xvYmFsRGVsdGFUaW1lIC8gMzMzLjBcclxuICAgICAgICAvLyBOdW1iZXIoZ2xvYmFsSW5wdXQuY2hlY2tLZXlzKFwiU2hpZnRcIikpICogMC4yXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQTtVQUVhLEtBQUssQ0FBQTtJQUNoQixJQUFBLFNBQVMsQ0FBUztJQUNsQixJQUFBLE9BQU8sQ0FBUztJQUNoQixJQUFBLFVBQVUsQ0FBUztJQUNuQixJQUFBLFNBQVMsQ0FBUztJQUNsQixJQUFBLFlBQVksQ0FBUztJQUNyQixJQUFBLE1BQU0sQ0FPSjtJQUVGLElBQUEsV0FBQSxHQUFBO0lBQ0UsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDN0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFB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QUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN6QztTQUNGO0lBRUQsSUFBQSxHQUFHLENBQUMsQ0FBTyxFQUFBO1lBQ1QsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNEO0lBRUQsSUFBQSxHQUFHLENBQUMsQ0FBTyxFQUFBO1lBQ1QsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNEO0lBRUQsSUFBQSxHQUFHLENBQUMsQ0FBUyxFQUFBO1lBQ1gsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3JEO0lBRUQsSUFBQSxHQUFHLENBQUMsQ0FBTyxFQUFBO1lBQ1QsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNuRDtJQUVELElBQUEsS0FBSyxDQUFDLENBQU8sRUFBQTtZQUNYLE9BQU8sSUFBSSxJQUFJLENBQ2IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDM0IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDM0IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDNUIsQ0FBQztTQUNIO1FBRUQsR0FBRyxHQUFBO1lBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV6QixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtJQUN4QixZQUFBLE9BQU8sR0FBRyxDQUFDO2FBQ1o7SUFDRCxRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN2QjtRQUVELElBQUksR0FBQTtJQUNGLFFBQUEsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsU0FBUyxHQUFBO1lBQ1AsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUNqQztJQUVELElBQUEsY0FBYyxDQUFDLENBQU8sRUFBQTtJQUNwQixRQUFBLE9BQU8sSUFBSSxJQUFJLENBQ2IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDeEUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDeEUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDekUsQ0FBQztTQUNIO1FBRUQsT0FBTyxHQUFBO0lBQ0wsUUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQztRQUVELFlBQVksR0FBQTtJQUNWLFFBQUEsT0FBTyxDQUFJLENBQUEsRUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFJLENBQUEsRUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFJLENBQUEsRUFBQSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUM7U0FDMUM7UUFFRCxLQUFLLEdBQUE7SUFDSCxRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkI7SUFDRixDQUFBO0lBRWUsU0FBQSxPQUFPLENBQUMsR0FBRyxJQUFjLEVBQUE7SUFDdkMsSUFBQSxJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0lBQ3pCLFFBQUEsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXJCLFFBQUEsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLEVBQUU7SUFDeEIsWUFBQSxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbkM7aUJBQU07Z0JBQ0wsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzFCO1NBQ0Y7SUFBTSxTQUFBLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUNsQixDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUNoQixDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRW5CLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMxQjtRQUNELE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDO1VBc0RZLElBQUksQ0FBQTtJQUNmLElBQUEsQ0FBQyxDQUFhO0lBRWQsSUFBQSxXQUFBLENBQVksR0FBRyxJQUFjLEVBQUE7SUFDM0IsUUFBQSxJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksRUFBRSxFQUFFO0lBQzFCLFlBQUEsSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtJQUN6QixnQkFBQSxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXZCLElBQUksQ0FBQyxDQUFDLEdBQUc7SUFDUCxvQkFBQSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxvQkFBQSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxvQkFBQSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQyxvQkFBQSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDckMsQ0FBQztpQkFDSDtnQkFDRCxJQUFJLENBQUMsQ0FBQyxHQUFHO0lBQ1AsZ0JBQUEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDWixnQkFBQSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNaLGdCQUFBLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ1osZ0JBQUEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ2IsQ0FBQztnQkFDRixPQUFPO2FBQ1I7WUFDRCxJQUFJLENBQUMsQ0FBQyxHQUFHO0lBQ1AsWUFBQSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxZQUFBLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hELFlBQUEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUQsWUFBQSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUM3RCxDQUFDO1NBQ0g7UUFFRCxPQUFPLGVBQWUsQ0FBQyxHQUFhLEVBQUE7SUFDbEMsUUFBQSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDLEdBQUc7SUFDSixZQUFBLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLFlBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEMsWUFBQSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQyxZQUFBLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDLENBQUM7SUFFRixRQUFBLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7SUFFRCxJQUFBLE9BQU8sU0FBUyxDQUNkLEdBQVcsRUFDWCxHQUFXLEVBQ1gsR0FBVyxFQUNYLEdBQVcsRUFDWCxHQUFXLEVBQ1gsR0FBVyxFQUNYLEdBQVcsRUFDWCxHQUFXLEVBQ1gsR0FBVyxFQUFBO0lBRVgsUUFBQSxRQUNFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDZixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2YsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNmLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDZixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7SUFDZixZQUFBLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUNmO1NBQ0g7SUFFRCxJQUFBLEdBQUcsQ0FBQyxHQUFTLEVBQUE7SUFDWCxRQUFBLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFFbkIsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNQLFlBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdCLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUCxZQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU3QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsWUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0IsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNQLFlBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdCLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUCxZQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU3QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsWUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0IsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNQLFlBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdCLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUCxZQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU3QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsWUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0IsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNQLFlBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdCLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUCxZQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU3QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsWUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0IsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNQLFlBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdCLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUCxZQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU3QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsWUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0IsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNQLFlBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixnQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLGdCQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdCLFFBQUEsT0FBTyxDQUFDLENBQUM7U0FDVjtRQUVELE1BQU0sR0FBQTtZQUNKLFFBQ0UsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxJQUFJLENBQUMsU0FBUyxDQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiO2dCQUNILENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDYjtnQkFDSCxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNYLElBQUksQ0FBQyxTQUFTLENBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2I7Z0JBQ0gsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDWCxJQUFJLENBQUMsU0FBUyxDQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLEVBQ0g7U0FDSDtRQUVELFNBQVMsR0FBQTtJQUNQLFFBQUEsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUVuQixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV6QixRQUFBLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7UUFFRCxPQUFPLEdBQUE7SUFDTCxRQUFBLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLEVBQ2hCLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFFdEIsUUFBQSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUU7SUFDWixZQUFBLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3hCO0lBRUQsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLElBQUksQ0FBQyxTQUFTLENBQ2IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2IsR0FBRyxHQUFHLENBQUM7SUFFVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDYixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDYixHQUFHLEdBQUcsQ0FBQztJQUVWLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUNiLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLEdBQUcsR0FBRyxDQUFDO0lBRVYsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLElBQUksQ0FBQyxTQUFTLENBQ2IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2IsR0FBRyxHQUFHLENBQUM7SUFFVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDYixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDYixHQUFHLEdBQUcsQ0FBQztJQUVWLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUNiLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLEdBQUcsR0FBRyxDQUFDO0lBRVYsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLElBQUksQ0FBQyxTQUFTLENBQ2IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2IsR0FBRyxHQUFHLENBQUM7SUFFVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDYixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDYixHQUFHLEdBQUcsQ0FBQztJQUVWLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUNiLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLEdBQUcsR0FBRyxDQUFDO0lBRVYsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLElBQUksQ0FBQyxTQUFTLENBQ2IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2IsR0FBRyxHQUFHLENBQUM7SUFFVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDYixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDYixHQUFHLEdBQUcsQ0FBQztJQUVWLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUNiLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLEdBQUcsR0FBRyxDQUFDO0lBRVYsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLElBQUksQ0FBQyxTQUFTLENBQ2IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2IsR0FBRyxHQUFHLENBQUM7SUFFVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDYixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDYixHQUFHLEdBQUcsQ0FBQztJQUVWLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUNiLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLEdBQUcsR0FBRyxDQUFDO0lBRVYsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLElBQUksQ0FBQyxTQUFTLENBQ2IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2IsR0FBRyxHQUFHLENBQUM7SUFFVixRQUFBLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7SUFFRCxJQUFBLE9BQU8sUUFBUSxHQUFBO0lBQ2IsUUFBQSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBRW5CLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3RC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LENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQ2hCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNmLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLFFBQUEsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWQsUUFBQSxPQUFPLENBQUMsQ0FBQztTQUNWO1FBRUQsT0FBTyxPQUFPLENBQUMsS0FBYSxFQUFBO0lBQzFCLFFBQUEsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUVuQixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQ2hCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNmLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLFFBQUEsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWQsUUFBQSxPQUFPLENBQUMsQ0FBQztTQUNWO0lBRUQsSUFBQSxPQUFPLE1BQU0sQ0FBQyxDQUFPLEVBQUUsS0FBYSxFQUFBO0lBQ2xDLFFBQUEsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUVuQixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQ2hCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNmLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLFFBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRXRCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEMsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUMsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFZCxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWQsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUMsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWQsUUFBQSxPQUFPLENBQUMsQ0FBQztTQUNWO0lBRUQsSUFBQSxPQUFPLElBQUksQ0FBQyxHQUFTLEVBQUUsRUFBUSxFQUFFLEdBQVMsRUFBQTtJQUN4QyxRQUFBLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFFbkIsUUFBQSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUMvQixLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFDbEMsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDcEMsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTFELFFBQUEsT0FBTyxDQUFDLENBQUM7U0FDVjtJQUVELElBQUEsT0FBTyxPQUFPLENBQ1osQ0FBUyxFQUNULENBQVMsRUFDVCxDQUFTLEVBQ1QsQ0FBUyxFQUNULENBQVMsRUFDVCxDQUFTLEVBQUE7SUFFVCxRQUFBLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7WUFFbkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTFDLFFBQUEsT0FBTyxDQUFDLENBQUM7U0FDVjtRQUVELE9BQU8sR0FBQTtZQUNMLE9BQU87SUFDTCxZQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1osWUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNaLFlBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDWixZQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1osWUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNaLFlBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDWixZQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1osWUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNaLFlBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDWixZQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1osWUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FB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M0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVDLFFBQUEsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFckIsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVDLFFBQUEsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFckIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzVDLFFBQUEsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFFBQUEsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFdEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlDLFFBQUEsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFdkIsUUFBQSxJQUFJLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBUyxFQUFFLENBQUMsQ0FBQztJQUVwQyxRQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVCLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzFCO1lBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTlDLFFBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDNUIsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUI7WUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFOUMsUUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM1QixPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQjtZQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM3QztRQUVELE9BQU8sQ0FBQyxNQUFxQixFQUFFLE1BQWMsRUFBQTtJQUMzQyxRQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLFFBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEMsUUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRXJDLFFBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEMsUUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwQyxRQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFFckMsUUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuQyxRQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25DLFFBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUV4QyxRQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLFFBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkMsUUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRXRDLFFBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDcEMsUUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNwQyxRQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFFdkMsUUFBQSxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ2hDLFlBQUEsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRTtvQkFDaEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3JFO2FBQ0Y7SUFFRCxRQUFBLEtBQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdB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
