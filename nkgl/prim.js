// Koptelov Nikita, 09-1, 07.06.2023, NK1

import { vec2, vec2Set, vec3, vec3Set, vec4, d2r, r2d,
         vec4Set, mat4, matrIdentity, matrTranslate,
         matrScale, matrRotateX, matrRotateY, matrRotateZ,
         matrRotate
       } from "./mth.js";

import { gl, cam } from "./render.js";

import { material } from "./material.js";

export function foo() {
    let v = new vec3(102, 47, 8);

    // v.check();
}

async function loadFileAsync(fileName) {
    try {
        const response = await fetch(fileName);
        return response.text();
    }
    catch (err) {
        console.log(err);
    }
}

const
    vertexFormat = "xyzrgbaxyzuv",
    sizeInBytes = vertexFormat.length * 4,
    sizeInNumbers = vertexFormat.length;

class vertex {
    constructor(p, c, n, t) {
        this.p = p;
        this.c = c;
        this.n = n;
        this.t = t;
    }

    toArray() {
        return this.p.toArray().concat(this.c.toArray()).concat(this.n.toArray()).concat(this.t.toArray());
    }
}

function vertexSet() {
    let p, c, n, t;

    if (arguments.length == 4) {
        p = arguments[0];
        c = arguments[1];
        n = arguments[2];
        t = arguments[3];
    }
    else if (arguments.length == 1) {
        let a = arguments[0];

        p = vec3Set(a[0], a[1], a[2]);
        c = vec4Set(a[3], a[4], a[5], a[6]);
        n = vec3Set(a[7], a[8], a[9]);
        t = vec2Set(a[10], a[11]);
    }
    else {
        p = vec3Set(arguments[0], arguments[1], arguments[2]);
        c = vec4Set(arguments[3], arguments[4], arguments[5], arguments[6]);
        n = vec3Set(arguments[7], arguments[8], arguments[9]);
        t = vec2Set(arguments[10], arguments[11]);
    }

    return new vertex(p, c, n, t);
}

function vertexToPrim(array) {
    // array is array of objects of class vertex
    let res = [];
    for (let i = 0; i < array.length; i++) {
        if (array[0].constructor.name == "vertex") {
            res = res.concat(array[i].toArray());
        }
        else {
            res = res.concat(array[i]);
        }
    }

    return res;
}

class buffer {
    constructor(gl_buffer_type) {
        this.type = gl_buffer_type;
        this.buf = gl.createBuffer();
    }

    bind() {
        gl.bindBuffer(this.type, this.buf);
    }

    delete() {
        gl.deleteBuffer(this.buf);
    }
}

class vertex_buffer extends buffer {
    constructor() {
        super(gl.ARRAY_BUFFER);
    }

    data(vData) {
        // WIP
    }
}

export class prim {
    constructor(type, vData, iData, mtl) {
        if (arguments.length == 0)
            return;
        else if (arguments.length == 1) {
            let tmp = arguments[0];

            this.type = tmp.type;
            this.vData = tmp.vData;
            this.iData = tmp.iData;

            if (tmp.mtl == undefined) {
                this.shade = false;
                this.mtl = new material(vec3Set(1), vec3Set(1), vec3Set(1), 34);
            }
            else {
                this.shade = true;
                this.mtl = tmp.mtl;
            }

            this.vCnt = tmp.vData.length / sizeInNumbers;
            this.iCnt = tmp.iData.length;

            this.trans = matrIdentity();
        }
        else {
            this.type = type;
            this.vData = vData;
            this.iData = iData;

            if (mtl == undefined) {
                this.shade = false;
                this.mtl = new material(vec3Set(1), vec3Set(1), vec3Set(1), 34);
            }
            else {
                this.shade = true;
                this.mtl = mtl;
            }

            this.vCnt = vData.length / sizeInNumbers;
            this.iCnt = iData.length;

            this.trans = matrIdentity();
        }

        if (this.vCnt != 0) {
            // Create vertex buffer object
            this.vBuf = gl.createBuffer();
            this.vArray = gl.createVertexArray();
            gl.bindVertexArray(this.vArray);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vData), gl.STATIC_DRAW);
            
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, sizeInBytes, 0);  // position
            gl.vertexAttribPointer(1, 4, gl.FLOAT, false, sizeInBytes, 12); // color
            gl.vertexAttribPointer(2, 3, gl.FLOAT, false, sizeInBytes, 28); // normal
            gl.vertexAttribPointer(3, 2, gl.FLOAT, false, sizeInBytes, 40); // uv (texture coordinates)

            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.enableVertexAttribArray(2);
            gl.enableVertexAttribArray(3);

            gl.bindVertexArray(null);
        }

        if (this.iCnt != 0) {
            // Create index buffer object
            this.iBuf = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.iData), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        this.shader = null;
    }

    draw(worldMatr) {
        let
            w = this.trans.mul(worldMatr),
            winv = w.inverse().transpose(),
            wvp = w.mul(cam.matrVP);

        gl.bindVertexArray(this.vArray);

        gl.useProgram(this.shader);

        let loc;
        const uniforms = [["matrWVP", wvp], ["matrW", w], ["matrWInv", winv], ["camLoc", cam.loc],
                          ["ka", this.mtl.ka],
                          ["kd", this.mtl.kd],
                          ["ks", this.mtl.ks],
                          ["ph", this.mtl.ph],
                          ["sh", this.shade]];

        uniforms.forEach((element) => {
            loc = gl.getUniformLocation(this.shader, element[0]);

            if (loc != null) {
                if (typeof element[1] == "boolean") {
                    gl.uniform1i(loc, element[1]);
                }
                else if (element[1].constructor.name == "mat4") {
                    gl.uniformMatrix4fv(loc, false, new Float32Array(element[1].toArray()));
                }
                else if (element[1].constructor.name == "vec4") {
                    gl.uniform4fv(loc, new Float32Array(element[1].toArray()));
                }
                else if (element[1].constructor.name == "vec3") {
                    gl.uniform3fv(loc, new Float32Array(element[1].toArray()));
                }
                else {
                    gl.uniform1f(loc, element[1]);
                }
            }
        })

        let loc2 = gl.getUniformLocation(this.shader, "fv")

        if (this.iCnt == 0) {
            gl.drawArrays(this.type, 0, this.vCnt);
        }
        else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuf);
            gl.drawElements(this.type, this.iCnt, gl.UNSIGNED_INT, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        gl.bindVertexArray(null);

        gl.useProgram(null);
    }

    addShader(shaderProgram) {
        this.shader = shaderProgram;
    }

    hexahedron() {
        const vData = [
            0, 0, 1,  1, 0, 0, 1,  1, 1, 1,  0, 1,
            0, 1, 1,  0, 1, 0, 1,  1, 1, 1,  0, 1,
            1, 1, 1,  0, 0, 1, 1,  1, 1, 1,  0, 1,
            1, 0, 1,  1, 1, 1, 1,  1, 1, 1,  0, 1,

            0, 0, 0,  1, 0, 0, 1,  1, 1, 1,  0, 1,
            0, 1, 0,  0, 1, 0, 1,  1, 1, 1,  0, 1,
            1, 1, 0,  0, 0, 1, 1,  1, 1, 1,  0, 1,
            1, 0, 0,  1, 1, 1, 1,  1, 1, 1,  0, 1
        ];
    
        const iData = [0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4,
                     0, 1, 5, 5, 4, 0, 3, 2, 6, 6, 7, 3,
                     1, 5, 2, 5, 2, 6, 0, 4, 3, 4, 3, 7];

        return new prim(gl.TRIANGLES, vData, iData);
    }

    pyramide() {
        const vData = [
            0, 0, 0,    1, 0, 0, 1,      1, 1, 1,  0, 1,
            0, 0, 10,   0, 1, 0, 1,      1, 1, 1,  0, 1,
            10, 0, 0,   0, 0, 1, 1,      1, 1, 1,  0, 1,
            10, 0, 10,  0.5, 0, 0.5, 1,  1, 1, 1,  0, 1,
            5, 7, 5,    0, 0, 0, 1,      1, 1, 1,  0, 1
            
        ];
    
        const iData = [
            0, 2, 1, 2, 3, 1,
            1, 4, 3, 4, 3, 2, 4, 2, 0, 4, 1, 0
        ];

        return new prim(gl.TRIANGLES, vData, iData);
    }

    tetrahedron() {
        let v3 = Math.sqrt(3);
        const vData = [
            0, 0, 0,         1, 0, 0, 1,               1, 1, 1,  0, 1,
            1, 0, 0,        0, 1, 0, 1,                1, 1, 1,  0, 1,
            0.5, 0, v3 / 2,       0, 0, 1, 1,          1, 1, 1,  0, 1,
            0.5, Math.sqrt(2 / 3), v3 / 6, 1, 1, 1, 1, 1, 1, 1,  0, 1
        ];
    
        const iData = [0, 1, 2, 3, 0, 1, 3, 0, 2, 3, 1, 2];

        return new prim(gl.TRIANGLES, vData, iData);
    }

    octahedron() {
        const vData = [
            0, 0, 0,  1, 0, 0, 1,  1, 1, 1,  0, 1,
            1, 0, 0,  0, 1, 0, 1,  1, 1, 1,  0, 1,
            1, 0, 1,  0, 0, 1, 1,  1, 1, 1,  0, 1,
            0, 0, 1,  1, 1, 1, 1,  1, 1, 1,  0, 1,

            0.5, Math.sqrt(1 / 2), 0.5, 1, 1, 0, 1,   1, 1, 1, 0, 1,
            0.5, -Math.sqrt(1 / 2), 0.5, 1, 0, 1, 1,  1, 1, 1, 0, 1,
        ];

        const iData = [
            0, 1, 2,
            0, 2, 3,
            4, 3, 2, 4, 3, 0, 4, 1, 0, 4, 1, 2,
            5, 3, 2, 5, 3, 0, 5, 1, 0, 5, 1, 2
        ];

        return new prim(gl.TRIANGLES, vData, iData);
    }

    icosahedron() {
        const vData = [
            0, 0, 0,   1, 0, 0, 1,   0, 1, 0,   0, 1,
            -Math.sin(d2r(18)), 0, Math.cos(d2r(18)),   0, 1, 0, 1,   0, 1, 0,   0, 1,
            -Math.sin(d2r(18)) + Math.cos(d2r(36)), 0, Math.cos(d2r(18)) + Math.sin(d2r(36)),   0, 0, 1, 1,   0, 1, 0,   0, 1,
            1 + Math.sin(d2r(18)), 0, Math.cos(d2r(18)),   1, 0, 0, 1,   0, 1, 0,   0, 1,
            1, 0, 0,   0, 1, 0, 1,   0, 1, 0,   0, 1,
            vec3Set(1, 0, 0).pointTransform(matrRotateY(36)).x, vec3Set(1, 0, 0).pointTransform(matrRotateY(36)).y,
            vec3Set(1, 0, 0).pointTransform(matrRotateY(36)).z, 1, 0, 1, 0, 1, 0, 1, 0, 1
        ];

        const iData = [
            0, 1, 2,
            0, 2, 4,
            2, 3, 4,
        ];

        return new prim(gl.TRIANGLES, vData, iData);
    }

    random() {
        const g = () => {
            return Math.random();
        }

        const vData = [
            0, 0, 0,   1, 0, 0, 1,    1, 1, 1,  0, 1,
            g(), 0, 0, 0, 1, 0, 1,    1, 1, 1,  0, 1,
            g(), 0, g(), 0, 0, 1, 1,  1, 1, 1,  0, 1,
            0.5, g(), 0, 1, 1, 1, 1,  1, 1, 1,  0, 1
        ];

        const iData = [
            0, 1, 2, 3, 0, 1, 3, 0, 2, 3, 1, 2
        ];

        return new prim(gl.LINE_STRIP, vData, iData);
    }

    axis() {
        const vData = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1,
                       15, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1,
                       0, 15, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1,
                       0, 0, 15, 0, 0, 1, 1,1, 1, 1, 0, 1];

        const iData = [0, 1, 0, 0, 2, 0, 0, 3, 0];

        return new prim(gl.LINE_STRIP, vData, iData);
    }

    grid(size, s, color) {
        let vData = [], iData = [];

        let begin = vec3Set(size, 0, size), end = vec3Set(size, 0, -size), n = Math.floor(size / s) * 2;
        let nm = vec3Set(0, 1, 0), t = vec2Set(0, 1);
        let curr = 0;

        for (let i = 0; i < n; i++) {
            vData.push(vertexSet(begin.add(vec3Set(-s * i, 0, 0)), color, nm, t).toArray());
            iData.push(curr);
            curr++;
            vData.push(vertexSet(end.add(vec3Set(-s * i, 0, 0)), color, nm, t).toArray());
            iData.push(curr, curr - 1);
            curr++;
        }

        end = vec3Set(-size, 0, size);

        for (let i = 0; i < n; i++) {
            vData.push(vertexSet(begin.add(vec3Set(0, 0, -s * i)), color, nm, t).toArray());
            iData.push(curr);
            curr++;
            vData.push(vertexSet(end.add(vec3Set(0, 0, -s * i)), color, nm, t).toArray());
            iData.push(curr, curr - 1);
            curr++;
        }

        return new prim(gl.LINE_STRIP, vertexToPrim(vData), iData);
    }

    async loadObj(fileName) {
        const _text = loadFileAsync(`./bin/models/${fileName}`);

        const promise = Promise.all([_text]).then((res) => {
            const text = res[0];
            let vData = [], iData = [];

            const lines = text.split("\n"), n = lines.length;

            for (let i = 0; i < n; i++) {
                const str = lines[i] + " ";

                if (str[0] == "v" && str[1] == " ") {
                    let pos = 2, a = [], number;

                    for (let j = 0; j < 3; j++) {
                        number = "";
                        while (str[pos] != " ") {
                            number += str[pos++]; 
                        }
                        a.push(parseFloat(number));
                        pos++;
                    }
                    let p = vec3Set(a);
                    let c = vec4Set(0.5, 0.5, 0.5, 1);

                    vData.push(vertexSet(p, c, vec3Set(0), vec2Set(0, 1)));
                }
                else if (str[0] == "f" && str[1] == " ") {
                    let pos = 2, number;
 
                    for (let j = 0; j < 3; j++) {
                        number = "";
                        while (str[pos] != "/" && str[pos] != " ") {
                            number += str[pos++]; 
                        }
                        while (str[pos] != " ") {
                            pos++;
                        }
                        iData.push(parseInt(number) - 1);
                        pos++;
                    };
                }
            }

            for (let i = 0; i < iData.length; i += 3) {
                let p0 = vData[iData[i]], p1 = vData[iData[i + 1]], p2 = vData[iData[i + 2]];

                let nm = p1.p.sub(p0.p).cross(p2.p.sub(p0.p)).normalize();

                p0.n = p0.n.add(nm);
                p1.n = p1.n.add(nm);
                p2.n = p2.n.add(nm);
            }
            let mtl = new material(vec3Set(0.2, 0.1, 0.05), vec3Set(0.7, 0.4, 0.2), vec3Set(1.5), 5);
            return new prim(gl.TRIANGLES, vertexToPrim(vData), iData, mtl);
        });
        return promise;
    }

    // for (i = 0; i < nf; i += 3)
    // {
    //     nk1VERTEX
    //     *p0 = &V[Ind[i]],
    //     *p1 = &V[Ind[i + 1]],
    //     *p2 = &V[Ind[i + 2]];
    //     VEC N = VecNormalize(VecCrossVec(VecSubVec(p1->P, p0->P), VecSubVec(p2->P, p0->P)));
// 
    //     p0->N = VecAddVec(p0->N, N);
    //     p1->N = VecAddVec(p1->N, N);
    //     p2->N = VecAddVec(p2->N, N);
    // }
}
