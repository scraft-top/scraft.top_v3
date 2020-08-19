declare module LatticeGen {
    export type LatticeMode = "text" | "image" | "textImage";
    export type LatticeConfig = {
        mode: LatticeMode;
        size: number;
        font: string;
        bitOrder: boolean;
        byteOrder: boolean;
        revertColor: boolean;
        columnDirection: boolean;
    }
    export type LatticeResult = {
        width: number;
        lattice: boolean[][];
    }
}
