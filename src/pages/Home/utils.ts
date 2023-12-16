import { Asset, AssetData } from './types.ts';

export const mapRange = function (value: number, from: number, to: number, newFrom: number, newTo: number) {
    if (to === from) {
        return to;
    }
    return ((value - from) / (to - from)) * (newTo - newFrom) + newFrom;
};

export const loadAssets = function (
    objects: Asset[],
    preloadCallback: () => void,
    callback: (data: AssetData[]) => void,
) {
    const data: AssetData[] = [];
    let length = objects.length;
    preloadCallback();

    const onLoad = function (img: HTMLImageElement, index: number) {
        data[index] = {
            sprite: img,
            x: 0,
            y: 0,
            z: 0,
            anchor: {
                x: img.width / 2,
                y: img.height / 2,
            },
            rotation: 0,
            rotationSpeed: 180,
            rotationAcc: 0,
        };
        length -= 1;
        if (length <= 0) {
            callback(data);
        }
    };

    // Load each image
    objects.forEach(function (object, index) {
        const img = new Image();
        img.src = object.src;
        img.alt = img.id = object.name;
        img.addEventListener('load', onLoad.bind(null, img, index));
    });
};

export const randomInRange = ([min, max]: [number, number], isInt?: boolean) => {
    const random = Math.random() * (max - min + 1) + min;
    return isInt ? Math.floor(random) : random;
};

export const randomInTwoRange = (rangeOne: [number, number], rangeTwo: [number, number], isInt?: boolean) => {
    return Math.random() - 0.5 < 0 ? randomInRange(rangeOne, isInt) : randomInRange(rangeTwo, isInt);
};
