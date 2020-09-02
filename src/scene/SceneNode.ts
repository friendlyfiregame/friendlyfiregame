import { Scene } from "../Scene";
import { Game } from "../Game";
import { Direction } from "../geom/Direction";
import { Polygon } from "../geom/Polygon";
import { AnimationArgs, SceneNodeAnimation } from "./SceneNodeAnimation";

export interface SceneNodeArgs {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    anchor?: Direction;
    childAnchor?: Direction;
    opacity?: number;
}

export class SceneNode<T extends Game> {
    /** The parent node. Null if none. */
    private parent: SceneNode<T> | null = null;

    /** The next sibling node. Null if none. */
    private nextSibling: SceneNode<T> | null = null;

    /** The previous sibling node. Null if none. */
    private previousSibling: SceneNode<T> | null = null;

    /** The first child node. Null if none. */
    private firstChild: SceneNode<T> | null = null;

    /** The last child node. Null if none. */
    private lastChild: SceneNode<T> | null = null;

    /** The scene this node is connected to. Null if none. */
    protected scene: Scene<T> | null = null;

    private x: number;

    private y: number;

    private width: number;

    private height: number;

    private anchor: Direction;

    private childAnchor: Direction;

    private boundsPolygon: Polygon = new Polygon();

    /** The transformation matrix of this node. */
    private readonly transformation = new DOMMatrix();

    private readonly animations: SceneNodeAnimation<T>[] = [];

    private opacity: number;

    public constructor({ x = 0, y = 0, width = 0, height = 0, anchor = Direction.CENTER,
            childAnchor = Direction.CENTER, opacity = 1 }: SceneNodeArgs = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.opacity = opacity;
        this.anchor = anchor;
        this.childAnchor = childAnchor;
    }

    public getX(): number {
        return this.x;
    }

    public setX(x: number): this {
        if (x !== this.x) {
            this.x = x;
            this.invalidate();
        }
        return this;
    }

    public getY(): number {
        return this.y;
    }

    public setY(y: number): this {
        if (y !== this.y) {
            this.y = y;
            this.invalidate();
        }
        return this;
    }

    public moveBy(x: number, y: number): this {
        if (x !== 0 || y !== 0) {
            this.x += x;
            this.y += y;
            this.invalidate();
        }
        return this;
    }

    public moveTo(x: number, y: number): this {
        if (x !== this.x || y !== this.y) {
            this.x = x;
            this.y = y;
            this.invalidate();
        }
        return this;
    }

    public getWidth(): number {
        return this.width;
    }

    public setWidth(width: number): this {
        if (width !== this.width) {
            this.width = width;
            this.invalidate();
            this.invalidateBounds();
        }
        return this;
    }

    public getHeight(): number {
        return this.height;
    }

    public setHeight(height: number): this {
        if (height !== this.height) {
            this.height = height;
            this.invalidate();
            this.invalidateBounds();
        }
        return this;
    }

    public resizeTo(width: number, height: number): this {
        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            this.invalidate();
            this.invalidateBounds();
        }
        return this;
    }

    public setOpacity(opacity: number): this {
        if (opacity !== this.opacity) {
            this.opacity = opacity;
            this.invalidate();
        }
        return this;
    }

    public getEffectiveOpacity(): number {
        if (this.parent != null) {
            return this.parent.getOpacity() * this.opacity;
        } else {
            return this.opacity;
        }
    }

    public getOpacity(): number {
        return this.opacity;
    }

    public getAnchor(): Direction {
        return this.anchor;
    }

    public setAnchor(anchor: Direction): this {
        if (anchor !== this.anchor) {
            this.anchor = anchor;
            this.invalidate();
        }
        return this;
    }

    public getChildAnchor(): Direction {
        return this.childAnchor;
    }

    public setChildAnchor(childAnchor: Direction): this {
        if (childAnchor !== this.childAnchor) {
            this.childAnchor = childAnchor;
            this.invalidate();
        }
        return this;
    }

    /**
     * The local node transformation.
     */
    public getTransformation(): DOMMatrix {
        return this.transformation;
    }

    public transform(transformer: (transformation: DOMMatrix) => void): this {
        transformer(this.transformation);
        return this.invalidate();
    }

    /**
     * Returns the scene the node is currently attached to. Null if none.
     *
     * @return The current scene or null if none.
     */
    public getScene(): Scene<T> | null {
        return this.scene;
    }

    /**
     * Sets the scene this node and all its children belongs to. This is called internally when a node is added to
     * the scene. Do not call it yourself.
     *
     * @param scene  The scene the node belongs to from now on. null to unset the current scene.
     */
    private setScene(scene: Scene<T> | null): void {
        if (scene !== this.scene) {
            if (this.scene) {
                // this.deactivate();
            }
            this.scene = scene;
            if (scene) {
                // this.activate();
            }
            this.forEachChild(node => node.setScene(scene));
        }
    }


    /**
     * Returns the parent node of this node or null if node is not attached to a parent or is the root element.
     *
     * @return The parent node or null if unattached or root element.
     */
    public getParent(): SceneNode<T> | null {
        return this.parent;
    }

    /**
     * Returns the next node at the same level.
     *
     * @return The next sibling or null if none.
     */
    public getNextSibling(): SceneNode<T> | null {
        return this.nextSibling;
    }

    /**
     * Returns the previous node at the same level.
     *
     * @return The previous sibling or null if none.
     */
    public getPreviousSibling(): SceneNode<T> | null {
        return this.previousSibling;
    }

    /**
     * Returns the first child node.
     *
     * @return The first child node or null if none.
     */
    public getFirstChild(): SceneNode<T> | null {
        return this.firstChild;
    }

    /**
     * Returns the last child node.
     *
     * @return The last child node or null if none.
     */
    public getLastChild(): SceneNode<T> | null {
        return this.lastChild;
    }

    /**
     * Checks if this node has child nodes.
     *
     * @return True if it child nodes are present, false if not.
     */
    public hasChildNodes(): boolean {
        return this.firstChild != null;
    }

    /**
     * Appends the given child node.
     *
     * @param node  The child node to add.
     */
    public appendChild(node: SceneNode<T>): this {
        if (node === this) {
            throw new Error("node can not be appended to itself");
        }

        // Remove from old parent if there is one
        const oldParent = node.parent;
        if (oldParent) {
            oldParent.removeChild(node);
        }

        // Append the child
        node.previousSibling = this.lastChild;
        const oldLastChild = this.lastChild;
        if (oldLastChild) {
            oldLastChild.nextSibling = node;
        }
        this.lastChild = node;
        if (!this.firstChild) {
            this.firstChild = node;
        }
        node.parent = this;
        node.setScene(this.scene);

        node.invalidate();
        this.invalidate();
        return this;
    }

    /**
     * Removes the given child node
     *
     * @param child  The child node to remove.
     */
    public removeChild(node: SceneNode<T>): this {
        if (node.parent !== this) {
            throw new Error("node must be a child node");
        }

        // Remove node from linked list
        const next = node.nextSibling;
        const prev = node.previousSibling;
        if (next) {
            next.previousSibling = prev;
        }
        if (prev) {
            prev.nextSibling = next;
        }

        // Correct first/last reference
        if (node === this.firstChild) {
            this.firstChild = next;
        }
        if (node === this.lastChild) {
            this.lastChild = prev;
        }

        // Remove all references from node
        node.parent = null;
        node.nextSibling = null;
        node.previousSibling = null;
        node.setScene(null);

        node.invalidate();
        this.invalidate();

        return this;
    }

    /**
     * Removes this node from the scene. The node is then a detached node ready to be added to the scene (or some
     * other scene) again.
     */
    public remove(): this {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        return this;
    }

    /**
     * Removes all child nodes.
     */
    public clear(): this {
        while (this.lastChild) {
            this.removeChild(this.lastChild);
        }
        return this;
    }

    /**
     * Inserts the given child node before the specified reference child node.
     *
     * @param newNode  The child node to insert.
     * @param refNode  The reference node. The child node is inserted before this one.
     */
    public insertBefore(newNode: SceneNode<T>, refNode: SceneNode<T>): this {
        if (newNode === this) {
            throw new Error("node can not be inserted into itself");
        }
        if (refNode.parent !== this) {
            throw new Error("refNode must be a child node");
        }

        // Remove from old parent if there is one
        const oldParent = newNode.parent;
        if (oldParent) {
            oldParent.removeChild(newNode);
        }

        // Insert the node
        const oldPrevious = refNode.previousSibling;
        if (!oldPrevious) {
            this.firstChild = newNode;
        } else {
            oldPrevious.nextSibling = newNode;
        }
        refNode.previousSibling = newNode;
        newNode.previousSibling = oldPrevious;
        newNode.nextSibling = refNode;
        newNode.parent = this;
        newNode.setScene(this.scene);

        return this.invalidate();
    }

    public prependChild(node: SceneNode<T>): this {
        if (this.firstChild != null) {
            return this.insertBefore(node, this.firstChild);
        } else {
            return this.appendChild(node);
        }
    }

    /**
     * Replaces the given child node with a new node.
     *
     * @param oldNode  The old child node to replace.
     * @param newNode  The new node to replace the old one with.
     */
    public replaceChild(oldNode: SceneNode<T>, newNode: SceneNode<T>): this {
        if (newNode === this) {
            throw new Error("newNode must not be the parent node");
        }
        if (oldNode.parent !== this) {
            throw new Error("oldNode must be a child node");
        }

        // If new node is the same as the old node then do nothing
        if (newNode === oldNode) {
            return this;
        }

        const next = oldNode.nextSibling;
        this.removeChild(oldNode);
        if (next) {
            this.insertBefore(newNode, next);
        } else {
            this.appendChild(newNode);
        }

        return this;
    }

    /**
     * Replace the given node with this one.
     *
     * @param node  The node to replace.
     */
    public replace(node: SceneNode<T>): this {
        if (this.parent) {
            this.parent.replaceChild(this, node);
        }
        return this;
    }

    public appendTo(node: SceneNode<T>): this {
        node.appendChild(this);
        return this;
    }

    public prependTo(node: SceneNode<T>): this {
        node.prependChild(this);
        return this;
    }

    /**
     * Iterates over all child nodes and calls the given callback with the currently iterated node as parameter.
     *
     * @param callback  The callback to call for each child node.
     * @param thisArg   Optional. Value to use as `this` when executing `callback`.
     */
    public forEachChild(callback: (node: SceneNode<T>, index: number) => void, thisArg: any = this): this {
        let index = 0;
        let node = this.firstChild;
        while (node) {
            const next = node.nextSibling;
            callback.call(thisArg, node, index++);
            node = next;
        }
        return this;
    }

    public someChildren(callback: (node: SceneNode<T>, index: number) => boolean, thisArg: any = this): boolean {
        let index = 0;
        let node = this.firstChild;
        while (node) {
            const next = node.nextSibling;
            if (callback.call(thisArg, node, index++)) {
                return true;
            }
            node = next;
        }
        return false;
    }

    /**
     * Returns a new array with all child nodes.
     *
     * @return All child nodes.
     */
    public getChildren(): SceneNode<T>[] {
        const children: SceneNode<T>[] = [];
        let node = this.firstChild;
        while (node) {
            children.push(node);
            node = node.nextSibling;
        }
        return children;
    }

    public invalidateBounds(): this {
        this.boundsPolygon.length = 0;
        return this;
    }

    protected updateBoundsPolygon(bounds: Polygon): void {
        bounds.push(new DOMPoint(0, 0));
        bounds.push(new DOMPoint(this.width, 0));
        bounds.push(new DOMPoint(this.width, this.height));
        bounds.push(new DOMPoint(0, this.height));
    }

    public getBoundsPolygon(): Polygon {
        if (this.boundsPolygon.length === 0) {
            this.updateBoundsPolygon(this.boundsPolygon);
        }
        return this.boundsPolygon;
    }

    /**
     * Marks this node, all parent nodes and the scene as invalid to trigger a scene revalidation.
     */
    public invalidate(): this {
        /*
        if (this.valid) {
            this.valid = false;
            if (this.parent) {
                this.parent.invalidate();
            } else if (this.scene) {
                void this.scene.invalidate();
            }
        }
        */
       return this;
    }

    public animate(args: AnimationArgs<T>): this {
        this.animations.push(new SceneNodeAnimation(this, args));
        return this;
    }

    public finishAnimations(): this {
        for (const animation of this.animations) {
            animation.finish();
        }
        return this.forEachChild(child => child.finishAnimations());
    }

    public hasAnimations(): boolean {
        return this.animations.length > 0 || this.someChildren(child => child.hasAnimations());
    }

    private updateAnimations(dt: number): void {
        const animations = this.animations;
        let numAnimations = animations.length;
        let i = 0;
        while (i < numAnimations) {
            if (animations[i].update(dt)) {
                animations.splice(i, 1);
                numAnimations--;
            } else {
                i++;
            }
        }
    }

    protected updateAll(dt: number): void {
        const postUpdate = this.update(dt);
        this.updateAnimations(dt);
        this.updateChildren(dt);
        if (postUpdate != null) {
            postUpdate();
        }
    }

    protected updateChildren(dt: number): void {
        this.forEachChild(child => {
            child.updateAll(dt);
        });
    }

    protected update(dt: number): void | (() => void) {}

    protected drawAll(ctx: CanvasRenderingContext2D, width: number, height: number):
            void | (() => void) {
        ctx.save();
        ctx.globalAlpha = this.getEffectiveOpacity();
        const m = this.transformation;
        ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
        ctx.translate(this.x, this.y);
        ctx.translate(
            -(Direction.getX(this.anchor) + 1) / 2 * this.width,
            -(Direction.getY(this.anchor) + 1) / 2 * this.height
        );
        const postDraw = this.draw(ctx, width, height);
        ctx.save();
        ctx.translate(
            (Direction.getX(this.childAnchor) + 1) / 2 * this.width,
            (Direction.getY(this.childAnchor) + 1) / 2 * this.height
        );
        this.drawChildren(ctx, width, height);
        ctx.restore();
        if (postDraw != null) {
            postDraw();
        }
        ctx.restore();
    }

    protected drawChildren(ctx: CanvasRenderingContext2D, width: number, height: number): void | (() => void) {
        this.forEachChild(child => {
            child.drawAll(ctx, width, height);
        });
    }

    protected draw(ctx: CanvasRenderingContext2D, width: number, height: number): void | (() => void) {}
}
