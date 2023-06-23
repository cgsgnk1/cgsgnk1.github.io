export class timer {
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
