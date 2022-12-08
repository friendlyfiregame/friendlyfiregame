export {};


interface Keyboard {
    async lock(keyCodes?: Iterable<DOMString>): Promise<void>;
    unlock(): void;
}

declare global {
    interface Navigator {
        // See https://wicg.github.io/keyboard-lock/
        readonly keyboard: Keyboard
    }
}
