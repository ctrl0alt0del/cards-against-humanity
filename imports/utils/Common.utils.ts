import { Meteor } from "meteor/meteor"

export async function meteorCall<T>(methodName: string, ...args) {
    return new Promise<T>((resolve, reject) => {
        Meteor.call(methodName, ...args, (err, res: T) => {
            if (err) {
                reject(err);
            } else {
                resolve(res)
            }
        })
    })
}

export function playAudio(fileSrc: string) {
    return new Audio(fileSrc).play();
}

export function vibrate(msTime: number) {
    if(navigator.vibrate){
        navigator.vibrate(msTime);
    } else {
        playAudio('/noVIbrate.mp3');
    }
}

export const safeHandler = (cb) => {
    return (...args) => cb && cb(...args);
}

export const EntityFetcher = <In, Out>(fn: (id: In) => Promise<Out>) => {
    const cacheMap = new Map<In, Out>();
    return function(id: In) {
        if(cacheMap.has(id)) {
            return Promise.resolve(cacheMap.get(id));
        }
        return fn(id).then(res => {
            cacheMap.set(id, res);
            return res;
        });
    }
}

export function startAnimationLoop(fnToStart: () => void) {
    requestAnimationFrame(()=>{
        fnToStart();
        startAnimationLoop(fnToStart);
    })
}
