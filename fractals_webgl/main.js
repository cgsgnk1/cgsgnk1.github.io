function func() {
    console.log("12342121");
}

function pauseHandle() {
    if (document.getElementById("pauseCheckbox") != "false") {
        window.startPauseTime = Date.now(); 
    }
    else {
        window.deltaPauseTime += Date.now() - window.startPauseTime;
    }
    window.pause = !window.pause;
}

function colorHandle() {
    let color = document.getElementById("frColor").value;

    window.frColorR = eval("0x" + color[1] + color[2]) / 255.0;
    window.frColorG = eval("0x" + color[3] + color[4]) / 255.0;
    window.frColorB = eval("0x" + color[5] + color[6]) / 255.0;
}

function zoomHandle() {
    window.zoom = 1 / document.getElementById("zoomSlider").value;
}

function brightnessHandle() {
    window.brightness = document.getElementById("brightnessSlider").value;
}

function amplitudeHandle() {
    window.amplitude = document.getElementById("amplitudeSlider").value;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Shader not compiled!")
    }

    return shader;
}

function initGL() {
    window.zoom = 2.0;
    window.deltaX = 0.0;
    window.deltaY = 0.0;
    window.pause = false;
    window.frColorR = eval("0x83") / 255.0;
    window.frColorG = eval("0x4d") / 255.0;
    window.frColorB = eval("0x18") / 255.0;
    window.brightness = 1.0;
    window.amplitude = 1.0;
    window.deltaPauseTime = 0;

    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl2");

    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vs = `#version 300 es
        precision highp float;
        in vec4 in_pos;
        out vec3 color;

        void main() {
            gl_Position = in_pos;
            color = in_pos.xyz;
        }
    `;

    const fs = `#version 300 es
        precision highp float;
        out vec4 o_color;
        in vec3 color;

        uniform float time, zoom, deltaX, deltaY, colorR, colorG, colorB, br, amp;

        #define W 1000.0
        #define H 1000.0

        float cmplNorm2(vec2 z) {
            float n2;

            n2 = z.x * z.x + z.y * z.y;
            return n2;
        }

        vec2 cmplAddCmpl(vec2 z1, vec2 z2) {
            vec2 z;

            z.x = z1.x + z2.x;
            z.y = z1.y + z2.y;
            return z;
        }

        vec2 cmplMulCmpl(vec2 z1, vec2 z2) {
            vec2 z;

            z.x = z1.x * z2.x - z1.y * z2.y;
            z.y = z1.x * z2.y + z1.y * z2.x;
            return z;
        }

        float mandelbrot(vec2 z) {
            float n = 0.0;
            vec2 z0;

            z0 = vec2(z);
            while (cmplNorm2(z) < 4.0 && n < 255.0) {
                z = cmplAddCmpl(cmplMulCmpl(z, z), z0);
                n += 1.0;
            }
            return n / 255.0;
        }

        float julia(vec2 z, vec2 c) {
            float n = 0.0;
            vec2 z0;

            z0 = vec2(z);
            while (cmplNorm2(z) < 4.0 && n < 255.0) {
                z = cmplAddCmpl(cmplMulCmpl(z, z), c);
                n += 1.0;
            }
            return n / 255.0;
        }

        void main() {
            vec2 sc = gl_FragCoord.xy;

            float x0 = -zoom, x1 = zoom, y0 = -zoom, y1 = zoom, n;
            vec2 z, c;

            z = vec2(x0 + (gl_FragCoord.x - deltaX) * (x1 - x0) / W, y0 + (gl_FragCoord.y - deltaY) * (y1 - y0) / H);
            c = vec2(0.35 + 0.08 * sin((time + 3.0) / amp), 0.39 + 0.08 * sin(time / amp));
            n = julia(z, c);
            // n = mandelbrot(z);
            o_color = vec4(vec3(colorR, colorG, colorB) * n * br, 1);
        }
    `;

    const vertexSh = loadShader(gl, gl.VERTEX_SHADER, vs);
    const fragmentSh = loadShader(gl, gl.FRAGMENT_SHADER, fs);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexSh);
    gl.attachShader(shaderProgram, fragmentSh);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Shader error!");
    } 

    const posLoc =  gl.getAttribLocation(shaderProgram, "in_pos");

    const begin = Date.now();
    let timeFromStart;

    const posBuf = gl.createBuffer();

    const draw = () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        const pos = [-1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLoc);
        if (!window.pause)
            timeFromStart = begin - window.deltaPauseTime - Date.now();
        
        const locs = ["time", "zoom", "deltaX", "deltaY", "colorR", "colorG", "colorB", "br", "amp"];
        const uniforms = [timeFromStart / 1000.0, window.zoom, window.deltaX,
                          window.deltaY, window.frColorR, window.frColorG,
                          window.frColorB, window.brightness, window.amplitude];

        for (let i = 0; i < locs.length; i++) {
            const loc = gl.getUniformLocation(shaderProgram, locs[i]);

            if (loc != -1)
                gl.uniform1f(loc, uniforms[i]);
            
        }

        gl.useProgram(shaderProgram);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 5);

        window.requestAnimationFrame(draw);
    }
    draw();
}
