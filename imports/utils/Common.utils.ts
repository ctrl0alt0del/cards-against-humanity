import { Meteor } from "meteor/meteor"

export async function meteorCall<T>(methodName: string, ...args) {
    return new Promise<T>((resolve, reject) => {
        Meteor.call(methodName, ...args, (err, res: T) => {
            if(err) {
                reject(err);
            } else {
                resolve(res)
            }
        })
    })
}

export const safeHandler = (cb) => {
    return (...args) => cb && cb(...args);
}