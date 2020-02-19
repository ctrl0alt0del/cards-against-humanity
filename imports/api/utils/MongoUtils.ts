import { Mongo } from "meteor/mongo";
import { shuffle } from 'lodash';

export function insertAsync<T>(collection: Mongo.Collection<T>, item: Mongo.OptionalId<T>) {
    return new Promise<string>((resolve, reject) => {
        collection.insert(item, (err, _id) => {
            if(err) {
                reject(err);
            } else {
                resolve(_id);
            }
        })
    })
}

export function updateAsync<T>(collection: Mongo.Collection<T>, selector: Mongo.Selector<T>, updateObj: Mongo.Modifier<T>, options: {multi?:boolean, upsert?: boolean}){
    return new Promise<void>((resolve, reject) => {
        collection.update(selector, updateObj, options, err => {
            if(err){
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

export function removeAsync<T>(collection: Mongo.Collection<T>, selector: Mongo.Selector<T>) {
    return new Promise<void>((resolve, reject) => {
        collection.remove(selector, err => {
            if(err) {
                reject(err);
            } else {
                resolve()
            }
        })
    })
}

export function randomFind<K, T extends {"_id": K}>(collection: Mongo.Collection<T>, count: number, excludeIds: K[]) {
    const randomIds = shuffle(collection.find({_id: {$nin: excludeIds as any}}).map(doc => doc._id));
    return collection.find({_id: {$in: randomIds.slice(0, count) as any}});
}