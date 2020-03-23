export function getVideoStreamResolution(mediaStream: MediaStream, trackNumber = 0) {
    const track = mediaStream.getVideoTracks()[0];
    if (track) {
        const { width, height } = track.getSettings();
        return { width, height };
    } else {
        return { width: 0, height: 0 }
    }
}

export type RGBArray = [number, number, number];

export type ImageManipulationFunction = (getFn: (x: number, y: number) => RGBArray, x: number, y: number) => RGBArray;

export function applyCanvasImageManipulation(ctx: CanvasRenderingContext2D, manFn: ImageManipulationFunction) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const image = ctx.getImageData(0, 0, width, height);
    const data = new Uint32Array(image.data);
    for(let coordX = 0; coordX < width; coordX++) {
        for(let coordY = 0; coordY < height; coordY++) {
            const index = coordY * width + coordX;
            const [r, g, b] = manFn((x, y) => {
                const i = (y * width + x);
                return [image.data[i*4], image.data[i * 4 + 1], image.data[i * 4 + 2]];
            }, coordX, coordY);
            data[index] = (255 << 24) | (b << 16) | (g << 8) | r;
        }
    }
    ctx.putImageData(image, 0, 0);
}