import { ImageEffect } from "./PictureTaker.component";

export const DefaultImageEffect: ImageEffect = {
    name: 'Default',
    effectGenFn: () => (get, x, y) => {
        return get(x, y);
    }
}

export const FishEyeEffect: ImageEffect = {
    name: 'FishEye',
    effectGenFn: (width, height) => {
        const centerX = width/2, centerY = height/2;
        const fishEyeRadius = Math.min(width, height)*.75;
        return (getColor, x, y) => {
            const dx = centerX - x;
            const dy = centerY - y;
            const dist = Math.sqrt(dx*dx+dy*dy);
            if(dist < fishEyeRadius) {
                x = Math.round(centerX - dx * Math.sin(dist/fishEyeRadius*Math.PI/2));
                y = Math.round(centerY - dy * Math.sin(dist/fishEyeRadius*Math.PI/2));
            }
            const [r,g,b] = getColor(x, y);
            return [r,g,b];
        };
    }
}