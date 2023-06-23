export class input {
    constructor() {
        this.keys = [];
        this.keysOld = [];
        this.keysClick = [];
        this.m = {
            lClick: false,
            rClick: false,
            mx: 0, my: 0, mz: 0,
            mdx: 0, mdy: 0, mdz: 0,
        }

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
        })
        window.addEventListener("mouseup", (event) => {
            this.isHold = false;
            this.m.lClick = false;
            this.m.rClick = false;
        })

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
        })

        window.addEventListener("wheel", (event) => {
            this.m.mdz = event.deltaY;
            this.m.mz += event.deltaY;
        })
    }

    setDefault() {
        this.m.mdx = 0;
        this.m.mdy = 0;
        this.m.mdz = 0;
    }
}
