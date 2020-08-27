/**
 * Enumeration of the different gamepad styles.
 *
 * Mainly used to adjust button mappings to offer the best possible *expected* gaming
 * experience and to make sure that graphics are displayed in-game that match the
 * controller being used.
 */
export enum GamepadStyle {

    /** Default gamepad type if nothing else matches. */
    UNKNOWN = "unkown",

    XBOX = "xbox",
    PLAYSTATION = "playstation",
    STADIA = "stadia"

}
