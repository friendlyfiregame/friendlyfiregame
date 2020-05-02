import { Signal } from "./Signal";

export class Keyboard {
    public readonly onKeyDown = new Signal<KeyboardEvent>();
    public readonly onKeyUp = new Signal<KeyboardEvent>();
    public readonly onKeyPress = new Signal<KeyboardEvent>();
    private readonly pressed = new Set<string>();

    public constructor() {
        document.addEventListener("keypress", event => this.handleKeyPress(event));
        document.addEventListener("keydown", event => this.handleKeyDown(event));
        document.addEventListener("keyup", event => this.handleKeyUp(event));
    }

    private handleKeyPress(event: KeyboardEvent): void {
        this.onKeyPress.emit(event)
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (!event.repeat) {
            this.pressed.add(event.code);
        }
        this.onKeyDown.emit(event);
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (!event.repeat) {
            this.pressed.delete(event.code);
        }
        this.onKeyUp.emit(event);
    }

    public isPressed(code: string): boolean {
        return this.pressed.has(code);
    }
}
