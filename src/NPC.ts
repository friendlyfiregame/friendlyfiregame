import { Entity } from './Entity';

export abstract class NPC extends Entity {
    public hasDialog = true;

    abstract enterConversation(): void;
}
