import { Scene } from "../Scene";
import { Game } from "../Game";
import { Direction } from "../geom/Direction";
import { AnimationArgs, SceneNodeAnimation } from "./SceneNodeAnimation";
import { AffineTransform } from "../graphics/AffineTransform";
import { Polygon2 } from "../graphics/Polygon2";
import { Vector2 } from "../graphics/Vector2";

/**
 * Hints which are returned to the scene after drawing the scene graph. These hints can suggest further actions after
 * drawing like requesting continuous drawing because of running animations.
 */
export enum PostDrawHints {
    /** As long as this hint is present the scene must be continuously redrawn to keep animations running. */
    CONTINUE_DRAWING = 1,

    /**
     * When this flag is set then at least one node has the showBounds flag set to true. The root node already
     * handles this flag by drawing the bounds when this hint is present.
     */
    DRAW_BOUNDS = 2
}

/**
 * Constructor arguments for [[SceneNode]].
 *
 * @param T - Optional owner game class.
 */
export interface SceneNodeArgs {
    /** Optional initial scene node ID. */
    id?: string | null;

    /** Optional initial horizontal position of the scene node. Defaults to 0. */
    x?: number;

    /** Optional initial vertical position of the scene node. Defaults to 0. */
    y?: number;

    /** Optional initial width of the scene node. Defaults to 0. */
    width?: number;

    /** Optional initial height of the scene node. Defaults to 0. */
    height?: number;

    /**
     * Optional initial node anchor. Defaults to CENTER which means the X/Y coordinates of the node define where
     * the center of this scene node is displayed relative to the parent node.
     */
    anchor?: Direction;

    /**
     * Optional initial child node anchor. Defaults to CENTER which means the child nodes are positioned relative to
     * the center of this scene node.
     */
    childAnchor?: Direction;

    /**
     * Optional initial node opacity. Must be 0 or higher. 0.0 means fully transparent. Defaults to 1.0 which means
     * fully opaque. Can be larger than 1.0 to compensate transparency of its parent.
     */
    opacity?: number;

    /**
     * Optional initial layer (0-31) to put the node onto. Defaults to null which means inheriting layer from parent.
     */
    layer?: number | null;

    /** Optional initial showBounds flag. Set to true to show bounds around the node for debugging purposes. */
    showBounds?: boolean;
}

/**
 * Base scene node. Is used as base class for more specialized scene nodes but can also be used standalone as parent
 * node for other nodes (similar to a DIV element in HTML for example).
 *
 * TODO Implement scene invalidation properly.
 */
export class SceneNode<T extends Game = Game> {
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
    #scene: Scene<T, unknown> | null = null;

    /** The ID of the node. Null if none. */
    private id: string | null;

    /** The horizontal position relative to parent node. */
    #x: number;

    /** The vertical position relative to parent node. */
    #y: number;

    public mirroredY = false;

    /** The node width. */
    #width: number;

    /** The node height. */
    #height: number;

    /**
     * The anchor defining the origin of this scene node. When set to TOP_LEFT for example then the X/Y coordinates of
     * this node define where to display the upper left corner of it. When set to CENTER then the node is centered at
     * its X/Y coordinates.
     */
    private anchor: Direction;

    /**
     * The anchor of the local coordinate system. When set to CENTER for example then the X/Y coordinates or child
     * nodes are relative to the center of this node.
     */
    private childAnchor: Direction;

    /**
     * The bounds polygon. This is updated on demand and automatically invalidated when node size changes. Node
     * has to call [[invalidateBounds]] manually when something else influences the bounds.
     */
    private boundsPolygon: Polygon2 = new Polygon2();

    /**
     * The transformation matrix of this node. This transformation is applied to the node before moving the node to
     * its position (X/Y coordinates). So in simple cases this transformation is not needed at all and its up to you
     * if you want to use the coordinates and/or the transformation matrix.
     */
    private readonly transformation = new AffineTransform();

    /**
     * The transformation matrix combining the nodes transformation with all the parent transformations. This is
     * calculated on-the-fly when a scene node is updated.
     */
    private readonly sceneTransformation = new AffineTransform();

    /** Array with currently active animations. Animations are automatically removed from the array when finished.*/
    private readonly animations: SceneNodeAnimation<T>[] = [];

    /**
     * The current opacity of the node. 0.0 means fully transparent and 1.0 means fully opaque. Can be larger
     * than 1.0 to compensate transparency of its parent.
     */
    private opacity: number;

    /** Set to true to show bounds. Useful for debugging. */
    private showBounds: boolean;

    /**
     * The layer this node is drawn on. Internal representation is stored in `2^n` while setter and getter works
     * with `n` instead. This is because the layering system internally works with fast bit masks. Can be set to
     * null to inherit layer from parent.
     */
    private layer: number | null;

    /**
     * Creates a new scene node with the given initial settings.
     */
    public constructor({ id = null, x = 0, y = 0, width = 0, height = 0, anchor = Direction.CENTER,
            childAnchor = Direction.CENTER, opacity = 1, showBounds = false, layer = null }: SceneNodeArgs = {}) {
        this.id = id;
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.opacity = opacity;
        this.anchor = anchor;
        this.childAnchor = childAnchor;
        this.showBounds = showBounds;
        this.layer = layer == null ? null : (1 << layer);
    }

    /**
     * Returns the node ID.
     *
     * @return The ID of the node or null if none.
     */
    public getId(): string | null {
        return this.id;
    }

    /**
     * Sets (or removes) the node ID.
     *
     * @param id - The id to set or null to unset.
     */
    public setId(id: string | null): this {
        this.id = id;
        return this;
    }

    /**
     * Returns the X position of the node relative to the parent node.
     *
     * @return The X position.
     */
    public getX(): number {
        return this.#x;
    }

    public get x(): number {
        return this.#x;
    }

    public set x(x: number) {
        this.setX(x);
    }

    public get y(): number {
        return this.#y;
    }

    public set y(y: number) {
        this.setY(y);
    }

    /**
     * Sets the horizontal position relative to the parent node.
     *
     * @param x - The horizontal position to set.
     */
    public setX(x: number): this {
        if (x !== this.#x) {
            this.#x = x;
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the Y position of the node relative the parent node.
     *
     * @return The Y position.
     */
    public getY(): number {
        return this.#y;
    }

    /**
     * Sets the vertical position relative to the parent node.
     *
     * @param y - The vertical position to set.
     */
    public setY(y: number): this {
        if (y !== this.#y) {
            this.#y = y;
            this.invalidate();
        }
        return this;
    }

    /**
     * Moves the node by the given deltas.
     *
     * @param x - The horizontal delta to move the node by.
     * @param y - The vertical delta to move the node by.
     */
    public moveBy(x: number, y: number): this {
        if (x !== 0 || y !== 0) {
            this.#x += x;
            this.#y += y;
            this.invalidate();
        }
        return this;
    }

    /**
     * Moves the node to the given position relative to its parent node.
     *
     * @param x - The horizontal position to move to.
     * @param y - The vertical position to move to.
     */
    public moveTo(x: number, y: number): this {
        if (x !== this.#x || y !== this.#y) {
            this.#x = x;
            this.#y = y;
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the width of the node.
     *
     * @return The node width.
     */
    public getWidth(): number {
        return this.#width;
    }

    public get width(): number {
        return this.#width;
    }

    public set width(width: number) {
        this.setHeight(width);
    }

    /**
     * Sets the width of the node.
     *
     * @param width - The width to set.
     */
    public setWidth(width: number): this {
        if (width !== this.#width) {
            this.#width = width;
            this.invalidate();
            this.invalidateBounds();
        }
        return this;
    }

    /**
     * Returns the width of the node.
     *
     * @return The node width.
     */
    public getHeight(): number {
        return this.#height;
    }

    public get height(): number {
        return this.#height;
    }

    public set height(height: number) {
        this.setHeight(height);
    }


    /**
     * Sets the height of the node.
     *
     * @param height - The height to set.
     */
    public setHeight(height: number): this {
        if (height !== this.#height) {
            this.#height = height;
            this.invalidate();
            this.invalidateBounds();
        }
        return this;
    }

    /**
     * Resizes the node to the given width and height.
     *
     * @param width  - The width to set.
     * @param height - The height to set.
     */
    public resizeTo(width: number, height: number): this {
        if (width !== this.#width || height !== this.#height) {
            this.#width = width;
            this.#height = height;
            this.invalidate();
            this.invalidateBounds();
        }
        return this;
    }

    /**
     * Returns the current opacity of the node.
     *
     * @return The opacity. 0.0 means fully transparent, 1.0 means fully opaque.
     */
    public getOpacity(): number {
        return this.opacity;
    }

    /**
     * Sets the nodes opacity.
     *
     * @pram opacity - The opacity to set. 0.0 means fully transparent, 1.0 means fully opaque. Can be larger than 1.0
     *                 to compensate transparency of its parent.
     */
    public setOpacity(opacity: number): this {
        opacity = Math.max(0, opacity);
        if (opacity !== this.opacity) {
            this.opacity = opacity;
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the effective node opacity which is the nodes opacity multiplied by the parents effective opacity.
     *
     * @return The effective node opacity clamped to valid range of 0.0 to 1.0.
     */
    public getEffectiveOpacity(): number {
        if (this.opacity === Infinity) {
            return 1;
        }
        return Math.max(0, Math.min(1, (this.parent?.getEffectiveOpacity() ?? 1) * this.opacity));
    }

    /**
     * Returns the node anchor which defines the meaning of the X/Y coordinates of the node. CENTER means the X/Y
     * coordinates define the center of the node. TOP_LEFT means the X/Y coordinates define the upper left corner of
     * the node.
     *
     * @return The node anchor.
     */
    public getAnchor(): Direction {
        return this.anchor;
    }

    /**
     * Sets the node anchor which defines the meaning of the X/Y coordinates of the node. CENTER means the X/Y
     * coordinates define the center of the node. TOP_LEFT means the X/Y coordinates define the upper left corner of
     * the node.
     *
     * @param anchor - The node anchor to set.
     */
    public setAnchor(anchor: Direction): this {
        if (anchor !== this.anchor) {
            this.anchor = anchor;
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the child anchor which defines the origin of the local coordinate system to which the coordinates of
     * child nodes are relative to.
     *
     * @return The child anchor.
     */
    public getChildAnchor(): Direction {
        return this.childAnchor;
    }

    /**
     * Sets the child anchor which defines the origin of the local coordinate system to which the coordinates of
     * child nodes are relative to.
     *
     * @param childAnchor - The child anchor to set.
     */
    public setChildAnchor(childAnchor: Direction): this {
        if (childAnchor !== this.childAnchor) {
            this.childAnchor = childAnchor;
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the custom transformation of this node which can be manipulated by the [[transform]] method. This
     * transformation is applied to the node before it is rendered at its intended position. Transformation and
     * node position can complement each other or you can only use one of them, that's up to you.
     *
     * @return The custom node transformation.
     */
    public getTransformation(): AffineTransform {
        return this.transformation;
    }

    /**
     * Modifies the custom transformation matrix of this node. Calls the given transformer function which can then
     * modify the given transformation matrix. After this the node is invalidated to recalculate bounds and redraw it.
     *
     * @param transformer - Function to call with transformation matrix as argument.
     */
    public transform(transformer: (transformation: AffineTransform) => void): this {
        transformer(this.transformation);
        return this.invalidate();
    }

    /**
     * Returns the scene the node is currently attached to. Null if none.
     *
     * @return The current scene or null if none.
     */
    public getScene(): Scene<T> | null {
        return this.#scene;
    }

    /**
     * Sets the scene this node and all its children belongs to. This is called internally when a node is added to
     * the scene.
     *
     * @param scene - The scene the node belongs to from now on. null to unset the current scene.
     */
    protected setScene(scene: Scene<T> | null): void {
        if (scene !== this.#scene) {
            if (this.#scene) {
                this.deactivate();
            }
            this.#scene = scene;
            if (scene) {
                this.activate();
            }
            this.forEachChild(node => node.setScene(scene));
        }
    }

    /**
     * Checks if scene node is present in a scene.
     *
     * @return True if in scene, false if not.
     */
    public isInScene(): boolean {
        return this.#scene != null;
    }

    /**
     * Called when node is added to scene. Can be overwritten to connect event handlers for example.
     */
    protected activate(): void {}

    /**
     * Called when node is removed from scene. Can be overwritten to disconnect event handlers for example.
     */
    protected deactivate(): void {}

    /**
     * Returns the parent node of this node or null if node is not attached to a parent or is the root node.
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
     * Appends the given child node so it becomes the last child of this node.
     *
     * @param node - The child node to append.
     */
    public appendChild(node: SceneNode<T>): this {
        if (node === this) {
            throw new Error("Node can not be appended to itself");
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
        node.setScene(this.#scene);

        node.invalidate();
        this.invalidate();
        return this;
    }

    /**
     * Prepends the given child node so it becomes the first child of this node.
     *
     * @param node - The child node to prepend.
     */
    public prependChild(node: SceneNode<T>): this {
        if (this.firstChild != null) {
            return this.insertBefore(node, this.firstChild);
        } else {
            return this.appendChild(node);
        }
    }

    /**
     * Removes the given child node
     *
     * @param child - The child node to remove.
     */
    public removeChild(node: SceneNode<T>): this {
        if (node.parent !== this) {
            throw new Error("Node must be a child node");
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
     * @param newNode - The child node to insert.
     * @param refNode - The reference node. The child node is inserted before this one.
     */
    public insertBefore(newNode: SceneNode<T>, refNode: SceneNode<T>): this {
        if (newNode === this) {
            throw new Error("Node can not be inserted into itself");
        }
        if (refNode.parent !== this) {
            throw new Error("Reference node must be a child node");
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
        newNode.setScene(this.#scene);

        return this.invalidate();
    }

    /**
     * Replaces the given child node with a new node.
     *
     * @param oldNode - The old child node to replace.
     * @param newNode - The new node to replace the old one with.
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
     * @param node - The node to replace.
     */
    public replace(node: SceneNode<T>): this {
        if (this.parent) {
            this.parent.replaceChild(this, node);
        }
        return this;
    }

    /**
     * Appends this node to the given parent node.
     *
     * @param node - The parent node to append this node to.
     */
    public appendTo(node: SceneNode<T>): this {
        node.appendChild(this);
        return this;
    }

    /**
     * Prepends this node to the given parent node.
     *
     * @param node - The parent node to prepend this node to.
     */
    public prependTo(node: SceneNode<T>): this {
        node.prependChild(this);
        return this;
    }

    /**
     * Iterates over all child nodes and calls the given callback with the currently iterated node as parameter.
     *
     * @param callback - The callback to call for each child node.
     * @param thisArg  - Optional value to use as `this` when executing `callback`.
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

    /**
     * Returns an iterator over all child nodes of this node.
     *
     * @return The child iterator.
     */
    public *children(): IterableIterator<SceneNode<T>> {
        let node = this.firstChild;
        while (node) {
            const next = node.nextSibling;
            yield node;
            node = next;
        }
    }

    /**
     * Iterates over all descendant nodes and calls the given callback with the currently iterated node as parameter.
     *
     * @param callback - The callback to call for each descendant node.
     * @param thisArg  - Optional value to use as `this` when executing `callback`.
     */
    public forEachDescendant(callback: (node: SceneNode<T>) => void, thisArg: any = this): this {
        let node = this.firstChild;
        while (node != null && node !== this) {
            let next = node.firstChild;
            if (next == null) {
                next = node.nextSibling;
            }
            if (next == null) {
                let parent = node.parent;
                while (parent != null && parent.nextSibling == null) {
                    parent = parent.parent;
                }
                next = parent?.nextSibling ?? null;
            }
            callback.call(thisArg, node);
            node = next;
        }
        return this;
    }

    /**
     * Returns an iterator over all child nodes of this node.
     *
     * @return The child iterator.
     */
    public *descendants(): IterableIterator<SceneNode<T>> {
        let node = this.firstChild;
        while (node != null && node !== this) {
            let next = node.firstChild;
            if (next == null) {
                next = node.nextSibling;
            }
            if (next == null) {
                let parent = node.parent;
                while (parent != null && parent.nextSibling == null) {
                    parent = parent.parent;
                }
                next = parent?.nextSibling ?? null;
            }
            yield(node);
            node = next;
        }
    }

    /**
     * Returns the first child node for which the given callback returns true.
     *
     * @param callback - The callback which checks if the iterated node is the one to look for.
     * @return The found matching child node or null if none.
     */
    public findChild(callback: (node: SceneNode<T>, index: number) => boolean, thisArg: unknown = this):
            SceneNode<T> | null {
        let index = 0;
        let node = this.firstChild;
        while (node) {
            const next = node.nextSibling;
            if (callback.call(thisArg, node, index++)) {
                return node;
            }
            node = next;
        }
        return null;
    }

    /**
     * Returns the first descendant node for which the given callback returns true.
     *
     * @param callback - The callback which checks if the iterated node is the one to look for.
     * @return The found matching descendant node or null if none.
     */
    public findDescendant(callback: (node: SceneNode<T>) => boolean, thisArg: unknown = this):
            SceneNode<T> | null {
                let node = this.firstChild;
        while (node != null && node !== this) {
            let next = node.firstChild;
            if (next == null) {
                next = node.nextSibling;
            }
            if (next == null) {
                next = node.parent?.nextSibling ?? null;
            }
            if (callback.call(thisArg, node)) {
                return node;
            }
            node = next;
        }
        return null;
    }

    /**
     * Tests whether at least one child node passes the test implemented by the provided function.
     *
     * @param callback - The callback to call for each child node returning a boolean.
     * @param thisArg  - Optional value to use as `this` when executing `callback`.
     * @return True if at least one child node returned true in the given callback, false if none did.
     */
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

    /**
     * Returns the descendant node with the given id.
     *
     * @param id - The ID to look for.
     * @return The matching descendant node or null if none.
     */
    public getDescendantById(id: string): SceneNode<T> | null {
        return this.findDescendant(node => node.getId() === id);
    }

    /**
     * Invalidates the bounds of the node. AUtomatically called when node size is changed. Must be called manually
     * when some other aspect of the node which may influence the bounds is changed.
     */
    public invalidateBounds(): this {
        this.boundsPolygon.clear();
        return this;
    }

    /**
     * Updates the bounds polygon of the node. The default implementation simply sets a bounding box. Specialized nodes
     * can overwrite this method to define a more specific polygon.
     *
     * @param bounds - The empty bounds polygon to be filled with points by this method.
     */
    protected updateBoundsPolygon(bounds: Polygon2): void {
        bounds.addVertex(new Vector2(0, 0));
        bounds.addVertex(new Vector2(this.#width, 0));
        bounds.addVertex(new Vector2(this.#width, this.#height));
        bounds.addVertex(new Vector2(0, this.#height));
    }

    /**
     * Returns the bounds polygon of the node.
     *
     * @return The bounds polygon.
     */
    public getBoundsPolygon(): Polygon2 {
        if (!this.boundsPolygon.hasVertices()) {
            this.updateBoundsPolygon(this.boundsPolygon);
        }
        return this.boundsPolygon;
    }

    /**
     * Marks this node, all parent nodes and the scene as invalid to trigger a scene revalidation. This must be
     * called every time when some aspect of the node is changed which requires a redraw of the scene node.
     *
     * TODO Not yet implemented, currently the scene is constantly redrawn.
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

    /**
     * Adds a new animation to the scene.
     *
     * @param animationArgs - The arguments defining the animation to add.
     */
    public animate(animationArgs: AnimationArgs<T>): this {
        this.animations.push(new SceneNodeAnimation(this, animationArgs));
        return this;
    }

    /**
     * Finishes all currently running animations. This calls all animator functions with their last animation index
     * (1.0) and then removes the animations.
     */
    public finishAnimations(): this {
        for (const animation of this.animations) {
            animation.finish();
        }
        return this.forEachChild(child => child.finishAnimations());
    }

    /**
     * Checks if node has running animations.
     *
     * @return True if node has animations, false if not.
     */
    public hasAnimations(): boolean {
        return this.animations.length > 0 || this.someChildren(child => child.hasAnimations());
    }

    /**
     * Enables or disables showing node bounds. This may be useful for debugging.
     *
     * @param showBounds - True to enable showing node bounds, false to disable it.
     */
    public setShowBounds(showBounds: boolean): this {
        if(showBounds !== this.showBounds) {
            this.showBounds = showBounds;
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns true if node bounds are currently shown for debugging purposes.
     *
     * @return True if node bounds are shown, false if not.
     */
    public isShowBounds(): boolean {
        return this.showBounds;
    }

    /**
     * Returns the layer of this node.
     *
     * @return The node's layer (0-31). Null if inherited from parent.
     */
    public getLayer(): number | null {
        return this.layer == null ? null : Math.log2(this.layer);
    }

    /**
     * Sets the layer this node should appear on.
     *
     * @param layer - The layer to set (0-31).
     */
    public setLayer(layer: number | null): this {
        if (layer != null && (layer < 0 || layer > 31)) {
            throw new Error(`Valid layer range is 0-31 but was ${layer}`);
        }
        layer = layer == null ? null : (1 << layer);
        if (layer !== this.layer) {
            this.layer = layer;
            this.invalidate();
        }
        return this;
    }

    /**
     * Returns the effective layer of this node.
     *
     * @return The effective layer.
     */
    protected getEffectiveLayer(): number {
        if (this.layer == null) {
            if (this.parent == null) {
                return 1;
            } else {
                return this.parent.getEffectiveLayer();
            }
        } else {
            return this.layer;
        }
    }

    /**
     * Updates the animations and removes finished animations.
     */
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

    /**
     * Updates this node and its child nodes recursively.
     *
     * @param dt - The time in seconds since the last update.
     * @return Bit mask with used layers.
     */
    protected updateAll(dt: number): number {
        // Update this node and run animations
        const postUpdate = this.update(dt);
        this.updateAnimations(dt);

        // Update the scene transformation for this node
        const parent = this.parent;
        if (parent != null) {
            this.sceneTransformation.setMatrix(parent.sceneTransformation);
            this.sceneTransformation.translate(
                (Direction.getX(parent.childAnchor) + 1) / 2 * parent.#width,
                (Direction.getY(parent.childAnchor) + 1) / 2 * parent.#height
            );
        } else {
            this.sceneTransformation.reset();
        }
        this.sceneTransformation.translate(this.#x, this.mirroredY ? -this.#y : this.#y);
        this.sceneTransformation.mul(this.transformation);
        this.sceneTransformation.translate(
            -(Direction.getX(this.anchor) + 1) / 2 * this.#width,
            -(Direction.getY(this.anchor) + 1) / 2 * this.#height
        );

        // Update child nodes
        const layers = this.updateChildren(dt) | this.getEffectiveLayer();

        // When update method returned a post-update function then call it now
        if (postUpdate != null) {
            postUpdate();
        }

        return layers;
    }

    /**
     * Updates the child nodes of this node recursively.
     *
     * @param dt - The time in seconds since the last update.
     * @return Bit mask with used layers.
     */
    protected updateChildren(dt: number): number {
        let layers = 0;
        this.forEachChild(child => {
            layers |= child.updateAll(dt);
        });
        return layers;
    }

    /**
     * Updates this node. This is done before updating the child nodes of this node. The method can return an optional
     * function which is called after the child nodes are updated so this can be used for post-updating operations.
     *
     * @param dt - The time in seconds since the last update.
     * @return Optional post-update function which is called after updating the child nodes.
     */
    protected update(dt: number): void | (() => void) {}

    /**
     * Recursively draws the bounds for this node and alls its child nodes as long as the [[showBounds]] for the node
     * is set to true.
     *
     * @param ctx - The rendering context.
     */
    protected drawBounds(ctx: CanvasRenderingContext2D): this {
        if (this.showBounds) {
            const bounds = this.getBoundsPolygon();
            ctx.save();
            this.sceneTransformation.setCanvasTransform(ctx);
            ctx.beginPath();
            bounds.draw(ctx);
            ctx.clip();
            ctx.save();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.stroke();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = "white";
            ctx.lineDashOffset = Math.round(Date.now() / 100) % 8;
            ctx.stroke();
            ctx.restore();
            ctx.restore();
        }
        return this.forEachChild(child => child.drawBounds(ctx));
    }

    /**
     * Draws this scene node and its child nodes recursively
     *
     * @param ctx    - The rendering context.
     * @param layer  - The layer to render. Nodes which doesn't belong to this layer are not drawn.
     * @param width  - The scene width.
     * @param height - The scene height.
     * @return Hints which suggests further actions after drawing.
     */
    protected drawAll(ctx: CanvasRenderingContext2D, layer: number, width: number, height: number): PostDrawHints {
        ctx.save();
        ctx.globalAlpha *= this.getEffectiveOpacity();
        ctx.translate(this.#x, this.mirroredY ? -this.#y : this.#y);
        this.transformation.transformCanvas(ctx);
        ctx.translate(
            -(Direction.getX(this.anchor) + 1) / 2 * this.#width,
            -(Direction.getY(this.anchor) + 1) / 2 * this.#height
        );

        // Ugly hack to correct text position to exact pixel boundary because Chrome renders broken character images
        // when exactly between two pixels (Firefox doesn't have this problem).
        if (ctx.getTransform) {
            const transform = ctx.getTransform();
            ctx.translate(
                Math.round(transform.e) - transform.e,
                Math.round(transform.f) - transform.f
            );
        }

        const postDraw = layer === this.getEffectiveLayer() ? this.draw(ctx, width, height) : null;
        ctx.save();
        ctx.translate(
            (Direction.getX(this.childAnchor) + 1) / 2 * this.#width,
            (Direction.getY(this.childAnchor) + 1) / 2 * this.#height
        );
        let flags = this.drawChildren(ctx, layer, width, height);
        ctx.restore();
        if (postDraw != null) {
            if (postDraw === true) {
                flags |= PostDrawHints.CONTINUE_DRAWING;
            } else if (postDraw !== false) {
                postDraw();
            }
        }
        ctx.restore();
        return this.showBounds ? flags | PostDrawHints.DRAW_BOUNDS | PostDrawHints.CONTINUE_DRAWING : flags;
    }

    /**
     * Draws all child nodes of this scene node recursively.
     *
     * @param ctx    - The rendering context.
     * @param layer  - The layer to render. Nodes which doesn't belong to this layer are not drawn.
     * @param width  - The scene width.
     * @param height - The scene height.
     * @return Hints which suggests further actions after drawing.
     */
    protected drawChildren(ctx: CanvasRenderingContext2D, layer: number, width: number, height: number):
            PostDrawHints {
        let flags = 0;
        this.forEachChild(child => {
            flags |= child.drawAll(ctx, layer, width, height);
        });
        return flags;
    }

    /**
     * Draws this node. This is done before drawing the child nodes of this node. The method can return a boolean
     * which indicates if the scene is not finished yet and must be drawn continuously (for animations for example).
     * The method can also return an optional function which is called after the child nodes are drawn so this can be
     * used for post-drawing operations. This post-draw function then can again return an optional boolean which
     * indicates that scene must be continuously draw itself.
     *
     * @param ctx    - The rendering context.
     * @param width  - The scene width.
     * @param height - The scene height.
     * @return Optional boolean to indicate if scene must be redrawn continuously (Defaults to false) or a post-draw
     *         function which is called after drawing the child nodes and which again can return a flag indicating
     *         continuos redraw.
     */
    protected draw(ctx: CanvasRenderingContext2D, width: number, height: number):
        void | boolean | (() => void | boolean) {}
}
