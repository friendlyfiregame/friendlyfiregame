import { NPC } from "./NPC";

export abstract class ScriptableNPC extends NPC {
    protected move: 0 | 1 | -1  = 0;

    protected override updatePosition(newX: number, newY: number): void {
        this.x = newX;
        this.y = newY;

        // Check collision with the environment and correct player position and movement
        if (this.pullOutOfGround() !== 0 || this.pullOutOfCeiling() !== 0) {
            this.setVelocityY(0);
        }

        if (this.pullOutOfWall() !== 0) {
            this.setVelocityX(0);
        }
    }

    public override update(dt: number): void {
        super.update(dt);
    }
}
