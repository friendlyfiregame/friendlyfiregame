import { Entity, entity, type EntityArgs } from "../../Entity";

export interface GateArgs extends EntityArgs {
    disabled?: boolean;
    target?: string | null;
    bgm?: string | null;
    enterSound?: string | null;
    exitSound?: string | null;
    exitSleepTime?: number | null;
    exitFadeTime?: number | null;
}

@entity("door_1")
@entity("door_2")
@entity("startingdoor_1")
@entity("startingdoor_2")
@entity("forrest_door_left_1")
@entity("forrest_door_right_1")
@entity("forrest_door_left_2")
@entity("forrest_door_right_2")
@entity("mountain_door_floor_1")
@entity("mountain_door_floor_2")
@entity("mountain_door_top_1")
@entity("mountain_door_top_2")
@entity("wing_house_door_1")
@entity("wing_house_door_2")
@entity("mountain_riddlecave_bottom_1")
@entity("mountain_riddlecave_bottom_2")
@entity("mountain_riddlecave_top_1")
@entity("mountain_riddlecave_top_2")
@entity("boss_door1")
@entity("boss_door2")
@entity("exitportaldoor_2")
@entity("ngplus_house_door_1")
@entity("ngplus_house_door_2")
@entity("shadowgate_door_2")
export class Gate extends Entity {
    public disabled: boolean;
    public readonly target: string | null;
    public readonly bgm: string | null;
    public readonly enterSound: string | null;
    public readonly exitSound: string | null;
    public readonly exitSleepTime: number | null;
    public readonly exitFadeTime: number | null;

    public constructor({
        disabled = false,
        target = null,
        bgm = null,
        enterSound = null,
        exitSound = null,
        exitSleepTime = null,
        exitFadeTime = null,
        ...args
    }: GateArgs) {
        super(args);
        this.disabled = disabled;
        this.target = target;
        this.bgm = bgm;
        this.enterSound = enterSound;
        this.exitSound = exitSound;
        this.exitSleepTime = exitSleepTime;
        this.exitFadeTime = exitFadeTime;
    }
}
