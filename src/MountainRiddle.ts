import { GameScene } from './scenes/GameScene';
import { Conversation } from './Conversation';
import { GotItemScene } from './scenes/GotItemScene';

const AMOUNT_GATE_COLS = 3;
const AMOUNT_GATE_ROWS = 5;

export class MountainRiddle {
  private attemptCount = 0;
  private failed = false;
  private cleared = false;
  private solution: number[];

  public constructor () {
    this.solution = this.getRandomizedSolution();
  }

  private getRandomizedSolution (): number[] {
    const solution: number[] = [];
    for (let index = 0; index < AMOUNT_GATE_ROWS; index++) {
      solution.push(Math.floor(Math.random() * Math.floor(AMOUNT_GATE_COLS)))
    }
    console.log('new solution', solution);
    return solution;
  }

  public isCorrectGate (col: number, row: number): boolean {
    return this.solution[row] === col;
  }

  public checkGate (col: number, row: number) {
    if (!this.failed && !this.cleared && !this.isCorrectGate(col, row)) {
      this.failRiddle();
    }
  }

  public hasAttempted (): boolean {
    return this.attemptCount > 0;
  }

  public registerAttempt (): void {
    this.attemptCount++;
    console.log('register attempt. new count', this.attemptCount);
  }

  public failRiddle (): void {
    console.log('fail riddle');
    Conversation.setGlobal("gotTeleported", "true");
    this.failed = true;
    this.registerAttempt();
    GameScene.wrong.play();
  }

  public isFailed (): boolean {
    return this.failed;
  }

  public resetRiddle (): void {
    if (this.failed && !this.cleared) {
      this.solution = this.getRandomizedSolution();
      this.failed = false;
    }
  }

  public isCleared (): boolean {
    return this.cleared;
  }
  public clearRiddle (): void {
    if (!this.cleared) {
      GotItemScene.sound.play();
      this.failed = false;
      this.cleared = true;
    }
  }
}