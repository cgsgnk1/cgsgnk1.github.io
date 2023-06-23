(function () {
    'use strict';

    // Koptelov Nikita, 09-1, 03.06.2023, NK1

    const d2r = (x) => {
        return x * Math.PI / 180;
    };

    const r2d = (x) => {
        return x * 180 / Math.PI;
    };

    class vec2 {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        add(v) {
            return new vec2(this.x + v.x, this.y + v.y);
        }

        sub(v) {
            return new vec2(this.x - v.x, this.y - v.y);
        }

        mul(n) {
            return new vec2(this.x * n, this.y * n);
        }

        dot(v) {
            return this.x * v.x + this.y * v.y;
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

        toArray() {
            return [this.x, this.y];
        }

        check() {
            console.log(this);
        }
    }

    function vec2Set() {
        if (arguments.length == 1) {
            let x = arguments[0];

            if (typeof x == "object") {
                return new vec2(x[0], x[1]);
            }
            else {
                return new vec2(x, x);
            }
        }
        else if (arguments.length == 2) {
            let x = arguments[0], y = arguments[1];

            return new vec2(x, y);
        }
    }

    class vec3 {
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        add(v) {
            return new vec3(this.x + v.x, this.y + v.y, this.z + v.z);
        }

        sub(v) {
            return new vec3(this.x - v.x, this.y - v.y, this.z - v.z);
        }

        mul(n) {
            return new vec3(this.x * n, this.y * n, this.z * n);
        }

        dot(v) {
            return this.x * v.x + this.y * v.y + v.z * this.z;
        }

        cross(v) {
            return new vec3(this.y * v.z - this.z * v.y,
                            this.z * v.x - this.x * v.z,
                            this.x * v.y - this.y * v.x);
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

        transform(m) {
            return new vec3(this.x * m.a[0][0] + this.y * m.a[1][0] + this.z * m.a[2][0],
                            this.x * m.a[0][1] + this.y * m.a[1][1] + this.z * m.a[2][1],
                            this.x * m.a[0][2] + this.y * m.a[1][2] + this.z * m.a[2][2]);
        }

        pointTransform(m) {
            return new vec3(this.x * m.a[0][0] + this.y * m.a[1][0] + this.z * m.a[2][0] + m.a[3][0],
                            this.x * m.a[0][1] + this.y * m.a[1][1] + this.z * m.a[2][1] + m.a[3][1],
                            this.x * m.a[0][2] + this.y * m.a[1][2] + this.z * m.a[2][2] + m.a[3][2]);
        }

        toArray() {
            return [this.x, this.y, this.z];
        }

        check() {
            console.log(this);
        }
    }

    function vec3Set() {
        if (arguments.length == 1) {
            let x = arguments[0];

            if (typeof x == "object") {
                return new vec3(x[0], x[1], x[2]);
            }
            else {
                return new vec3(x, x, x);
            }
        }
        else if (arguments.length == 3) {
            let x = arguments[0], y = arguments[1], z = arguments[2];

            return new vec3(x, y, z);
        }
    }

    class vec4 {
        constructor(x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }

        add(v) {
            return new vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
        }

        sub(v) {
            return new vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
        }

        mul(n) {
            return new vec4(this.x * n, this.y * n, this.z * n, this.w * n);
        }

        dot(v) {
            return this.x * v.x + this.y * v.y + v.z * this.z + this.w * v.w;
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

        toArray() {
            return [this.x, this.y, this.z, this.w];
        }

        check() {
            console.log(this);
        }
    }

    function vec4Set() {
        if (arguments.length == 1) {
            let x = arguments[0];

            return new vec4(x, x, x, x);
        }
        else if (arguments.length == 4) {
            let x = arguments[0], y = arguments[1], z = arguments[2], w = arguments[3];

            return new vec4(x, y, z, w);
        }
    }

    function determ3x3(a00, a01, a02,
                       a10, a11, a12,
                       a20, a21, a22) {
        return a00 * a11 * a22 + a01 * a12 * a20 + a02 * a10 * a21 -
               a00 * a12 * a21 - a01 * a10 * a22 - a02 * a11 * a20;
    }

    class mat4 {
        constructor(a00, a01, a02, a03,
                    a10, a11, a12, a13,
                    a20, a21, a22, a23,
                    a30, a31, a32, a33) {
            this.a = [
                [a00, a01, a02, a03],
                [a10, a11, a12, a13],
                [a20, a21, a22, a23],
                [a30, a31, a32, a33]
            ];
        }

        mul(obj) {
            let r = new mat4();

            r.a[0][0] = this.a[0][0] * obj.a[0][0] + this.a[0][1] * obj.a[1][0] + 
                        this.a[0][2] * obj.a[2][0] + this.a[0][3] * obj.a[3][0];

            r.a[0][1] = this.a[0][0] * obj.a[0][1] + this.a[0][1] * obj.a[1][1] + 
                        this.a[0][2] * obj.a[2][1] + this.a[0][3] * obj.a[3][1];

            r.a[0][2] = this.a[0][0] * obj.a[0][2] + this.a[0][1] * obj.a[1][2] + 
                        this.a[0][2] * obj.a[2][2] + this.a[0][3] * obj.a[3][2];

            r.a[0][3] = this.a[0][0] * obj.a[0][3] + this.a[0][1] * obj.a[1][3] + 
                        this.a[0][2] * obj.a[2][3] + this.a[0][3] * obj.a[3][3];

            r.a[1][0] = this.a[1][0] * obj.a[0][0] + this.a[1][1] * obj.a[1][0] + 
                        this.a[1][2] * obj.a[2][0] + this.a[1][3] * obj.a[3][0];

            r.a[1][1] = this.a[1][0] * obj.a[0][1] + this.a[1][1] * obj.a[1][1] + 
                        this.a[1][2] * obj.a[2][1] + this.a[1][3] * obj.a[3][1];

            r.a[1][2] = this.a[1][0] * obj.a[0][2] + this.a[1][1] * obj.a[1][2] + 
                        this.a[1][2] * obj.a[2][2] + this.a[1][3] * obj.a[3][2];

            r.a[1][3] = this.a[1][0] * obj.a[0][3] + this.a[1][1] * obj.a[1][3] + 
                        this.a[1][2] * obj.a[2][3] + this.a[1][3] * obj.a[3][3];

            r.a[2][0] = this.a[2][0] * obj.a[0][0] + this.a[2][1] * obj.a[1][0] + 
                        this.a[2][2] * obj.a[2][0] + this.a[2][3] * obj.a[3][0];

            r.a[2][1] = this.a[2][0] * obj.a[0][1] + this.a[2][1] * obj.a[1][1] + 
                        this.a[2][2] * obj.a[2][1] + this.a[2][3] * obj.a[3][1];

            r.a[2][2] = this.a[2][0] * obj.a[0][2] + this.a[2][1] * obj.a[1][2] + 
                        this.a[2][2] * obj.a[2][2] + this.a[2][3] * obj.a[3][2];

            r.a[2][3] = this.a[2][0] * obj.a[0][3] + this.a[2][1] * obj.a[1][3] + 
                        this.a[2][2] * obj.a[2][3] + this.a[2][3] * obj.a[3][3];

            r.a[3][0] = this.a[3][0] * obj.a[0][0] + this.a[3][1] * obj.a[1][0] + 
                        this.a[3][2] * obj.a[2][0] + this.a[3][3] * obj.a[3][0];

            r.a[3][1] = this.a[3][0] * obj.a[0][1] + this.a[3][1] * obj.a[1][1] + 
                        this.a[3][2] * obj.a[2][1] + this.a[3][3] * obj.a[3][1];

            r.a[3][2] = this.a[3][0] * obj.a[0][2] + this.a[3][1] * obj.a[1][2] + 
                        this.a[3][2] * obj.a[2][2] + this.a[3][3] * obj.a[3][2];

            r.a[3][3] = this.a[3][0] * obj.a[0][3] + this.a[3][1] * obj.a[1][3] + 
                        this.a[3][2] * obj.a[2][3] + this.a[3][3] * obj.a[3][3];
            
            return r;
        }

        determ() {
            return +this.a[0][0] * determ3x3(this.a[1][1], this.a[1][2], this.a[1][3],
                                             this.a[2][1], this.a[2][2], this.a[2][3],
                                             this.a[3][1], this.a[3][2], this.a[3][3]) +
                   -this.a[0][1] * determ3x3(this.a[1][0], this.a[1][2], this.a[1][3],
                                             this.a[2][0], this.a[2][2], this.a[2][3],
                                             this.a[3][0], this.a[3][2], this.a[3][3]) +
                   +this.a[0][2] * determ3x3(this.a[1][0], this.a[1][1], this.a[1][3],
                                             this.a[2][0], this.a[2][1], this.a[2][3],
                                             this.a[3][0], this.a[3][1], this.a[3][3]) +
                   -this.a[0][3] * determ3x3(this.a[1][0], this.a[1][1], this.a[1][2],
                                             this.a[2][0], this.a[2][1], this.a[2][2],
                                             this.a[3][0], this.a[3][1], this.a[3][2]);
        }

        transpose() {
            let m = new mat4();

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
            let m = new mat4(), det = this.determ();

            if (det == 0) {
                return matrIdentity();
            }

            m.a[0][0] =
                +determ3x3(this.a[1][1], this.a[1][2], this.a[1][3],
                           this.a[2][1], this.a[2][2], this.a[2][3],
                           this.a[3][1], this.a[3][2], this.a[3][3]) / det;

            m.a[1][0] =
                -determ3x3(this.a[1][0], this.a[1][2], this.a[1][3],
                           this.a[2][0], this.a[2][2], this.a[2][3],
                           this.a[3][0], this.a[3][2], this.a[3][3]) / det;

            m.a[2][0] =
                +determ3x3(this.a[1][0], this.a[1][1], this.a[1][3],
                           this.a[2][0], this.a[2][1], this.a[2][3],
                           this.a[3][0], this.a[3][1], this.a[3][3]) / det;

            m.a[3][0] =
                +determ3x3(this.a[1][0], this.a[1][1], this.a[1][2],
                           this.a[2][0], this.a[2][1], this.a[2][2],
                           this.a[3][0], this.a[3][1], this.a[3][2]) / det;

            m.a[0][1] =
                -determ3x3(this.a[0][1], this.a[0][2], this.a[0][3],
                           this.a[2][1], this.a[2][2], this.a[2][3],
                           this.a[3][1], this.a[3][2], this.a[3][3]) / det;

            m.a[1][1] =
                +determ3x3(this.a[0][0], this.a[0][2], this.a[0][3],
                           this.a[2][0], this.a[2][2], this.a[2][3],
                           this.a[3][0], this.a[3][2], this.a[3][3]) / det;

            m.a[2][1] =
                -determ3x3(this.a[0][0], this.a[0][1], this.a[0][3],
                           this.a[2][0], this.a[2][1], this.a[2][3],
                           this.a[3][0], this.a[3][1], this.a[3][3]) / det;

            m.a[3][1] =
                -determ3x3(this.a[0][0], this.a[0][1], this.a[0][2],
                           this.a[2][0], this.a[2][1], this.a[2][2],
                           this.a[3][0], this.a[3][1], this.a[3][2]) / det;

            m.a[0][2] =
                +determ3x3(this.a[0][1], this.a[0][2], this.a[0][3],
                           this.a[1][1], this.a[1][2], this.a[1][3],
                           this.a[3][1], this.a[3][2], this.a[3][3]) / det;

            m.a[1][2] =
                -determ3x3(this.a[0][0], this.a[0][2], this.a[0][3],
                           this.a[1][0], this.a[1][2], this.a[1][3],
                           this.a[3][0], this.a[3][2], this.a[3][3]) / det;

            m.a[2][2] =
                +determ3x3(this.a[0][0], this.a[0][1], this.a[0][3],
                           this.a[1][0], this.a[1][1], this.a[1][3],
                           this.a[3][0], this.a[3][1], this.a[3][3]) / det;

            m.a[3][2] =
                +determ3x3(this.a[0][0], this.a[0][1], this.a[0][2],
                           this.a[1][0], this.a[1][1], this.a[1][2],
                           this.a[3][0], this.a[3][1], this.a[3][2]) / det;

            m.a[0][3] =
                +determ3x3(this.a[0][1], this.a[0][2], this.a[0][3],
                           this.a[1][1], this.a[1][2], this.a[1][3],
                           this.a[2][1], this.a[2][2], this.a[2][3]) / det;

            m.a[1][3] =
                -determ3x3(this.a[0][0], this.a[0][2], this.a[0][3],
                           this.a[1][0], this.a[1][2], this.a[1][3],
                           this.a[2][0], this.a[2][2], this.a[2][3]) / det;

            m.a[2][3] =
                +determ3x3(this.a[0][0], this.a[0][1], this.a[0][3],
                           this.a[1][0], this.a[1][1], this.a[1][3],
                           this.a[2][0], this.a[2][1], this.a[2][3]) / det;

            m.a[3][3] =
                +determ3x3(this.a[0][0], this.a[0][1], this.a[0][2],
                           this.a[1][0], this.a[1][1], this.a[1][2],
                           this.a[2][0], this.a[2][1], this.a[2][2]) / det;
            
            return m;
        }

        setIdentity() {
            this.a[0]= [1, 0, 0, 0];
            this.a[1]= [0, 1, 0, 0];
            this.a[2]= [0, 0, 1, 0];
            this.a[3]= [0, 0, 0, 1];

            return this;
        }

        setScale(v) {
            this.a[0] = [v.x, 0, 0, 0];
            this.a[1] = [0, v.y, 0, 0];
            this.a[2] = [0, 0, v.z, 0];
            this.a[3] = [0, 0, 0, 1];

            return this;
        }
        
        setTranslate(v) {
            this.a[0] = [1, 0, 0, 0];
            this.a[1] = [0, 1, 0, 0];
            this.a[2] = [0, 0, 1, 0];
            this.a[3] = [v.x, v.y, v.z, 1];

            return this;
        }
        
        setRotateX(angle) {
            let a = d2r(angle), s = Math.sin(a), c = Math.cos(a);
            this.setIdentity();
            
            this.a[1][1] = c;
            this.a[1][2] = s;
            this.a[2][1] = -s;
            this.a[2][2] = c;

            return this;
        }
        
        setRotateY(angle) {
            let a = d2r(angle), s = Math.sin(a), c = Math.cos(a);
            this.setIdentity();

            this.a[0][0] = c;
            this.a[0][2] = -s;
            this.a[2][0] = s;
            this.a[2][2] = c;
            
            return this;
        }
        
        setRotateZ(angle) {
            let a = d2r(angle), s = Math.sin(a), c = Math.cos(a);
            this.setIdentity();

            this.a[0][0] = c;
            this.a[0][2] = s;
            this.a[2][0] = -s;
            this.a[2][2] = c;
          
            return this;
        }
        
        setRotate(v, angle) {
            let a = d2r(angle), s = Math.sin(a), c = Math.cos(a);
            let r = v.normalize();
            
            this.a[0][0] = c + r.x * r.x * (1 - c);
            this.a[0][1] = r.x * r.y * (1 - c) + r.z * s;
            this.a[0][2] = r.x * r.z * (1 - c) - r.y * s;
            this.a[0][3] = 0;

            this.a[1][0] = r.y * r.x * (1 - c) - r.z * s;
            this.a[1][1] = c + r.y * r.y * (1 - c);
            this.a[1][2] = r.y * r.z * (1 - c) + r.z * s;
            this.a[1][3] = 0;

            this.a[2][0] = r.z * r.x * (1 - c) + r.y * s;
            this.a[2][1] = r.z * r.y * (1 - c) - r.x * s;
            this.a[2][2] = c + r.z * r.z * (1 - c);
            this.a[2][3] = 0;

            this.a[3][0] = 0;
            this.a[3][1] = 0;
            this.a[3][2] = 0;
            this.a[3][3] = 1;
            
            return this;
        }

        setView(loc, at, up1) {
            let
                dir = at.sub(loc).normalize(),
                right = dir.cross(up1).normalize(),
                up = right.cross(dir);

            this.a[0] = [right.x, up.x, -dir.x, 0];
            this.a[1] = [right.y, up.y, -dir.y, 0];
            this.a[2] = [right.z, up.z, -dir.z, 0];
            this.a[3] = [-loc.dot(right), -loc.dot(up), loc.dot(dir), 1];

            return this;
        }

        setFrustum(l, r, b, t, n, f) {
            this.a[0] = [2 * n / (r - l), 0, 0, 0];
            this.a[1] = [0, 2 * n / (t - b), 0, 0];
            this.a[2] = [(r + l) / (r - l), (t + b) / (t - b), (f + n) / (n - f), -1];
            this.a[3] = [0, 0, 2 * n * f / (n - f), 0];

            return this;
        }

        toArray() {
            return [this.a[0][0], this.a[0][1], this.a[0][2], this.a[0][3],
                    this.a[1][0], this.a[1][1], this.a[1][2], this.a[1][3],
                    this.a[2][0], this.a[2][1], this.a[2][2], this.a[2][3],
                    this.a[3][0], this.a[3][1], this.a[3][2], this.a[3][3]];
        }

        check() {
            console.log(this.a[0], this.a[1], this.a[2], this.a[3]);
        }
    }

    function matrIdentity() {
        return new mat4().setIdentity();
    }

    function matrScale(v) {
        return new mat4().setScale(v);
    }

    function matrTranslate(v) {
        return new mat4().setTranslate(v);
    }

    function matrRotateX(angle) {
        return new mat4().setRotateX(angle);
    }

    function matrRotateY(angle) {
        return new mat4().setRotateY(angle);
    }

    function matrRotate(v, angle) {
        return new mat4().setRotate(v, angle);
    }

    class camera {
        constructor(gl) {
            this.gl = gl;
            this.projSize = 0.1;
            this.projDist = 0.1;
            this.projFarClip = 1000;

            this.frameW = 500;
            this.frameH = 500;

            this.matrView = new mat4(); 
            this.matrProj = new mat4(); 
            this.matrVP = new mat4();
            this.loc = new vec3();      
            this.at = new vec3();       
            this.dir = new vec3();     
            this.up = new vec3();       
            this.right = new vec3();
        }

        set(loc, at, up) {
            this.matrView.setView(loc, at, up);
            this.loc = loc;
            this.at = at;
            this.dir =   vec3Set(-this.matrView.a[0][2],
                                 -this.matrView.a[1][2],
                                 -this.matrView.a[2][2]);
            this.up =    vec3Set(this.matrView.a[0][1],
                                 this.matrView.a[1][1],
                                 this.matrView.a[2][1]);
            this.right = vec3Set(this.matrView.a[0][0],
                                 this.matrView.a[1][0],
                                 this.matrView.a[2][0]);

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

            this.matrProj.setFrustum(-rx / 2, rx / 2, -ry / 2, ry / 2,
                                      this.projDist, this.projFarClip);
            this.matrVP = this.matrView.mul(this.matrProj);
        }

        resize(nw, nh) {
            this.gl.viewport(0, 0, nw, nh);

            this.frameW = nw;
            this.frameH = nh;
            this.proj();
        }
    }

    function cameraCreate(gl) {
        return new camera(gl);
    }

    // let v1 = new vec3(3, 45, 6);
    // let v2 = new vec3(6, 2, -1);
    // 
    // let v3 = v2.normalize();
    // 
    // console.log(v2, v3);
    // 
    // let v4 = new vec3();
    // 
    // console.log(v4);
    // 
    // let m1 = new mat4(5.6, 4.43, 3.4, 320,
    //                   32, 2, 3.44, 32.3,
    //                   3, 1, 12, 9.03,
    //                   93, 4, 4, 3);
    // 
    // let m2 = new mat4(4.5, 39, 90, 2,
    //                   1, 3.9, 3.2, 4.5,
    //                   2.4, 4.5, 3, 2,
    //                   1, 1, 1, 3.4);
    // 
    // let v5 = vec3Set(2, 4, 5);

    class texture {
        constructor(fileName) {
            this.glId = gl.createTexture();

            this.image = new Image();
            this.image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, this.glId);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            };
            this.image.src = fileName;
        }
    }

    class material {
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

    // Koptelov Nikita, 09-1, 07.06.2023, NK1


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

    class prim {
        constructor(type, vData, iData, mtl) {
            if (arguments.length == 0)
                return;
            else if (arguments.length == 1) {
                let tmp = arguments[0];

                this.type = tmp.type;
                this.vData = tmp.vData;
                this.iData = tmp.iData;

                if (tmp.mtl == undefined) {
                    this.isShade = false;
                    this.mtl = new material(vec3Set(1), vec3Set(1), vec3Set(1), 34);
                }
                else {
                    this.isShade = true;
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
                    this.isShade = false;
                    this.mtl = new material(vec3Set(1), vec3Set(1), vec3Set(1), 34);
                }
                else {
                    this.isShade = true;
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
        }

        draw(worldMatr) {
            let
                w = this.trans.mul(worldMatr),
                winv = w.inverse().transpose(),
                wvp = w.mul(cam.matrVP);

            gl.bindVertexArray(this.vArray);

            gl.useProgram(this.mtl.shader);

            let loc;
            const uniforms = [["matrWVP", wvp], ["matrW", w], ["matrWInv", winv], ["camLoc", cam.loc],
                              ["ka", this.mtl.ka],
                              ["kd", this.mtl.kd],
                              ["ks", this.mtl.ks],
                              ["ph", this.mtl.ph],
                              ["isShade", this.isShade],
                              ["isTextured", this.mtl.texture != null]];

            uniforms.forEach((element) => {
                loc = gl.getUniformLocation(this.mtl.shader, element[0]);

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
            });

            if (this.mtl.texture != null) {
                gl.bindTexture(gl.TEXTURE_2D, this.mtl.texture.glId);
                gl.activeTexture(gl.TEXTURE0);

                loc = gl.getUniformLocation(this.mtl.shader, "texture0");
                if (loc != null) {
                    gl.uniform1i(loc, 0);
                }
            }

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

        rectangle(w, h) {
            const vData = [0, 0, 0,   0, 0, 0, 1,   0, 0, 1,   0, 0,
                0, h, 0,  0, 0, 0, 1,   1, 0, 1,   0, 1,
                w, h, 0,  0, 0, 0, 1,   1, 1, 1,  1, 1,
                w, 0, 0,   0, 0, 0, 1,   1, 1, 1,  1, 0,
                0, 0, 0,   0, 0, 0, 1,   1, 1, 1,   0, 0];

            return new prim(gl.TRIANGLE_STRIP, vData, []);
        }

        hexahedron() {
            const vData = [
                0, 0, 1,  1, 0, 0, 1,  0, 0, 1,  0, 1,
                0, 1, 1,  0, 1, 0, 1,  1, 1, 1,  0, 0,
                1, 1, 1,  0, 0, 1, 1,  1, 1, 1,  1, 0,
                1, 0, 1,  1, 1, 1, 1,  1, 1, 1,  1, 1,

                0, 0, 0,  1, 0, 0, 1,  1, 1, 1,  0, 1,
                0, 1, 0,  0, 1, 0, 1,  1, 1, 1,  0, 0,
                1, 1, 0,  0, 0, 1, 1,  1, 1, 1,  1, 0,
                1, 0, 0,  1, 1, 1, 1,  1, 1, 1,  1, 1,
            ];
        
            const iData = [0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4,
                         0, 1, 5, 5, 4, 0, 3, 2, 6, 6, 7, 3,
                         1, 5, 2, 5, 2, 6, 0, 4, 3, 4, 3, 7];

            return new prim(gl.TRIANGLES, vertexToPrim(vData), iData);
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
            };

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
                        }                }
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

    class timer {
        constructor() {
            this.startTime = this.oldTime = this.oldTimeFPS = Date.now();
            this.pauseTime = this.frameCounter = 0;
            this.global = {};
            this.global.fps = 0;
            this.global.isPause = false;
        }

        response() {
            const t = Date.now();

            this.global.globalTime = t - this.startTime;
            this.global.globalDeltaTime = t - this.oldTime;
            if (this.global.isPause) {
                this.global.deltaTime = 0;
                this.pauseTime += t - this.oldTime;
            } else {
                this.global.deltaTime = this.global.globalDeltaTime;
                this.global.time = t - this.pauseTime - this.startTime;
            }

            this.frameCounter++;

            if (t - this.oldTimeFPS > 1000) {
                 // every second measure FPS
                this.global.fps = this.frameCounter / ((t - this.oldTimeFPS) / 1000.0);
                this.oldTimeFPS = t;
                this.frameCounter = 0;
            }
            this.oldTime = t;
        }
    }

    class input {
        constructor() {
            this.keys = [];
            this.keysOld = [];
            this.keysClick = [];
            this.m = {
                lClick: false,
                rClick: false,
                mx: 0, my: 0, mz: 0,
                mdx: 0, mdy: 0, mdz: 0,
            };

            this.shift = 250;
            this.control = 251;
            this.space = 252;
            this.alt = 253;

            this.isHold = false;

            for (let i = 0; i < 255; i++) {
                this.keys.push(false);
                this.keysOld.push(false);
                this.keysClick.push(false);
            }

            window.addEventListener("keydown", (event) => {
                if (event.key.length == 1) {
                    this.keys[event.key.charCodeAt()] = true;
                } else {
                    if (event.key == "Shift") {
                        this.keys[this.shift] = true;
                    } else if (event.key == "Control") {
                        this.keys[this.control] = true;
                    } else if (event.key == "Space") {
                        this.keys[this.space] = true;
                    } else if (event.key == "Alt") {
                        this.keys[this.alt] = true;
                    }
                }
                
            });
            window.addEventListener("keyup", (event) => {
                for (let i = 0; i < 255; i++) {
                    this.keys[i] = false;
                }
            });

            window.addEventListener("mousedown", (event) => {
                this.isHold = true;

                this.m.mx = event.clientX;
                this.m.my = event.clientY;

                if (this.isHold) {
                    if (event.button == 0) {
                        this.m.lClick = true;
                    }
                    else if (event.button == 2) {
                        this.m.rClick = true;
                    }
                }
            });
            window.addEventListener("mouseup", (event) => {
                this.isHold = false;
                this.m.lClick = false;
                this.m.rClick = false;
            });

            window.addEventListener("mousemove", (event) => {
                this.m.mx = event.clientX;
                this.m.my = event.clientY;

                this.m.mdx = event.movementX;
                this.m.mdy = event.movementY;

                if (this.isHold) {
                    if (event.button == 0) {
                        this.m.lClick = true;
                    }
                    else if (event.button == 2) {
                        this.m.rClick = true;
                    }
                }
            });

            window.addEventListener("wheel", (event) => {
                this.m.mdz = event.deltaY;
                this.m.mz += event.deltaY;
            });
        }

        setDefault() {
            this.m.mdx = 0;
            this.m.mdy = 0;
            this.m.mdz = 0;
        }
    }

    // Global WebGL context
    let gl, cam, tim, inp, canvas;

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
            alert("Shader not compiled!");
        }

        return shader;
    }

    function initGL(canvasID) {
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
        };

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
            let hexa = new prim().hexahedron();
            let octa = new prim().octahedron();
            let tetra = new prim().tetrahedron();

            let lamp = new prim().hexahedron();
            lamp.mtl = new material(vec3Set(0.5, 0.8, 0.5), vec3Set(0.3), vec3Set(0.3), 34);
            lamp.isShade = true;

            let table = new prim().rectangle(500, 500);
            table.mtl.addTexture("bin/textures/table3.jpg");

            axis.mtl.addShader(shaderProgram);
            cow.mtl.addShader(shaderProgram);
            cow1.mtl.addShader(shaderProgram);
            cow2.mtl.addShader(shaderProgram);
            grid.mtl.addShader(shaderProgram);
            table.mtl.addShader(shaderProgram);
            hexa.mtl.addShader(shaderProgram);
            octa.mtl.addShader(shaderProgram);
            tetra.mtl.addShader(shaderProgram);

            lamp.mtl.addShader(shaderProgram);

            const draw = () => {
                tim.response();

                let matrix = matrScale(vec3Set(5)).mul(matrRotate(vec3Set(1), 360 * Math.sin(tim.global.time / 1000.0)));

                cameraHandle();
                
                document.getElementById("fpsText").innerHTML = `<i>FPS:</i> ${tim.global.fps}`;

                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                cam.resize(canvas.width, canvas.height);

                axis.draw(matrTranslate(vec3Set(0, 0.5, 0)));

                cow.draw(matrRotateY(Math.sin(tim.global.time / 1000.0) * 360));
                cow1.draw(matrRotateY(Math.sin(tim.global.time / 500.0) * 360).mul(matrTranslate(vec3Set(20, 0, 0))));
                cow2.draw(matrRotateY(Math.sin(tim.global.time / 2000.0) * 360).mul(matrTranslate(vec3Set(-20, 0, 0))));

                table.draw(matrRotateX(-90).mul(matrTranslate(vec3Set(-250, -30, 250))));

                lamp.draw(matrTranslate(vec3Set(1, 15, 10)));

                hexa.draw(matrix);
                octa.draw(matrix.mul(matrTranslate(vec3Set(-20, 0, 0))));
                tetra.draw(matrix.mul(matrTranslate(vec3Set(20, 0, 0))));

                inp.setDefault();
                window.requestAnimationFrame(draw);
            };

            draw();
        };

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
        );
    }

    initGL("glCanvas");

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbXRoLmpzIiwiLi4vc3JjL3RleHR1cmUuanMiLCIuLi9zcmMvbWF0ZXJpYWwuanMiLCIuLi9zcmMvcHJpbS5qcyIsIi4uL3NyYy90aW1lci5qcyIsIi4uL3NyYy9pbnB1dC5qcyIsIi4uL3NyYy9yZW5kZXIuanMiLCIuLi9zcmMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBLb3B0ZWxvdiBOaWtpdGEsIDA5LTEsIDAzLjA2LjIwMjMsIE5LMVxyXG5cclxuZXhwb3J0IGNvbnN0IGQyciA9ICh4KSA9PiB7XHJcbiAgICByZXR1cm4geCAqIE1hdGguUEkgLyAxODA7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgcjJkID0gKHgpID0+IHtcclxuICAgIHJldHVybiB4ICogMTgwIC8gTWF0aC5QSTtcclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyB2ZWMyIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHkpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkKHYpIHtcclxuICAgICAgICByZXR1cm4gbmV3IHZlYzIodGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN1Yih2KSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyB2ZWMyKHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55KTtcclxuICAgIH1cclxuXHJcbiAgICBtdWwobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgdmVjMih0aGlzLnggKiBuLCB0aGlzLnkgKiBuKTtcclxuICAgIH1cclxuXHJcbiAgICBkb3Qodikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XHJcbiAgICB9XHJcblxyXG4gICAgbGVuKCkge1xyXG4gICAgICAgIGxldCBsZW4gPSB0aGlzLmRvdCh0aGlzKTtcclxuXHJcbiAgICAgICAgaWYgKGxlbiA9PSAxIHx8IGxlbiA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsZW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQobGVuKTtcclxuICAgIH1cclxuXHJcbiAgICBsZW4yKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRvdCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBub3JtYWxpemUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubXVsKDEgLyB0aGlzLmxlbigpKTtcclxuICAgIH1cclxuXHJcbiAgICB0b0FycmF5KCkge1xyXG4gICAgICAgIHJldHVybiBbdGhpcy54LCB0aGlzLnldO1xyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmVjMlNldCgpIHtcclxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICBsZXQgeCA9IGFyZ3VtZW50c1swXTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyB2ZWMyKHhbMF0sIHhbMV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyB2ZWMyKHgsIHgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMikge1xyXG4gICAgICAgIGxldCB4ID0gYXJndW1lbnRzWzBdLCB5ID0gYXJndW1lbnRzWzFdO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IHZlYzIoeCwgeSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyB2ZWMzIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHopIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgIH1cclxuXHJcbiAgICBhZGQodikge1xyXG4gICAgICAgIHJldHVybiBuZXcgdmVjMyh0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSwgdGhpcy56ICsgdi56KTtcclxuICAgIH1cclxuXHJcbiAgICBzdWIodikge1xyXG4gICAgICAgIHJldHVybiBuZXcgdmVjMyh0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSwgdGhpcy56IC0gdi56KTtcclxuICAgIH1cclxuXHJcbiAgICBtdWwobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgdmVjMyh0aGlzLnggKiBuLCB0aGlzLnkgKiBuLCB0aGlzLnogKiBuKTtcclxuICAgIH1cclxuXHJcbiAgICBkb3Qodikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB2LnogKiB0aGlzLno7XHJcbiAgICB9XHJcblxyXG4gICAgY3Jvc3Modikge1xyXG4gICAgICAgIHJldHVybiBuZXcgdmVjMyh0aGlzLnkgKiB2LnogLSB0aGlzLnogKiB2LnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueiAqIHYueCAtIHRoaXMueCAqIHYueixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54KTtcclxuICAgIH1cclxuXHJcbiAgICBsZW4oKSB7XHJcbiAgICAgICAgbGV0IGxlbiA9IHRoaXMuZG90KHRoaXMpO1xyXG5cclxuICAgICAgICBpZiAobGVuID09IDEgfHwgbGVuID09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGxlbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChsZW4pO1xyXG4gICAgfVxyXG5cclxuICAgIGxlbjIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZG90KHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIG5vcm1hbGl6ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tdWwoMSAvIHRoaXMubGVuKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRyYW5zZm9ybShtKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyB2ZWMzKHRoaXMueCAqIG0uYVswXVswXSArIHRoaXMueSAqIG0uYVsxXVswXSArIHRoaXMueiAqIG0uYVsyXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy54ICogbS5hWzBdWzFdICsgdGhpcy55ICogbS5hWzFdWzFdICsgdGhpcy56ICogbS5hWzJdWzFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnggKiBtLmFbMF1bMl0gKyB0aGlzLnkgKiBtLmFbMV1bMl0gKyB0aGlzLnogKiBtLmFbMl1bMl0pO1xyXG4gICAgfVxyXG5cclxuICAgIHBvaW50VHJhbnNmb3JtKG0pIHtcclxuICAgICAgICByZXR1cm4gbmV3IHZlYzModGhpcy54ICogbS5hWzBdWzBdICsgdGhpcy55ICogbS5hWzFdWzBdICsgdGhpcy56ICogbS5hWzJdWzBdICsgbS5hWzNdWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnggKiBtLmFbMF1bMV0gKyB0aGlzLnkgKiBtLmFbMV1bMV0gKyB0aGlzLnogKiBtLmFbMl1bMV0gKyBtLmFbM11bMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueCAqIG0uYVswXVsyXSArIHRoaXMueSAqIG0uYVsxXVsyXSArIHRoaXMueiAqIG0uYVsyXVsyXSArIG0uYVszXVsyXSk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9BcnJheSgpIHtcclxuICAgICAgICByZXR1cm4gW3RoaXMueCwgdGhpcy55LCB0aGlzLnpdO1xyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmVjM1NldCgpIHtcclxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICBsZXQgeCA9IGFyZ3VtZW50c1swXTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyB2ZWMzKHhbMF0sIHhbMV0sIHhbMl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyB2ZWMzKHgsIHgsIHgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMykge1xyXG4gICAgICAgIGxldCB4ID0gYXJndW1lbnRzWzBdLCB5ID0gYXJndW1lbnRzWzFdLCB6ID0gYXJndW1lbnRzWzJdO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IHZlYzMoeCwgeSwgeik7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyB2ZWM0IHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHosIHcpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgICAgICB0aGlzLncgPSB3O1xyXG4gICAgfVxyXG5cclxuICAgIGFkZCh2KSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyB2ZWM0KHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55LCB0aGlzLnogKyB2LnosIHRoaXMudyArIHYudyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3ViKHYpIHtcclxuICAgICAgICByZXR1cm4gbmV3IHZlYzQodGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueiwgdGhpcy53IC0gdi53KTtcclxuICAgIH1cclxuXHJcbiAgICBtdWwobikge1xyXG4gICAgICAgIHJldHVybiBuZXcgdmVjNCh0aGlzLnggKiBuLCB0aGlzLnkgKiBuLCB0aGlzLnogKiBuLCB0aGlzLncgKiBuKTtcclxuICAgIH1cclxuXHJcbiAgICBkb3Qodikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB2LnogKiB0aGlzLnogKyB0aGlzLncgKiB2Lnc7XHJcbiAgICB9XHJcblxyXG4gICAgbGVuKCkge1xyXG4gICAgICAgIGxldCBsZW4gPSB0aGlzLmRvdCh0aGlzKTtcclxuXHJcbiAgICAgICAgaWYgKGxlbiA9PSAxIHx8IGxlbiA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsZW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQobGVuKTtcclxuICAgIH1cclxuXHJcbiAgICBsZW4yKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRvdCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBub3JtYWxpemUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubXVsKDEgLyB0aGlzLmxlbigpKTtcclxuICAgIH1cclxuXHJcbiAgICB0b0FycmF5KCkge1xyXG4gICAgICAgIHJldHVybiBbdGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53XTtcclxuICAgIH1cclxuXHJcbiAgICBjaGVjaygpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHZlYzRTZXQoKSB7XHJcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgbGV0IHggPSBhcmd1bWVudHNbMF07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgdmVjNCh4LCB4LCB4LCB4KTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNCkge1xyXG4gICAgICAgIGxldCB4ID0gYXJndW1lbnRzWzBdLCB5ID0gYXJndW1lbnRzWzFdLCB6ID0gYXJndW1lbnRzWzJdLCB3ID0gYXJndW1lbnRzWzNdO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IHZlYzQoeCwgeSwgeiwgdyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm0zeDMoYTAwLCBhMDEsIGEwMixcclxuICAgICAgICAgICAgICAgICAgIGExMCwgYTExLCBhMTIsXHJcbiAgICAgICAgICAgICAgICAgICBhMjAsIGEyMSwgYTIyKSB7XHJcbiAgICByZXR1cm4gYTAwICogYTExICogYTIyICsgYTAxICogYTEyICogYTIwICsgYTAyICogYTEwICogYTIxIC1cclxuICAgICAgICAgICBhMDAgKiBhMTIgKiBhMjEgLSBhMDEgKiBhMTAgKiBhMjIgLSBhMDIgKiBhMTEgKiBhMjA7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBtYXQ0IHtcclxuICAgIGNvbnN0cnVjdG9yKGEwMCwgYTAxLCBhMDIsIGEwMyxcclxuICAgICAgICAgICAgICAgIGExMCwgYTExLCBhMTIsIGExMyxcclxuICAgICAgICAgICAgICAgIGEyMCwgYTIxLCBhMjIsIGEyMyxcclxuICAgICAgICAgICAgICAgIGEzMCwgYTMxLCBhMzIsIGEzMykge1xyXG4gICAgICAgIHRoaXMuYSA9IFtcclxuICAgICAgICAgICAgW2EwMCwgYTAxLCBhMDIsIGEwM10sXHJcbiAgICAgICAgICAgIFthMTAsIGExMSwgYTEyLCBhMTNdLFxyXG4gICAgICAgICAgICBbYTIwLCBhMjEsIGEyMiwgYTIzXSxcclxuICAgICAgICAgICAgW2EzMCwgYTMxLCBhMzIsIGEzM11cclxuICAgICAgICBdO1xyXG4gICAgfVxyXG5cclxuICAgIG11bChvYmopIHtcclxuICAgICAgICBsZXQgciA9IG5ldyBtYXQ0KCk7XHJcblxyXG4gICAgICAgIHIuYVswXVswXSA9IHRoaXMuYVswXVswXSAqIG9iai5hWzBdWzBdICsgdGhpcy5hWzBdWzFdICogb2JqLmFbMV1bMF0gKyBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMF1bMl0gKiBvYmouYVsyXVswXSArIHRoaXMuYVswXVszXSAqIG9iai5hWzNdWzBdO1xyXG5cclxuICAgICAgICByLmFbMF1bMV0gPSB0aGlzLmFbMF1bMF0gKiBvYmouYVswXVsxXSArIHRoaXMuYVswXVsxXSAqIG9iai5hWzFdWzFdICsgXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzBdWzJdICogb2JqLmFbMl1bMV0gKyB0aGlzLmFbMF1bM10gKiBvYmouYVszXVsxXTtcclxuXHJcbiAgICAgICAgci5hWzBdWzJdID0gdGhpcy5hWzBdWzBdICogb2JqLmFbMF1bMl0gKyB0aGlzLmFbMF1bMV0gKiBvYmouYVsxXVsyXSArIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYVswXVsyXSAqIG9iai5hWzJdWzJdICsgdGhpcy5hWzBdWzNdICogb2JqLmFbM11bMl07XHJcblxyXG4gICAgICAgIHIuYVswXVszXSA9IHRoaXMuYVswXVswXSAqIG9iai5hWzBdWzNdICsgdGhpcy5hWzBdWzFdICogb2JqLmFbMV1bM10gKyBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMF1bMl0gKiBvYmouYVsyXVszXSArIHRoaXMuYVswXVszXSAqIG9iai5hWzNdWzNdO1xyXG5cclxuICAgICAgICByLmFbMV1bMF0gPSB0aGlzLmFbMV1bMF0gKiBvYmouYVswXVswXSArIHRoaXMuYVsxXVsxXSAqIG9iai5hWzFdWzBdICsgXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzFdWzJdICogb2JqLmFbMl1bMF0gKyB0aGlzLmFbMV1bM10gKiBvYmouYVszXVswXTtcclxuXHJcbiAgICAgICAgci5hWzFdWzFdID0gdGhpcy5hWzFdWzBdICogb2JqLmFbMF1bMV0gKyB0aGlzLmFbMV1bMV0gKiBvYmouYVsxXVsxXSArIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYVsxXVsyXSAqIG9iai5hWzJdWzFdICsgdGhpcy5hWzFdWzNdICogb2JqLmFbM11bMV07XHJcblxyXG4gICAgICAgIHIuYVsxXVsyXSA9IHRoaXMuYVsxXVswXSAqIG9iai5hWzBdWzJdICsgdGhpcy5hWzFdWzFdICogb2JqLmFbMV1bMl0gKyBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMV1bMl0gKiBvYmouYVsyXVsyXSArIHRoaXMuYVsxXVszXSAqIG9iai5hWzNdWzJdO1xyXG5cclxuICAgICAgICByLmFbMV1bM10gPSB0aGlzLmFbMV1bMF0gKiBvYmouYVswXVszXSArIHRoaXMuYVsxXVsxXSAqIG9iai5hWzFdWzNdICsgXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzFdWzJdICogb2JqLmFbMl1bM10gKyB0aGlzLmFbMV1bM10gKiBvYmouYVszXVszXTtcclxuXHJcbiAgICAgICAgci5hWzJdWzBdID0gdGhpcy5hWzJdWzBdICogb2JqLmFbMF1bMF0gKyB0aGlzLmFbMl1bMV0gKiBvYmouYVsxXVswXSArIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYVsyXVsyXSAqIG9iai5hWzJdWzBdICsgdGhpcy5hWzJdWzNdICogb2JqLmFbM11bMF07XHJcblxyXG4gICAgICAgIHIuYVsyXVsxXSA9IHRoaXMuYVsyXVswXSAqIG9iai5hWzBdWzFdICsgdGhpcy5hWzJdWzFdICogb2JqLmFbMV1bMV0gKyBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMl1bMl0gKiBvYmouYVsyXVsxXSArIHRoaXMuYVsyXVszXSAqIG9iai5hWzNdWzFdO1xyXG5cclxuICAgICAgICByLmFbMl1bMl0gPSB0aGlzLmFbMl1bMF0gKiBvYmouYVswXVsyXSArIHRoaXMuYVsyXVsxXSAqIG9iai5hWzFdWzJdICsgXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzJdWzJdICogb2JqLmFbMl1bMl0gKyB0aGlzLmFbMl1bM10gKiBvYmouYVszXVsyXTtcclxuXHJcbiAgICAgICAgci5hWzJdWzNdID0gdGhpcy5hWzJdWzBdICogb2JqLmFbMF1bM10gKyB0aGlzLmFbMl1bMV0gKiBvYmouYVsxXVszXSArIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYVsyXVsyXSAqIG9iai5hWzJdWzNdICsgdGhpcy5hWzJdWzNdICogb2JqLmFbM11bM107XHJcblxyXG4gICAgICAgIHIuYVszXVswXSA9IHRoaXMuYVszXVswXSAqIG9iai5hWzBdWzBdICsgdGhpcy5hWzNdWzFdICogb2JqLmFbMV1bMF0gKyBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFbM11bMl0gKiBvYmouYVsyXVswXSArIHRoaXMuYVszXVszXSAqIG9iai5hWzNdWzBdO1xyXG5cclxuICAgICAgICByLmFbM11bMV0gPSB0aGlzLmFbM11bMF0gKiBvYmouYVswXVsxXSArIHRoaXMuYVszXVsxXSAqIG9iai5hWzFdWzFdICsgXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzNdWzJdICogb2JqLmFbMl1bMV0gKyB0aGlzLmFbM11bM10gKiBvYmouYVszXVsxXTtcclxuXHJcbiAgICAgICAgci5hWzNdWzJdID0gdGhpcy5hWzNdWzBdICogb2JqLmFbMF1bMl0gKyB0aGlzLmFbM11bMV0gKiBvYmouYVsxXVsyXSArIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYVszXVsyXSAqIG9iai5hWzJdWzJdICsgdGhpcy5hWzNdWzNdICogb2JqLmFbM11bMl07XHJcblxyXG4gICAgICAgIHIuYVszXVszXSA9IHRoaXMuYVszXVswXSAqIG9iai5hWzBdWzNdICsgdGhpcy5hWzNdWzFdICogb2JqLmFbMV1bM10gKyBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFbM11bMl0gKiBvYmouYVsyXVszXSArIHRoaXMuYVszXVszXSAqIG9iai5hWzNdWzNdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfVxyXG5cclxuICAgIGRldGVybSgpIHtcclxuICAgICAgICByZXR1cm4gK3RoaXMuYVswXVswXSAqIGRldGVybTN4Myh0aGlzLmFbMV1bMV0sIHRoaXMuYVsxXVsyXSwgdGhpcy5hWzFdWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVsyXVsxXSwgdGhpcy5hWzJdWzJdLCB0aGlzLmFbMl1bM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzNdWzFdLCB0aGlzLmFbM11bMl0sIHRoaXMuYVszXVszXSkgK1xyXG4gICAgICAgICAgICAgICAtdGhpcy5hWzBdWzFdICogZGV0ZXJtM3gzKHRoaXMuYVsxXVswXSwgdGhpcy5hWzFdWzJdLCB0aGlzLmFbMV1bM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzJdWzBdLCB0aGlzLmFbMl1bMl0sIHRoaXMuYVsyXVszXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbM11bMF0sIHRoaXMuYVszXVsyXSwgdGhpcy5hWzNdWzNdKSArXHJcbiAgICAgICAgICAgICAgICt0aGlzLmFbMF1bMl0gKiBkZXRlcm0zeDModGhpcy5hWzFdWzBdLCB0aGlzLmFbMV1bMV0sIHRoaXMuYVsxXVszXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMl1bMF0sIHRoaXMuYVsyXVsxXSwgdGhpcy5hWzJdWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVszXVswXSwgdGhpcy5hWzNdWzFdLCB0aGlzLmFbM11bM10pICtcclxuICAgICAgICAgICAgICAgLXRoaXMuYVswXVszXSAqIGRldGVybTN4Myh0aGlzLmFbMV1bMF0sIHRoaXMuYVsxXVsxXSwgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVsyXVswXSwgdGhpcy5hWzJdWzFdLCB0aGlzLmFbMl1bMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzNdWzBdLCB0aGlzLmFbM11bMV0sIHRoaXMuYVszXVsyXSk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJhbnNwb3NlKCkge1xyXG4gICAgICAgIGxldCBtID0gbmV3IG1hdDQoKTtcclxuXHJcbiAgICAgICAgbS5hWzBdWzBdID0gdGhpcy5hWzBdWzBdO1xyXG4gICAgICAgIG0uYVswXVsxXSA9IHRoaXMuYVsxXVswXTtcclxuICAgICAgICBtLmFbMF1bMl0gPSB0aGlzLmFbMl1bMF07XHJcbiAgICAgICAgbS5hWzBdWzNdID0gdGhpcy5hWzNdWzBdO1xyXG5cclxuICAgICAgICBtLmFbMV1bMF0gPSB0aGlzLmFbMF1bMV07XHJcbiAgICAgICAgbS5hWzFdWzFdID0gdGhpcy5hWzFdWzFdO1xyXG4gICAgICAgIG0uYVsxXVsyXSA9IHRoaXMuYVsyXVsxXTtcclxuICAgICAgICBtLmFbMV1bM10gPSB0aGlzLmFbM11bMV07XHJcblxyXG4gICAgICAgIG0uYVsyXVswXSA9IHRoaXMuYVswXVsyXTtcclxuICAgICAgICBtLmFbMl1bMV0gPSB0aGlzLmFbMV1bMl07XHJcbiAgICAgICAgbS5hWzJdWzJdID0gdGhpcy5hWzJdWzJdO1xyXG4gICAgICAgIG0uYVsyXVszXSA9IHRoaXMuYVszXVsyXTtcclxuXHJcbiAgICAgICAgbS5hWzNdWzBdID0gdGhpcy5hWzBdWzNdO1xyXG4gICAgICAgIG0uYVszXVsxXSA9IHRoaXMuYVsxXVszXTtcclxuICAgICAgICBtLmFbM11bMl0gPSB0aGlzLmFbMl1bM107XHJcbiAgICAgICAgbS5hWzNdWzNdID0gdGhpcy5hWzNdWzNdO1xyXG5cclxuICAgICAgICByZXR1cm4gbTtcclxuICAgIH1cclxuXHJcbiAgICBpbnZlcnNlKCkge1xyXG4gICAgICAgIGxldCBtID0gbmV3IG1hdDQoKSwgZGV0ID0gdGhpcy5kZXRlcm0oKTtcclxuXHJcbiAgICAgICAgaWYgKGRldCA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRySWRlbnRpdHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG0uYVswXVswXSA9XHJcbiAgICAgICAgICAgICtkZXRlcm0zeDModGhpcy5hWzFdWzFdLCB0aGlzLmFbMV1bMl0sIHRoaXMuYVsxXVszXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMl1bMV0sIHRoaXMuYVsyXVsyXSwgdGhpcy5hWzJdWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVszXVsxXSwgdGhpcy5hWzNdWzJdLCB0aGlzLmFbM11bM10pIC8gZGV0O1xyXG5cclxuICAgICAgICBtLmFbMV1bMF0gPVxyXG4gICAgICAgICAgICAtZGV0ZXJtM3gzKHRoaXMuYVsxXVswXSwgdGhpcy5hWzFdWzJdLCB0aGlzLmFbMV1bM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzJdWzBdLCB0aGlzLmFbMl1bMl0sIHRoaXMuYVsyXVszXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbM11bMF0sIHRoaXMuYVszXVsyXSwgdGhpcy5hWzNdWzNdKSAvIGRldDtcclxuXHJcbiAgICAgICAgbS5hWzJdWzBdID1cclxuICAgICAgICAgICAgK2RldGVybTN4Myh0aGlzLmFbMV1bMF0sIHRoaXMuYVsxXVsxXSwgdGhpcy5hWzFdWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVsyXVswXSwgdGhpcy5hWzJdWzFdLCB0aGlzLmFbMl1bM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzNdWzBdLCB0aGlzLmFbM11bMV0sIHRoaXMuYVszXVszXSkgLyBkZXQ7XHJcblxyXG4gICAgICAgIG0uYVszXVswXSA9XHJcbiAgICAgICAgICAgICtkZXRlcm0zeDModGhpcy5hWzFdWzBdLCB0aGlzLmFbMV1bMV0sIHRoaXMuYVsxXVsyXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMl1bMF0sIHRoaXMuYVsyXVsxXSwgdGhpcy5hWzJdWzJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVszXVswXSwgdGhpcy5hWzNdWzFdLCB0aGlzLmFbM11bMl0pIC8gZGV0O1xyXG5cclxuICAgICAgICBtLmFbMF1bMV0gPVxyXG4gICAgICAgICAgICAtZGV0ZXJtM3gzKHRoaXMuYVswXVsxXSwgdGhpcy5hWzBdWzJdLCB0aGlzLmFbMF1bM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzJdWzFdLCB0aGlzLmFbMl1bMl0sIHRoaXMuYVsyXVszXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbM11bMV0sIHRoaXMuYVszXVsyXSwgdGhpcy5hWzNdWzNdKSAvIGRldDtcclxuXHJcbiAgICAgICAgbS5hWzFdWzFdID1cclxuICAgICAgICAgICAgK2RldGVybTN4Myh0aGlzLmFbMF1bMF0sIHRoaXMuYVswXVsyXSwgdGhpcy5hWzBdWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVsyXVswXSwgdGhpcy5hWzJdWzJdLCB0aGlzLmFbMl1bM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzNdWzBdLCB0aGlzLmFbM11bMl0sIHRoaXMuYVszXVszXSkgLyBkZXQ7XHJcblxyXG4gICAgICAgIG0uYVsyXVsxXSA9XHJcbiAgICAgICAgICAgIC1kZXRlcm0zeDModGhpcy5hWzBdWzBdLCB0aGlzLmFbMF1bMV0sIHRoaXMuYVswXVszXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMl1bMF0sIHRoaXMuYVsyXVsxXSwgdGhpcy5hWzJdWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVszXVswXSwgdGhpcy5hWzNdWzFdLCB0aGlzLmFbM11bM10pIC8gZGV0O1xyXG5cclxuICAgICAgICBtLmFbM11bMV0gPVxyXG4gICAgICAgICAgICAtZGV0ZXJtM3gzKHRoaXMuYVswXVswXSwgdGhpcy5hWzBdWzFdLCB0aGlzLmFbMF1bMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzJdWzBdLCB0aGlzLmFbMl1bMV0sIHRoaXMuYVsyXVsyXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbM11bMF0sIHRoaXMuYVszXVsxXSwgdGhpcy5hWzNdWzJdKSAvIGRldDtcclxuXHJcbiAgICAgICAgbS5hWzBdWzJdID1cclxuICAgICAgICAgICAgK2RldGVybTN4Myh0aGlzLmFbMF1bMV0sIHRoaXMuYVswXVsyXSwgdGhpcy5hWzBdWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVsxXVsxXSwgdGhpcy5hWzFdWzJdLCB0aGlzLmFbMV1bM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzNdWzFdLCB0aGlzLmFbM11bMl0sIHRoaXMuYVszXVszXSkgLyBkZXQ7XHJcblxyXG4gICAgICAgIG0uYVsxXVsyXSA9XHJcbiAgICAgICAgICAgIC1kZXRlcm0zeDModGhpcy5hWzBdWzBdLCB0aGlzLmFbMF1bMl0sIHRoaXMuYVswXVszXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMV1bMF0sIHRoaXMuYVsxXVsyXSwgdGhpcy5hWzFdWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVszXVswXSwgdGhpcy5hWzNdWzJdLCB0aGlzLmFbM11bM10pIC8gZGV0O1xyXG5cclxuICAgICAgICBtLmFbMl1bMl0gPVxyXG4gICAgICAgICAgICArZGV0ZXJtM3gzKHRoaXMuYVswXVswXSwgdGhpcy5hWzBdWzFdLCB0aGlzLmFbMF1bM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzFdWzBdLCB0aGlzLmFbMV1bMV0sIHRoaXMuYVsxXVszXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbM11bMF0sIHRoaXMuYVszXVsxXSwgdGhpcy5hWzNdWzNdKSAvIGRldDtcclxuXHJcbiAgICAgICAgbS5hWzNdWzJdID1cclxuICAgICAgICAgICAgK2RldGVybTN4Myh0aGlzLmFbMF1bMF0sIHRoaXMuYVswXVsxXSwgdGhpcy5hWzBdWzJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVsxXVswXSwgdGhpcy5hWzFdWzFdLCB0aGlzLmFbMV1bMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzNdWzBdLCB0aGlzLmFbM11bMV0sIHRoaXMuYVszXVsyXSkgLyBkZXQ7XHJcblxyXG4gICAgICAgIG0uYVswXVszXSA9XHJcbiAgICAgICAgICAgICtkZXRlcm0zeDModGhpcy5hWzBdWzFdLCB0aGlzLmFbMF1bMl0sIHRoaXMuYVswXVszXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMV1bMV0sIHRoaXMuYVsxXVsyXSwgdGhpcy5hWzFdWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVsyXVsxXSwgdGhpcy5hWzJdWzJdLCB0aGlzLmFbMl1bM10pIC8gZGV0O1xyXG5cclxuICAgICAgICBtLmFbMV1bM10gPVxyXG4gICAgICAgICAgICAtZGV0ZXJtM3gzKHRoaXMuYVswXVswXSwgdGhpcy5hWzBdWzJdLCB0aGlzLmFbMF1bM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzFdWzBdLCB0aGlzLmFbMV1bMl0sIHRoaXMuYVsxXVszXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMl1bMF0sIHRoaXMuYVsyXVsyXSwgdGhpcy5hWzJdWzNdKSAvIGRldDtcclxuXHJcbiAgICAgICAgbS5hWzJdWzNdID1cclxuICAgICAgICAgICAgK2RldGVybTN4Myh0aGlzLmFbMF1bMF0sIHRoaXMuYVswXVsxXSwgdGhpcy5hWzBdWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVsxXVswXSwgdGhpcy5hWzFdWzFdLCB0aGlzLmFbMV1bM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hWzJdWzBdLCB0aGlzLmFbMl1bMV0sIHRoaXMuYVsyXVszXSkgLyBkZXQ7XHJcblxyXG4gICAgICAgIG0uYVszXVszXSA9XHJcbiAgICAgICAgICAgICtkZXRlcm0zeDModGhpcy5hWzBdWzBdLCB0aGlzLmFbMF1bMV0sIHRoaXMuYVswXVsyXSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFbMV1bMF0sIHRoaXMuYVsxXVsxXSwgdGhpcy5hWzFdWzJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYVsyXVswXSwgdGhpcy5hWzJdWzFdLCB0aGlzLmFbMl1bMl0pIC8gZGV0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBtO1xyXG4gICAgfVxyXG5cclxuICAgIHNldElkZW50aXR5KCkge1xyXG4gICAgICAgIHRoaXMuYVswXT0gWzEsIDAsIDAsIDBdO1xyXG4gICAgICAgIHRoaXMuYVsxXT0gWzAsIDEsIDAsIDBdO1xyXG4gICAgICAgIHRoaXMuYVsyXT0gWzAsIDAsIDEsIDBdO1xyXG4gICAgICAgIHRoaXMuYVszXT0gWzAsIDAsIDAsIDFdO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRTY2FsZSh2KSB7XHJcbiAgICAgICAgdGhpcy5hWzBdID0gW3YueCwgMCwgMCwgMF07XHJcbiAgICAgICAgdGhpcy5hWzFdID0gWzAsIHYueSwgMCwgMF07XHJcbiAgICAgICAgdGhpcy5hWzJdID0gWzAsIDAsIHYueiwgMF07XHJcbiAgICAgICAgdGhpcy5hWzNdID0gWzAsIDAsIDAsIDFdO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0VHJhbnNsYXRlKHYpIHtcclxuICAgICAgICB0aGlzLmFbMF0gPSBbMSwgMCwgMCwgMF07XHJcbiAgICAgICAgdGhpcy5hWzFdID0gWzAsIDEsIDAsIDBdO1xyXG4gICAgICAgIHRoaXMuYVsyXSA9IFswLCAwLCAxLCAwXTtcclxuICAgICAgICB0aGlzLmFbM10gPSBbdi54LCB2LnksIHYueiwgMV07XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRSb3RhdGVYKGFuZ2xlKSB7XHJcbiAgICAgICAgbGV0IGEgPSBkMnIoYW5nbGUpLCBzID0gTWF0aC5zaW4oYSksIGMgPSBNYXRoLmNvcyhhKTtcclxuICAgICAgICB0aGlzLnNldElkZW50aXR5KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hWzFdWzFdID0gYztcclxuICAgICAgICB0aGlzLmFbMV1bMl0gPSBzO1xyXG4gICAgICAgIHRoaXMuYVsyXVsxXSA9IC1zO1xyXG4gICAgICAgIHRoaXMuYVsyXVsyXSA9IGM7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRSb3RhdGVZKGFuZ2xlKSB7XHJcbiAgICAgICAgbGV0IGEgPSBkMnIoYW5nbGUpLCBzID0gTWF0aC5zaW4oYSksIGMgPSBNYXRoLmNvcyhhKTtcclxuICAgICAgICB0aGlzLnNldElkZW50aXR5KCk7XHJcblxyXG4gICAgICAgIHRoaXMuYVswXVswXSA9IGM7XHJcbiAgICAgICAgdGhpcy5hWzBdWzJdID0gLXM7XHJcbiAgICAgICAgdGhpcy5hWzJdWzBdID0gcztcclxuICAgICAgICB0aGlzLmFbMl1bMl0gPSBjO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRSb3RhdGVaKGFuZ2xlKSB7XHJcbiAgICAgICAgbGV0IGEgPSBkMnIoYW5nbGUpLCBzID0gTWF0aC5zaW4oYSksIGMgPSBNYXRoLmNvcyhhKTtcclxuICAgICAgICB0aGlzLnNldElkZW50aXR5KCk7XHJcblxyXG4gICAgICAgIHRoaXMuYVswXVswXSA9IGM7XHJcbiAgICAgICAgdGhpcy5hWzBdWzJdID0gcztcclxuICAgICAgICB0aGlzLmFbMl1bMF0gPSAtcztcclxuICAgICAgICB0aGlzLmFbMl1bMl0gPSBjO1xyXG4gICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0Um90YXRlKHYsIGFuZ2xlKSB7XHJcbiAgICAgICAgbGV0IGEgPSBkMnIoYW5nbGUpLCBzID0gTWF0aC5zaW4oYSksIGMgPSBNYXRoLmNvcyhhKTtcclxuICAgICAgICBsZXQgciA9IHYubm9ybWFsaXplKCksIG0gPSBuZXcgbWF0NCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYVswXVswXSA9IGMgKyByLnggKiByLnggKiAoMSAtIGMpO1xyXG4gICAgICAgIHRoaXMuYVswXVsxXSA9IHIueCAqIHIueSAqICgxIC0gYykgKyByLnogKiBzO1xyXG4gICAgICAgIHRoaXMuYVswXVsyXSA9IHIueCAqIHIueiAqICgxIC0gYykgLSByLnkgKiBzO1xyXG4gICAgICAgIHRoaXMuYVswXVszXSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYVsxXVswXSA9IHIueSAqIHIueCAqICgxIC0gYykgLSByLnogKiBzO1xyXG4gICAgICAgIHRoaXMuYVsxXVsxXSA9IGMgKyByLnkgKiByLnkgKiAoMSAtIGMpO1xyXG4gICAgICAgIHRoaXMuYVsxXVsyXSA9IHIueSAqIHIueiAqICgxIC0gYykgKyByLnogKiBzO1xyXG4gICAgICAgIHRoaXMuYVsxXVszXSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYVsyXVswXSA9IHIueiAqIHIueCAqICgxIC0gYykgKyByLnkgKiBzO1xyXG4gICAgICAgIHRoaXMuYVsyXVsxXSA9IHIueiAqIHIueSAqICgxIC0gYykgLSByLnggKiBzO1xyXG4gICAgICAgIHRoaXMuYVsyXVsyXSA9IGMgKyByLnogKiByLnogKiAoMSAtIGMpO1xyXG4gICAgICAgIHRoaXMuYVsyXVszXSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYVszXVswXSA9IDA7XHJcbiAgICAgICAgdGhpcy5hWzNdWzFdID0gMDtcclxuICAgICAgICB0aGlzLmFbM11bMl0gPSAwO1xyXG4gICAgICAgIHRoaXMuYVszXVszXSA9IDE7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Vmlldyhsb2MsIGF0LCB1cDEpIHtcclxuICAgICAgICBsZXRcclxuICAgICAgICAgICAgZGlyID0gYXQuc3ViKGxvYykubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIHJpZ2h0ID0gZGlyLmNyb3NzKHVwMSkubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIHVwID0gcmlnaHQuY3Jvc3MoZGlyKTtcclxuXHJcbiAgICAgICAgdGhpcy5hWzBdID0gW3JpZ2h0LngsIHVwLngsIC1kaXIueCwgMF07XHJcbiAgICAgICAgdGhpcy5hWzFdID0gW3JpZ2h0LnksIHVwLnksIC1kaXIueSwgMF07XHJcbiAgICAgICAgdGhpcy5hWzJdID0gW3JpZ2h0LnosIHVwLnosIC1kaXIueiwgMF07XHJcbiAgICAgICAgdGhpcy5hWzNdID0gWy1sb2MuZG90KHJpZ2h0KSwgLWxvYy5kb3QodXApLCBsb2MuZG90KGRpciksIDFdO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRGcnVzdHVtKGwsIHIsIGIsIHQsIG4sIGYpIHtcclxuICAgICAgICB0aGlzLmFbMF0gPSBbMiAqIG4gLyAociAtIGwpLCAwLCAwLCAwXTtcclxuICAgICAgICB0aGlzLmFbMV0gPSBbMCwgMiAqIG4gLyAodCAtIGIpLCAwLCAwXTtcclxuICAgICAgICB0aGlzLmFbMl0gPSBbKHIgKyBsKSAvIChyIC0gbCksICh0ICsgYikgLyAodCAtIGIpLCAoZiArIG4pIC8gKG4gLSBmKSwgLTFdO1xyXG4gICAgICAgIHRoaXMuYVszXSA9IFswLCAwLCAyICogbiAqIGYgLyAobiAtIGYpLCAwXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgdG9BcnJheSgpIHtcclxuICAgICAgICByZXR1cm4gW3RoaXMuYVswXVswXSwgdGhpcy5hWzBdWzFdLCB0aGlzLmFbMF1bMl0sIHRoaXMuYVswXVszXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuYVsxXVswXSwgdGhpcy5hWzFdWzFdLCB0aGlzLmFbMV1bMl0sIHRoaXMuYVsxXVszXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuYVsyXVswXSwgdGhpcy5hWzJdWzFdLCB0aGlzLmFbMl1bMl0sIHRoaXMuYVsyXVszXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuYVszXVswXSwgdGhpcy5hWzNdWzFdLCB0aGlzLmFbM11bMl0sIHRoaXMuYVszXVszXV07XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2soKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5hWzBdLCB0aGlzLmFbMV0sIHRoaXMuYVsyXSwgdGhpcy5hWzNdKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1hdHJJZGVudGl0eSgpIHtcclxuICAgIHJldHVybiBuZXcgbWF0NCgpLnNldElkZW50aXR5KCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXRyU2NhbGUodikge1xyXG4gICAgcmV0dXJuIG5ldyBtYXQ0KCkuc2V0U2NhbGUodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXRyVHJhbnNsYXRlKHYpIHtcclxuICAgIHJldHVybiBuZXcgbWF0NCgpLnNldFRyYW5zbGF0ZSh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1hdHJSb3RhdGVYKGFuZ2xlKSB7XHJcbiAgICByZXR1cm4gbmV3IG1hdDQoKS5zZXRSb3RhdGVYKGFuZ2xlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1hdHJSb3RhdGVZKGFuZ2xlKSB7XHJcbiAgICByZXR1cm4gbmV3IG1hdDQoKS5zZXRSb3RhdGVZKGFuZ2xlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1hdHJSb3RhdGVaKGFuZ2xlKSB7XHJcbiAgICByZXR1cm4gbmV3IG1hdDQoKS5zZXRSb3RhdGVaKGFuZ2xlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1hdHJSb3RhdGUodiwgYW5nbGUpIHtcclxuICAgIHJldHVybiBuZXcgbWF0NCgpLnNldFJvdGF0ZSh2LCBhbmdsZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBjYW1lcmEge1xyXG4gICAgY29uc3RydWN0b3IoZ2wpIHtcclxuICAgICAgICB0aGlzLmdsID0gZ2w7XHJcbiAgICAgICAgdGhpcy5wcm9qU2l6ZSA9IDAuMTtcclxuICAgICAgICB0aGlzLnByb2pEaXN0ID0gMC4xO1xyXG4gICAgICAgIHRoaXMucHJvakZhckNsaXAgPSAxMDAwO1xyXG5cclxuICAgICAgICB0aGlzLmZyYW1lVyA9IDUwMDtcclxuICAgICAgICB0aGlzLmZyYW1lSCA9IDUwMDtcclxuXHJcbiAgICAgICAgdGhpcy5tYXRyVmlldyA9IG5ldyBtYXQ0KCk7IFxyXG4gICAgICAgIHRoaXMubWF0clByb2ogPSBuZXcgbWF0NCgpOyBcclxuICAgICAgICB0aGlzLm1hdHJWUCA9IG5ldyBtYXQ0KCk7XHJcbiAgICAgICAgdGhpcy5sb2MgPSBuZXcgdmVjMygpOyAgICAgIFxyXG4gICAgICAgIHRoaXMuYXQgPSBuZXcgdmVjMygpOyAgICAgICBcclxuICAgICAgICB0aGlzLmRpciA9IG5ldyB2ZWMzKCk7ICAgICBcclxuICAgICAgICB0aGlzLnVwID0gbmV3IHZlYzMoKTsgICAgICAgXHJcbiAgICAgICAgdGhpcy5yaWdodCA9IG5ldyB2ZWMzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0KGxvYywgYXQsIHVwKSB7XHJcbiAgICAgICAgdGhpcy5tYXRyVmlldy5zZXRWaWV3KGxvYywgYXQsIHVwKTtcclxuICAgICAgICB0aGlzLmxvYyA9IGxvYztcclxuICAgICAgICB0aGlzLmF0ID0gYXQ7XHJcbiAgICAgICAgdGhpcy5kaXIgPSAgIHZlYzNTZXQoLXRoaXMubWF0clZpZXcuYVswXVsyXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtdGhpcy5tYXRyVmlldy5hWzFdWzJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC10aGlzLm1hdHJWaWV3LmFbMl1bMl0pO1xyXG4gICAgICAgIHRoaXMudXAgPSAgICB2ZWMzU2V0KHRoaXMubWF0clZpZXcuYVswXVsxXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hdHJWaWV3LmFbMV1bMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXRyVmlldy5hWzJdWzFdKTtcclxuICAgICAgICB0aGlzLnJpZ2h0ID0gdmVjM1NldCh0aGlzLm1hdHJWaWV3LmFbMF1bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXRyVmlldy5hWzFdWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWF0clZpZXcuYVsyXVswXSk7XHJcblxyXG4gICAgICAgIHRoaXMubWF0clZQID0gdGhpcy5tYXRyVmlldy5tdWwodGhpcy5tYXRyUHJvaik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvaigpIHtcclxuICAgICAgICBsZXQgcngsIHJ5O1xyXG5cclxuICAgICAgICByeCA9IHRoaXMucHJvalNpemU7XHJcbiAgICAgICAgcnkgPSByeDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZnJhbWVXID4gdGhpcy5mcmFtZUgpIHtcclxuICAgICAgICAgICAgcnggKj0gdGhpcy5mcmFtZVcgLyB0aGlzLmZyYW1lSDsgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByeSAqPSB0aGlzLmZyYW1lSCAvIHRoaXMuZnJhbWVXO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tYXRyUHJvai5zZXRGcnVzdHVtKC1yeCAvIDIsIHJ4IC8gMiwgLXJ5IC8gMiwgcnkgLyAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9qRGlzdCwgdGhpcy5wcm9qRmFyQ2xpcCk7XHJcbiAgICAgICAgdGhpcy5tYXRyVlAgPSB0aGlzLm1hdHJWaWV3Lm11bCh0aGlzLm1hdHJQcm9qKTtcclxuICAgIH1cclxuXHJcbiAgICByZXNpemUobncsIG5oKSB7XHJcbiAgICAgICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCBudywgbmgpO1xyXG5cclxuICAgICAgICB0aGlzLmZyYW1lVyA9IG53O1xyXG4gICAgICAgIHRoaXMuZnJhbWVIID0gbmg7XHJcbiAgICAgICAgdGhpcy5wcm9qKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjYW1lcmFDcmVhdGUoZ2wpIHtcclxuICAgIHJldHVybiBuZXcgY2FtZXJhKGdsKTtcclxufVxyXG5cclxuLy8gbGV0IHYxID0gbmV3IHZlYzMoMywgNDUsIDYpO1xyXG4vLyBsZXQgdjIgPSBuZXcgdmVjMyg2LCAyLCAtMSk7XHJcbi8vIFxyXG4vLyBsZXQgdjMgPSB2Mi5ub3JtYWxpemUoKTtcclxuLy8gXHJcbi8vIGNvbnNvbGUubG9nKHYyLCB2Myk7XHJcbi8vIFxyXG4vLyBsZXQgdjQgPSBuZXcgdmVjMygpO1xyXG4vLyBcclxuLy8gY29uc29sZS5sb2codjQpO1xyXG4vLyBcclxuLy8gbGV0IG0xID0gbmV3IG1hdDQoNS42LCA0LjQzLCAzLjQsIDMyMCxcclxuLy8gICAgICAgICAgICAgICAgICAgMzIsIDIsIDMuNDQsIDMyLjMsXHJcbi8vICAgICAgICAgICAgICAgICAgIDMsIDEsIDEyLCA5LjAzLFxyXG4vLyAgICAgICAgICAgICAgICAgICA5MywgNCwgNCwgMyk7XHJcbi8vIFxyXG4vLyBsZXQgbTIgPSBuZXcgbWF0NCg0LjUsIDM5LCA5MCwgMixcclxuLy8gICAgICAgICAgICAgICAgICAgMSwgMy45LCAzLjIsIDQuNSxcclxuLy8gICAgICAgICAgICAgICAgICAgMi40LCA0LjUsIDMsIDIsXHJcbi8vICAgICAgICAgICAgICAgICAgIDEsIDEsIDEsIDMuNCk7XHJcbi8vIFxyXG4vLyBsZXQgdjUgPSB2ZWMzU2V0KDIsIDQsIDUpO1xyXG4iLCJpbXBvcnQgeyBnbCB9IGZyb20gXCIuL3JlbmRlci5qc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIHRleHR1cmUge1xyXG4gICAgY29uc3RydWN0b3IoZmlsZU5hbWUpIHtcclxuICAgICAgICB0aGlzLmdsSWQgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICB0aGlzLmltYWdlLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5nbElkKTtcclxuICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB0aGlzLmltYWdlKTtcclxuXHJcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW1hZ2Uuc3JjID0gZmlsZU5hbWU7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgdGV4dHVyZSB9IGZyb20gXCIuL3RleHR1cmUuanNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBtYXRlcmlhbCB7XHJcbiAgICBjb25zdHJ1Y3RvcihrYSwga2QsIGtzLCBwaCkge1xyXG4gICAgICAgIHRoaXMua2EgPSBrYTtcclxuICAgICAgICB0aGlzLmtkID0ga2Q7XHJcbiAgICAgICAgdGhpcy5rcyA9IGtzO1xyXG4gICAgICAgIHRoaXMucGggPSBwaDtcclxuICAgICAgICB0aGlzLnNoYWRlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBhZGRTaGFkZXIoc2hhZGVyUHJvZ3JhbSkge1xyXG4gICAgICAgIHRoaXMuc2hhZGVyID0gc2hhZGVyUHJvZ3JhbTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRUZXh0dXJlKGZpbGVOYW1lKSB7XHJcbiAgICAgICAgbGV0IHRleCA9IG5ldyB0ZXh0dXJlKGZpbGVOYW1lKTtcclxuICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXg7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gS29wdGVsb3YgTmlraXRhLCAwOS0xLCAwNy4wNi4yMDIzLCBOSzFcclxuXHJcbmltcG9ydCB7IHZlYzIsIHZlYzJTZXQsIHZlYzMsIHZlYzNTZXQsIHZlYzQsIGQyciwgcjJkLFxyXG4gICAgICAgICB2ZWM0U2V0LCBtYXQ0LCBtYXRySWRlbnRpdHksIG1hdHJUcmFuc2xhdGUsXHJcbiAgICAgICAgIG1hdHJTY2FsZSwgbWF0clJvdGF0ZVgsIG1hdHJSb3RhdGVZLCBtYXRyUm90YXRlWixcclxuICAgICAgICAgbWF0clJvdGF0ZVxyXG4gICAgICAgfSBmcm9tIFwiLi9tdGguanNcIjtcclxuXHJcbmltcG9ydCB7IGdsLCBjYW0gfSBmcm9tIFwiLi9yZW5kZXIuanNcIjtcclxuXHJcbmltcG9ydCB7IG1hdGVyaWFsIH0gZnJvbSBcIi4vbWF0ZXJpYWwuanNcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmb28oKSB7XHJcbiAgICBsZXQgdiA9IG5ldyB2ZWMzKDEwMiwgNDcsIDgpO1xyXG5cclxuICAgIC8vIHYuY2hlY2soKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZEZpbGVBc3luYyhmaWxlTmFtZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGZpbGVOYW1lKTtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0XHJcbiAgICB2ZXJ0ZXhGb3JtYXQgPSBcInh5enJnYmF4eXp1dlwiLFxyXG4gICAgc2l6ZUluQnl0ZXMgPSB2ZXJ0ZXhGb3JtYXQubGVuZ3RoICogNCxcclxuICAgIHNpemVJbk51bWJlcnMgPSB2ZXJ0ZXhGb3JtYXQubGVuZ3RoO1xyXG5cclxuY2xhc3MgdmVydGV4IHtcclxuICAgIGNvbnN0cnVjdG9yKHAsIGMsIG4sIHQpIHtcclxuICAgICAgICB0aGlzLnAgPSBwO1xyXG4gICAgICAgIHRoaXMuYyA9IGM7XHJcbiAgICAgICAgdGhpcy5uID0gbjtcclxuICAgICAgICB0aGlzLnQgPSB0O1xyXG4gICAgfVxyXG5cclxuICAgIHRvQXJyYXkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucC50b0FycmF5KCkuY29uY2F0KHRoaXMuYy50b0FycmF5KCkpLmNvbmNhdCh0aGlzLm4udG9BcnJheSgpKS5jb25jYXQodGhpcy50LnRvQXJyYXkoKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZlcnRleFNldCgpIHtcclxuICAgIGxldCBwLCBjLCBuLCB0O1xyXG5cclxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDQpIHtcclxuICAgICAgICBwID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICAgIGMgPSBhcmd1bWVudHNbMV07XHJcbiAgICAgICAgbiA9IGFyZ3VtZW50c1syXTtcclxuICAgICAgICB0ID0gYXJndW1lbnRzWzNdO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgbGV0IGEgPSBhcmd1bWVudHNbMF07XHJcblxyXG4gICAgICAgIHAgPSB2ZWMzU2V0KGFbMF0sIGFbMV0sIGFbMl0pO1xyXG4gICAgICAgIGMgPSB2ZWM0U2V0KGFbM10sIGFbNF0sIGFbNV0sIGFbNl0pO1xyXG4gICAgICAgIG4gPSB2ZWMzU2V0KGFbN10sIGFbOF0sIGFbOV0pO1xyXG4gICAgICAgIHQgPSB2ZWMyU2V0KGFbMTBdLCBhWzExXSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBwID0gdmVjM1NldChhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcclxuICAgICAgICBjID0gdmVjNFNldChhcmd1bWVudHNbM10sIGFyZ3VtZW50c1s0XSwgYXJndW1lbnRzWzVdLCBhcmd1bWVudHNbNl0pO1xyXG4gICAgICAgIG4gPSB2ZWMzU2V0KGFyZ3VtZW50c1s3XSwgYXJndW1lbnRzWzhdLCBhcmd1bWVudHNbOV0pO1xyXG4gICAgICAgIHQgPSB2ZWMyU2V0KGFyZ3VtZW50c1sxMF0sIGFyZ3VtZW50c1sxMV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgdmVydGV4KHAsIGMsIG4sIHQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2ZXJ0ZXhUb1ByaW0oYXJyYXkpIHtcclxuICAgIC8vIGFycmF5IGlzIGFycmF5IG9mIG9iamVjdHMgb2YgY2xhc3MgdmVydGV4XHJcbiAgICBsZXQgcmVzID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFycmF5WzBdLmNvbnN0cnVjdG9yLm5hbWUgPT0gXCJ2ZXJ0ZXhcIikge1xyXG4gICAgICAgICAgICByZXMgPSByZXMuY29uY2F0KGFycmF5W2ldLnRvQXJyYXkoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXMgPSByZXMuY29uY2F0KGFycmF5W2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlcztcclxufVxyXG5cclxuY2xhc3MgYnVmZmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKGdsX2J1ZmZlcl90eXBlKSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gZ2xfYnVmZmVyX3R5cGU7XHJcbiAgICAgICAgdGhpcy5idWYgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBiaW5kKCkge1xyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIodGhpcy50eXBlLCB0aGlzLmJ1Zik7XHJcbiAgICB9XHJcblxyXG4gICAgZGVsZXRlKCkge1xyXG4gICAgICAgIGdsLmRlbGV0ZUJ1ZmZlcih0aGlzLmJ1Zik7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIHZlcnRleF9idWZmZXIgZXh0ZW5kcyBidWZmZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoZ2wuQVJSQVlfQlVGRkVSKTtcclxuICAgIH1cclxuXHJcbiAgICBkYXRhKHZEYXRhKSB7XHJcbiAgICAgICAgLy8gV0lQXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBwcmltIHtcclxuICAgIGNvbnN0cnVjdG9yKHR5cGUsIHZEYXRhLCBpRGF0YSwgbXRsKSB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICBsZXQgdG1wID0gYXJndW1lbnRzWzBdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50eXBlID0gdG1wLnR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMudkRhdGEgPSB0bXAudkRhdGE7XHJcbiAgICAgICAgICAgIHRoaXMuaURhdGEgPSB0bXAuaURhdGE7XHJcblxyXG4gICAgICAgICAgICBpZiAodG1wLm10bCA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tdGwgPSBuZXcgbWF0ZXJpYWwodmVjM1NldCgxKSwgdmVjM1NldCgxKSwgdmVjM1NldCgxKSwgMzQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NoYWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubXRsID0gdG1wLm10bDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy52Q250ID0gdG1wLnZEYXRhLmxlbmd0aCAvIHNpemVJbk51bWJlcnM7XHJcbiAgICAgICAgICAgIHRoaXMuaUNudCA9IHRtcC5pRGF0YS5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRyYW5zID0gbWF0cklkZW50aXR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgICAgICB0aGlzLnZEYXRhID0gdkRhdGE7XHJcbiAgICAgICAgICAgIHRoaXMuaURhdGEgPSBpRGF0YTtcclxuXHJcbiAgICAgICAgICAgIGlmIChtdGwgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hhZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubXRsID0gbmV3IG1hdGVyaWFsKHZlYzNTZXQoMSksIHZlYzNTZXQoMSksIHZlYzNTZXQoMSksIDM0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFkZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm10bCA9IG10bDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy52Q250ID0gdkRhdGEubGVuZ3RoIC8gc2l6ZUluTnVtYmVycztcclxuICAgICAgICAgICAgdGhpcy5pQ250ID0gaURhdGEubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50cmFucyA9IG1hdHJJZGVudGl0eSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMudkNudCAhPSAwKSB7XHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSB2ZXJ0ZXggYnVmZmVyIG9iamVjdFxyXG4gICAgICAgICAgICB0aGlzLnZCdWYgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgICAgICAgICAgdGhpcy52QXJyYXkgPSBnbC5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xyXG4gICAgICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkodGhpcy52QXJyYXkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMudkJ1Zik7XHJcbiAgICAgICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRoaXMudkRhdGEpLCBnbC5TVEFUSUNfRFJBVyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKDAsIDMsIGdsLkZMT0FULCBmYWxzZSwgc2l6ZUluQnl0ZXMsIDApOyAgLy8gcG9zaXRpb25cclxuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcigxLCA0LCBnbC5GTE9BVCwgZmFsc2UsIHNpemVJbkJ5dGVzLCAxMik7IC8vIGNvbG9yXHJcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoMiwgMywgZ2wuRkxPQVQsIGZhbHNlLCBzaXplSW5CeXRlcywgMjgpOyAvLyBub3JtYWxcclxuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcigzLCAyLCBnbC5GTE9BVCwgZmFsc2UsIHNpemVJbkJ5dGVzLCA0MCk7IC8vIHV2ICh0ZXh0dXJlIGNvb3JkaW5hdGVzKVxyXG5cclxuICAgICAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoMCk7XHJcbiAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KDEpO1xyXG4gICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgyKTtcclxuICAgICAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoMyk7XHJcblxyXG4gICAgICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pQ250ICE9IDApIHtcclxuICAgICAgICAgICAgLy8gQ3JlYXRlIGluZGV4IGJ1ZmZlciBvYmplY3RcclxuICAgICAgICAgICAgdGhpcy5pQnVmID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuaUJ1Zik7XHJcbiAgICAgICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MzJBcnJheSh0aGlzLmlEYXRhKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyh3b3JsZE1hdHIpIHtcclxuICAgICAgICBsZXRcclxuICAgICAgICAgICAgdyA9IHRoaXMudHJhbnMubXVsKHdvcmxkTWF0ciksXHJcbiAgICAgICAgICAgIHdpbnYgPSB3LmludmVyc2UoKS50cmFuc3Bvc2UoKSxcclxuICAgICAgICAgICAgd3ZwID0gdy5tdWwoY2FtLm1hdHJWUCk7XHJcblxyXG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZBcnJheSk7XHJcblxyXG4gICAgICAgIGdsLnVzZVByb2dyYW0odGhpcy5tdGwuc2hhZGVyKTtcclxuXHJcbiAgICAgICAgbGV0IGxvYztcclxuICAgICAgICBjb25zdCB1bmlmb3JtcyA9IFtbXCJtYXRyV1ZQXCIsIHd2cF0sIFtcIm1hdHJXXCIsIHddLCBbXCJtYXRyV0ludlwiLCB3aW52XSwgW1wiY2FtTG9jXCIsIGNhbS5sb2NdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFtcImthXCIsIHRoaXMubXRsLmthXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJrZFwiLCB0aGlzLm10bC5rZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgW1wia3NcIiwgdGhpcy5tdGwua3NdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFtcInBoXCIsIHRoaXMubXRsLnBoXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJpc1NoYWRlXCIsIHRoaXMuaXNTaGFkZV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgW1wiaXNUZXh0dXJlZFwiLCB0aGlzLm10bC50ZXh0dXJlICE9IG51bGxdXTtcclxuXHJcbiAgICAgICAgdW5pZm9ybXMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBsb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5tdGwuc2hhZGVyLCBlbGVtZW50WzBdKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsb2MgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50WzFdID09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2wudW5pZm9ybTFpKGxvYywgZWxlbWVudFsxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbGVtZW50WzFdLmNvbnN0cnVjdG9yLm5hbWUgPT0gXCJtYXQ0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KGxvYywgZmFsc2UsIG5ldyBGbG9hdDMyQXJyYXkoZWxlbWVudFsxXS50b0FycmF5KCkpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGVsZW1lbnRbMV0uY29uc3RydWN0b3IubmFtZSA9PSBcInZlYzRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGdsLnVuaWZvcm00ZnYobG9jLCBuZXcgRmxvYXQzMkFycmF5KGVsZW1lbnRbMV0udG9BcnJheSgpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbGVtZW50WzFdLmNvbnN0cnVjdG9yLm5hbWUgPT0gXCJ2ZWMzXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBnbC51bmlmb3JtM2Z2KGxvYywgbmV3IEZsb2F0MzJBcnJheShlbGVtZW50WzFdLnRvQXJyYXkoKSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2wudW5pZm9ybTFmKGxvYywgZWxlbWVudFsxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubXRsLnRleHR1cmUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLm10bC50ZXh0dXJlLmdsSWQpO1xyXG4gICAgICAgICAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwKTtcclxuXHJcbiAgICAgICAgICAgIGxvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLm10bC5zaGFkZXIsIFwidGV4dHVyZTBcIik7XHJcbiAgICAgICAgICAgIGlmIChsb2MgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTFpKGxvYywgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlDbnQgPT0gMCkge1xyXG4gICAgICAgICAgICBnbC5kcmF3QXJyYXlzKHRoaXMudHlwZSwgMCwgdGhpcy52Q250KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuaUJ1Zik7XHJcbiAgICAgICAgICAgIGdsLmRyYXdFbGVtZW50cyh0aGlzLnR5cGUsIHRoaXMuaUNudCwgZ2wuVU5TSUdORURfSU5ULCAwKTtcclxuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuXHJcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRTaGFkZXIoc2hhZGVyUHJvZ3JhbSkge1xyXG4gICAgICAgIHRoaXMuc2hhZGVyID0gc2hhZGVyUHJvZ3JhbTtcclxuICAgIH1cclxuXHJcbiAgICByZWN0YW5nbGUodywgaCkge1xyXG4gICAgICAgIGNvbnN0IHZEYXRhID0gWzAsIDAsIDAsICAgMCwgMCwgMCwgMSwgICAwLCAwLCAxLCAgIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIGgsIDAsICAwLCAwLCAwLCAxLCAgIDEsIDAsIDEsICAgMCwgMSxcclxuICAgICAgICAgICAgdywgaCwgMCwgIDAsIDAsIDAsIDEsICAgMSwgMSwgMSwgIDEsIDEsXHJcbiAgICAgICAgICAgIHcsIDAsIDAsICAgMCwgMCwgMCwgMSwgICAxLCAxLCAxLCAgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgICAwLCAwLCAwLCAxLCAgIDEsIDEsIDEsICAgMCwgMF07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgcHJpbShnbC5UUklBTkdMRV9TVFJJUCwgdkRhdGEsIFtdKTtcclxuICAgIH1cclxuXHJcbiAgICBoZXhhaGVkcm9uKCkge1xyXG4gICAgICAgIGNvbnN0IHZEYXRhID0gW1xyXG4gICAgICAgICAgICAwLCAwLCAxLCAgMSwgMCwgMCwgMSwgIDAsIDAsIDEsICAwLCAxLFxyXG4gICAgICAgICAgICAwLCAxLCAxLCAgMCwgMSwgMCwgMSwgIDEsIDEsIDEsICAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLCAgMCwgMCwgMSwgMSwgIDEsIDEsIDEsICAxLCAwLFxyXG4gICAgICAgICAgICAxLCAwLCAxLCAgMSwgMSwgMSwgMSwgIDEsIDEsIDEsICAxLCAxLFxyXG5cclxuICAgICAgICAgICAgMCwgMCwgMCwgIDEsIDAsIDAsIDEsICAxLCAxLCAxLCAgMCwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMCwgIDAsIDEsIDAsIDEsICAxLCAxLCAxLCAgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCwgIDAsIDAsIDEsIDEsICAxLCAxLCAxLCAgMSwgMCxcclxuICAgICAgICAgICAgMSwgMCwgMCwgIDEsIDEsIDEsIDEsICAxLCAxLCAxLCAgMSwgMSxcclxuICAgICAgICBdO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgaURhdGEgPSBbMCwgMSwgMiwgMiwgMywgMCwgNCwgNSwgNiwgNiwgNywgNCxcclxuICAgICAgICAgICAgICAgICAgICAgMCwgMSwgNSwgNSwgNCwgMCwgMywgMiwgNiwgNiwgNywgMyxcclxuICAgICAgICAgICAgICAgICAgICAgMSwgNSwgMiwgNSwgMiwgNiwgMCwgNCwgMywgNCwgMywgN107XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgcHJpbShnbC5UUklBTkdMRVMsIHZlcnRleFRvUHJpbSh2RGF0YSksIGlEYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBweXJhbWlkZSgpIHtcclxuICAgICAgICBjb25zdCB2RGF0YSA9IFtcclxuICAgICAgICAgICAgMCwgMCwgMCwgICAgMSwgMCwgMCwgMSwgICAgICAxLCAxLCAxLCAgMCwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMTAsICAgMCwgMSwgMCwgMSwgICAgICAxLCAxLCAxLCAgMCwgMSxcclxuICAgICAgICAgICAgMTAsIDAsIDAsICAgMCwgMCwgMSwgMSwgICAgICAxLCAxLCAxLCAgMCwgMSxcclxuICAgICAgICAgICAgMTAsIDAsIDEwLCAgMC41LCAwLCAwLjUsIDEsICAxLCAxLCAxLCAgMCwgMSxcclxuICAgICAgICAgICAgNSwgNywgNSwgICAgMCwgMCwgMCwgMSwgICAgICAxLCAxLCAxLCAgMCwgMVxyXG4gICAgICAgICAgICBcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBjb25zdCBpRGF0YSA9IFtcclxuICAgICAgICAgICAgMCwgMiwgMSwgMiwgMywgMSxcclxuICAgICAgICAgICAgMSwgNCwgMywgNCwgMywgMiwgNCwgMiwgMCwgNCwgMSwgMFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgcHJpbShnbC5UUklBTkdMRVMsIHZEYXRhLCBpRGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGV0cmFoZWRyb24oKSB7XHJcbiAgICAgICAgbGV0IHYzID0gTWF0aC5zcXJ0KDMpO1xyXG4gICAgICAgIGNvbnN0IHZEYXRhID0gW1xyXG4gICAgICAgICAgICAwLCAwLCAwLCAgICAgICAgIDEsIDAsIDAsIDEsICAgICAgICAgICAgICAgMSwgMSwgMSwgIDAsIDEsXHJcbiAgICAgICAgICAgIDEsIDAsIDAsICAgICAgICAwLCAxLCAwLCAxLCAgICAgICAgICAgICAgICAxLCAxLCAxLCAgMCwgMSxcclxuICAgICAgICAgICAgMC41LCAwLCB2MyAvIDIsICAgICAgIDAsIDAsIDEsIDEsICAgICAgICAgIDEsIDEsIDEsICAwLCAxLFxyXG4gICAgICAgICAgICAwLjUsIE1hdGguc3FydCgyIC8gMyksIHYzIC8gNiwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgIDAsIDFcclxuICAgICAgICBdO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgaURhdGEgPSBbMCwgMSwgMiwgMywgMCwgMSwgMywgMCwgMiwgMywgMSwgMl07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgcHJpbShnbC5UUklBTkdMRVMsIHZEYXRhLCBpRGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgb2N0YWhlZHJvbigpIHtcclxuICAgICAgICBjb25zdCB2RGF0YSA9IFtcclxuICAgICAgICAgICAgMCwgMCwgMCwgIDEsIDAsIDAsIDEsICAxLCAxLCAxLCAgMCwgMSxcclxuICAgICAgICAgICAgMSwgMCwgMCwgIDAsIDEsIDAsIDEsICAxLCAxLCAxLCAgMCwgMSxcclxuICAgICAgICAgICAgMSwgMCwgMSwgIDAsIDAsIDEsIDEsICAxLCAxLCAxLCAgMCwgMSxcclxuICAgICAgICAgICAgMCwgMCwgMSwgIDEsIDEsIDEsIDEsICAxLCAxLCAxLCAgMCwgMSxcclxuXHJcbiAgICAgICAgICAgIDAuNSwgTWF0aC5zcXJ0KDEgLyAyKSwgMC41LCAxLCAxLCAwLCAxLCAgIDEsIDEsIDEsIDAsIDEsXHJcbiAgICAgICAgICAgIDAuNSwgLU1hdGguc3FydCgxIC8gMiksIDAuNSwgMSwgMCwgMSwgMSwgIDEsIDEsIDEsIDAsIDEsXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgY29uc3QgaURhdGEgPSBbXHJcbiAgICAgICAgICAgIDAsIDEsIDIsXHJcbiAgICAgICAgICAgIDAsIDIsIDMsXHJcbiAgICAgICAgICAgIDQsIDMsIDIsIDQsIDMsIDAsIDQsIDEsIDAsIDQsIDEsIDIsXHJcbiAgICAgICAgICAgIDUsIDMsIDIsIDUsIDMsIDAsIDUsIDEsIDAsIDUsIDEsIDJcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IHByaW0oZ2wuVFJJQU5HTEVTLCB2RGF0YSwgaURhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGljb3NhaGVkcm9uKCkge1xyXG4gICAgICAgIGNvbnN0IHZEYXRhID0gW1xyXG4gICAgICAgICAgICAwLCAwLCAwLCAgIDEsIDAsIDAsIDEsICAgMCwgMSwgMCwgICAwLCAxLFxyXG4gICAgICAgICAgICAtTWF0aC5zaW4oZDJyKDE4KSksIDAsIE1hdGguY29zKGQycigxOCkpLCAgIDAsIDEsIDAsIDEsICAgMCwgMSwgMCwgICAwLCAxLFxyXG4gICAgICAgICAgICAtTWF0aC5zaW4oZDJyKDE4KSkgKyBNYXRoLmNvcyhkMnIoMzYpKSwgMCwgTWF0aC5jb3MoZDJyKDE4KSkgKyBNYXRoLnNpbihkMnIoMzYpKSwgICAwLCAwLCAxLCAxLCAgIDAsIDEsIDAsICAgMCwgMSxcclxuICAgICAgICAgICAgMSArIE1hdGguc2luKGQycigxOCkpLCAwLCBNYXRoLmNvcyhkMnIoMTgpKSwgICAxLCAwLCAwLCAxLCAgIDAsIDEsIDAsICAgMCwgMSxcclxuICAgICAgICAgICAgMSwgMCwgMCwgICAwLCAxLCAwLCAxLCAgIDAsIDEsIDAsICAgMCwgMSxcclxuICAgICAgICAgICAgdmVjM1NldCgxLCAwLCAwKS5wb2ludFRyYW5zZm9ybShtYXRyUm90YXRlWSgzNikpLngsIHZlYzNTZXQoMSwgMCwgMCkucG9pbnRUcmFuc2Zvcm0obWF0clJvdGF0ZVkoMzYpKS55LFxyXG4gICAgICAgICAgICB2ZWMzU2V0KDEsIDAsIDApLnBvaW50VHJhbnNmb3JtKG1hdHJSb3RhdGVZKDM2KSkueiwgMSwgMCwgMSwgMCwgMSwgMCwgMSwgMCwgMVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGNvbnN0IGlEYXRhID0gW1xyXG4gICAgICAgICAgICAwLCAxLCAyLFxyXG4gICAgICAgICAgICAwLCAyLCA0LFxyXG4gICAgICAgICAgICAyLCAzLCA0LFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgcHJpbShnbC5UUklBTkdMRVMsIHZEYXRhLCBpRGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmFuZG9tKCkge1xyXG4gICAgICAgIGNvbnN0IGcgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdkRhdGEgPSBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsICAgMSwgMCwgMCwgMSwgICAgMSwgMSwgMSwgIDAsIDEsXHJcbiAgICAgICAgICAgIGcoKSwgMCwgMCwgMCwgMSwgMCwgMSwgICAgMSwgMSwgMSwgIDAsIDEsXHJcbiAgICAgICAgICAgIGcoKSwgMCwgZygpLCAwLCAwLCAxLCAxLCAgMSwgMSwgMSwgIDAsIDEsXHJcbiAgICAgICAgICAgIDAuNSwgZygpLCAwLCAxLCAxLCAxLCAxLCAgMSwgMSwgMSwgIDAsIDFcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBjb25zdCBpRGF0YSA9IFtcclxuICAgICAgICAgICAgMCwgMSwgMiwgMywgMCwgMSwgMywgMCwgMiwgMywgMSwgMlxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgcHJpbShnbC5MSU5FX1NUUklQLCB2RGF0YSwgaURhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGF4aXMoKSB7XHJcbiAgICAgICAgY29uc3QgdkRhdGEgPSBbMCwgMCwgMCwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMCwgMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAxNSwgMCwgMCwgMSwgMCwgMCwgMSwgMSwgMSwgMSwgMCwgMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAwLCAxNSwgMCwgMCwgMSwgMCwgMSwgMSwgMSwgMSwgMCwgMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxNSwgMCwgMCwgMSwgMSwxLCAxLCAxLCAwLCAxXTtcclxuXHJcbiAgICAgICAgY29uc3QgaURhdGEgPSBbMCwgMSwgMCwgMCwgMiwgMCwgMCwgMywgMF07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgcHJpbShnbC5MSU5FX1NUUklQLCB2RGF0YSwgaURhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGdyaWQoc2l6ZSwgcywgY29sb3IpIHtcclxuICAgICAgICBsZXQgdkRhdGEgPSBbXSwgaURhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IGJlZ2luID0gdmVjM1NldChzaXplLCAwLCBzaXplKSwgZW5kID0gdmVjM1NldChzaXplLCAwLCAtc2l6ZSksIG4gPSBNYXRoLmZsb29yKHNpemUgLyBzKSAqIDI7XHJcbiAgICAgICAgbGV0IG5tID0gdmVjM1NldCgwLCAxLCAwKSwgdCA9IHZlYzJTZXQoMCwgMSk7XHJcbiAgICAgICAgbGV0IGN1cnIgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICB2RGF0YS5wdXNoKHZlcnRleFNldChiZWdpbi5hZGQodmVjM1NldCgtcyAqIGksIDAsIDApKSwgY29sb3IsIG5tLCB0KS50b0FycmF5KCkpO1xyXG4gICAgICAgICAgICBpRGF0YS5wdXNoKGN1cnIpO1xyXG4gICAgICAgICAgICBjdXJyKys7XHJcbiAgICAgICAgICAgIHZEYXRhLnB1c2godmVydGV4U2V0KGVuZC5hZGQodmVjM1NldCgtcyAqIGksIDAsIDApKSwgY29sb3IsIG5tLCB0KS50b0FycmF5KCkpO1xyXG4gICAgICAgICAgICBpRGF0YS5wdXNoKGN1cnIsIGN1cnIgLSAxKTtcclxuICAgICAgICAgICAgY3VycisrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZW5kID0gdmVjM1NldCgtc2l6ZSwgMCwgc2l6ZSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZEYXRhLnB1c2godmVydGV4U2V0KGJlZ2luLmFkZCh2ZWMzU2V0KDAsIDAsIC1zICogaSkpLCBjb2xvciwgbm0sIHQpLnRvQXJyYXkoKSk7XHJcbiAgICAgICAgICAgIGlEYXRhLnB1c2goY3Vycik7XHJcbiAgICAgICAgICAgIGN1cnIrKztcclxuICAgICAgICAgICAgdkRhdGEucHVzaCh2ZXJ0ZXhTZXQoZW5kLmFkZCh2ZWMzU2V0KDAsIDAsIC1zICogaSkpLCBjb2xvciwgbm0sIHQpLnRvQXJyYXkoKSk7XHJcbiAgICAgICAgICAgIGlEYXRhLnB1c2goY3VyciwgY3VyciAtIDEpO1xyXG4gICAgICAgICAgICBjdXJyKys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmV3IHByaW0oZ2wuTElORV9TVFJJUCwgdmVydGV4VG9QcmltKHZEYXRhKSwgaURhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGxvYWRPYmooZmlsZU5hbWUpIHtcclxuICAgICAgICBjb25zdCBfdGV4dCA9IGxvYWRGaWxlQXN5bmMoYC4vYmluL21vZGVscy8ke2ZpbGVOYW1lfWApO1xyXG5cclxuICAgICAgICBjb25zdCBwcm9taXNlID0gUHJvbWlzZS5hbGwoW190ZXh0XSkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSByZXNbMF07XHJcbiAgICAgICAgICAgIGxldCB2RGF0YSA9IFtdLCBpRGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KFwiXFxuXCIpLCBuID0gbGluZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0ciA9IGxpbmVzW2ldICsgXCIgXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0clswXSA9PSBcInZcIiAmJiBzdHJbMV0gPT0gXCIgXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0gMiwgYSA9IFtdLCBudW1iZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgMzsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChzdHJbcG9zXSAhPSBcIiBcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyICs9IHN0cltwb3MrK107IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGEucHVzaChwYXJzZUZsb2F0KG51bWJlcikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHAgPSB2ZWMzU2V0KGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjID0gdmVjNFNldCgwLjUsIDAuNSwgMC41LCAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdkRhdGEucHVzaCh2ZXJ0ZXhTZXQocCwgYywgdmVjM1NldCgwKSwgdmVjMlNldCgwLCAxKSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RyWzBdID09IFwiZlwiICYmIHN0clsxXSA9PSBcIiBcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3MgPSAyLCBudW1iZXI7XHJcbiBcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDM7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW1iZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoc3RyW3Bvc10gIT0gXCIvXCIgJiYgc3RyW3Bvc10gIT0gXCIgXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlciArPSBzdHJbcG9zKytdOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoc3RyW3Bvc10gIT0gXCIgXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcysrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlEYXRhLnB1c2gocGFyc2VJbnQobnVtYmVyKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MrKztcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlEYXRhLmxlbmd0aDsgaSArPSAzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcDAgPSB2RGF0YVtpRGF0YVtpXV0sIHAxID0gdkRhdGFbaURhdGFbaSArIDFdXSwgcDIgPSB2RGF0YVtpRGF0YVtpICsgMl1dO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBubSA9IHAxLnAuc3ViKHAwLnApLmNyb3NzKHAyLnAuc3ViKHAwLnApKS5ub3JtYWxpemUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBwMC5uID0gcDAubi5hZGQobm0pO1xyXG4gICAgICAgICAgICAgICAgcDEubiA9IHAxLm4uYWRkKG5tKTtcclxuICAgICAgICAgICAgICAgIHAyLm4gPSBwMi5uLmFkZChubSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IG10bCA9IG5ldyBtYXRlcmlhbCh2ZWMzU2V0KDAuMiwgMC4xLCAwLjA1KSwgdmVjM1NldCgwLjcsIDAuNCwgMC4yKSwgdmVjM1NldCgxLjUpLCA1KTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBwcmltKGdsLlRSSUFOR0xFUywgdmVydGV4VG9QcmltKHZEYXRhKSwgaURhdGEsIG10bCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZm9yIChpID0gMDsgaSA8IG5mOyBpICs9IDMpXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgICAgbmsxVkVSVEVYXHJcbiAgICAvLyAgICAgKnAwID0gJlZbSW5kW2ldXSxcclxuICAgIC8vICAgICAqcDEgPSAmVltJbmRbaSArIDFdXSxcclxuICAgIC8vICAgICAqcDIgPSAmVltJbmRbaSArIDJdXTtcclxuICAgIC8vICAgICBWRUMgTiA9IFZlY05vcm1hbGl6ZShWZWNDcm9zc1ZlYyhWZWNTdWJWZWMocDEtPlAsIHAwLT5QKSwgVmVjU3ViVmVjKHAyLT5QLCBwMC0+UCkpKTtcclxuLy8gXHJcbiAgICAvLyAgICAgcDAtPk4gPSBWZWNBZGRWZWMocDAtPk4sIE4pO1xyXG4gICAgLy8gICAgIHAxLT5OID0gVmVjQWRkVmVjKHAxLT5OLCBOKTtcclxuICAgIC8vICAgICBwMi0+TiA9IFZlY0FkZFZlYyhwMi0+TiwgTik7XHJcbiAgICAvLyB9XHJcbn1cclxuIiwiZXhwb3J0IGNsYXNzIHRpbWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5vbGRUaW1lID0gdGhpcy5vbGRUaW1lRlBTID0gRGF0ZS5ub3coKTtcclxuICAgICAgICB0aGlzLnBhdXNlVGltZSA9IHRoaXMuZnJhbWVDb3VudGVyID0gMDtcclxuICAgICAgICB0aGlzLmdsb2JhbCA9IHt9O1xyXG4gICAgICAgIHRoaXMuZ2xvYmFsLmZwcyA9IDA7XHJcbiAgICAgICAgdGhpcy5nbG9iYWwuaXNQYXVzZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc3BvbnNlKCkge1xyXG4gICAgICAgIGNvbnN0IHQgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgICB0aGlzLmdsb2JhbC5nbG9iYWxUaW1lID0gdCAtIHRoaXMuc3RhcnRUaW1lO1xyXG4gICAgICAgIHRoaXMuZ2xvYmFsLmdsb2JhbERlbHRhVGltZSA9IHQgLSB0aGlzLm9sZFRpbWU7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2xvYmFsLmlzUGF1c2UpIHtcclxuICAgICAgICAgICAgdGhpcy5nbG9iYWwuZGVsdGFUaW1lID0gMDtcclxuICAgICAgICAgICAgdGhpcy5wYXVzZVRpbWUgKz0gdCAtIHRoaXMub2xkVGltZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmdsb2JhbC5kZWx0YVRpbWUgPSB0aGlzLmdsb2JhbC5nbG9iYWxEZWx0YVRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsLnRpbWUgPSB0IC0gdGhpcy5wYXVzZVRpbWUgLSB0aGlzLnN0YXJ0VGltZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVDb3VudGVyKys7XHJcblxyXG4gICAgICAgIGlmICh0IC0gdGhpcy5vbGRUaW1lRlBTID4gMTAwMCkge1xyXG4gICAgICAgICAgICAgLy8gZXZlcnkgc2Vjb25kIG1lYXN1cmUgRlBTXHJcbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsLmZwcyA9IHRoaXMuZnJhbWVDb3VudGVyIC8gKCh0IC0gdGhpcy5vbGRUaW1lRlBTKSAvIDEwMDAuMCk7XHJcbiAgICAgICAgICAgIHRoaXMub2xkVGltZUZQUyA9IHQ7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3VudGVyID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vbGRUaW1lID0gdDtcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgY2xhc3MgaW5wdXQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5rZXlzID0gW107XHJcbiAgICAgICAgdGhpcy5rZXlzT2xkID0gW107XHJcbiAgICAgICAgdGhpcy5rZXlzQ2xpY2sgPSBbXTtcclxuICAgICAgICB0aGlzLm0gPSB7XHJcbiAgICAgICAgICAgIGxDbGljazogZmFsc2UsXHJcbiAgICAgICAgICAgIHJDbGljazogZmFsc2UsXHJcbiAgICAgICAgICAgIG14OiAwLCBteTogMCwgbXo6IDAsXHJcbiAgICAgICAgICAgIG1keDogMCwgbWR5OiAwLCBtZHo6IDAsXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNoaWZ0ID0gMjUwO1xyXG4gICAgICAgIHRoaXMuY29udHJvbCA9IDI1MTtcclxuICAgICAgICB0aGlzLnNwYWNlID0gMjUyO1xyXG4gICAgICAgIHRoaXMuYWx0ID0gMjUzO1xyXG5cclxuICAgICAgICB0aGlzLmlzSG9sZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI1NTsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMua2V5cy5wdXNoKGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5rZXlzT2xkLnB1c2goZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLmtleXNDbGljay5wdXNoKGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LmtleS5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzW2V2ZW50LmtleS5jaGFyQ29kZUF0KCldID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT0gXCJTaGlmdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzW3RoaXMuc2hpZnRdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09IFwiQ29udHJvbFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzW3RoaXMuY29udHJvbF0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT0gXCJTcGFjZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzW3RoaXMuc3BhY2VdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09IFwiQWx0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXNbdGhpcy5hbHRdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI1NTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleXNbaV0gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5pc0hvbGQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tLm14ID0gZXZlbnQuY2xpZW50WDtcclxuICAgICAgICAgICAgdGhpcy5tLm15ID0gZXZlbnQuY2xpZW50WTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzSG9sZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tLmxDbGljayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubS5yQ2xpY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNIb2xkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMubS5sQ2xpY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5tLnJDbGljayA9IGZhbHNlO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm0ubXggPSBldmVudC5jbGllbnRYO1xyXG4gICAgICAgICAgICB0aGlzLm0ubXkgPSBldmVudC5jbGllbnRZO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tLm1keCA9IGV2ZW50Lm1vdmVtZW50WDtcclxuICAgICAgICAgICAgdGhpcy5tLm1keSA9IGV2ZW50Lm1vdmVtZW50WTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzSG9sZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tLmxDbGljayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubS5yQ2xpY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tLm1keiA9IGV2ZW50LmRlbHRhWTtcclxuICAgICAgICAgICAgdGhpcy5tLm16ICs9IGV2ZW50LmRlbHRhWTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHNldERlZmF1bHQoKSB7XHJcbiAgICAgICAgdGhpcy5tLm1keCA9IDA7XHJcbiAgICAgICAgdGhpcy5tLm1keSA9IDA7XHJcbiAgICAgICAgdGhpcy5tLm1keiA9IDA7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgY2FtZXJhQ3JlYXRlLCBtYXRySWRlbnRpdHksIHZlYzMsIHZlYzNTZXQsIG1hdHJTY2FsZSxcclxuICAgICAgICAgdmVjNCwgdmVjNFNldCwgZDJyLCByMmQsXHJcbiAgICAgICAgIG1hdHJSb3RhdGUsIG1hdHJSb3RhdGVYLCBtYXRyUm90YXRlWSwgbWF0clJvdGF0ZVosIG1hdHJUcmFuc2xhdGUgfSBmcm9tIFwiLi9tdGguanNcIjtcclxuXHJcbmltcG9ydCB7IHByaW0gfSBmcm9tIFwiLi9wcmltLmpzXCI7XHJcbmltcG9ydCB7IG1hdGVyaWFsIH0gZnJvbSBcIi4vbWF0ZXJpYWwuanNcIjtcclxuaW1wb3J0IHsgdGltZXIgfSBmcm9tIFwiLi90aW1lci5qc1wiO1xyXG5pbXBvcnQgeyBpbnB1dCB9IGZyb20gXCIuL2lucHV0LmpzXCI7XHJcblxyXG5pbXBvcnQgeyB0ZXh0dXJlIH0gZnJvbSBcIi4vdGV4dHVyZS5qc1wiO1xyXG5cclxuLy8gR2xvYmFsIFdlYkdMIGNvbnRleHRcclxubGV0IGdsLCBjYW0sIHRpbSwgaW5wLCBjYW52YXM7XHJcblxyXG5leHBvcnQgeyBnbCwgY2FtLCB0aW0sIGlucCB9O1xyXG5cclxuLy8gQ2FudmFzIDJEIGNvbnRleHRcclxuZnVuY3Rpb24gaW5pdDJEKCkge1xyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0dXRvcmlhbFwiKTtcclxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IC8gNjtcclxuXHJcbiAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKCkgPT4ge1xyXG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gICAgfSk7XHJcbiAgICBpbWFnZS5zcmMgPSBcImJpbi90ZXh0dXJlcy9jYW52YXMyZC5qcGdcIjtcclxuICAgIGNvbnNvbGUubG9nKGN0eCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhbWVyYUhhbmRsZSgpIHtcclxuICAgIGlmIChpbnAua2V5c1tpbnAuc2hpZnRdIHx8IDEpIHtcclxuICAgICAgICBsZXQgZGlzdCwgY29zVCwgc2luVCwgcGxlbiwgY29zUCwgc2luUCwgYXppbXV0aCwgZWxldmF0b3I7XHJcblxyXG4gICAgICAgIGRpc3QgPSBjYW0uYXQuc3ViKGNhbS5sb2MpLmxlbigpO1xyXG4gICAgICAgIGNvc1QgPSAoY2FtLmxvYy55IC0gY2FtLmF0LnkpIC8gZGlzdDtcclxuICAgICAgICBzaW5UID0gTWF0aC5zcXJ0KDEgLSBjb3NUICogY29zVCk7XHJcbiAgICAgICAgcGxlbiA9IGRpc3QgKiBzaW5UO1xyXG4gICAgICAgIGNvc1AgPSAoY2FtLmxvYy56IC0gY2FtLmF0LnopIC8gcGxlbjtcclxuICAgICAgICBzaW5QID0gKGNhbS5sb2MueCAtIGNhbS5hdC54KSAvIHBsZW47XHJcbiAgICAgICAgYXppbXV0aCA9IHIyZChNYXRoLmF0YW4yKHNpblAsIGNvc1ApKTtcclxuICAgICAgICBlbGV2YXRvciA9IHIyZChNYXRoLmF0YW4yKHNpblQsIGNvc1QpKTtcclxuXHJcbiAgICAgICAgbGV0IGxjID0gMDtcclxuXHJcbiAgICAgICAgaWYgKGlucC5tLmxDbGljaykgbGMgPSAxO1xyXG5cclxuICAgICAgICBhemltdXRoICs9IHRpbS5nbG9iYWwuZ2xvYmFsRGVsdGFUaW1lICogMyAqICgtNC43ICogbGMgKiBpbnAubS5tZHggLyAxMDAwLjApO1xyXG4gICAgXHJcbiAgICAgICAgZWxldmF0b3IgKz0gdGltLmdsb2JhbC5nbG9iYWxEZWx0YVRpbWUgKiAzICogKC00LjcgKiBsYyAqIGlucC5tLm1keSAvIDEwMDAuMCk7XHJcblxyXG4gICAgICAgIGlmIChlbGV2YXRvciA8IDAuMSkge1xyXG4gICAgICAgIGVsZXZhdG9yID0gMC4xO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZWxldmF0b3IgPiAxNzguOSkge1xyXG4gICAgICAgIGVsZXZhdG9yID0gMTc4Ljk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYWx0ID0gMDtcclxuXHJcbiAgICAgICAgaWYgKGlucC5rZXlzW2lucC5hbHRdKSBhbHQgPSAxO1xyXG5cclxuICAgICAgICBkaXN0ICs9IHRpbS5nbG9iYWwuZ2xvYmFsRGVsdGFUaW1lICogKDEgKyBhbHQgKiAxMCkgKiAoaW5wLm0ubWR6IC8gMzAwLjApO1xyXG5cclxuICAgICAgICBpZiAoZGlzdCA8IDAuMSkge1xyXG4gICAgICAgICAgICBkaXN0ID0gMC4xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucC5rZXlzW2lucC5jb250cm9sXSkgeyAgICBcclxuICAgICAgICAgICAgbGV0IFdwLCBIcCwgc3gsIHN5O1xyXG4gICAgICAgICAgICBsZXQgZHYgPSBuZXcgdmVjMygpO1xyXG5cclxuICAgICAgICAgICAgV3AgPSBIcCA9IGNhbS5wcm9qU2l6ZTtcclxuICAgICAgICAgICAgaWYgKGNhbS5mcmFtZVcgPiBjYW0uZnJhbWVIKSB7XHJcbiAgICAgICAgICAgICAgICBXcCAqPSBjYW0uZnJhbWVXIC8gY2FtLmZyYW1lSDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIEhwICo9IGNhbS5mcmFtZUggLyBjYW0uZnJhbWVXO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN4ID0gLWlucC5tLm1keCAqIFdwIC8gY2FtLmZyYW1lVyAqIGRpc3QgLyBjYW0ucHJvakRpc3Q7XHJcbiAgICAgICAgICAgIHN5ID0gaW5wLm0ubWR5ICogSHAgLyBjYW0uZnJhbWVIICogZGlzdCAvIGNhbS5wcm9qRGlzdDtcclxuXHJcbiAgICAgICAgICAgIGR2ID0gKGNhbS5yaWdodC5tdWwoc3gpKS5hZGQoY2FtLnVwLmNyb3NzKGNhbS5yaWdodCkubXVsKHN5KSk7XHJcbiAgICAgICAgICAgIGNhbS5hdCA9IGNhbS5hdC5hZGQoZHYpO1xyXG4gICAgICAgICAgICBjYW0ubG9jID0gY2FtLmxvYy5hZGQoZHYpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FtLmxvYyA9IHZlYzNTZXQoMCwgZGlzdCwgMCkucG9pbnRUcmFuc2Zvcm0oXHJcbiAgICAgICAgICAgIChtYXRyUm90YXRlWChlbGV2YXRvcikubXVsKG1hdHJSb3RhdGVZKGF6aW11dGgpKSkubXVsKG1hdHJUcmFuc2xhdGUoY2FtLmF0KSlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjYW0uc2V0KGNhbS5sb2MsIGNhbS5hdCwgdmVjM1NldCgwLCAxLCAwKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlucC5rZXlzWycxJy5jaGFyQ29kZUF0KCldKSB7XHJcbiAgICAgICAgY2FtLnNldCh2ZWMzU2V0KDAsIDIwMCwgMzAwKSwgdmVjM1NldCgwKSwgdmVjM1NldCgwLCAxLCAwKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlucC5rZXlzWycyJy5jaGFyQ29kZUF0KCldKSB7XHJcbiAgICAgICAgY2FtLnNldCh2ZWMzU2V0KDAsIDIwMCwgLTMwMCksIHZlYzNTZXQoMCksIHZlYzNTZXQoMCwgMSwgMCkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBsb2FkU2hhZGVyKHR5cGUsIHNvdXJjZSkge1xyXG4gICAgY29uc3Qgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKHR5cGUpO1xyXG5cclxuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XHJcbiAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XHJcblxyXG4gICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBhbGVydChcIlNoYWRlciBub3QgY29tcGlsZWQhXCIpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNoYWRlcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRHTChjYW52YXNJRCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coMTIzKTtcclxuICAgIC8vIGxldCB2ID0gbmV3IHZlYzMoMywgNCwgNSk7XHJcbiAgICAvLyB2LmNoZWNrKCk7XHJcbiAgICAvLyBmb28oKTtcclxuXHJcbiAgICAvLyBpbml0MkQoKTtcclxuXHJcbiAgICBjb25zdCBpbml0ID0gKCkgPT4ge1xyXG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNhbnZhc0lEKTtcclxuICAgICAgICBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KFwid2ViZ2wyXCIpO1xyXG5cclxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuNTE0LCAwLjMwMiwgMC4wOTQsIDEpO1xyXG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuXHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xyXG5cclxuICAgICAgICBjYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gd2luZG93LmlubmVySGVpZ2h0IC8gNjtcclxuXHJcbiAgICAgICAgY2FtID0gY2FtZXJhQ3JlYXRlKGdsKTtcclxuICAgICAgICBjYW0ucmVzaXplKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgY2FtLnNldCh2ZWMzU2V0KDIwLCAyMCwgMzApLCB2ZWMzU2V0KDApLCB2ZWMzU2V0KDAsIDEsIDApKTtcclxuICAgICAgICAvLyBjYW0uc2V0KHZlYzNTZXQoMCwgMjAsIDIwKSwgdmVjM1NldCgwKSwgdmVjM1NldCgwLCAxLCAwKSk7XHJcblxyXG4gICAgICAgIHRpbSA9IG5ldyB0aW1lcigpO1xyXG4gICAgICAgIGlucCA9IG5ldyBpbnB1dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlbmRlciA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCB2cyA9IGAjdmVyc2lvbiAzMDAgZXNcclxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xyXG4gICAgICAgICAgICBsYXlvdXQobG9jYXRpb24gPSAwKSBpbiB2ZWMzIGluX3BvcztcclxuICAgICAgICAgICAgbGF5b3V0KGxvY2F0aW9uID0gMSkgaW4gdmVjNCBpbl9jb2xvcjtcclxuICAgICAgICAgICAgbGF5b3V0KGxvY2F0aW9uID0gMikgaW4gdmVjMyBpbl9ub3JtYWw7XHJcbiAgICAgICAgICAgIGxheW91dChsb2NhdGlvbiA9IDMpIGluIHZlYzIgaW5fdGV4Q29vcmQ7IFxyXG4gICAgICAgICAgICB1bmlmb3JtIG1hdDQgbWF0clcsIG1hdHJXSW52LCBtYXRyV1ZQOyBcclxuICAgICAgICAgICAgb3V0IHZlYzQgdl9jb2xvcjtcclxuICAgICAgICAgICAgb3V0IHZlYzMgdl9wb3MsIHZfbm9ybWFsO1xyXG4gICAgICAgICAgICBvdXQgdmVjMiB2X3RleENvb3JkO1xyXG5cclxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSBtYXRyV1ZQICogdmVjNChpbl9wb3MsIDEpO1xyXG4gICAgICAgICAgICAgICAgZ2xfUG9pbnRTaXplID0gNC4wO1xyXG4gICAgICAgICAgICAgICAgdl9jb2xvciA9IGluX2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgdl9wb3MgPSAobWF0clcgKiB2ZWM0KGluX3BvcywgMSkpLnh5ejtcclxuICAgICAgICAgICAgICAgIHZfbm9ybWFsID0gbWF0MyhtYXRyV0ludikgKiBpbl9ub3JtYWw7XHJcbiAgICAgICAgICAgICAgICB2X3RleENvb3JkID0gaW5fdGV4Q29vcmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBjb25zdCBmcyA9IGAjdmVyc2lvbiAzMDAgZXNcclxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xyXG4gICAgICAgICAgICBvdXQgdmVjNCBmX2NvbG9yO1xyXG4gICAgICAgICAgICBpbiB2ZWM0IHZfY29sb3I7XHJcbiAgICAgICAgICAgIGluIHZlYzMgdl9wb3MsIHZfbm9ybWFsO1xyXG4gICAgICAgICAgICBpbiB2ZWMyIHZfdGV4Q29vcmQ7XHJcbiAgICAgICAgICAgIHVuaWZvcm0gdmVjMyBjYW1Mb2MsIGthLCBrZCwga3M7XHJcbiAgICAgICAgICAgIHVuaWZvcm0gZmxvYXQgcGg7XHJcbiAgICAgICAgICAgIHVuaWZvcm0gYm9vbCBpc1NoYWRlLCBpc1RleHR1cmVkO1xyXG5cclxuICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTA7XHJcblxyXG4gICAgICAgICAgICB2ZWMzIHNoYWRlKHZlYzMgcCwgdmVjMyBuKSB7XHJcbiAgICAgICAgICAgICAgICB2ZWMzIGwgPSBub3JtYWxpemUodmVjMygxLCAxNSwgMTApKTtcclxuICAgICAgICAgICAgICAgIHZlYzMgbGMgPSB2ZWMzKDEpO1xyXG4gICAgICAgICAgICAgICAgdmVjMyBjb2xvciA9IHZlYzMoMCk7XHJcbiAgICAgICAgICAgICAgICB2ZWMzIHYgPSBub3JtYWxpemUocCAtIGNhbUxvYyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBrYTtcclxuXHJcbiAgICAgICAgICAgICAgICBuID0gZmFjZWZvcndhcmQobiwgdiwgbik7XHJcblxyXG4gICAgICAgICAgICAgICAgY29sb3IgKz0gbWF4KDAuMCwgZG90KG4sIGwpKSAqIGtkICogbGM7IFxyXG5cclxuICAgICAgICAgICAgICAgIHZlYzMgciA9IHJlZmxlY3Qodiwgbik7XHJcbiAgICAgICAgICAgICAgICBjb2xvciArPSBwb3cobWF4KDAuMCwgZG90KHIsIGwpKSwgcGgpICoga3MgKiBsYztcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc1NoYWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZl9jb2xvciA9IHZlYzQocG93KHNoYWRlKHZfcG9zLCBub3JtYWxpemUodl9ub3JtYWwpKSwgdmVjMygxLjAgLyAyLjIpKSwgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc1RleHR1cmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZl9jb2xvciA9IHRleHR1cmUodGV4dHVyZTAsIHZlYzIoMSwgLTEpICogdl90ZXhDb29yZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBmX2NvbG9yID0gdl9jb2xvcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIGNvbnN0IHZlcnRleFNoID0gbG9hZFNoYWRlcihnbC5WRVJURVhfU0hBREVSLCB2cyk7XHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRTaCA9IGxvYWRTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSLCBmcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNoYWRlclByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIHZlcnRleFNoKTtcclxuICAgICAgICBnbC5hdHRhY2hTaGFkZXIoc2hhZGVyUHJvZ3JhbSwgZnJhZ21lbnRTaCk7XHJcbiAgICAgICAgZ2wubGlua1Byb2dyYW0oc2hhZGVyUHJvZ3JhbSk7XHJcblxyXG4gICAgICAgIGxldCBheGlzID0gbmV3IHByaW0oKS5heGlzKCk7XHJcbiAgICAgICAgbGV0IGdyaWQgPSBuZXcgcHJpbSgpLmdyaWQoNjAsIDIsIHZlYzRTZXQoMSwgMCwgMSwgMSkpO1xyXG4gICAgICAgIGxldCBoZXhhID0gbmV3IHByaW0oKS5oZXhhaGVkcm9uKCk7XHJcbiAgICAgICAgbGV0IG9jdGEgPSBuZXcgcHJpbSgpLm9jdGFoZWRyb24oKTtcclxuICAgICAgICBsZXQgdGV0cmEgPSBuZXcgcHJpbSgpLnRldHJhaGVkcm9uKCk7XHJcblxyXG4gICAgICAgIGxldCBsYW1wID0gbmV3IHByaW0oKS5oZXhhaGVkcm9uKCk7XHJcbiAgICAgICAgbGFtcC5tdGwgPSBuZXcgbWF0ZXJpYWwodmVjM1NldCgwLjUsIDAuOCwgMC41KSwgdmVjM1NldCgwLjMpLCB2ZWMzU2V0KDAuMyksIDM0KTtcclxuICAgICAgICBsYW1wLmlzU2hhZGUgPSB0cnVlO1xyXG5cclxuICAgICAgICBsZXQgdGFibGUgPSBuZXcgcHJpbSgpLnJlY3RhbmdsZSg1MDAsIDUwMCk7XHJcbiAgICAgICAgdGFibGUubXRsLmFkZFRleHR1cmUoXCJiaW4vdGV4dHVyZXMvdGFibGUzLmpwZ1wiKTtcclxuXHJcbiAgICAgICAgbGV0IHJhbmRvbTtcclxuXHJcbiAgICAgICAgYXhpcy5tdGwuYWRkU2hhZGVyKHNoYWRlclByb2dyYW0pO1xyXG4gICAgICAgIGNvdy5tdGwuYWRkU2hhZGVyKHNoYWRlclByb2dyYW0pO1xyXG4gICAgICAgIGNvdzEubXRsLmFkZFNoYWRlcihzaGFkZXJQcm9ncmFtKTtcclxuICAgICAgICBjb3cyLm10bC5hZGRTaGFkZXIoc2hhZGVyUHJvZ3JhbSk7XHJcbiAgICAgICAgZ3JpZC5tdGwuYWRkU2hhZGVyKHNoYWRlclByb2dyYW0pO1xyXG4gICAgICAgIHRhYmxlLm10bC5hZGRTaGFkZXIoc2hhZGVyUHJvZ3JhbSk7XHJcbiAgICAgICAgaGV4YS5tdGwuYWRkU2hhZGVyKHNoYWRlclByb2dyYW0pO1xyXG4gICAgICAgIG9jdGEubXRsLmFkZFNoYWRlcihzaGFkZXJQcm9ncmFtKTtcclxuICAgICAgICB0ZXRyYS5tdGwuYWRkU2hhZGVyKHNoYWRlclByb2dyYW0pO1xyXG5cclxuICAgICAgICBsYW1wLm10bC5hZGRTaGFkZXIoc2hhZGVyUHJvZ3JhbSk7XHJcblxyXG4gICAgICAgIC8vIG15UHJpbS50eXBlID0gZ2wuTElORV9TVFJJUDtcclxuXHJcbiAgICAgICAgY29uc3QgdGltZU5vdyA9ICh0KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNpbihEYXRlLm5vdygpIC8gdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0aW1lTm93QWJzID0gKHQpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKE1hdGguc2luKERhdGUubm93KCkgLyB0KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkcmF3ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aW0ucmVzcG9uc2UoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBtYXRyaXggPSBtYXRyU2NhbGUodmVjM1NldCg1KSkubXVsKG1hdHJSb3RhdGUodmVjM1NldCgxKSwgMzYwICogTWF0aC5zaW4odGltLmdsb2JhbC50aW1lIC8gMTAwMC4wKSkpO1xyXG5cclxuICAgICAgICAgICAgY2FtZXJhSGFuZGxlKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc1RleHRcIikuaW5uZXJIVE1MID0gYDxpPkZQUzo8L2k+ICR7dGltLmdsb2JhbC5mcHN9YDtcclxuXHJcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgICAgICBjYW0ucmVzaXplKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBheGlzLmRyYXcobWF0clRyYW5zbGF0ZSh2ZWMzU2V0KDAsIDAuNSwgMCkpKTtcclxuXHJcbiAgICAgICAgICAgIGNvdy5kcmF3KG1hdHJSb3RhdGVZKE1hdGguc2luKHRpbS5nbG9iYWwudGltZSAvIDEwMDAuMCkgKiAzNjApKTtcclxuICAgICAgICAgICAgY293MS5kcmF3KG1hdHJSb3RhdGVZKE1hdGguc2luKHRpbS5nbG9iYWwudGltZSAvIDUwMC4wKSAqIDM2MCkubXVsKG1hdHJUcmFuc2xhdGUodmVjM1NldCgyMCwgMCwgMCkpKSk7XHJcbiAgICAgICAgICAgIGNvdzIuZHJhdyhtYXRyUm90YXRlWShNYXRoLnNpbih0aW0uZ2xvYmFsLnRpbWUgLyAyMDAwLjApICogMzYwKS5tdWwobWF0clRyYW5zbGF0ZSh2ZWMzU2V0KC0yMCwgMCwgMCkpKSk7XHJcblxyXG4gICAgICAgICAgICB0YWJsZS5kcmF3KG1hdHJSb3RhdGVYKC05MCkubXVsKG1hdHJUcmFuc2xhdGUodmVjM1NldCgtMjUwLCAtMzAsIDI1MCkpKSk7XHJcblxyXG4gICAgICAgICAgICBsYW1wLmRyYXcobWF0clRyYW5zbGF0ZSh2ZWMzU2V0KDEsIDE1LCAxMCkpKTtcclxuXHJcbiAgICAgICAgICAgIGhleGEuZHJhdyhtYXRyaXgpO1xyXG4gICAgICAgICAgICBvY3RhLmRyYXcobWF0cml4Lm11bChtYXRyVHJhbnNsYXRlKHZlYzNTZXQoLTIwLCAwLCAwKSkpKTtcclxuICAgICAgICAgICAgdGV0cmEuZHJhdyhtYXRyaXgubXVsKG1hdHJUcmFuc2xhdGUodmVjM1NldCgyMCwgMCwgMCkpKSk7XHJcblxyXG4gICAgICAgICAgICBpbnAuc2V0RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZHJhdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBjb3csIGNvdzEsIGNvdzI7XHJcbiAgICBcclxuICAgIGluaXQoKTtcclxuICAgIFxyXG4gICAgbmV3IHByaW0oKS5sb2FkT2JqKFwia2FzaG1pcl9jb3cub2JqXCIpLnRoZW4oXHJcbiAgICAgICAgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAvLyBjb3cgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlcykpO1xyXG4gICAgICAgICAgICBjb3cgPSBuZXcgcHJpbShyZXMpO1xyXG4gICAgICAgICAgICBsZXQgbXRsID0gbmV3IG1hdGVyaWFsKHZlYzNTZXQoMC4xMyksIHZlYzNTZXQoMC41NiksIHZlYzNTZXQoMSksIDUpO1xyXG4gICAgICAgICAgICBjb3cubXRsID0gbXRsO1xyXG4gICAgICAgICAgICBjb3cxID0gbmV3IHByaW0ocmVzKTtcclxuICAgICAgICAgICAgbGV0IG10bDEgPSBuZXcgbWF0ZXJpYWwodmVjM1NldCgwLjU3LCAwLjIsIDApLCB2ZWMzU2V0KDAuNTYpLCB2ZWMzU2V0KDEpLCAyNSk7XHJcbiAgICAgICAgICAgIGNvdzEubXRsID0gbXRsMTtcclxuICAgICAgICAgICAgY293MiA9IG5ldyBwcmltKHJlcyk7XHJcbiAgICAgICAgICAgIGxldCBtdGwyID0gbmV3IG1hdGVyaWFsKHZlYzNTZXQoMC4xLCAwLCAwKSwgdmVjM1NldCgwKSwgdmVjM1NldCgwLjA0NSksIDI1KTtcclxuICAgICAgICAgICAgY293Mi5tdGwgPSBtdGwyO1xyXG4gICAgICAgICAgICByZW5kZXIoKTtcclxuICAgICAgICB9XHJcbiAgICApXHJcbn1cclxuIiwiaW1wb3J0IHsgaW5pdEdMIH0gZnJvbSBcIi4vcmVuZGVyLmpzXCI7XHJcblxyXG5pbml0R0woXCJnbENhbnZhc1wiKTtcclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUFBO0FBQ0E7SUFDTyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSztJQUMxQixJQUFJLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBQzdCLENBQUMsQ0FBQztBQUNGO0lBQ08sTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUs7SUFDMUIsSUFBSSxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUM3QixDQUFDLENBQUM7QUFDRjtJQUNPLE1BQU0sSUFBSSxDQUFDO0lBQ2xCLElBQUksV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDdEIsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLEtBQUs7QUFDTDtJQUNBLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRTtJQUNYLFFBQVEsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsS0FBSztBQUNMO0lBQ0EsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ1gsUUFBUSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxD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Q0FBQyxFQUFFO0lBQ1gsUUFBUSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEUsS0FBSztBQUNMO0lBQ0EsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ1gsUUFBUSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEUsS0FBSztBQUNMO0lBQ0EsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ1gsUUFBUSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDNUQsS0FBSztBQUNMO0lBQ0EsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO0lBQ1gsUUFBUSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzFELEtBQUs7QUFDTDtJQUNBLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRTtJQUNiLFFBQVEsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNuRCx3QkFBd0IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkQsd0JBQXdCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRCxLQUFLO0FBQ0w7SUFDQSxJQUFJLEdBQUcsR0FBRztJQUNWLFFBQVEsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQztJQUNBLFFBQVEsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUU7SUFDbEMsWUFBWSxPQUFPLEdBQUcsQ0FBQztJQUN2QixTQUFTO0lBQ1QsUUFBUSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUIsS0FBSztBQUNMO0lBQ0EsSUFBSSxJQUFJLEdBQUc7SUFDWCxRQUFRLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixLQUFLO0FBQ0w7SUFDQSxJQUFJLFNBQVMsR0FBRztJQUNoQixRQUFRLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDeEMsS0FBSztBQUNMO0lBQ0EsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFO0lBQ2pCLFFBQVEsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEYsd0JBQXdCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwRix3QkFBd0IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RixLQUFLO0FBQ0w7SUFDQSxJQUFJLGNBQWMsQ0FBQyxDQUFDLEVBQUU7SUFDdEIsUUFBUSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLHdCQUF3QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMs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LENBQUMsR0FBRyxFQUFFO0lBQ2IsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzNCO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVFO0lBQ0EsUUFBUSxPQUFPLENBQUMsQ0FBQztJQUNqQixLQUFLO0FBQ0w7SUFDQSxJQUFJLE1BQU0sR0FBRztJQUNiLFFBQVEsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRix5Q0FBeUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pGLHlDQUF5QyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRixlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pGLHlDQUF5QyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakYseUNBQXlDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakYseUNBQXlDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRix5Q0FBeUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEYsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRix5Q0FBeUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pGLHlDQUF5QyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25GLEtBQUs7QUFDTDtJQUNBLElBQUksU0FBUyxHQUFHO0lBQ2hCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUMzQjtJQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakM7SUFDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQztJQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDO0lBQ0EsUUFBUSxPQUFPLENBQUMsQ0FBQztJQUNqQixLQUFLO0FBQ0w7SUFDQSxJQUFJLE9BQU8sR0FBRztJQUNkLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hEO0lBQ0EsUUFBUSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUU7SUFDdEIsWUFBWSxPQUFPLFlBQVksRUFBRSxDQUFDO0lBQ2xDLFNBQVM7QUFDVDtJQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdkU7SUFDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELHVCQUF1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3ZFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELHVCQUF1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN2RTtJQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdkU7SUFDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELHVCQUF1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3ZFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELHVCQUF1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN2RTtJQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdkU7SUFDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELHVCQUF1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3ZFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELHVCQUF1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN2RTtJQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdkU7SUFDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELHVCQUF1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3ZFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELHVCQUF1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN2RTtJQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdkU7SUFDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELHVCQUF1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3ZFO0lBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELHVCQUF1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN2RTtJQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsdUJBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCx1QkFBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDdkU7SUFDQSxRQUFRLE9BQU8sQ0FBQyxDQUFDO0lBQ2pCLEtBQUs7QUFDTDtJQUNBLElBQUksV0FBVyxHQUFHO0lBQ2xCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2hDO0lBQ0EsUUFBUSxPQUFPLElBQUksQ0FBQztJQUNwQixLQUFLO0FBQ0w7SUFDQSxJQUFJLFFBQVEsQ0FBQyxDQUFDLEVBQUU7SUFDaEIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25DLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakM7SUFDQSxRQUFRLE9BQU8sSUFBSSxDQUFDO0lBQ3BCLEtBQUs7SUFDTDtJQUNBLElBQUksWUFBWSxDQUFDLENBQUMsRUFBRTtJQUNwQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QztJQUNBLFFBQVEsT0FBTyxJQUFJLENBQUM7SUFDcEIsS0FBSztJQUNMO0lBQ0EsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFO0lBQ3RCLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdELFFBQVEsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzNCO0lBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMxQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCO0lBQ0EsUUFBUSxPQUFPLElBQUksQ0FBQztJQUNwQixLQUFLO0lBQ0w7SUFDQSxJQUFJLFVBQVUsQ0FBQyxLQUFLLEVBQUU7SUFDdEIsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0QsUUFBUSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDM0I7SUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMxQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekI7SUFDQSxRQUFRLE9BQU8sSUFBSSxDQUFDO0lBQ3BCLEtBQUs7SUFDTDtJQUNBLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRTtJQUN0QixRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RCxRQUFRLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMzQjtJQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QjtJQUNBLFFBQVEsT0FBTyxJQUFJLENBQUM7SUFDcEIsS0FBSztJQUNMO0lBQ0EsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRTtJQUN4QixRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RCxRQUFXLElBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBaUI7SUFDOUM7SUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDL0MsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckQsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckQsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QjtJQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JELFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyRCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCO0lBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckQsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckQsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQy9DLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekI7SUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCO0lBQ0EsUUFBUSxPQUFPLElBQUksQ0FBQztJQUNwQixLQUFLO0FBQ0w7SUFDQSxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtJQUMxQixRQUFRO0lBQ1IsWUFBWSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUU7SUFDekMsWUFBWSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUU7SUFDOUMsWUFBWSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQztJQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0MsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMvQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQy9DLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNyRTtJQUNBLFFBQVEsT0FBTyxJQUFJLENBQUM7SUFDcEIsS0FBSztBQUNMO0lBQ0EsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDakMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMvQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQy9DLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEYsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbkQ7SUFDQSxRQUFRLE9BQU8sSUFBSSxDQUFDO0lBQ3BCLEtBQUs7QUFDTDtJQUNBLElBQUksT0FBTyxHQUFHO0lBQ2QsUUFBUSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsZ0JBQWdCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RSxnQkFBZ0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENB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R0FBRyxHQUFHLEdBQUcsQ0FBQztJQUN2QixRQUFRLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLFFBQVEsSUFBSSxDQUFDLEdBQUcsS0FBSyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkQsNkJBQTZCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25ELDZCQUE2QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsUUFBUSxJQUFJLENBQUMsRUFBRSxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEQsNkJBQTZCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRCw2QkFBNkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwRCxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRCw2QkFBNkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xELDZCQUE2QixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BEO0lBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN2RCxL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LENBQUMsQ0FBQyxDQUFDO0lBQ3pCLEtBQUs7SUFDTCxTQUFTLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7SUFDcEMsUUFBUSxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0I7SUFDQSxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0QyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNsQyxLQUFLO0lBQ0wsU0FBUztJQUNULFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RSxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMs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QyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekY7SUFDQSxZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxRSxZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMzRSxZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMzRSxZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMzRTtJQUNBLFlBQVksRUFBRSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFDLFlBQVksRUFBRSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFDLFlBQVksRUFBRSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFDLFlBQVksRUFBRSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDO0lBQ0EsWUFBWSxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLFNBQVM7QUFDVDtJQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRTtJQUM1QjtJQUNBLFlBQVksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDMUMsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUQsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2hHLFlBQVksRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekQsU0FBUztJQUNULEtBQUs7QUFDTDtJQUNBLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtJQUNwQixRQUFRO0lBQ1IsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO0lBQ3pDLFlBQVksSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUU7SUFDMUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEM7SUFDQSxRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDO0lBQ0EsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkM7SUFDQSxRQUFRLElBQUksR0FBRyxDQUFDO0lBQ2hCLFFBQVEsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ2pHLDBCQUEwQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUM3QywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDN0MsMEJBQTBCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQzdDLDBCQUEwQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUM3QywwQkFBMEIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNuRCwwQkFBMEIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwRTtJQUNBLFFBQVEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sS0FBSztJQUN0QyxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckU7SUFDQSxZQUFZLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtJQUM3QixnQkFBZ0IsSUFBSSxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLEVBQUU7SUFDcEQsb0JBQW9CLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xELGlCQUFpQjtJQUNqQixxQkFBcUIsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUU7SUFDaEUsb0JBQW9CLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUYsaUJBQWlCO0lBQ2pCLHFCQUFxQixJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLE1BQU0sRUFBRTtJQUNoRSxvQkFBb0IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMvRSxpQkFBaUI7SUFDakIscUJBQXFCLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFO0lBQ2hFLG9CQUFvQixFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQy9FLGlCQUFpQjtJQUNqQixxQkFBcUI7SUFDckIsb0JBQW9CLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xELGlCQUFpQjtJQUNqQixhQUFhO0lBQ2IsU0FBUyxDQUFDLENBQUM7QUFDWDtJQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUU7SUFDdEMsWUFBWSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakUsWUFBWSxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxQztJQUNBLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNyRSxZQUFZLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtJQUM3QixnQkFBZ0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckMsYUFBYTtJQUNiLFNBQVM7QUFDVDtJQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRTtJQUM1QixZQUFZLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25ELFNBQVM7SUFDVCxhQUFhO0lBQ2IsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUQsWUFBWSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLFlBQVksRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekQsU0FBUztJQUNULFFBQVEsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQztJQUNBLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixLQUFLO0FBQ0w7SUFDQSxJQUFJLFNBQVMsQ0FBQyxhQUFhLEVBQUU7SUFDN0IsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztJQUNwQyxLQUFLO0FBQ0w7SUFDQSxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ3BCLFFBQVEsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDL0QsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDbkQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDbEQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDbkQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3REO0lBQ0EsUUFBUSxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELEtBQUs7QUFDTDtJQUNBLElBQUksVUFBVSxHQUFHO0lBQ2pCLFFBQVEsTUFBTSxLQUFLLEdBQUc7SUFDdEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDakQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDakQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDakQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDakQ7SUFDQSxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNqRCxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNqRCxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNqRCxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNqRCxTQUFTLENBQUM7SUFDVjtJQUNBLFFBQVEsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDekQscUJBQXFCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUN2RCxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6RDtJQUNBLFFBQVEsT0FBTyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRSxLQUFLO0FBQ0w7SUFDQSxJQUFJLFFBQVEsR0FBRztJQUNmLFFBQVEsTUFBTSxLQUFLLEdBQUc7SUFDdEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDdkQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDdkQsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDdkQsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDdkQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDdkQ7SUFDQSxTQUFTLENBQUM7QUFDVjtJQUNBLFFBQVEsTUFBTSxLQUFLLEdBQUc7SUFDdEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDNUIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDOUMsU0FBUyxDQUFDO0FBQ1Y7SUFDQSxRQUFRLE9BQU8sSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEQsS0FBSztBQUNMO0lBQ0EsSUFBSSxXQUFXLEdBQUc7SUFDbEIsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlCLFFBQVEsTUFBTSxLQUFLLEdBQUc7SUFDdEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNyRSxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQ3JFLFlBQVksR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNyRSxZQUFZLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNyRSxTQUFTLENBQUM7SUFDVjtJQUNBLFFBQVEsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNEO0lBQ0EsUUFBUSxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BELEtBQUs7QUFDTDtJQUNBLElBQUksVUFBVSxHQUFHO0lBQ2pCLFFBQVEsTUFBTSxLQUFLLEdBQUc7SUFDdEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDakQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDakQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDakQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDakQ7SUFDQSxZQUFZLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ25FLFlBQVksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUNuRSxTQUFTLENBQUM7QUFDVjtJQUNBLFFBQVEsTUFBTSxLQUFLLEdBQUc7SUFDdEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDOUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDOUMsU0FBUyxDQUFDO0FBQ1Y7SUFDQSxRQUFRLE9BQU8sSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEQsS0FBSztBQUNMO0lBQ0EsSUFBSSxXQUFXLEdBQUc7SUFDbEIsUUFBUSxNQUFNLEtBQUssR0FBRztJQUN0QixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNwRCxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDckYsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUM3SCxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUN4RixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNwRCxZQUFZLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEgsWUFBWSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUN6RixTQUFTLENBQUM7QUFDVjtJQUNBLFFBQVEsTUFBTSxLQUFLLEdBQUc7SUFDdEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkIsU0FBUyxDQUFDO0FBQ1Y7SUFDQSxRQUFRLE9BQU8sSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEQsS0FBSztBQUNMO0lBQ0EsSUFBSSxNQUFNLEdBQUc7SUFDYixRQUFRLE1BQU0sQ0FBQyxHQUFHLE1BQU07SUFDeEIsWUFBWSxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNqQyxVQUFTO0FBQ1Q7SUFDQSxRQUFRLE1BQU0sS0FBSyxHQUFHO0lBQ3RCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQ3BELFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDcEQsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQ3BELFlBQVksR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDcEQsU0FBUyxDQUFDO0FBQ1Y7SUFDQSxRQUFRLE1BQU0sS0FBSyxHQUFHO0lBQ3RCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQzlDLFNBQVMsQ0FBQztBQUNWO0lBQ0EsUUFBUSxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JELEtBQUs7QUFDTDtJQUNBLElBQUksSUFBSSxHQUFHO0lBQ1gsUUFBUSxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUN6RCx1QkFBdUIsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQzFELHVCQUF1QixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDMUQsdUJBQXVCLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0Q7SUFDQSxRQUFRLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsRDtJQUNBLFFBQVEsT0FBTyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyRCxLQUFLO0FBQ0w7SUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtJQUN6QixRQUFRLElBQUksS0FBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ25DO0lBQ0EsUUFBUSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hHLFFBQVEsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckQsUUFBUSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDckI7SUFDQSxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDcEMsWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzVGLFlBQVksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixZQUFZLElBQUksRUFBRSxDQUFDO0lBQ25CLFlBQVksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUMxRixZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN2QyxZQUFZLElBQUksRUFBRSxDQUFDO0lBQ25CLFNBQVM7QUFDVDtJQUNBLFFBQVEsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEM7SUFDQSxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDcEMsWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzVGLFlBQVksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixZQUFZLElBQUksRUFBRSxDQUFDO0lBQ25CLFlBQVksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUMxRixZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN2QyxZQUFZLElBQUksRUFBRSxDQUFDO0lBQ25CLFNBQVM7QUFDVDtJQUNBLFFBQVEsT0FBTyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuRSxLQUFLO0FBQ0w7SUFDQSxJQUFJLE1BQU0sT0FBTyxDQUFDLFFBQVEsRUFBRTtJQUM1QixRQUFRLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEU7SUFDQSxRQUFRLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSztJQUMzRCxZQUFZLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxZQUFZLElBQUksS0FBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ3ZDO0lBQ0EsWUFBWSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQzdEO0lBQ0EsWUFBWSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3hDLGdCQUFnQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzNDO0lBQ0EsZ0JBQWdCLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFO0lBQ3BELG9CQUFvQixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxNQUFNLENBQUM7QUFDaEQ7SUFDQSxvQkFBb0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUNoRCx3QkFBd0IsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNwQyx3QkFBd0IsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFO0lBQ2hELDRCQUE0QixNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDakQseUJBQXlCO0lBQ3pCLHdCQUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ25ELHdCQUF3QixHQUFHLEVBQUUsQ0FBQztJQUM5QixxQkFBcUI7SUFDckIsb0JBQW9CLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QyxvQkFBb0IsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3REO0lBQ0Esb0JBQW9CLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLGlCQUFpQjtJQUNqQixxQkFBcUIsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUU7SUFDekQsb0JBQW9CLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUM7SUFDeEM7SUFDQSxvQkFBb0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUNoRCx3QkFBd0IsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNwQyx3QkFBd0IsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUU7SUFDbkUsNEJBQTRCLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNqRCx5QkFBeUI7SUFDekIsd0JBQXdCLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRTtJQUNoRCw0QkFBNEIsR0FBRyxFQUFFLENBQUM7SUFDbEMseUJBQXlCO0lBQ3pCLHdCQUF3QixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN6RCx3QkFBd0IsR0FBRyxFQUFFLENBQUM7SUFDOUIscUJBQ0EsaUJBQWlCO0lBQ2pCLGFBQWE7QUFDYjtJQUNBLFlBQVksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUN0RCxnQkFBZ0IsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdGO0lBQ0EsZ0JBQWdCLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDMUU7SUFDQSxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwQyxhQUFhO0lBQ2IsWUFBWSxJQUFJLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckcsWUFBWSxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMzRSxTQUFTLENBQUMsQ0FBQztJQUNYLFFBQVEsT0FBTyxPQUFPLENBQUM7SUFDdkIsS0FBSztBQUNMO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7O0lDNWVPLE1BQU0sS0FBSyxDQUFDO0lBQ25CLElBQUksV0FBVyxHQUFHO0lBQ2xCLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3JFLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztJQUMvQyxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ3BDLEtBQUs7QUFDTDtJQUNBLElBQUksUUFBUSxHQUFHO0lBQ2YsUUFBUSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDN0I7SUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3BELFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdkQsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO0lBQ2pDLFlBQVksSUFBSSxDQUFDLE1B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QUFRLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDekMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDN0MsUUFBUSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzFDLFFBQVEsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7SUFDM0IsUUFBUSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDN0MsUUFBUSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDN0MsUUFBUSxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUMsUUFBUSxRQUFRLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDL0M7SUFDQSxRQUFRLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNuQjtJQUNBLFFBQVEsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDO0lBQ0EsUUFBUSxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQztJ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QVMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0Y7SUFDQSxZQUFZLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUM3QyxZQUFZLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUMvQyxZQUFZLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEQ7SUFDQSxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RDtJQUNBLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVFLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xILFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEg7SUFDQSxZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckY7SUFDQSxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RDtJQUNBLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5QixZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRSxZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckU7SUFDQSxZQUFZLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM3QixZQUFZLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQyxVQUFTO0FBQ1Q7SUFDQSxRQUFRLElBQUksRUFBRSxDQUFDO0lBQ2YsTUFBSztBQUNMO0lBQ0EsSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQ3hCO0lBQ0EsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNYO0lBQ0EsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUk7SUFDOUMsUUFBUSxDQUFDLEdBQUcsS0FBSztJQUNqQjtJQUNBLFlBQVksR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hDLFlBQVksSUFBSSxHQUFHLEdBQUcsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEYsWUFBWSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUMxQixZQUFZLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxZQUFZLElBQUksSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDMUYsWUFBWSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztJQUM1QixZQUFZLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxZQUFZLElBQUksSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEYsWUFBWSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztJQUM1QixZQUFZLE1BQU0sRUFBRSxDQUFDO0lBQ3JCLFNBQVM7SUFDVCxNQUFLO0lBQ0w7O0lDbFRBLE1BQU0sQ0FBQyxVQUFVLENBQUM7Ozs7OzsifQ==
