import { asset } from "./Assets";
import { Sound } from "./audio/Sound";
import { Conversation } from "./Conversation";

const AMOUNT_GATE_COLS = 3;
const AMOUNT_GATE_ROWS = 5;

export class MountainRiddle {
    private attemptCount = 0;
    private failed = false;
    private cleared = false;
    private solution: number[];

    @asset("sounds/item/fanfare.mp3")
    private static readonly sound: Sound;

    @asset("sounds/gate/wrong.ogg")
    public static wrong: Sound;

    public constructor() {
        this.solution = this.getRandomizedSolution();
    }

    private getRandomizedSolution(): number[] {
        const solution: number[] = [];

        for (let index = 0; index < AMOUNT_GATE_ROWS; index++) {
            solution.push(Math.floor(Math.random() * Math.floor(AMOUNT_GATE_COLS)));
        }

        return solution;
    }

    public isCorrectGate(col: number, row: number): boolean {
        return this.solution[row] === col;
    }

    public checkGate(col: number, row: number): void {
        if (!this.failed && !this.cleared && !this.isCorrectGate(col, row)) {
            this.failRiddle();
        }
    }

    public wasAttempted(): boolean {
        return this.attemptCount > 0;
    }

    public registerAttempt(): void {
        this.attemptCount++;
    }

    public failRiddle(): void {
        Conversation.setGlobal("gotTeleported", "true");
        this.failed = true;
        this.registerAttempt();
        MountainRiddle.wrong.play();
    }

    public isFailed(): boolean {
        return this.failed;
    }

    public resetRiddle(): void {
        if (this.failed && !this.cleared) {
            this.solution = this.getRandomizedSolution();
            this.failed = false;
        }
    }

    public isCleared(): boolean {
        return this.cleared;
    }

    public clearRiddle(): void {
        if (!this.cleared) {
            MountainRiddle.sound.play();
            this.failed = false;
            this.cleared = true;
        }
    }
}
