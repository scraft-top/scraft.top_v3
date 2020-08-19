/// <reference path = "lattice-gen.d.ts" />
const pinyin = require('pinyin');

function latticeCodeColumn(config: LatticeGen.LatticeConfig, lattice: LatticeGen.LatticeResult[]): Uint8Array[] {
    // 从左到右
    let ret: Uint8Array[] = [];
    lattice.forEach(l => {
        // 处理每个点阵字
        let tmpRet: number[] = [];
        let tmpByte: number = 0;
        let tmpByteIdx: number = 0;
        if (!config.byteOrder) {
            // 正向字节序 从上到下
            for (let x = 0; x < l.lattice[0].length; x++) {
                for (let y = 0; y < l.lattice.length; y++) {
                    let pixel = l.lattice[y][x];
                    // 处理每个像素
                    if (config.bitOrder) {
                        // 反向位序 高字节在上
                        tmpByte <<= 1;
                        pixel && (tmpByte |= 0x01);
                    } else {
                        // 正向位序 低字节在上
                        tmpByte >>>= 1;
                        pixel && (tmpByte |= 0x80);
                    }
                    tmpByteIdx++;
                    if (tmpByteIdx == 8) {
                        // 处理了8位 保存一字节
                        if (config.revertColor) {
                            // 反转颜色
                            tmpByte ^= 0xFF;
                        }
                        tmpRet.push(tmpByte);
                        tmpByte = 0;
                        tmpByteIdx = 0;
                    }
                }
            }
            // 不够8字节的处理
            if (tmpByteIdx > 0) {
                if (config.bitOrder) {
                    tmpByte <<= 8 - tmpByteIdx;
                } else {
                    tmpByte >>>= 8 - tmpByteIdx;
                }
                if (config.revertColor) {
                    // 反转颜色
                    tmpByte ^= 0xFF;
                }
                tmpRet.push(tmpByte);
            }
        } else {
            // 反向字节序 从下到上
            for (let x = 0; x < l.lattice[0].length; x++) {
                for (let y = l.lattice.length - 1; y >= 0; y--) {
                    let pixel = l.lattice[y][x];
                    // 处理每个像素
                    if (config.bitOrder) {
                        // 反向位序 高字节在上
                        tmpByte >>>= 1;
                        pixel && (tmpByte |= 0x80);
                    } else {
                        // 正向位序 低字节在上
                        tmpByte <<= 1;
                        pixel && (tmpByte |= 0x01);
                    }
                    tmpByteIdx++;
                    if (tmpByteIdx == 8) {
                        // 处理了8位 保存一字节
                        if (config.revertColor) {
                            // 反转颜色
                            tmpByte ^= 0xFF;
                        }
                        tmpRet.push(tmpByte);
                        tmpByte = 0;
                        tmpByteIdx = 0;
                    }
                }
            }
            // 不够8字节的处理
            if (tmpByteIdx > 0) {
                if (config.bitOrder) {
                    tmpByte >>>= 8 - tmpByteIdx;
                } else {
                    tmpByte <<= 8 - tmpByteIdx;
                }
                if (config.revertColor) {
                    // 反转颜色
                    tmpByte ^= 0xFF;
                }
                tmpRet.push(tmpByte);
            }
        }
        ret.push(new Uint8Array(tmpRet));
    })
    return ret;
}

function latticeCodeRow(config: LatticeGen.LatticeConfig, lattice: LatticeGen.LatticeResult[]): Uint8Array[] {
    let ret: Uint8Array[] = [];
    lattice.forEach(l => {
        let tmpRet: number[] = [];
        let tmpByte: number = 0;
        let tmpByteIdx: number = 0;
        if (!config.byteOrder) {
            // 正向字节序
            // 处理每个像素
            l.lattice.forEach(line => line.forEach(pixel => {
                if (config.bitOrder) {
                    // 高位在前
                    tmpByte <<= 1;
                    pixel && (tmpByte |= 0x01);
                } else {
                    // 低位在前
                    tmpByte >>>= 1;
                    pixel && (tmpByte |= 0x80);
                }
                tmpByteIdx++; // 记处理了一位
                if (tmpByteIdx == 8) {
                    // 处理了8位 保存一字节
                    if (config.revertColor) {
                        // 反转颜色
                        tmpByte ^= 0xFF;
                    }
                    tmpRet.push(tmpByte);
                    tmpByte = 0;
                    tmpByteIdx = 0;
                }
            }));
            // 不够8字节的处理
            if (tmpByteIdx > 0) {
                if (config.bitOrder) {
                    tmpByte <<= 8 - tmpByteIdx;
                } else {
                    tmpByte >>>= 8 - tmpByteIdx;
                }
                if (config.revertColor) {
                    // 反转颜色
                    tmpByte ^= 0xFF;
                }
                tmpRet.push(tmpByte);
            }
        } else {
            // 反向字节序
            l.lattice.forEach((line: Boolean[]) => {
                // 处理每一行  从右到左字节序
                for (let i = line.length - 1; i >= 0; i--) {
                    let pixel = line[i];
                    if (config.bitOrder) {
                        // 高位在前
                        tmpByte >>>= 1;
                        pixel && (tmpByte |= 0x80);
                    } else {
                        // 低位在前
                        tmpByte <<= 1;
                        pixel && (tmpByte |= 0x01);
                    }
                    tmpByteIdx++; // 记处理了一位
                    if (tmpByteIdx == 8) {
                        // 处理了8位 保存一字节
                        if (config.revertColor) {
                            // 反转颜色
                            tmpByte ^= 0xFF;
                        }
                        tmpRet.push(tmpByte);
                        tmpByte = 0;
                        tmpByteIdx = 0;
                    }
                }
            });
            // 不够8字节的处理
            if (tmpByteIdx > 0) {
                if (config.bitOrder) {
                    tmpByte >>>= 8 - tmpByteIdx;
                } else {
                    tmpByte <<= 8 - tmpByteIdx;
                }
                if (config.revertColor) {
                    // 反转颜色
                    tmpByte ^= 0xFF;
                }
                tmpRet.push(tmpByte);
            }
        }
        ret.push(new Uint8Array(tmpRet));
    })
    return ret;
}

function lattice2Code(config: LatticeGen.LatticeConfig, lattice: LatticeGen.LatticeResult[] | null): Promise<Uint8Array[] | undefined> {
    return new Promise((resolve) => {
        if (lattice) {
            if (config.columnDirection) {
                resolve(latticeCodeColumn(config, lattice));
            } else {
                resolve(latticeCodeRow(config, lattice));
            }
        }
        resolve(undefined);
    });
}

function text2VarName(text: string): string {
    let ret = "";
    let py = pinyin(text, {
        heteronym: true,
        segment: true,
        style: pinyin.STYLE_NORMAL
    });
    for (let idx in py) {
        let p: string = py[idx][0];
        ret += p.charAt(0).toUpperCase() + p.slice(1);
    }
    return ret;
}

export default {
    lattice2Code,
    text2VarName
};
