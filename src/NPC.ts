import { Entity } from './Entity';

export abstract class NPC extends Entity {
    public hasDialog = false;

    abstract startDialog(): void;
}
