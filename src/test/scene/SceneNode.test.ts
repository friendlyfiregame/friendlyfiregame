import "jest-extended";

import { Game } from "../../Game";
import { Direction } from "../../geom/Direction";
import { createContext2D } from "../../graphics";
import { AffineTransform } from "../../graphics/AffineTransform";
import { Vector2 } from "../../graphics/Vector2";
import { Scene } from "../../Scene";
import { SceneNode, SceneNodeArgs, SceneNodeAspect } from "../../scene/SceneNode";

class TestGame extends Game {
}

class TestScene extends Scene {
}

function createValidSceneNode(args?: SceneNodeArgs): SceneNode {
    const game = new TestGame(640, 480);
    const scene = new TestScene(game);
    const parent = new SceneNode();
    const node = new SceneNode(args);
    scene.rootNode.appendChild(parent);
    parent.appendChild(node);
    scene.update(0);
    scene.draw(createContext2D(game.width, game.height), game.width, game.height);
    node.getScenePosition();
    node.getSceneTransformation();
    node.getBounds();
    node.getSceneBounds();
    parent.getScenePosition();
    parent.getSceneTransformation();
    parent.getBounds();
    parent.getSceneBounds();
    expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
    expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
    expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
    expect(node.isValid(SceneNodeAspect.BOUNDS)).toBe(true);
    expect(node.isValid(SceneNodeAspect.SCENE_BOUNDS)).toBe(true);
    expect(parent.isValid(SceneNodeAspect.RENDERING)).toBe(true);
    expect(parent.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
    expect(parent.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
    expect(parent.isValid(SceneNodeAspect.BOUNDS)).toBe(true);
    expect(parent.isValid(SceneNodeAspect.SCENE_BOUNDS)).toBe(true);
    return node;
}

describe("SceneNode", () => {
    describe("constructor", () => {
        it("initializes all properties correctly", () => {
            const node = new SceneNode({
                id: "test-id",
                x: 1,
                y: 2,
                width: 3,
                height: 4,
                hidden: true,
                anchor: Direction.BOTTOM,
                childAnchor: Direction.TOP,
                layer: 5,
                opacity: 0.2,
                showBounds: true
            });
            expect(node.getId()).toBe("test-id");
            expect(node.getX()).toBe(1);
            expect(node.getY()).toBe(2);
            expect(node.getWidth()).toBe(3);
            expect(node.getHeight()).toBe(4);
            expect(node.isHidden()).toBe(true);
            expect(node.getAnchor()).toBe(Direction.BOTTOM);
            expect(node.getChildAnchor()).toBe(Direction.TOP);
            expect(node.getLayer()).toBe(5);
            expect(node.getOpacity()).toBe(0.2);
            expect(node.isShowBounds()).toBe(true);
        });
        it("initializes all properties to correct defaults when no arguments given", () => {
            const node = new SceneNode();
            expect(node.getId()).toBeNull();
            expect(node.getX()).toBe(0);
            expect(node.getY()).toBe(0);
            expect(node.getWidth()).toBe(0);
            expect(node.getHeight()).toBe(0);
            expect(node.isHidden()).toBe(false);
            expect(node.getAnchor()).toBe(Direction.CENTER);
            expect(node.getChildAnchor()).toBe(Direction.CENTER);
            expect(node.getLayer()).toBeNull();
            expect(node.getOpacity()).toBe(1);
            expect(node.isShowBounds()).toBe(false);
        });
        it("initializes all properties to correct defaults when only one argument is given", () => {
            const node = new SceneNode({ hidden: false });
            expect(node.getId()).toBeNull();
            expect(node.getX()).toBe(0);
            expect(node.getY()).toBe(0);
            expect(node.getWidth()).toBe(0);
            expect(node.getHeight()).toBe(0);
            expect(node.isHidden()).toBe(false);
            expect(node.getAnchor()).toBe(Direction.CENTER);
            expect(node.getChildAnchor()).toBe(Direction.CENTER);
            expect(node.getLayer()).toBeNull();
            expect(node.getOpacity()).toBe(1);
            expect(node.isShowBounds()).toBe(false);
        });
    });

    describe("setId", () => {
        it("sets the id", () => {
            const node = new SceneNode();
            expect(node.getId()).toBeNull();
            node.setId("foo");
            expect(node.getId()).toBe("foo");
            node.setId(null);
            expect(node.getId()).toBeNull();
        });
    });

    describe("setX", () => {
        it("sets the X position", () => {
            const node = new SceneNode();
            expect(node.getX()).toBe(0);
            node.setX(10);
            expect(node.getX()).toBe(10);
        });
        it("invalidates the scene transformation", () => {
            const node = new SceneNode();
            expect(node.getSceneTransformation()).toEqual(new AffineTransform());
            node.setX(10);
            expect(node.getSceneTransformation()).toEqual(AffineTransform.createTranslation(10, 0));
        });
        it("does nothing when not changed", () => {
            const node = new SceneNode();
            node.getSceneTransformation();
            node.setX(node.getX());
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
    });

    describe("setY", () => {
        it("sets the Y position", () => {
            const node = new SceneNode();
            expect(node.getY()).toBe(0);
            node.setY(10);
            expect(node.getY()).toBe(10);
        });
        it("invalidates the scene transformation", () => {
            const node = new SceneNode();
            expect(node.getSceneTransformation()).toEqual(new AffineTransform());
            node.setY(10);
            expect(node.getSceneTransformation()).toEqual(AffineTransform.createTranslation(0, 10));
        });
        it("does nothing when not changed", () => {
            const node = new SceneNode();
            node.getSceneTransformation();
            node.setY(node.getY());
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
    });

    describe("getPosition", () => {
        it("returns the position as a vector", () => {
            const node = new SceneNode({x: 1, y: 2 });
            expect(node.getPosition()).toEqual(new Vector2(1, 2));
        });
    });

    describe("getScenePosition", () => {
        it("always returns same vector", () => {
            const node = new SceneNode();
            const pos = node.getScenePosition();
            expect(node.getScenePosition()).toBe(pos);
            node.transform(m => m.translate(10, 20));
            expect(node.getScenePosition()).toBe(pos);
        });
        it("returns local position when it has no parent", () => {
            const node = new SceneNode({ x: 2, y: 4 });
            expect(node.getScenePosition()).toEqual(new Vector2(2, 4));
        });
        it("does not include local transformation", () => {
            const node = new SceneNode({ x: 2, y: 4 });
            node.transform(m => m.translate(20, 10));
            expect(node.getScenePosition()).toEqual(new Vector2(2, 4));
        });
        it("includes parent node position", () => {
            const node = new SceneNode({ x: 2, y: 4 });
            const parent = new SceneNode({ x: -6, y: 10 });
            parent.appendChild(node);
            expect(node.getScenePosition()).toEqual(new Vector2(-4, 14));
        });
        it("includes parent child anchor", () => {
            const node = new SceneNode({ x: 2, y: 4 });
            const parent = new SceneNode({ x: -6, y: 10, width: 20, height: 10 });
            parent.appendChild(node);
            parent.setChildAnchor(Direction.TOP_LEFT);
            expect(node.getScenePosition()).toEqual(new Vector2(-14, 9));
            parent.setChildAnchor(Direction.CENTER);
            expect(node.getScenePosition()).toEqual(new Vector2(-4, 14));
            parent.setChildAnchor(Direction.BOTTOM_RIGHT);
            expect(node.getScenePosition()).toEqual(new Vector2(6, 19));
        });
        it("includes parent transformation", () => {
            const node = new SceneNode({ x: 2, y: 4 });
            const parent = new SceneNode({ x: -6, y: 10 });
            parent.appendChild(node);
            parent.transform(m => m.translate(20, 10));
            expect(node.getScenePosition()).toEqual(new Vector2(16, 24));
        });
    });

    describe("moveBy", () => {
        it("moves the node by given delta",() => {
            const node = new SceneNode({ x: 1, y: 2 });
            node.moveBy(10, 20);
            expect(node.getX()).toBe(11);
            expect(node.getY()).toBe(22);
        });
        it("invalidates rendering, scene position and scene transformation", () => {
            const node = createValidSceneNode({ x: 1, y: 2 });
            node.moveBy(10, 20);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
        it("does nothing when delta is 0", () => {
            const node = createValidSceneNode({ x: 1, y: 2 });
            node.moveBy(0, 0);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
        });
    });

    describe("moveTo", () => {
        it("moves the node to the given position",() => {
            const node = new SceneNode({ x: 1, y: 2 });
            node.moveTo(10, 20);
            expect(node.getX()).toBe(10);
            expect(node.getY()).toBe(20);
        });
        it("invalidates rendering, scene position and scene transformation", () => {
            const node = createValidSceneNode({ x: 1, y: 2 });
            node.moveTo(10, 20);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
        it("does nothing when moving to current position", () => {
            const node = createValidSceneNode({ x: 1, y: 2 });
            node.moveTo(1, 2);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
        });
    });

    describe("setWidth", () => {
        it("sets the nodes width",() => {
            const node = new SceneNode({ width: 1, height: 2 });
            node.setWidth(10);
            expect(node.getWidth()).toBe(10);
        });
        it("invalidates rendering and bounds", () => {
            const node = createValidSceneNode({ width: 1, height: 2 });
            node.setWidth(10);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.BOUNDS)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_BOUNDS)).toBe(false);
        });
        it("does nothing when width is not changed", () => {
            const node = createValidSceneNode({ width: 1, height: 2 });
            node.setWidth(1);
            expect(node.isValid(SceneNodeAspect.BOUNDS)).toBe(true);
        });
    });

    describe("setHeight", () => {
        it("sets the nodes height",() => {
            const node = new SceneNode({ width: 1, height: 2 });
            node.setHeight(10);
            expect(node.getHeight()).toBe(10);
        });
        it("invalidates rendering and bounds", () => {
            const node = createValidSceneNode({ width: 1, height: 2 });
            node.setHeight(10);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.BOUNDS)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_BOUNDS)).toBe(false);
        });
        it("does nothing when height is not changed", () => {
            const node = createValidSceneNode({ width: 1, height: 2 });
            node.setHeight(2);
            expect(node.isValid(SceneNodeAspect.BOUNDS)).toBe(true);
        });
    });

    describe("getLeft", () => {
        it("returns the left edge position", () => {
            const node = new SceneNode({ x: 1, y: 2, width: 20, height: 10 });
            node.setAnchor(Direction.LEFT);
            expect(node.getLeft()).toBe(1);
            node.setAnchor(Direction.CENTER);
            expect(node.getLeft()).toBe(-9);
            node.setAnchor(Direction.RIGHT);
            expect(node.getLeft()).toBe(-19);
        });
    });

    describe("getRight", () => {
        it("returns the right edge position", () => {
            const node = new SceneNode({ x: 1, y: 2, width: 20, height: 10 });
            node.setAnchor(Direction.LEFT);
            expect(node.getRight()).toBe(21);
            node.setAnchor(Direction.CENTER);
            expect(node.getRight()).toBe(11);
            node.setAnchor(Direction.RIGHT);
            expect(node.getRight()).toBe(1);
        });
    });

    describe("getTop", () => {
        it("returns the top edge position", () => {
            const node = new SceneNode({ x: 1, y: 2, width: 20, height: 10 });
            node.setAnchor(Direction.TOP);
            expect(node.getTop()).toBe(2);
            node.setAnchor(Direction.CENTER);
            expect(node.getTop()).toBe(-3);
            node.setAnchor(Direction.BOTTOM);
            expect(node.getTop()).toBe(-8);
        });
    });

    describe("getBottom", () => {
        it("returns the bottom edge position", () => {
            const node = new SceneNode({ x: 1, y: 2, width: 20, height: 10 });
            node.setAnchor(Direction.TOP);
            expect(node.getBottom()).toBe(12);
            node.setAnchor(Direction.CENTER);
            expect(node.getBottom()).toBe(7);
            node.setAnchor(Direction.BOTTOM);
            expect(node.getBottom()).toBe(2);
        });
    });

    describe("resizeTo", () => {
        it("sets the nodes size",() => {
            const node = new SceneNode({ width: 1, height: 2 });
            node.resizeTo(10, 20);
            expect(node.getWidth()).toBe(10);
            expect(node.getHeight()).toBe(20);
        });
        it("invalidates rendering and bounds", () => {
            const node = createValidSceneNode({ width: 1, height: 2 });
            node.resizeTo(10, 20);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.BOUNDS)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_BOUNDS)).toBe(false);
        });
        it("does nothing when height is not changed", () => {
            const node = createValidSceneNode({ width: 1, height: 2 });
            node.resizeTo(1, 2);
            expect(node.isValid(SceneNodeAspect.BOUNDS)).toBe(true);
        });
    });

    describe("setOpacity", () => {
        it("changes the node opacity", () => {
            const node = new SceneNode({ opacity: 0.7 });
            node.setOpacity(0.2);
            expect(node.getOpacity()).toBe(0.2);
        });
        it("invalidates rendering", () => {
            const node = createValidSceneNode();
            node.setOpacity(0.2);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
        });
        it("does nothing when opacity is not changed", () => {
            const node = createValidSceneNode();
            node.setOpacity(1);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
        });
    });

    describe("getEffectiveOpacity", () => {
        it("returns combined opacity of node and parents", () => {
            const node = new SceneNode({ opacity: 0.75 });
            const parent = new SceneNode({ opacity: 0.5 });
            parent.appendChild(node);
            expect(node.getEffectiveOpacity()).toBe(0.375);
        });
        it("returns 1 when opacity is infinite", () => {
            const node = new SceneNode({ opacity: Infinity });
            expect(node.getEffectiveOpacity()).toBe(1);
        });
    });

    describe("setHidden", () => {
        it("sets the hidden flag", () => {
            const node = new SceneNode();
            expect(node.isHidden()).toBe(false);
            node.setHidden(true);
            expect(node.isHidden()).toBe(true);
        });
        it("invalidates rendering", () => {
            const node = createValidSceneNode();
            node.setHidden(true);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
        });
        it("does nothing when state not changed", () => {
            const node = createValidSceneNode();
            node.setHidden(false);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
        });
    });

    describe("setVisible", () => {
        it("sets the visible (actually the hidden) flag", () => {
            const node = new SceneNode();
            expect(node.isVisible()).toBe(true);
            node.setVisible(false);
            expect(node.isVisible()).toBe(false);
        });
        it("invalidates rendering", () => {
            const node = createValidSceneNode();
            node.setVisible(false);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
        });
        it("does nothing when state not changed", () => {
            const node = createValidSceneNode();
            node.setVisible(true);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
        });
    });

    describe("hide", () => {
        it("hides the node", () => {
            const node = new SceneNode();
            expect(node.isVisible()).toBe(true);
            node.hide();
            expect(node.isVisible()).toBe(false);
        });
        it("invalidates rendering", () => {
            const node = createValidSceneNode();
            node.hide();
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
        });
        it("does nothing when state not changed", () => {
            const node = createValidSceneNode({ hidden: true });
            node.hide();
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
        });
    });

    describe("show", () => {
        it("shows the node", () => {
            const node = new SceneNode({ hidden: true });
            expect(node.isVisible()).toBe(false);
            node.show();
            expect(node.isVisible()).toBe(true);
        });
        it("invalidates rendering", () => {
            const node = createValidSceneNode({ hidden: true });
            node.show();
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
        });
        it("does nothing when state not changed", () => {
            const node = createValidSceneNode();
            node.show();
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
        });
    });

    describe("setAnchor", () => {
        it("sets the position anchor of the node", () => {
            const node = new SceneNode();
            expect(node.getAnchor()).toBe(Direction.CENTER);
            node.setAnchor(Direction.RIGHT);
            expect(node.getAnchor()).toBe(Direction.RIGHT);
        });
        it("invalidates rendering and scene transformation", () => {
            const node = createValidSceneNode();
            node.setAnchor(Direction.TOP);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
        it("does nothing when not changed", () => {
            const node = createValidSceneNode();
            node.setAnchor(Direction.CENTER);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
    });

    describe("setChildAnchor", () => {
        it("sets the position anchor of the child nodes", () => {
            const node = new SceneNode();
            expect(node.getChildAnchor()).toBe(Direction.CENTER);
            node.setChildAnchor(Direction.RIGHT);
            expect(node.getChildAnchor()).toBe(Direction.RIGHT);
        });
        it("invalidates rendering, scene transformation and scene position of child nodes", () => {
            const node = createValidSceneNode();
            const parent = node.getParent() as SceneNode;
            parent.setChildAnchor(Direction.TOP);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
            expect(parent.isValid(SceneNodeAspect.RENDERING)).toBe(true);
            expect(parent.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
            expect(parent.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
        it("does nothing when not changed", () => {
            const node = createValidSceneNode();
            const parent = node.getParent() as SceneNode;
            parent.setChildAnchor(Direction.CENTER);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
        });
    });

    describe("getTransformation", () => {
        it("returns the custom transformation of the node", () => {
            const node = new SceneNode();
            node.transform(m => m.translate(1, 2));
            expect(node.getTransformation()).toEqual(AffineTransform.createTranslation(1, 2));
        });
    });

    describe("getScene", () => {
        it("returns null when node is not in scene", () => {
            const node = new SceneNode();
            expect(node.getScene()).toBeNull();
        });
        it("returns null when node has been removed from scene", () => {
            const node = createValidSceneNode();
            node.remove();
            expect(node.getScene()).toBeNull();
        });
        it("returns the scene when node is connected to a scene", () => {
            const node = new SceneNode();
            const scene = new TestScene(new TestGame());
            scene.rootNode.appendChild(node);
            expect(node.getScene()).toBe(scene);
        });
        it("returns the scene when parent is connected to a scene", () => {
            const node = new SceneNode();
            const parent = new SceneNode();
            parent.appendChild(node);
            const scene = new TestScene(new TestGame());
            scene.rootNode.appendChild(parent);
            expect(node.getScene()).toBe(scene);
        });
    });

    describe("isInScene", () => {
        it("returns false when node is not in scene", () => {
            const node = new SceneNode();
            expect(node.isInScene()).toBe(false);
        });
        it("returns false when node has been removed from scene", () => {
            const node = createValidSceneNode();
            node.remove();
            expect(node.isInScene()).toBe(false);
        });
        it("returns true when node is connected to a scene", () => {
            const node = new SceneNode();
            const scene = new TestScene(new TestGame());
            scene.rootNode.appendChild(node);
            expect(node.isInScene()).toBe(true);
        });
        it("returns true when parent is connected to a scene", () => {
            const node = new SceneNode();
            const parent = new SceneNode();
            parent.appendChild(node);
            const scene = new TestScene(new TestGame());
            scene.rootNode.appendChild(parent);
            expect(node.isInScene()).toBe(true);
        });
    });

    describe("getNextSibling", () => {
        it("returns the next sibling or null if none", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const a1 = new SceneNode().appendTo(a);
            const a2 = new SceneNode().appendTo(a);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const c1 = new SceneNode().appendTo(c);
            const c2 = new SceneNode().appendTo(c);
            expect(a.getNextSibling()).toBe(b);
            expect(b.getNextSibling()).toBe(c);
            expect(c.getNextSibling()).toBeNull();
            expect(a1.getNextSibling()).toBe(a2);
            expect(a2.getNextSibling()).toBeNull();
            expect(c1.getNextSibling()).toBe(c2);
            expect(c2.getNextSibling()).toBeNull();
            expect(parent.getNextSibling()).toBeNull();
        });
    });

    describe("getPreviousSibling", () => {
        it("returns the previous sibling or null if none", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const a1 = new SceneNode().appendTo(a);
            const a2 = new SceneNode().appendTo(a);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const c1 = new SceneNode().appendTo(c);
            const c2 = new SceneNode().appendTo(c);
            expect(c.getPreviousSibling()).toBe(b);
            expect(b.getPreviousSibling()).toBe(a);
            expect(a.getPreviousSibling()).toBeNull();
            expect(a2.getPreviousSibling()).toBe(a1);
            expect(a1.getPreviousSibling()).toBeNull();
            expect(c2.getPreviousSibling()).toBe(c1);
            expect(c1.getPreviousSibling()).toBeNull();
            expect(parent.getPreviousSibling()).toBeNull();
        });
    });

    describe("getFirstChild", () => {
        it("returns the first child node or null if none", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const a1 = new SceneNode().appendTo(a);
            const a2 = new SceneNode().appendTo(a);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const c1 = new SceneNode().appendTo(c);
            const c2 = new SceneNode().appendTo(c);
            expect(a.getFirstChild()).toBe(a1);
            expect(b.getFirstChild()).toBeNull();
            expect(c.getFirstChild()).toBe(c1);
            expect(a1.getFirstChild()).toBeNull();
            expect(a2.getFirstChild()).toBeNull();
            expect(c1.getFirstChild()).toBeNull();
            expect(c2.getFirstChild()).toBeNull();
            expect(parent.getFirstChild()).toBe(a);
        });
    });

    describe("getLastChild", () => {
        it("returns the last child node or null if none", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const a1 = new SceneNode().appendTo(a);
            const a2 = new SceneNode().appendTo(a);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const c1 = new SceneNode().appendTo(c);
            const c2 = new SceneNode().appendTo(c);
            expect(a.getLastChild()).toBe(a2);
            expect(b.getLastChild()).toBeNull();
            expect(c.getLastChild()).toBe(c2);
            expect(a1.getLastChild()).toBeNull();
            expect(a2.getLastChild()).toBeNull();
            expect(c1.getLastChild()).toBeNull();
            expect(c2.getLastChild()).toBeNull();
            expect(parent.getLastChild()).toBe(c);
        });
    });

    describe("hasChildNodes", () => {
        it("checks if node has children", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const a1 = new SceneNode().appendTo(a);
            const a2 = new SceneNode().appendTo(a);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const c1 = new SceneNode().appendTo(c);
            const c2 = new SceneNode().appendTo(c);
            expect(a.hasChildNodes()).toBe(true);
            expect(b.hasChildNodes()).toBe(false);
            expect(c.hasChildNodes()).toBe(true);
            expect(a1.hasChildNodes()).toBe(false);
            expect(a2.hasChildNodes()).toBe(false);
            expect(c1.hasChildNodes()).toBe(false);
            expect(c2.hasChildNodes()).toBe(false);
            expect(parent.hasChildNodes()).toBe(true);
        });
    });

    describe("appendChild", () => {
        it("throws error when appending to itself", () => {
            const node = new SceneNode();
            expect(() => node.appendChild(node)).toThrowWithMessage(Error, "Node can not be appended to itself");
        });
        it("moves existing node to the end of child list", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            parent.appendChild(b);
            expect(a.getNextSibling()).toBe(c);
            expect(b.getPreviousSibling()).toBe(c);
            expect(c.getNextSibling()).toBe(b);
            expect(c.getPreviousSibling()).toBe(a);
            expect(parent.getLastChild()).toBe(b);
            expect(b.getParent()).toBe(parent);
        });
        it("invalidates rendering, scene position and scene transformation of appended child", () => {
            const parent = new SceneNode();
            const node = createValidSceneNode();
            parent.appendChild(node);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
    });

    describe("prependChild", () => {
        it("throws error when prepending to itself", () => {
            const node = new SceneNode();
            expect(() => node.prependChild(node)).toThrowWithMessage(Error, "Node can not be appended to itself");
        });
        it("moves existing node to the end of child list", () => {
            const parent = new SceneNode();
            const c = new SceneNode().prependTo(parent);
            const b = new SceneNode().prependTo(parent);
            const a = new SceneNode().prependTo(parent);
            parent.prependChild(b);
            expect(b.getNextSibling()).toBe(a);
            expect(a.getPreviousSibling()).toBe(b);
            expect(a.getNextSibling()).toBe(c);
            expect(c.getPreviousSibling()).toBe(a);
            expect(parent.getFirstChild()).toBe(b);
            expect(b.getParent()).toBe(parent);
        });
        it("invalidates rendering, scene position and scene transformation of prepended child", () => {
            const parent = new SceneNode();
            const node = createValidSceneNode();
            parent.prependChild(node);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
    });

    describe("removeChild", () => {
        it("throws error when node is not a child", () => {
            const node = new SceneNode();
            expect(() => node.removeChild(new SceneNode())).toThrowWithMessage(Error,
                "Node must be a child node");
        });
        it("removes the child node", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            parent.removeChild(b);
            expect(a.getNextSibling()).toBe(c);
            expect(b.getPreviousSibling()).toBeNull();
            expect(b.getNextSibling()).toBeNull();
            expect(c.getPreviousSibling()).toBe(a);
            expect(b.getParent()).toBeNull();
        });
        it("invalidates rendering, scene position and scene transformation of removed child", () => {
            const node = createValidSceneNode();
            const parent = node.getParent() as SceneNode;
            parent.removeChild(node);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
    });

    describe("remove", () => {
        it("does nothing when node has no parent", () => {
            const node = new SceneNode();
            node.getSceneTransformation();
            node.remove();
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
        it("removes the node", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            b.remove();
            expect(a.getNextSibling()).toBe(c);
            expect(b.getPreviousSibling()).toBeNull();
            expect(b.getNextSibling()).toBeNull();
            expect(c.getPreviousSibling()).toBe(a);
            expect(b.getParent()).toBeNull();
        });
        it("invalidates rendering, scene position and scene transformation of removed child", () => {
            const node = createValidSceneNode();
            node.remove();
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
    });

    describe("clear", () => {
        it("removes all child nodes", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            parent.clear();
            expect(parent.getFirstChild()).toBeNull();
            expect(parent.getLastChild()).toBeNull();
            expect(parent.hasChildNodes()).toBe(false);
            expect(a.getParent()).toBe(null);
            expect(b.getParent()).toBe(null);
            expect(c.getParent()).toBe(null);
        });
    });

    describe("insertChildBefore", () => {
        it("throws error when trying to insert into itself", () => {
            const parent = new SceneNode();
            const ref = new SceneNode().appendTo(parent);
            expect(() => parent.insertChildBefore(parent, ref)).toThrowWithMessage(Error,
                "Node can not be inserted into itself");
        });
        it("throws error when reference is not a child node", () => {
            const node = new SceneNode();
            const parent = new SceneNode();
            const ref = new SceneNode();
            expect(() => parent.insertChildBefore(node, ref)).toThrowWithMessage(Error,
                "Reference node must be a child node");
        });
        it("moves existing node inside child list", () => {
            const parent = new SceneNode();
            const c = new SceneNode().appendTo(parent);
            const a = new SceneNode();
            parent.insertChildBefore(a, c);
            const b = new SceneNode();
            parent.insertChildBefore(b, c);
            parent.insertChildBefore(c, a);
            expect(c.getNextSibling()).toBe(a);
            expect(a.getPreviousSibling()).toBe(c);
            expect(a.getNextSibling()).toBe(b);
            expect(b.getPreviousSibling()).toBe(a);
            expect(parent.getFirstChild()).toBe(c);
            expect(parent.getLastChild()).toBe(b);
            expect(a.getParent()).toBe(parent);
            expect(b.getParent()).toBe(parent);
            expect(c.getParent()).toBe(parent);
        });
        it("invalidates rendering, scene position and scene transformation of inserted child", () => {
            const node = createValidSceneNode();
            const newNode = createValidSceneNode();
            const parent = node.getParent() as SceneNode;
            parent.insertChildBefore(newNode, node);
            expect(newNode.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
        it("does nothing when inserting child before itself", () => {
            const node = createValidSceneNode();
            const parent = node.getParent() as SceneNode;
            parent.insertChildBefore(node, node);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
    });

    describe("insertBefore", () => {
        it("throws error when reference node has no parent", () => {
            const node = new SceneNode();
            expect(() => node.insertBefore(new SceneNode())).toThrowWithMessage(Error,
                "Reference node has no parent");
        });
        it("moves existing node to the inside child list", () => {
            const parent = new SceneNode();
            const c = new SceneNode().appendTo(parent);
            const a = new SceneNode().insertBefore(c);
            const b = new SceneNode().insertBefore(c);
            c.insertBefore(a);
            expect(c.getNextSibling()).toBe(a);
            expect(a.getPreviousSibling()).toBe(c);
            expect(a.getNextSibling()).toBe(b);
            expect(b.getPreviousSibling()).toBe(a);
            expect(parent.getFirstChild()).toBe(c);
            expect(parent.getLastChild()).toBe(b);
            expect(a.getParent()).toBe(parent);
            expect(b.getParent()).toBe(parent);
            expect(c.getParent()).toBe(parent);
        });
        it("invalidates rendering, scene position and scene transformation of inserted child", () => {
            const node = createValidSceneNode();
            const newNode = createValidSceneNode();
            newNode.insertBefore(node);
            expect(newNode.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
        it("does nothing when inserting child before itself", () => {
            const node = createValidSceneNode();
            node.insertBefore(node);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
    });

    describe("insertChildAfter", () => {
        it("throws error when trying to insert into itself", () => {
            const parent = new SceneNode();
            const ref = new SceneNode().appendTo(parent);
            expect(() => parent.insertChildAfter(parent, ref)).toThrowWithMessage(Error,
                "Node can not be inserted into itself");
        });
        it("throws error when reference is not a child node", () => {
            const node = new SceneNode();
            const parent = new SceneNode();
            const ref = new SceneNode();
            expect(() => parent.insertChildAfter(node, ref)).toThrowWithMessage(Error,
                "Reference node must be a child node");
        });
        it("moves existing node inside child list", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const c = new SceneNode();
            parent.insertChildAfter(c, a);
            const b = new SceneNode();
            parent.insertChildAfter(b, a);
            parent.insertChildAfter(a, c);
            expect(b.getNextSibling()).toBe(c);
            expect(c.getPreviousSibling()).toBe(b);
            expect(c.getNextSibling()).toBe(a);
            expect(a.getPreviousSibling()).toBe(c);
            expect(parent.getFirstChild()).toBe(b);
            expect(parent.getLastChild()).toBe(a);
            expect(a.getParent()).toBe(parent);
            expect(b.getParent()).toBe(parent);
            expect(c.getParent()).toBe(parent);
        });
        it("invalidates rendering, scene position and scene transformation of inserted child", () => {
            const node = createValidSceneNode();
            const newNode = createValidSceneNode();
            const parent = node.getParent() as SceneNode;
            parent.insertChildAfter(newNode, node);
            expect(newNode.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
        it("does nothing when inserting child before itself", () => {
            const node = createValidSceneNode();
            const parent = node.getParent() as SceneNode;
            parent.insertChildAfter(node, node);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
    });

    describe("insertAfter", () => {
        it("throws error when reference node has no parent", () => {
            const node = new SceneNode();
            expect(() => node.insertAfter(new SceneNode())).toThrowWithMessage(Error,
                "Reference node has no parent");
        });
        it("moves existing node inside child list", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const c = new SceneNode().insertAfter(a);
            const b = new SceneNode().insertAfter(a);
            a.insertAfter(c);
            expect(b.getNextSibling()).toBe(c);
            expect(c.getPreviousSibling()).toBe(b);
            expect(c.getNextSibling()).toBe(a);
            expect(a.getPreviousSibling()).toBe(c);
            expect(parent.getFirstChild()).toBe(b);
            expect(parent.getLastChild()).toBe(a);
            expect(a.getParent()).toBe(parent);
            expect(b.getParent()).toBe(parent);
            expect(c.getParent()).toBe(parent);
        });
        it("invalidates rendering, scene position and scene transformation of inserted child", () => {
            const node = createValidSceneNode();
            const newNode = createValidSceneNode();
            newNode.insertAfter(node);
            expect(newNode.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
        it("does nothing when inserting child before itself", () => {
            const node = createValidSceneNode();
            node.insertAfter(node);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
    });

    describe("replaceChild", () => {
        it("throws error when new node is the parent node", () => {
            const newNode = new SceneNode();
            const oldNode = createValidSceneNode();
            expect(() => newNode.replaceChild(oldNode, newNode)).toThrowWithMessage(Error,
                "New node must not be the parent node");
        });
        it("throws error when old node is not a child node", () => {
            const newNode = createValidSceneNode();
            const oldNode = createValidSceneNode();
            const parent = newNode.getParent() as SceneNode;
            expect(() => parent.replaceChild(oldNode, newNode)).toThrowWithMessage(Error,
                "Old node must be a child node");
        });
        it("replaces one-and-only child node", () => {
            const newNode = createValidSceneNode();
            const oldNode = createValidSceneNode();
            const parent = oldNode.getParent() as SceneNode;
            parent.replaceChild(oldNode, newNode);
            expect(oldNode.getParent()).toBeNull();
            expect(newNode.getParent()).toBe(parent);
        });
        it("replaces child in group of nodes", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const newB = new SceneNode();
            parent.replaceChild(b, newB);
            expect(b.getParent()).toBeNull();
            expect(newB.getParent()).toBe(parent);
            expect(a.getNextSibling()).toBe(newB);
            expect(newB.getPreviousSibling()).toBe(a);
            expect(newB.getNextSibling()).toBe(c);
            expect(c.getPreviousSibling()).toBe(newB);
            expect(b.getPreviousSibling()).toBeNull();
            expect(b.getNextSibling()).toBeNull();
        });
        it("invalidates rendering, scene position and scene transformation of new and old child", () => {
            const newNode = createValidSceneNode();
            const oldNode = createValidSceneNode();
            const parent = oldNode.getParent() as SceneNode;
            parent.replaceChild(oldNode, newNode);
            expect(newNode.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
            expect(oldNode.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(oldNode.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(oldNode.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
        it("does nothing when replacing with itself", () => {
            const node = createValidSceneNode();
            const parent = node.getParent() as SceneNode;
            parent.replaceChild(node, node);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
    });

    describe("replace", () => {
        it("throws error when other node is the parent node", () => {
            const node = new SceneNode();
            const parent = new SceneNode();
            parent.appendChild(node);
            expect(() => node.replaceWith(parent)).toThrowWithMessage(Error,
                "New node must not be the parent node");
        });
        it("replaces one-and-only child node", () => {
            const newNode = createValidSceneNode();
            const oldNode = createValidSceneNode();
            const parent = oldNode.getParent() as SceneNode;
            oldNode.replaceWith(newNode);
            expect(oldNode.getParent()).toBeNull();
            expect(newNode.getParent()).toBe(parent);
        });
        it("replaces child in group of nodes", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const newB = new SceneNode();
            b.replaceWith(newB);
            expect(b.getParent()).toBeNull();
            expect(newB.getParent()).toBe(parent);
            expect(a.getNextSibling()).toBe(newB);
            expect(newB.getPreviousSibling()).toBe(a);
            expect(newB.getNextSibling()).toBe(c);
            expect(c.getPreviousSibling()).toBe(newB);
            expect(b.getPreviousSibling()).toBeNull();
            expect(b.getNextSibling()).toBeNull();
        });
        it("invalidates rendering, scene position and scene transformation of new and old child", () => {
            const newNode = createValidSceneNode();
            const oldNode = createValidSceneNode();
            oldNode.replaceWith(newNode);
            expect(newNode.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(newNode.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
            expect(oldNode.isValid(SceneNodeAspect.RENDERING)).toBe(false);
            expect(oldNode.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(false);
            expect(oldNode.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(false);
        });
        it("does nothing when replacing with itself", () => {
            const node = createValidSceneNode();
            node.replaceWith(node);
            expect(node.isValid(SceneNodeAspect.RENDERING)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
            expect(node.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
        it("does nothing when replacing nodes without parents", () => {
            const oldNode = new SceneNode();
            const newNode = new SceneNode();
            oldNode.getScenePosition();
            oldNode.getSceneTransformation();
            newNode.getScenePosition();
            newNode.getSceneTransformation();
            oldNode.replaceWith(newNode);
            expect(oldNode.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
            expect(oldNode.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
            expect(newNode.isValid(SceneNodeAspect.SCENE_POSITION)).toBe(true);
            expect(newNode.isValid(SceneNodeAspect.SCENE_TRANSFORMATION)).toBe(true);
        });
    });

    describe("forEachChild", () => {
        it("iterates over all children", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const a1 = new SceneNode().appendTo(a);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const c1 = new SceneNode().appendTo(c);
            const c2 = new SceneNode().appendTo(c);

            const children = [ a, b, c ];
            const aChildren = [ a1 ];
            const cChildren = [ c1, c2 ];
            let index = 0;

            parent.forEachChild((child, i) => {
                expect(i).toBe(index);
                expect(child).toBe(children[index]);
                index++;
            });
            expect(index).toBe(3);

            index = 0;
            a.forEachChild((child, i) => {
                expect(i).toBe(index);
                expect(child).toBe(aChildren[index]);
                index++;
            });
            expect(index).toBe(1);

            index = 0;
            b.forEachChild((child, i) => {
                expect(child).toBeUndefined();
                index++;
            });
            expect(index).toBe(0);

            index = 0;
            c.forEachChild((child, i) => {
                expect(i).toBe(index);
                expect(child).toBe(cChildren[index]);
                index++;
            });
            expect(index).toBe(2);
        });
        it("calls callback with node as this-context", () => {
            const parent = new SceneNode().appendChild(new SceneNode()).appendChild(new SceneNode());
            parent.forEachChild(function() {
                expect(this).toBe(parent);
            });
        });
        it("calls callback with given this-context", () => {
            const parent = new SceneNode().appendChild(new SceneNode()).appendChild(new SceneNode());
            parent.forEachChild(function() {
                expect(this).toBe(53);
            }, 53 as const);
        });
    });

    describe("children", () => {
        it("returns an iterator over all child nodes", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const a1 = new SceneNode().appendTo(a);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const c1 = new SceneNode().appendTo(c);
            const c2 = new SceneNode().appendTo(c);

            const children = [ a, b, c ];
            const aChildren = [ a1 ];
            const cChildren = [ c1, c2 ];
            let index = 0;

            for (const child of parent.children()) {
                expect(child).toBe(children[index]);
                index++;
            }
            expect(index).toBe(3);

            index = 0;
            for (const child of a.children()) {
                expect(child).toBe(aChildren[index]);
                index++;
            }
            expect(index).toBe(1);

            index = 0;
            for (const child of b.children()) {
                expect(child).toBeUndefined();
                index++;
            }
            expect(index).toBe(0);

            index = 0;
            for (const child of c.children()) {
                expect(child).toBe(cChildren[index]);
                index++;
            }
            expect(index).toBe(2);
        });
    });

    describe("forEachDescendant", () => {
        it("iterates over all descendants", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const a1 = new SceneNode().appendTo(a);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const c1 = new SceneNode().appendTo(c);
            const c2 = new SceneNode().appendTo(c);

            const descendants = [ a, a1, b, c, c1, c2 ];
            const aDescendants = [ a1 ];
            const cDescendants = [ c1, c2 ];

            let index = 0;
            parent.forEachDescendant((node) => {
                expect(node).toBe(descendants[index]);
                index++;
            });
            expect(index).toBe(descendants.length);

            index = 0;
            a.forEachDescendant(node => {
                expect(node).toBe(aDescendants[index]);
                index++;
            });
            expect(index).toBe(aDescendants.length);

            index = 0;
            b.forEachDescendant(node => {
                expect(node).toBeUndefined();
                index++;
            });
            expect(index).toBe(0);

            index = 0;
            c.forEachDescendant(node => {
                expect(node).toBe(cDescendants[index]);
                index++;
            });
            expect(index).toBe(cDescendants.length);
        });
        it("calls callback with node as this-context", () => {
            const parent = new SceneNode().appendChild(new SceneNode()).appendChild(new SceneNode());
            parent.forEachDescendant(function() {
                expect(this).toBe(parent);
            });
        });
        it("calls callback with given this-context", () => {
            const parent = new SceneNode().appendChild(new SceneNode()).appendChild(new SceneNode());
            parent.forEachDescendant(function() {
                expect(this).toBe(53);
            }, 53 as const);
        });
    });

    describe("descendants", () => {
        it("returns an iterator over all descendants", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const a1 = new SceneNode().appendTo(a);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const c1 = new SceneNode().appendTo(c);
            const c2 = new SceneNode().appendTo(c);

            const descendants = [ a, a1, b, c, c1, c2 ];
            const aDescendants = [ a1 ];
            const cDescendants = [ c1, c2 ];
            let index = 0;

            for (const child of parent.descendants()) {
                expect(child).toBe(descendants[index]);
                index++;
            }
            expect(index).toBe(descendants.length);

            index = 0;
            for (const child of a.descendants()) {
                expect(child).toBe(aDescendants[index]);
                index++;
            }
            expect(index).toBe(aDescendants.length);

            index = 0;
            for (const child of b.descendants()) {
                expect(child).toBeUndefined();
                index++;
            }
            expect(index).toBe(0);

            index = 0;
            for (const child of c.descendants()) {
                expect(child).toBe(cDescendants[index]);
                index++;
            }
            expect(index).toBe(cDescendants.length);
        });
    });

    describe("findChild", () => {
        it("searches for first matching child", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const a1 = new SceneNode().appendTo(a);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const c1 = new SceneNode().appendTo(c);
            const c2 = new SceneNode().appendTo(c);

            expect(parent.findChild(child => child === a)).toBe(a);
            expect(parent.findChild(child => child === b)).toBe(b);
            expect(parent.findChild(child => child === c)).toBe(c);
            expect(parent.findChild(child => child === a1)).toBeNull();
            expect(b.findChild(child => child === c1)).toBeNull();
            expect(c.findChild(child => child === c1)).toBe(c1);
            expect(c.findChild(child => child === c2)).toBe(c2);
        });
        it("passes child index to callback", () => {
            const parent = new SceneNode();
            const a = new SceneNode().appendTo(parent);
            const b = new SceneNode().appendTo(parent);
            const c = new SceneNode().appendTo(parent);
            const children = [ a, b, c ];
            expect(parent.findChild((child, index) => {
                expect(children.indexOf(child)).toBe(index);
                return false;
            })).toBeNull();
        });
        it("calls callback with node as this-context", () => {
            const parent = new SceneNode().appendChild(new SceneNode()).appendChild(new SceneNode());
            parent.findChild(function() {
                expect(this).toBe(parent);
                return false;
            });
        });
        it("calls callback with given this-context", () => {
            const parent = new SceneNode().appendChild(new SceneNode()).appendChild(new SceneNode());
            parent.findChild(function() {
                expect(this).toBe(53);
                return false;
            }, 53 as const);
        });
    });
});
