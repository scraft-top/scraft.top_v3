/// <reference path = "lattice-gen.d.ts" />
import stringWidth from 'string-width';

function genTextImage(config: LatticeGen.LatticeConfig, text: string): LatticeGen.LatticeResult[] {
    // compute vars
    let canvas: HTMLCanvasElement = document.createElement("canvas");
    let context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext("2d");
    canvas.height = config.size;
    canvas.width = Math.ceil(stringWidth(text) * config.size / 2);
    // draw virtual text
    context.font = "normal normal normal " + config.size + "px SimSun"; // TODO: font
    context.textBaseline = "middle";
    context.fillStyle = "#000";
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0, x = 0; i < text.length; i++) {
        let ch = text.charAt(i);
        context.fillText(ch, x, config.size / 2);
        x += stringWidth(ch) * config.size / 2;
    }
    // get data
    let img: Uint8ClampedArray = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let data: boolean[][] = [];
    for (let y = 0; y < canvas.height; y++) {
        let row: boolean[] = [];
        for (let x = 0; x < canvas.width; x++) {
            let idx = (y * canvas.width + x + 1) * 4 - 1;
            row.push(img[idx] > 0);
        }
        data.push(row);
    }
    return [{
        width: canvas.width,
        lattice: data,
    }];
}

function genText(config: LatticeGen.LatticeConfig, text: string): LatticeGen.LatticeResult[] {
    let ret: LatticeGen.LatticeResult[] = [];
    // compute vars
    let canvas: HTMLCanvasElement = document.createElement("canvas");
    let context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext("2d");
    canvas.height = config.size;
    canvas.width = config.size;
    // draw virtual text
    context.font = "normal normal normal " + config.size + "px SimSun"; // TODO: font
    context.textBaseline = "middle";
    context.fillStyle = "#000";
    for (let i = 0; i < text.length; i++) {
        // draw virtual text
        let ch = text.charAt(i);
        context.clearRect(0, 0, config.size, config.size);
        context.fillText(ch, 0, config.size / 2);
        // get data
        let chw: number = Math.ceil(stringWidth(ch) * config.size / 2);
        let img: Uint8ClampedArray = context.getImageData(0, 0, chw, config.size).data;
        let data: boolean[][] = [];
        for (let y = 0; y < config.size; y++) {
            let row: boolean[] = [];
            for (let x = 0; x < chw; x++) {
                let idx = (y * chw + x + 1) * 4 - 1;
                row.push(img[idx] > 0);
            }
            data.push(row);
        }
        ret.push({
            width: chw,
            lattice: data,
        });
    }
    return ret;
}

function latticeGen(config: LatticeGen.LatticeConfig, text: string): Promise<LatticeGen.LatticeResult[] | null> {
    return new Promise(resolve => {
        if (text) {
            switch (config.mode) {
                case 'text':
                    resolve(genText(config, text));
                    break;
                case 'image':
                    resolve(null);
                    break;
                case 'textImage':
                    resolve(genTextImage(config, text));
                    break;
            }
        } else {
            resolve(null);
        }
    });
}

export default latticeGen;
