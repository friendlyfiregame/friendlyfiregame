import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { Conversation } from './Conversation';
import { entity } from './Entity';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { RenderingLayer, RenderingType } from './Renderer';

interface SpiderSpriteMetadata {
    eyeOffsetFrames?: number[];
}

@entity("spider")
export class Spider extends NPC {
    @asset("sprites/magicspider.aseprite.json")
    private static sprite: Aseprite;

    @asset("sprites/eyes/spider.aseprite.json")
    private static eyes: Aseprite;

    private spriteMetadata: SpiderSpriteMetadata | null = null;
    private eyeOffsetY = 0;

    public constructor(scene: GameScene, x: number, y:number) {
        super(scene, x, y, 36, 36);
        Conversation.setGlobal("talkedToSpider", "false");
    }

    public showDialoguePrompt(): boolean {
        if (!super.showDialoguePrompt()) {
            return false;
        }

        return Conversation.getGlobals()["$talkedToSpider"] === "false";
    }

    private getSpriteMetadata(): SpiderSpriteMetadata {
        if (this.spriteMetadata == null) {
            const metadata = Spider.sprite.getLayer("Meta")?.data;
            this.spriteMetadata = metadata ? JSON.parse(metadata) : {};
        }

        return this.spriteMetadata || {};
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.addAseprite(
            Spider.sprite, "idle", this.x, this.y, RenderingLayer.ENTITIES, this.direction
        );

        const scale = (this.direction < 0) ? { x: -1, y: 1 } : undefined;
        const totalOffsetY = -10 - this.eyeOffsetY;
        const totalOffsetX = 5;

        this.scene.renderer.add({
            type: RenderingType.ASEPRITE,
            layer: RenderingLayer.ENTITIES,
            asset: Spider.eyes,
            scale,
            translation: {
                x: this.x,
                y: -this.y,
            },
            position: {
                x: (-Spider.eyes.width >> 1) + totalOffsetX,
                y: -Spider.eyes.height + totalOffsetY
            },
            animationTag: "blink",
            time: this.scene.gameTime * 1000
        });

        if (this.scene.showBounds) this.drawBounds();

        if (this.showDialoguePrompt()) {
            this.drawDialoguePrompt();
        }

        this.speechBubble.draw(ctx);
    }

    public update(dt: number): void {
        super.update(dt);

        // Get y offset to match breathing motion
        const currentFrameIndex = Spider.sprite.getTaggedFrameIndex("idle", this.scene.gameTime * 1000);
        const eyeOffsetFrames = this.getSpriteMetadata().eyeOffsetFrames ?? [];
        this.eyeOffsetY = eyeOffsetFrames.includes(currentFrameIndex + 1) ? 0 : -1;

        this.dialoguePrompt.update(dt, this.x, this.y + 32);
        this.speechBubble.update(this.x, this.y);
    }
}
