/**
 * Number if pixels per meter on the world map. Used to convert from pixel coordinates to meters (for size and
 * physics calculations).
 */
export const PIXEL_PER_METER = 18;

/** Gravity in m/s² */
export const GRAVITY = 35;

/** Maximum movement speed of the player in m/s */
export const MAX_PLAYER_SPEED = 5;

/** Player movement acceleration in m/s² */
export const PLAYER_ACCELERATION = 15;

/** Player jump height in meters. */
export const PLAYER_JUMP_HEIGHT = 3.5;

/** Animation speed for player idling in milliseconds */
export const PLAYER_IDLE_ANIMATION = [ 100, 500, 50, 1000 ];

/** Animation speed for player running in milliseconds */
export const PLAYER_RUNNING_ANIMATION = [ 150, 150, 150, 150 ];
