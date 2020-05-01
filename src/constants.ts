/**
 * Number if pixels per meter on the world map. Used to convert from pixel coordinates to meters (for size and
 * physics calculations).
 */
export const PIXEL_PER_METER = 18;

/** Gravity in m/s² */
export const GRAVITY = 35;

/** Gravity for short jumps (while flying upwards, after player releases jump key) in m/s² */
export const SHORT_JUMP_GRAVITY = 70;

/** Drowning velocity in meters per second. */
export const DROWNING_VELOCITY = -1;

/** Maximum movement speed of the player in m/s */
export const MAX_PLAYER_SPEED = 5;

/** Player movement acceleration on ground in m/s² */
export const PLAYER_ACCELERATION = 30;

/** Player movement acceleration in air in m/s² */
export const PLAYER_ACCELERATION_AIR = 12;

/** Player jump height in meters. */
export const PLAYER_JUMP_HEIGHT = 3.75;

/** Player jump height in meters. */
export const PLAYER_BOUNCE_HEIGHT = 10;
