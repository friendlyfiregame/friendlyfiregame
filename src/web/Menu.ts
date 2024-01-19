import { asset } from "./Assets";
import { BitmapFont } from "./BitmapFont";
import { Signal } from "./Signal";
import { Sound } from "./audio/Sound";
import { SceneNode, SceneNodeArgs } from "./scene/SceneNode";
import { FriendlyFire } from "./FriendlyFire";

export enum MenuAlignment { LEFT, CENTER, RIGHT }

/**
 * Simple MenuItem Class for usage in a MenuList.
 * Currently, each item is only rendered as simple text. The focused state is visualized via an
 * additional `►` character as prefix. The item instances don't need to be manually drawn, since the
 * MenuList class' draw method will take care of it.
 */
export class MenuItem<T = null> {
    public id: string;
    public label: string;
    protected font: BitmapFont;
    protected color: "black" | "white";
    public x: number;
    public y: number;
    public enabled: boolean = true;
    public focused: boolean;
    public data: T;

    @asset("images/menu_selector.png")
    protected static selectorImage: HTMLImageElement;

    public constructor(id: string, label: string, font: BitmapFont, color: "black" | "white", x: number, y: number, data: T | null = null ) {
        this.id = id;
        this.label = label;
        this.font = font;
        this.color = color;
        this.x = x;
        this.y = y;
        this.focused = false;
        this.data = data as T;
    }

    /**
     * Draw method for a single ListItem. Is automatically called when the parent
     * MenuList's draw method is called.
     *
     * @param ctx CanvasRenderingContext2D
     */
    public draw(ctx: CanvasRenderingContext2D, align: MenuAlignment): void {
        ctx.save();
        const alpha = this.enabled ? 1 : 0.35;

        let x = this.x;
        const y = this.y;

        const text = this.label;
        const width = this.font.measureText(text).width;


        if (align === MenuAlignment.CENTER) {
            x -= Math.round(width / 2);
        }

        this.font.drawText(ctx, text, x, y, this.color, 0, alpha);

        if (this.focused) {
            ctx.drawImage(MenuItem.selectorImage, x - 13, y + 2);
        }

        ctx.restore();
    }
}

export type MenuItemParams<T = null> = {
    id: string;
    label: string;
    font: BitmapFont;
    color: "black" | "white";
    x: number;
    y: number;
    enabled: boolean;
    data: T;
};

export type SliderMenuItemParams<T> = MenuItemParams<T> & {
    initialValue: number;
    minValue: number;
    maxValue: number;
    increment: number;
    rightActionCallback: (newValue: number, data: T) => void;
    leftActionCallback: (newValue: number, data: T) => void;
};

export class SliderMenuItem<T = null> extends MenuItem<T> {
    private value: number;
    private readonly minValue: number;
    private readonly maxValue: number;
    private readonly increment: number;
    private readonly rightActionCallback: (newValue: number, data: T) => void;
    private readonly leftActionCallback: (newValue: number, data: T) => void;

    public constructor(params: SliderMenuItemParams<T>) {
        super(params.id, params.label, params.font, params.color, params.x, params.y, params.data);
        this.value = params.initialValue;
        this.minValue = params.minValue;
        this.maxValue = params.maxValue;
        this.increment = params.increment;
        this.rightActionCallback = params.rightActionCallback;
        this.leftActionCallback = params.leftActionCallback;
    }

    public getValue(): number {
        return this.value;
    }

    public setValue(value: number): void {
        this.value = Math.min(this.maxValue, Math.max(this.minValue, value));
    }

    public increaseValue(): void {
        this.setValue(this.value + this.increment);
        this.rightActionCallback(this.value, this.data);
    }

    public decreaseValue(): void {
        this.setValue(this.value - this.increment);
        this.leftActionCallback(this.value, this.data);
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const alpha = this.enabled ? 1 : 0.35;
        const x = this.x;
        const y = this.y;

        const text = this.label;
        this.font.drawText(ctx, text, x, y, this.color, 0, alpha);

        const valueText = `${this.getValue()} %`;
        const valueWidth = this.font.measureText(valueText).width;
        this.font.drawText(ctx, valueText, x + 250 - valueWidth, y, this.color, 0, alpha);

        if (this.focused) {
            ctx.drawImage(MenuItem.selectorImage, x - 13, y + 2);
        }

        ctx.restore();
    }
}

export type CheckboxMenuItemParams<T> = MenuItemParams<T> & {
    initialValue: boolean;
    actionCallback: (newValue: boolean, data: T) => void;
};

export class CheckboxMenuItem<T = null> extends MenuItem<T> {
    private value: boolean;
    private readonly actionCallback: (newValue: boolean, data: T) => void;

    public constructor(params: CheckboxMenuItemParams<T>) {
        super(params.id, params.label, params.font, params.color, params.x, params.y, params.data);
        this.value = params.initialValue;
        this.actionCallback = params.actionCallback;
    }

    public getValue(): boolean {
        return this.value;
    }

    public setValue(value: boolean): void {
        this.value = value;
        this.actionCallback(this.value, this.data);
    }

    public toggleValue(): void {
        this.setValue(!this.getValue());
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const alpha = this.enabled ? 1 : 0.35;
        const x = this.x;
        const y = this.y;

        const text = this.label;
        this.font.drawText(ctx, text, x, y, this.color, 0, alpha);

        const valueText = this.value ? "On" : "Off";
        const valueWidth = this.font.measureText(valueText).width;
        this.font.drawText(ctx, valueText, x + 250 - valueWidth, y, this.color, 0, alpha);

        if (this.focused) {
            ctx.drawImage(MenuItem.selectorImage, x - 13, y + 2);
        }

        ctx.restore();
    }
}

export type SelectMenuItemParams<V extends string, T> = MenuItemParams<T> & {
    values: V[];
    valueLabels: Record<V, string>;
    initialValue: V;
    actionCallback: (newValue: V, data: T) => void;
};

export class SelectMenuItem<V extends string, T = null> extends MenuItem<T> {
    private readonly values: V[];
    private readonly valueLabels: Record<V, string>;
    private value: V;
    private readonly actionCallback: (newValue: V, data: T) => void;

    public constructor(params: SelectMenuItemParams<V, T>) {
        super(params.id, params.label, params.font, params.color, params.x, params.y, params.data);
        this.values = params.values;
        this.value = params.initialValue;
        this.valueLabels = params.valueLabels;
        this.actionCallback = params.actionCallback;
    }

    public getValue(): V {
        return this.value;
    }

    public setValue(value: V): void {
        this.value = value;
        this.actionCallback(this.value, this.data);
    }

    public cycleValue(): void {
        const currentIndex = this.values.indexOf(this.value);
        this.setValue(this.values[currentIndex < this.values.length - 1 ? currentIndex + 1 : 0]);
    }

    public nextValue(): void {
        const currentIndex = this.values.indexOf(this.value);
        if (currentIndex < this.values.length - 1) {
            this.setValue(this.values[currentIndex + 1]);
        }
    }

    public previousValue(): void {
        const currentIndex = this.values.indexOf(this.value);
        if (currentIndex > 0) {
            this.setValue(this.values[currentIndex - 1]);
        }
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const alpha = this.enabled ? 1 : 0.35;
        const x = this.x;
        const y = this.y;

        const text = this.label;
        this.font.drawText(ctx, text, x, y, this.color, 0, alpha);

        const valueText = this.valueLabels[this.value] ?? this.value;
        const valueWidth = this.font.measureText(valueText).width;
        this.font.drawText(ctx, valueText, x + 250 - valueWidth, y, this.color, 0, alpha);

        if (this.focused) {
            ctx.drawImage(MenuItem.selectorImage, x - 13, y + 2);
        }

        ctx.restore();
    }
}

export interface MenuListArgs extends SceneNodeArgs {
    align?: MenuAlignment;
}

/**
 * A simple MenuList that can hold MenuItems and navigate them in two directions via methods. On
 * each navigational change, the new MenuItem is focused. When calling the `executeAction` method a
 * signal is emitted containing the focused MenuItem's ID. Disabled MenuItems will be skipped
 * automatically when navigating. The draw method of the list instance has to be called to have all
 * containing buttons be drawn automatically.
 */
export class MenuList extends SceneNode<FriendlyFire> {
    @asset("sounds/interface/click.mp3")
    public static click: Sound;
    @asset("sounds/interface/confirm.mp3")
    public static confirm: Sound;
    @asset("sounds/interface/select.mp3")
    public static select: Sound;
    @asset("sounds/interface/bass.mp3")
    public static pause: Sound;

    private readonly align: MenuAlignment;
    private items: MenuItem<unknown>[] = [];
    public onActivated = new Signal<string>();
    public onRightAction = new Signal<string>();
    public onLeftAction = new Signal<string>();

    public constructor({ align = MenuAlignment.LEFT, ...args }: MenuListArgs = {}) {
        super(args);
        this.align = align;
    }

    /**
     * Adds an arbitrary number of menu items to the menu list
     * The first available menu item will be focused automatically
     * @param items
     */
    public addItems(...items: MenuItem[]): void {
        this.items.push(...items);
        this.focusFirstItem();
    }

    /**
     * Clears all menu items from the menu instance
     */
    public reset(): void {
        this.items = [];
    }

    /**
     * Sets an arbitrary number of menu items to the menu list and overrides any previously added
     * items. The first available menu item will be focused automatically.
     */
    public setItems(...items: MenuItem<unknown>[]): this {
        this.items = [...items];
        this.focusFirstItem();
        return this;
    }

    /**
     * Finds and focuses the first available item if no item was focused before.: void
     */
    private focusFirstItem(): void {
        if (!this.getFocusedItem()) {
            const index = this.items.findIndex(item => item.enabled);

            if (index > -1) {
                this.items[index].focused = true;
            }
        }
    }

    private getFocusedItem(): MenuItem<unknown> | undefined {
        return this.items.find(item => item.focused);
    }

    private getFocusedItemIndex(): number {
        return this.items.findIndex(item => item.focused);
    }

    private unfocusAllItems(): void {
        this.items.forEach(item => { item.focused = false; });
    }

    private focusItem(item: MenuItem<unknown>): void {
        this.unfocusAllItems();
        item.focused = true;
    }

    /**
     * Recursive method to focus the next item in the direction provided in the argument.
     * @param currentIndex - The index of the currently focused item in the items array
     * @param direction    - Direction in which the next item should be searched for.
     *                       Either 1 (forwards) or -1 (backwards)
     */
    private findAndFocusNextItem(currentIndex: number, direction: -1 | 1): void {
        const min = direction > 0 ? 0 : (this.items.length - 1);
        const max = direction > 0 ? (this.items.length - 1) : 0;
        const nextIndex = (currentIndex === max) ? min : currentIndex + direction;

        const nextItem = this.items[nextIndex];

        if (nextItem.enabled) {
            this.focusItem(this.items[nextIndex]);
        } else {
            this.findAndFocusNextItem(nextIndex, direction);
        }

        MenuList.click.stop();
        MenuList.click.play();
    }

    /**
     * Method to navigate the focus of the menu list to the next item
     */
    public next(): void {
        this.findAndFocusNextItem(this.getFocusedItemIndex(), 1);
    }

    /**
     * Method to navigate the focus of the menu list to the previous item
     */
    public prev(): void {
        this.findAndFocusNextItem(this.getFocusedItemIndex(), -1);
    }

    public executeAction(sound: Sound = MenuList.confirm): void {
        const focusedButton = this.getFocusedItem();

        if (focusedButton && focusedButton.enabled) {
            sound.stop();
            sound.play();
            this.onActivated.emit(focusedButton.id);
            if (focusedButton instanceof CheckboxMenuItem) {
                focusedButton.toggleValue();
            } else if (focusedButton instanceof SelectMenuItem) {
                focusedButton.cycleValue();
            }
        }
    }

    public executeRightAction(sound: Sound = MenuList.click): void {
        const focusedButton = this.getFocusedItem();

        if (focusedButton && focusedButton.enabled) {
            sound.stop();
            sound.play();
            this.onRightAction.emit(focusedButton.id);
            if (focusedButton instanceof SliderMenuItem) {
                focusedButton.increaseValue();
            } else if (focusedButton instanceof SelectMenuItem) {
                focusedButton.nextValue();
            }
        }
    }

    public executeLeftAction(sound: Sound = MenuList.click): void {
        const focusedButton = this.getFocusedItem();

        if (focusedButton && focusedButton.enabled) {
            sound.stop();
            sound.play();
            this.onLeftAction.emit(focusedButton.id);
            if (focusedButton instanceof SliderMenuItem) {
                focusedButton.decreaseValue();
            } else if (focusedButton instanceof SelectMenuItem) {
                focusedButton.previousValue();
            }
        }
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        this.items.forEach(item => {
            item.draw(ctx, this.align);
        });
    }
}
