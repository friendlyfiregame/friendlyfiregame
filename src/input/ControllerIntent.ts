export enum ControllerIntent {

    NONE = 0,

    /** Player movement: left */
    PLAYER_MOVE_LEFT = 0b0000_0000_0000_0001,
    /** Player movement: right */
    PLAYER_MOVE_RIGHT = 0b0000_0000_0000_0010,
    /** Player movement: jump */
    PLAYER_JUMP = 0b0000_0000_0000_0100,
    /** Player movement: DROP (or: duck/crouch) */
    PLAYER_DROP = 0b0000_0000_0000_1000,

    /** Interact with NPC, throw stuff, etc., pp. */
    PLAYER_INTERACT = 0b0000_0000_0001_0000,

    UNUSED_1 = 0b0000_0000_0010_0000,

    /** Dance move no. 1 */
    PLAYER_DANCE_1 = 0b0000_0000_0100_0000,

    /** Dance move no. 2 */
    PLAYER_DANCE_2 = 0b0000_0000_1000_0000,

    // Menu navigation
    MENU_LEFT = 0b0000_0001_0000_0000,
    MENU_RIGHT = 0b0000_0010_0000_0000,
    MENU_UP = 0b0000_0100_0000_0000,
    MENU_DOWN = 0b0000_1000_0000_0000,

    /** The key usually known as "enter" or something alike. */
    CONFIRM = 0b0001_0000_0000_0000,
    UNUSED_2 = 0b0010_0000_0000_0000,

    /** Pause/unpause. */
    PAUSE = 0b0100_0000_0000_0000,

    /** Back / abort / get-me-the-hell-out-of-here. */
    ABORT = 0b1000_0000_0000_0000
}
