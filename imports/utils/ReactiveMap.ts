type KeySubscriber<V> = (newVal: V) => void;

export class ReactiveMap<K, V> extends Map<K, V> {

    private subscribers = new Map<K, KeySubscriber<V>[]>();

    subscribeForKey(key: K, callback: KeySubscriber<V>) {
        const previousSubscribers = this.subscribers.get(key);
        if (!previousSubscribers) {
            this.subscribers.set(key, [callback]);
        } else {
            previousSubscribers.push(callback)
        }
    }

    set(key: K, value: V) {
        super.set(key, value);
        this.notifySubscribers(key, value);
        return this;
    }

    delete(key: K) {
        const result = super.delete(key);
        this.subscribers.delete(key);
        return result;
    }

    private notifySubscribers(key: K, value: V) {
        const subscribers = this.subscribers.get(key);
        if (subscribers && subscribers.length) {
            subscribers.forEach(callback => callback(value));
        }
    }
}