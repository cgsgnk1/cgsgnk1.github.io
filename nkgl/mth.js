// Koptelov Nikita, 09-1, 03.06.2023, NK1

export const d2r = (x) => {
    return x * Math.PI / 180;
};

export const r2d = (x) => {
    return x * 180 / Math.PI;
};

export class vec2 {
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

export function vec2Set() {
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

export class vec3 {
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

export function vec3Set() {
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

export class vec4 {
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

export function vec4Set() {
    if (arguments.length == 1) {
        let x = arguments[0];

        return new vec4(x, x, x, x);
    }
    else if (arguments.length == 4) {
        let x = arguments[0], y = arguments[1], z = arguments[2], w = arguments[3];

        return new vec4(x, y, z, w);
    }
}

export function determ3x3(a00, a01, a02,
                   a10, a11, a12,
                   a20, a21, a22) {
    return a00 * a11 * a22 + a01 * a12 * a20 + a02 * a10 * a21 -
           a00 * a12 * a21 - a01 * a10 * a22 - a02 * a11 * a20;
}

export class mat4 {
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
        let r = v.normalize(), m = new mat4();
        
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

export function matrIdentity() {
    return new mat4().setIdentity();
}

export function matrScale(v) {
    return new mat4().setScale(v);
}

export function matrTranslate(v) {
    return new mat4().setTranslate(v);
}

export function matrRotateX(angle) {
    return new mat4().setRotateX(angle);
}

export function matrRotateY(angle) {
    return new mat4().setRotateY(angle);
}

export function matrRotateZ(angle) {
    return new mat4().setRotateZ(angle);
}

export function matrRotate(v, angle) {
    return new mat4().setRotate(v, angle);
}

export class camera {
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
        this.loc = new mat4();      
        this.at = new mat4();       
        this.dir = new mat4();     
        this.up = new mat4();       
        this.right = new mat4();
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

export function cameraCreate(gl) {
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
