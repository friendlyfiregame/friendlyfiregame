/**
 * Internally used container for a slot (A callback function with a calling context).
 */
class Slot<T = unknown> {
    public constructor(public callback: (value: T) => void, public context?: object) {}
    public call(value: T): void {
        this.callback.call(this.context, value);
    }
}

/**
 * Light-weight and very fast signal/slot based event system. Just create a signal instance, connect slots
 * (event listeners) to it and then let the signal emit values which are then send to all connected slots.
 * Slots can be methods and it's easy to disconnect them again using the disconnect() method or calling the function
 * returned by connect().
 */
export class Signal<T = void> {
    private readonly slots: Slot<T>[] = [];
    private readonly onInit: ((signal: Signal<T>) => (() => void) | void) | null;
    private onDone: ((signal: Signal<T>) => void) | null = null;

    /**
     * Creates a new signal with the given optional initialization function.
     *
     * @param onInit - Optional initialization function which is called when the first slot is connected to the signal.
     *                 This function can return an optional deinitialization function which is called after the last
     *                 slot has been disconnected.
     */
    public constructor(onInit?: (signal: Signal<T>) => (() => void) | void) {
        this.onInit = onInit ?? null;
    }

    /**
     * Connects a slot to this signal.
     *
     * @param callback - The slot callback function to call when signal emits a value.
     * @param context  - Optional context to call the slot callback function on. This is useful for connecting methods.
     * @return A function which can be called to disconnect the slot from the signal again.
     */
    public connect(callback: (value: T) => void, context?: object): () => void {
        if (this.onInit != null && this.slots.length === 0) {
            this.onDone = this.onInit(this) || null;
        }
        this.slots.push(new Slot(callback, context));
        return () => this.disconnect(callback, context);
    }

    /**
     * Disconnects a slot from this signal.
     *
     * @param callback - The slot callback function to disconnect from the signal.
     * @param context  - Optional context. Needed to disconnect methods.
     */
    public disconnect(callback: (value: T) => void, context?: object): void {
        const index = this.slots.findIndex(slot => slot.callback === callback && slot.context === context);
        if (index >= 0) {
            this.slots.splice(index, 1);
        }
        if (this.onDone != null && this.slots.length === 0) {
            this.onDone(this);
            this.onDone = null;
        }
    }

    /**
     * Emits the given value to all connected slots.
     *
     * @param value - The value to emit.
     */
    public emit(value: T): void {
        this.slots.forEach(slot => slot.call(value));
    }

    /**
     * Returns a new signal which only emits the values matching the giving predicate.
     *
     * @parm predicate - The function which decides if the value is emitted or not.
     * @return The new signal.
     */
    public filter(predicate: (value: T) => boolean): Signal<T> {
        return new Signal(signal => this.connect(value => {
            if (predicate(value)) {
                signal.emit(value);
            }
        }));
    }

    /**
     * Returns a new signal which maps all emitted values to something else.
     *
     * @param mapper - The function which maps the original value to something new.
     * @return The new signal.
     */
    public map<R>(mapper: (value: T) => R): Signal<R> {
        return new Signal<R>(signal => this.connect(value => {
            return signal.emit(mapper(value));
        }));
    }
}
