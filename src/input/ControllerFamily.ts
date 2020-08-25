/**
 * This enumeration is used to classify the various known input methods.
 */
export enum ControllerFamily {
    KEYBOARD = "keyboard",
    GAMEPAD = "gamepad"
}

/**
 * This enum consists of all supported button aseprite sheets
 */
export enum ControllerSpriteMap {
    KEYBOARD = "keyboard",
    XBOX = "xbox",
    PLAYSTATION = "playstation"
}

/**
 * This enum consists of all available animation tags supported by the button aseprite sheets
 */
export enum ControllerAnimationTags {
    CONFIRM = "confirm",
    JUMP = "jump",
    ACTION = "action",
    INTERACT = "interact",
    OPEN_DOOR = "up",
    BACK = "back"
}
