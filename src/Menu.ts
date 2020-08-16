import { asset } from './Assets';
import { BitmapFont } from './BitmapFont';
import { Point } from './Geometry';
import { Signal } from './Signal';
import { Sound } from './Sound';

export enum MenuAlignment { LEFT, CENTER, RIGHT };

/**
 * Simple MenuItem Class for usage in a MenuList.
 * Currently, each item is only rendered as simple text. The focused state is visualized via
 * an additional `►` character as prefix. The item instances don't need to be manually drawn,
 * since the MenuList class' draw method will take care of it
 */
export class MenuItem {
    public id: string;
    public label: string;
    private font: BitmapFont;
    private color: "black" | "white";
    public position: Point;
    public enabled: boolean;
    public focused: boolean;

    @asset("sprites/menu_selector.png")
    private static selectorImage: HTMLImageElement;

    public constructor(id: string, label: string, font: BitmapFont, color: 'black' | 'white', position: Point, enabled = true) {
        this.id = id;
        this.label = label;
        this.font = font;
        this.color = color;
        this.position = position;
        this.enabled = enabled;
        this.focused = false;
    }

    /**
     * Draw method for a single ListItem. Is automatically called when the parent
     * MenuList's draw method is called.
     *
     * @param ctx CanvasRenderingContext2D
     */
    public draw(ctx: CanvasRenderingContext2D, align: MenuAlignment) {
        ctx.save();

        const alpha = this.enabled ? 1 : 0.35;
        const text = this.label;
        const width = this.font.measureText(text).width;

        let actualPosition = this.position.clone();

        if (align === MenuAlignment.CENTER) {
            actualPosition.moveXBy(-Math.round(width / 2));
        }

        this.font.drawText(ctx, text, actualPosition, this.color, 0, alpha);

        if (this.focused) {
            actualPosition.moveBy(-13, 2);

            ctx.drawImage(MenuItem.selectorImage, actualPosition.x, actualPosition.y);
        }

        ctx.restore();
    }
}

/**
 * A simple Menu List that can hold MenuItems and navigate them in two directions via methods.
 * On each navigational change, the new Menu Item is focused. When calling the `executeAction` method a
 * signal is emitted containing the focused menu items id. Disabled Menu Items will be skipped automatically when navigating.
 * The draw method of the list instance has to be called to have all contianing buttons be drawn automatically.
 */
export class MenuList {
    @asset("sounds/interface/click.mp3")
    public static click: Sound;
    @asset("sounds/interface/confirm.mp3")
    public static confirm: Sound;
    @asset("sounds/interface/select.mp3")
    public static select: Sound;
    @asset("sounds/interface/bass.mp3")
    public static pause: Sound;

    private align: MenuAlignment;
    private items: MenuItem[] = [];
    public onActivated = new Signal<string>();

    public constructor(align = MenuAlignment.LEFT) {
        this.align = align;
    }

    /**
     * Adds an arbitray number of menu items to the menu list
     * The first available menu item will be focused automatically
     * @param items
     */
    public addItems(...items: MenuItem[]) {
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
     * Sets an arbitray number of menu items to the menu list and overrides
     * any previously added items. The first available menu item will be focused automatically
     * @param items
     */
    public setItems(...items: MenuItem[]) {
        this.items = [...items];
        this.focusFirstItem();
    }

    /**
     * Finds and focuses the first available item if no item was focused before.
     */
    private focusFirstItem (): void {
        if (!this.getFocusedItem()) {
            const index = this.items.findIndex(item => item.enabled)
            if (index > -1) {
                this.items[index].focused = true;
            }
        }
    }

    private getFocusedItem (): MenuItem | undefined {
        return this.items.find(item => item.focused)
    }
    private getFocusedItemIndex (): number {
        return this.items.findIndex(item => item.focused)
    }
    private unfocusAllItems (): void {
        this.items.forEach(item => item.focused = false);
    }
    private focusItem (item: MenuItem): void {
        this.unfocusAllItems();
        item.focused = true;
    }

    /**
     * Recursive method to focus the next item in the direction provided in the argument.
     * @param currentIndex - The index of the currently focused item in the items array
     * @param direction    - Direction in which the next item should be searched for.
     *                       Either 1 (forwards) or -1 (backwards)
     */
    private findAndFocusNextItem(currentIndex: number, direction: -1 | 1) {
        const min = direction > 0 ? 0 : (this.items.length - 1);
        const max = direction > 0 ? (this.items.length - 1) : 0;
        const nextIndex = (currentIndex === max) ? min : currentIndex + direction;

        const nextItem = this.items[nextIndex];

        if (nextItem.enabled) {
            this.focusItem(this.items[nextIndex])
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
        this.findAndFocusNextItem(this.getFocusedItemIndex(), 1)
    }

    /**
     * Method to navigate the focus of the menu list to the previous item
     */
    public prev(): void {
        this.findAndFocusNextItem(this.getFocusedItemIndex(), -1)
    }

    public executeAction(sound: Sound = MenuList.confirm): void {
        const focusedButton = this.getFocusedItem();
        if (focusedButton && focusedButton.enabled) {
            sound.stop();
            sound.play();
            this.onActivated.emit(focusedButton.id);
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        this.items.forEach(item => {
            item.draw(ctx, this.align);
        })
    }
}
