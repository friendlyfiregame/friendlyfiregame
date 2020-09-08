import { FriendlyFire } from "../FriendlyFire";
import { Scene } from "../Scene";
import { asset } from "../Assets";
import { Aseprite } from "../Aseprite";
import { AsepriteNode } from "../scene/AsepriteNode";
import { Direction } from "../geom/Direction";
import { Animator } from "../scene/animations/Animator";
import { ParallelAnimations } from "../scene/animations/ParallelAnimations";
import { SequentialAnimations } from "../scene/animations/SequentialAnimations";
import { easeOutBounce } from "../easings";

export class TestScene extends Scene<FriendlyFire> {
    @asset("sprites/mimic.aseprite.json")
    private static sprite: Aseprite;

    public setup(): void {
        this.setBackgroundStyle("gray");
        const node1 = new AsepriteNode({
            aseprite: TestScene.sprite,
            showBounds: true
        }).appendTo(this.rootNode).addAnimation(new SequentialAnimations([
            new Animator((node, value) => node.setX(100 * value), { duration: 1 }),
            new ParallelAnimations([
                new Animator((node, value) => node.setX(100 * (1 - value)), { duration: 1 }),
                new Animator((node, value) => node.transform(m => m.setScale(1 + value)), { duration: 1, easing: easeOutBounce }),
            ]),
            new ParallelAnimations([
                new Animator((node, value) => node.setX(100 * value), { duration: 1 }),
                new Animator((node, value) => node.transform(m => m.setScale(2 - value)), { duration: 1, easing: easeOutBounce }),
            ]),
            new Animator((node, value) => node.setX(100 * (1 - value)), { duration: 1 })
        ]));

        const node2 = new AsepriteNode({
            aseprite: TestScene.sprite,
            x: 200,
            showBounds: true
        }).appendTo(this.rootNode).addAnimation(new Animator(
            node => node.transform(m => m.rotate(0.01)),
            { duration: Infinity }
        ));

        const node3 = new AsepriteNode({
            aseprite: TestScene.sprite,
            y: 50,
            showBounds: true
        }).appendTo(node2).addAnimation(new Animator(
            node => node.transform(m => m.rotate(0.001)),
            { duration: Infinity }
        ));

        this.rootNode.setShowBounds(true);
        this.rootNode.setChildAnchor(Direction.CENTER);

        (window as any).camera = this.camera;
        (window as any).node1 = node1;
        (window as any).node2 = node2;
        (window as any).node3 = node3;
        // this.camera.transform(m => m.rotate(0).scale(3));
    }

    public cleanup(): void {
        this.rootNode.clear();
    }
}
