/**
 * Width of the game canvas in pixels.
 */
export const GAME_CANVAS_WIDTH = 480;

/**
 * Height of the game canvas in pixels.
 */
export const GAME_CANVAS_HEIGHT = 270;

/**
 * Number if pixels per meter on the world map. Used to convert from pixel coordinates to meters (for size and
 * physics calculations).
 */
export const PIXEL_PER_METER = 18;
export const METER_PER_PIXEL = 1 / PIXEL_PER_METER;

export const SOUND_INTENSITY_MULTIPLIER = 50;

/** Gravity in m/s² */
export const GRAVITY = 35;

/** Gravity for short jumps (while flying upwards, after player releases jump key) in m/s² */
export const SHORT_JUMP_GRAVITY = 70;

/** Drowning velocity in meters per second. */
export const DROWNING_VELOCITY = -1;

/** Maximum movement speed of the player in m/s */
export const MAX_PLAYER_SPEED = 5;

/** Maximum movement speed of the player in m/s */
export const MAX_PLAYER_RUNNING_SPEED = 7;

/** Player movement acceleration on ground in m/s² */
export const PLAYER_ACCELERATION = 30;

/** Player movement acceleration in air in m/s² */
export const PLAYER_ACCELERATION_AIR = 12;

/** Player jump height in meters. */
export const PLAYER_JUMP_HEIGHT = 3.75;

/** Player jump height in meters. */
export const PLAYER_BOUNCE_HEIGHT = 10;

/** Terminal velocity in m/s */
export const TERMINAL_VELOCITY = -30;

/** Threshold in seconds for allowing a jump after entering falling state */
export const PLAYER_JUMP_TIMING_THRESHOLD = 0.1;

/** Color array containing all double jump particle colors */
export const DOUBLE_JUMP_COLORS = [ "#ffffff", "#cccccc", "#aaaaaa" ];

/** Player dimensions */
export const PLAYER_HEIGHT = 1.60 * PIXEL_PER_METER;
export const PLAYER_WIDTH = 0.5 * PIXEL_PER_METER;
export const PLAYER_CARRY_HEIGHT = 4;

/** Fonts */
export const DIALOG_FONT = "fonts/pixcelsior.font.json";
