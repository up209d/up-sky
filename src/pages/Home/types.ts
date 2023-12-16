export type Asset = {
    name: string;
    src: string;
};

export type AssetData = {
    sprite: HTMLImageElement;
    x: number;
    y: number;
    z: number;
    anchor: {
        x: number;
        y: number;
    };
    rotation: number;
    rotationSpeed: number;
    rotationAcc: number;
};
