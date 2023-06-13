import { cameraCreate, matrIdentity, vec3, vec3Set, matrScale,
         vec4, vec4Set, d2r, r2d,
         matrRotate, matrRotateX, matrRotateY, matrRotateZ, matrTranslate } from "./mth.js";

import { foo, prim } from "./prim.js";
import { shader } from "./shader.js";
import { material } from "./material.js";

// Global WebGL context
let gl, cam, canvas;

export { gl, cam };

function handle() {

}

function loadShader(type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Shader not compiled!")
    }

    return shader;
}

export function initGL(canvasID) {
    // console.log(123);
    // let v = new vec3(3, 4, 5);
    // v.check();
    // foo();

    const init = () => {
        canvas = document.getElementById(canvasID);
        gl = canvas.getContext("webgl2");

        gl.clearColor(0.514, 0.302, 0.094, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        cam = cameraCreate(gl);
        cam.resize(canvas.width, canvas.height);
        cam.set(vec3Set(20, 20, 30), vec3Set(0), vec3Set(0, 1, 0));
        // cam.set(vec3Set(0, 20, 20), vec3Set(0), vec3Set(0, 1, 0));
    }

    const render = () => {
        const vs = `#version 300 es
            precision highp float;
            layout(location = 0) in vec3 in_pos;
            layout(location = 1) in vec4 in_color;
            layout(location = 2) in vec3 in_normal; 
            uniform mat4 matrW, matrWInv, matrWVP; 
            out vec4 v_color;
            out vec3 v_pos, v_normal;

            void main() {
                gl_Position = matrWVP * vec4(in_pos, 1);
                gl_PointSize = 4.0;
                v_color = in_color;
                v_pos = (matrW * vec4(in_pos, 1)).xyz;
                v_normal = mat3(matrWInv) * in_normal;
            }
        `;

        const fs = `#version 300 es
            precision highp float;
            out vec4 f_color;
            in vec4 v_color;
            in vec3 v_pos, v_normal;
            uniform vec3 camLoc, ka, kd, ks;
            uniform float ph;
            uniform bool sh;

            vec3 shade(vec3 p, vec3 n) {
                vec3 l = normalize(vec3(1, 2, 3));
                vec3 lc = vec3(1);
                vec3 color = vec3(0);
                vec3 v = normalize(p - camLoc);

                color = ka;

                n = faceforward(n, v, n);

                color += max(0.0, dot(n, l)) * kd * lc; 

                vec3 r = reflect(v, n);
                color += pow(max(0.0, dot(r, l)), ph) * ks * lc;

                return color;
            }

            void main() {
                if (sh) {
                    f_color = vec4(shade(v_pos, normalize(v_normal)), 1);
                }
                else {
                    f_color = v_color;
                }
            }
        `;

        const vertexSh = loadShader(gl.VERTEX_SHADER, vs);
        const fragmentSh = loadShader(gl.FRAGMENT_SHADER, fs);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexSh);
        gl.attachShader(shaderProgram, fragmentSh);
        gl.linkProgram(shaderProgram);

        let tetra = new prim().tetrahedron();
        let hexa = new prim().hexahedron();
        let octa = new prim().octahedron();
        let axis = new prim().axis();
        let grid = new prim().grid(60, 5, vec4Set(1, 0, 1, 1));
        let random;

        tetra.addShader(shaderProgram);
        hexa.addShader(shaderProgram);
        octa.addShader(shaderProgram);
        axis.addShader(shaderProgram);
        cow.addShader(shaderProgram);
        cow1.addShader(shaderProgram);
        cow2.addShader(shaderProgram);
        grid.addShader(shaderProgram);

        // myPrim.type = gl.LINE_STRIP;

        const timeNow = (t) => {
            return Math.sin(Date.now() / t);
        }

        const timeNowAbs = (t) => {
            return Math.abs(Math.sin(Date.now() / t));
        }

        document.body.onkeydown = (ev) => {
            if (ev.key == "Control") {
                let dist, cosT, sinT, plen, cosP, sinP, azimuth, elevator;

                dist = cam.at.sub(cam.loc).len();
                cosT = (cam.loc.y - cam.at.y) / dist;
                sinT = Math.sqrt(1 - cosT * cosT);

                plen = dist * sinT;
                cosP = (cam.loc.z - cam.at.z) / plen;
                sinP = (cam.loc.x - cam.at.x) / plen;

                azimuth = r2d(Math.atan2(sinP, cosP));
                elevator = r2d(Math.atan2(sinT, cosT));
                // ...
            }
        }

        const draw = () => {
            grid = new prim().grid(60, 1 + Math.floor(Math.abs(30 * Math.sin(Date.now() / 1000.0))), vec4Set(Math.sin(Date.now() / 100.0), 0, 1, 1));
            grid.addShader(shaderProgram);

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            cam.resize(canvas.width, canvas.height);

            let m = matrScale(vec3Set(10)).mul(matrRotate(vec3Set(2.5), 200 * Math.sin(Date.now() / 1000.0)));

            if (window.currentFigure == "tetra") {
                tetra.draw(matrTranslate(vec3Set(-0.50, 0, -Math.sqrt(3) / 6)).mul(m));
                // tetra.draw(matrScale(vec3Set(10)));   
            }
            else if (window.currentFigure == "hexa") {
                hexa.draw(matrTranslate(vec3Set(-0.5, -0.5, -0.5)).mul(m));
            }
            else if (window.currentFigure == "octa") {
                octa.draw(matrTranslate(vec3Set(-0.5, 0, -0.5)).mul(matrScale(vec3Set(10))).mul(matrRotateX(200 * Math.sin(Date.now() / 1000.0))));
            }
            else if (window.currentFigure == "random") {
                random.draw(matrScale(vec3Set(1.5)).mul(m));
            }

            if (window.currentFigure != "random") {
                random = new prim().random();
                random.addShader(shaderProgram);
            }

            if (window.axis) {
                axis.draw(matrIdentity());
            }
            if (window.grid) {
                grid.draw(matrRotateY(timeNow(5000) * 200));
            }
            if (window.cow) {
                // cow.draw(matrRotateY(360 * Math.sin(Date.now() / 2000.0)).mul(matrTranslate(vec3Set(0))));
                cow.draw(matrIdentity());
                cow.draw(matrRotateY(180));
                cow.draw(matrRotateY(90));
                cow.draw(matrRotateY(-90));
                cow1.draw(matrRotateY(360 * Math.sin(Date.now() / 2000.0)).mul(matrTranslate(vec3Set(-20, 0, 0))));
                cow2.draw(matrRotateY(360 * Math.sin(Date.now() / 2000.0)).mul(matrTranslate(vec3Set(20, 0, 0))));
            }

            window.addEventListener("wheel", (event) => {
                let x = cam.loc.add(vec3Set(event.deltaY / 10000.0));

                if (x.x > 0 && x.y > 0 && x.z > 0)
                    cam.set(cam.loc.add(vec3Set(event.deltaY / 10000.0)), cam.at, cam.up);
            });

            // myPrim.draw(matrIdentity());
            window.requestAnimationFrame(draw);
        }

        draw();
    }

    let cow, cow1, cow2;
    
    init();
    
    new prim().loadObj("kashmir_cow.obj").then(
        (res) => {
            // cow = JSON.parse(JSON.stringify(res));
            cow = new prim(res);
            let mtl = new material(vec3Set(0.13), vec3Set(0.56), vec3Set(1), 5);
            cow.mtl = mtl;
            cow1 = new prim(res);
            let mtl1 = new material(vec3Set(0.57, 0.2, 0), vec3Set(0.56), vec3Set(1), 25);
            cow1.mtl = mtl1;
            cow2 = new prim(res);
            let mtl2 = new material(vec3Set(0.1, 0, 0), vec3Set(0), vec3Set(0.045), 25);
            cow2.mtl = mtl2;
            render();
        }
    )
}
