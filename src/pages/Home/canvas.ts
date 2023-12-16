import * as utils from './utils';
import {Asset, AssetData} from './types.ts';
import gsap from "gsap";

const skyUpColorRange = ['rgba(165, 30, 210, 1.0)', 'rgb(11,168,255)'];
const skyDownColorRange = ['rgba( 75, 65, 205, 1.0)', 'rgb(187,244,255)'];

export interface CanvasOptions {
  width: number;
  height: number;
  resolution: number;
  fps: number;
  step: number;
}

export interface CanvasState {
  width: number;
  height: number;
  resolution: number;
  fps: number;
  step: number;
  frame: number;
  currentTime: number;
  lastTime: number;
  totalTime: number;
  isMouseDown: number;
  speed: number;
  acc: number;
  count: number;
  assets: Asset[];
  camera: {
    fov: number;
    speed: number;
    acc: number;
    jerk: number;
    jounce: number;
    height: number;
    x: number;
    y: number;
    z: number;
  };
  data: AssetData[];
  skyColorStopBegin: string;
  skyColorStopEnd: string;
}

export type CanvasPoint = {
  x: number;
  y: number;
  z: number;
  baseScale: number;
  alpha: number;
  rotation: number;
  spriteIndex: number;
};

export class CanvasAnimation {
  public state: CanvasState;
  public animationHandler: number | null = null;
  public randomPoints: CanvasPoint[] = [];
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(options: CanvasOptions) {
    this.state = {
      width: options.width,
      height: options.height,
      resolution: options.resolution,
      fps: options.fps,
      step: 1 / options.fps,
      frame: 0,
      currentTime: new Date().getTime(),
      lastTime: new Date().getTime(),
      totalTime: 0,
      isMouseDown: 0,
      speed: 3,
      acc: 0.05,
      count: 30,
      assets: [
        {
          name: 'Cloud 01',
          src: import.meta.env.BASE_URL + '/assets/banner/cloud_01.png',
        },
        {
          name: 'Cloud 02',
          src: import.meta.env.BASE_URL + '/assets/banner/cloud_02.png',
        },
        {
          name: 'Cloud 03',
          src: import.meta.env.BASE_URL + '/assets/banner/cloud_03.png',
        },
      ],
      camera: {
        fov: 60,
        speed: 0.05,
        acc: 0,
        jerk: 0,
        jounce: 0,
        height: 3,
        x: 2,
        y: -0.5,
        z: -(1 / Math.tan(25 * (Math.PI / 180))),
      },
      data: [],
      skyColorStopBegin: gsap.utils.interpolate(skyUpColorRange[0], skyUpColorRange[1], 0),
      skyColorStopEnd: gsap.utils.interpolate(skyDownColorRange[0], skyDownColorRange[1], 0),
    };

    for (let i = 0; i < this.state.count; i++) {
      this.randomPoints.push({
        x: utils.randomInTwoRange([-5, -3], [3, 5]),
        y: Math.random() * 4 - 2,
        z: Math.random() * 10 + 10,
        baseScale: (Math.random() < 0.5 ? 1 : -1) * Math.random() * 0.5 + 2.5,
        alpha: 0,
        rotation: 0,
        spriteIndex: Math.floor(Math.random() * this.state.assets.length),
      });
    }

    const canvas: HTMLCanvasElement | null = document.querySelector('canvas#renderer');
    if (!canvas) {
      throw new Error('Error cannot found canvas element for rendering');
    }
    this.canvas = canvas;

    this.updateSize(this.state.width, this.state.height);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Error cannot get 2d context for canvas');
    }
    this.ctx = ctx;

    this.run = this.run.bind(this);
    this.runTimeStepFixed = this.runTimeStepFixed.bind(this);
  }

  async init() {
    return new Promise<void>(res => {
      utils.loadAssets(
        this.state.assets,
        function () {
          console.log('Assets is being loaded ...');
        },
        data => {
          console.log('All assets are loaded');
          this.state.data = data;
          this.run();
          res();
        },
      );

      window.addEventListener('mousedown', () => {
        this.state.isMouseDown = 1;
      });
      window.addEventListener('mouseup', () => {
        this.state.isMouseDown = 0;
      });
    })
  }

  destroy() {
    if (this.animationHandler) {
      cancelAnimationFrame(this.animationHandler);
    }
  }

  updateSize(width: number, height: number) {
    this.state.width = width;
    this.state.height = height;
    this.canvas.width = this.state.width * this.state.resolution;
    this.canvas.height = this.state.height * this.state.resolution;
    this.canvas.style.width = this.state.width + 'px';
    this.canvas.style.height = this.state.height + 'px';
  }

  run() {
    this.state.frame++;
    this.state.frame = this.state.frame % 1200;

    this.state.currentTime = new Date().getTime();
    const deltaTime = this.state.currentTime - this.state.lastTime;
    if (deltaTime >= 1000 / this.state.fps) {
      this.update();
      this.state.lastTime = this.state.currentTime - (deltaTime - 1000 / this.state.fps);
    }

    this.render();
    this.animationHandler = requestAnimationFrame(this.run);
  }

  runTimeStepFixed() {
    this.state.currentTime = new Date().getTime();
    let deltaTime = this.state.currentTime - this.state.lastTime;
    deltaTime = deltaTime > 1000 ? 1000 : deltaTime;
    this.state.totalTime += deltaTime;

    while (this.state.totalTime > this.state.step * 1000) {
      this.state.totalTime -= this.state.step * 1000;
      this.update();
    }
    this.state.lastTime = this.state.currentTime;
    this.render();
    requestAnimationFrame(this.runTimeStepFixed);
  }

  threeToTwo(position: CanvasPoint) {
    const xWorld = position.x;
    const yWorld = position.y;
    const zWorld = position.z;

    const cameraFOV = this.state.camera.fov;

    const cameraX = this.state.camera.x;
    const cameraY = this.state.camera.y;
    const cameraZ = this.state.camera.z;

    const xCamera = xWorld - cameraX;
    const yCamera = yWorld - cameraY;
    const zCamera = zWorld - cameraZ;

    const scalingRatio = Math.min(10, Math.abs(1 / Math.tan((cameraFOV / 2) * (Math.PI / 180)) / zCamera));

    const xProject = xCamera * scalingRatio;
    const yProject = yCamera * scalingRatio;

    const xScreen = utils.mapRange(xProject, -1, 1, 0, this.state.width);
    const yScreen = utils.mapRange(yProject, 1, -1, 0, this.state.height);

    return {
      x: xScreen,
      y: yScreen,
      s: scalingRatio,
    };
  }

  update() {
    this.state.speed = Math.max(1, this.state.speed);
    this.state.speed = Math.min(10, this.state.speed);
    this.state.speed = this.state.isMouseDown
      ? this.state.speed + this.state.acc * 2
      : this.state.speed - this.state.acc;

    this.state.camera.z += this.state.camera.speed * this.state.speed;

    const points = this.randomPoints;

    points.forEach(item => {
      if (this.state.camera.z > item.z + 0.01) {
        item.z = this.state.camera.z + (Math.random() * 10 + 10);
        item.alpha = 0;
        item.x = utils.randomInTwoRange([-8, -3], [3, 8]);
        item.y = -this.state.camera.y / 2;
        // item.baseScale = Math.random() * 6 + 1.5;
        // points.pop();
        // points.splice(0, 0, item);
      }
    });
  }

  render() {
    const points = this.randomPoints;

    this.ctx.clearRect(0, 0, this.state.width, this.state.height);
    const sky = this.ctx.createLinearGradient(this.state.width / 2, 0, this.state.width / 2, this.state.height);
    sky.addColorStop(0, gsap.utils.interpolate(skyUpColorRange[0], skyUpColorRange[1], Math.abs(Math.sin(this.state.currentTime / 10000))));
    sky.addColorStop(1, gsap.utils.interpolate(skyDownColorRange[0], skyDownColorRange[1], Math.abs(Math.sin(this.state.currentTime / 10000))));
    this.ctx.fillStyle = sky;
    this.ctx.fillRect(0, 0, this.state.width, this.state.height);

    points.forEach((item, index) => {
      const data = this.threeToTwo(item);

      this.ctx.save();

      this.ctx.globalAlpha = item.alpha;

      if (points[index].z - this.state.camera.z < 5) {
        points[index].alpha += -0.02;
      } else {
        points[index].alpha += 0.01;
      }

      points[index].alpha = Math.min(0.98, Math.max(0.02, points[index].alpha));

      this.ctx.translate(data.x, data.y);

      this.ctx.scale(item.baseScale * data.s, item.baseScale * data.s);

      this.ctx.drawImage(
        this.state.data[item.spriteIndex].sprite,
        -(this.state.data[item.spriteIndex].sprite.width / this.state.width / 5),
        -(this.state.data[item.spriteIndex].sprite.height / this.state.width / 5),
      );

      this.ctx.restore();
    });
  }
}

export default CanvasAnimation;
