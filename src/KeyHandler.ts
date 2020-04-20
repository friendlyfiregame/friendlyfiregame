export class KeyHandler {
    private keyStates = new Map<string, boolean>();

    public constructor() {
        document.addEventListener("keydown", event => this.handleKeyDown(event));
        document.addEventListener("keyup", event => this.handleKeyUp(event));
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.repeat) {
            // We don't like key repeats!
            return;
        }
        this.keyStates.set(event.key, true);
    }

    private handleKeyUp(event: KeyboardEvent) {
        this.keyStates.set(event.key, false);
    }

    public isPressed(key: string): boolean {
        return this.keyStates.get(key) ?? false;
    }
}
