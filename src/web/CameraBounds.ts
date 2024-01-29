import { Entity, entity } from "./Entity";

// TODO Reduce to one class name and use class name in tiled map to reference it instead of name
@entity("cave1-bounds")
@entity("startingcave-bounds")
@entity("forrest-cave-bounds")
@entity("winghouse-bounds")
@entity("mountain-foot-cave-bounds")
@entity("inferno-bounds")
@entity("overworld-bounds")
@entity("laboratory-bounds")
@entity("ngplus-house-bounds")
@entity("shadowhallway-bounds")
export class CameraBounds extends Entity {}
