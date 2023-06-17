import { cameraCreate, matrIdentity, vec3, vec3Set, matrScale,
         vec4, vec4Set, d2r, r2d,
         matrRotate, matrRotateX, matrRotateY, matrRotateZ, matrTranslate } from "./mth.js";

import { prim } from "./prim.js";
import { material } from "./material.js";
import { timer } from "./timer.js";
import { input } from "./input.js";

import { texture } from "./texture.js";

// Global WebGL context
let gl, cam, tim, inp, canvas;

export { gl, cam, tim, inp };

// Canvas 2D context
function init2D() {
    const canvas = document.getElementById("tutorial");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 6;

    const image = new Image();
    image.addEventListener("load", () => {
        ctx.drawImage(image, 0, 0);
    });
    image.src = "bin/textures/canvas2d.jpg";
    console.log(ctx);
}

function cameraHandle() {
    if (inp.keys[inp.shift] || 1) {
        let dist, cosT, sinT, plen, cosP, sinP, azimuth, elevator;

        dist = cam.at.sub(cam.loc).len();
        cosT = (cam.loc.y - cam.at.y) / dist;
        sinT = Math.sqrt(1 - cosT * cosT);
        plen = dist * sinT;
        cosP = (cam.loc.z - cam.at.z) / plen;
        sinP = (cam.loc.x - cam.at.x) / plen;
        azimuth = r2d(Math.atan2(sinP, cosP));
        elevator = r2d(Math.atan2(sinT, cosT));

        let lc = 0;

        if (inp.m.lClick) lc = 1;

        azimuth += tim.global.globalDeltaTime * 3 * (-4.7 * lc * inp.m.mdx / 1000.0);
    
        elevator += tim.global.globalDeltaTime * 3 * (-4.7 * lc * inp.m.mdy / 1000.0);

        if (elevator < 0.1) {
        elevator = 0.1;
        } else if (elevator > 178.9) {
        elevator = 178.9;
        }

        let alt = 0;

        if (inp.keys[inp.alt]) alt = 1;

        dist += tim.global.globalDeltaTime * (1 + alt * 10) * (inp.m.mdz / 300.0);

        if (dist < 0.1) {
            dist = 0.1;
        }

        if (inp.keys[inp.control]) {    
            let Wp, Hp, sx, sy;
            let dv = new vec3();

            Wp = Hp = cam.projSize;
            if (cam.frameW > cam.frameH) {
                Wp *= cam.frameW / cam.frameH;
            } else {
                Hp *= cam.frameH / cam.frameW;
            }
            sx = -inp.m.mdx * Wp / cam.frameW * dist / cam.projDist;
            sy = inp.m.mdy * Hp / cam.frameH * dist / cam.projDist;

            dv = (cam.right.mul(sx)).add(cam.up.cross(cam.right).mul(sy));
            cam.at = cam.at.add(dv);
            cam.loc = cam.loc.add(dv);
        }

        cam.loc = vec3Set(0, dist, 0).pointTransform(
            (matrRotateX(elevator).mul(matrRotateY(azimuth))).mul(matrTranslate(cam.at))
        );

        cam.set(cam.loc, cam.at, vec3Set(0, 1, 0));
    }

    if (inp.keys['1'.charCodeAt()]) {
        cam.set(vec3Set(0, 200, 300), vec3Set(0), vec3Set(0, 1, 0));
    }

    if (inp.keys['2'.charCodeAt()]) {
        cam.set(vec3Set(0, 200, -300), vec3Set(0), vec3Set(0, 1, 0));
    }
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

    // init2D();

    const init = () => {
        canvas = document.getElementById(canvasID);
        gl = canvas.getContext("webgl2");

        gl.clearColor(0.514, 0.302, 0.094, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - window.innerHeight / 6;

        cam = cameraCreate(gl);
        cam.resize(canvas.width, canvas.height);
        cam.set(vec3Set(20, 20, 30), vec3Set(0), vec3Set(0, 1, 0));
        // cam.set(vec3Set(0, 20, 20), vec3Set(0), vec3Set(0, 1, 0));

        tim = new timer();
        inp = new input();
    }

    const render = () => {
        const vs = `#version 300 es
            precision highp float;
            layout(location = 0) in vec3 in_pos;
            layout(location = 1) in vec4 in_color;
            layout(location = 2) in vec3 in_normal;
            layout(location = 3) in vec2 in_texCoord; 
            uniform mat4 matrW, matrWInv, matrWVP; 
            out vec4 v_color;
            out vec3 v_pos, v_normal;
            out vec2 v_texCoord;

            void main() {
                gl_Position = matrWVP * vec4(in_pos, 1);
                gl_PointSize = 4.0;
                v_color = in_color;
                v_pos = (matrW * vec4(in_pos, 1)).xyz;
                v_normal = mat3(matrWInv) * in_normal;
                v_texCoord = in_texCoord;
            }
        `;

        const fs = `#version 300 es
            precision highp float;
            out vec4 f_color;
            in vec4 v_color;
            in vec3 v_pos, v_normal;
            in vec2 v_texCoord;
            uniform vec3 camLoc, ka, kd, ks;
            uniform float ph;
            uniform bool isShade, isTextured;

            uniform sampler2D texture0;

            vec3 shade(vec3 p, vec3 n) {
                vec3 l = normalize(vec3(1, 15, 10));
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
                if (isShade) {
                    f_color = vec4(pow(shade(v_pos, normalize(v_normal)), vec3(1.0 / 2.2)), 1);
                }
                else if (isTextured) {
                    f_color = texture(texture0, vec2(1, -1) * v_texCoord);
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

        let axis = new prim().axis();
        let grid = new prim().grid(60, 2, vec4Set(1, 0, 1, 1));

        let lamp = new prim().hexahedron();
        lamp.mtl = new material(vec3Set(0.5, 0.8, 0.5), vec3Set(0.3), vec3Set(0.3), 34);
        lamp.isShade = true;

        let table = new prim().rectangle(500, 500);
        table.mtl.addTexture("bin/textures/table3.jpg");

        let random;

        axis.mtl.addShader(shaderProgram);
        cow.mtl.addShader(shaderProgram);
        cow1.mtl.addShader(shaderProgram);
        cow2.mtl.addShader(shaderProgram);
        grid.mtl.addShader(shaderProgram);
        table.mtl.addShader(shaderProgram);
        
        lamp.mtl.addShader(shaderProgram);

        // myPrim.type = gl.LINE_STRIP;

        const timeNow = (t) => {
            return Math.sin(Date.now() / t);
        }

        const timeNowAbs = (t) => {
            return Math.abs(Math.sin(Date.now() / t));
        }

        const draw = () => {
            tim.response();

            cameraHandle();
            
            document.getElementById("fpsText").innerHTML = `<i>FPS:</i> ${tim.global.fps}`;

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            cam.resize(canvas.width, canvas.height);

            axis.draw(matrTranslate(vec3Set(0, 0.5, 0)));

            cow.draw(matrRotateY(Math.sin(tim.global.time / 1000.0) * 360));
            cow1.draw(matrRotateY(Math.sin(tim.global.time / 500.0) * 360).mul(matrTranslate(vec3Set(20, 0, 0))));
            cow2.draw(matrRotateY(Math.sin(tim.global.time / 2000.0) * 360).mul(matrTranslate(vec3Set(-20, 0, 0))));

            table.draw(matrRotateX(-90).mul(matrTranslate(vec3Set(-250, 0, 250))));

            lamp.draw(matrTranslate(vec3Set(1, 15, 10)));

            inp.setDefault();
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
