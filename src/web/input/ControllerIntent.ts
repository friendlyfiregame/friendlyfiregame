/**
 * Enumeration of the different intents that may be emitted by a single button,
 * whereas a button might either be a physical key on a keyboard, a mapped axis
 * on a gamepad or a touch screen event.
 *
 * Right now, these events are stored in a bit mask to be extra efficient, …
 * …maybe that's not really necessary and should be changed to improve
 * readability at some point…
 */
export enum ControllerIntent {
    /** Used for unknown / unmapped buttons. */
    NONE = 0,

    /** Player movement: left */
    PLAYER_MOVE_LEFT = 0b0000_0000_0000_0000_0001,
    /** Player movement: right */
    PLAYER_MOVE_RIGHT = 0b0000_0000_0000_0000_0010,
    /** Player movement: jump */
    PLAYER_JUMP = 0b0000_0000_0000_0000_0100,
    /** Player movement: DROP (or: duck/crouch) */
    PLAYER_DROP = 0b0000_0000_0000_0000_1000,

    /** Talk to NPCs, read signs etc */
    PLAYER_INTERACT = 0b0000_0000_0000_0001_0000,

    /** Action, throw stuff */
    PLAYER_ACTION = 0b0000_0000_0000_0010_0000,

    /** Dance move no. 1 */
    PLAYER_DANCE_1 = 0b0000_0000_0000_0100_0000,

    /** Dance move no. 2 */
    PLAYER_DANCE_2 = 0b0000_0000_0000_1000_0000,

    // Menu navigation
    MENU_LEFT = 0b0000_0000_0001_0000_0000,
    MENU_RIGHT = 0b0000_0000_0010_0000_0000,
    MENU_UP = 0b0000_0000_0100_0000_0000,
    MENU_DOWN = 0b0000_0000_1000_0000_0000,

    /** The key usually known as "enter" or something alike. */
    CONFIRM = 0b0000_0001_0000_0000_0000,

    /** Go through doors */
    PLAYER_ENTER_DOOR = 0b0000_0010_0000_0000_0000,

    /** Pause/unpause. */
    PAUSE = 0b0000_0100_0000_0000_0000,

    /** Back / abort / get-me-the-hell-out-of-here. */
    ABORT = 0b0000_1000_0000_0000_0000,

    /** Run modifier */
    PLAYER_RUN = 0b0001_0000_0000_0000_0000,

    UNUSED_1 = 0b0010_0000_0000_0000_0000,
    UNUSED_2 = 0b0100_0000_0000_0000_0000,
    UNUSED_3 = 0b1000_0000_0000_0000_0000,
}
