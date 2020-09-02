import { Game } from "./Game";
import { Scene, SceneConstructor, SceneProperties } from "./Scene";

export class Scenes<T extends Game> {
    public activeScene: Scene<T> | null = null;
    private sceneCache = new WeakMap<SceneConstructor<T>, Scene<T>>();
    private scenes: Scene<T>[] = [];
    private sortedScenes: Scene<T>[] = [];

    public constructor(public readonly game: T) {}

    private createScene(sceneClass: SceneConstructor<T>): Scene<T> {
        let scene = this.sceneCache.get(sceneClass);

        if (scene == null) {
            scene = new sceneClass(this.game);
            this.sceneCache.set(sceneClass, scene);
        }

        return scene;
    }

    public async pushScene(sceneClass: SceneConstructor<T>, properties: SceneProperties = null): Promise<void> {
        if (this.activeScene != null) {
            await this.activeScene.deactivate();
        }

        const scene = this.createScene(sceneClass);

        if (properties) {
            scene.setProperties(properties);
        }

        await scene.setup();
        this.scenes.push(scene);
        this.updateSortedScenes();

        if (scene.inTransition != null) {
            scene.currentTransition = scene.inTransition;
            await scene.currentTransition.start("in");
            scene.currentTransition = null;
        }

        await scene.activate();
        this.activeScene = scene;
    }

    public getPreviousScene(): Scene<T> | null {
        return this.scenes[this.scenes.length - 2] ?? null;
    }

    public async popScene({ noTransition = false }: { noTransition?: boolean} = {}): Promise<Scene<T> | null> {
        const activeScene = this.activeScene;

        if (activeScene != null) {
            await activeScene.deactivate();

            if (!noTransition && activeScene.outTransition != null) {
                activeScene.currentTransition = activeScene.outTransition;
                await activeScene.currentTransition.start("out");
                activeScene.currentTransition = null;
            }

            this.scenes.pop();
            this.updateSortedScenes();
            await activeScene.cleanup();
            this.activeScene = this.scenes[this.scenes.length - 1] ?? null;

            if (this.activeScene != null) {
                await this.activeScene.activate();
            }
        }

        return activeScene;
    }

    public async setScene(newSceneClass: SceneConstructor<T>): Promise<void> {
        const currentScene = this.activeScene;

        if (currentScene == null) {
            return this.pushScene(newSceneClass);
        }

        await currentScene.deactivate();
        let outTransitionPromise: Promise<void> | null = null;

        if (currentScene.outTransition) {
            currentScene.currentTransition = currentScene.outTransition;
            outTransitionPromise = currentScene.currentTransition.start("out");
        }

        const currentSceneIndex = this.scenes.length - 1;
        const newScene = this.createScene(newSceneClass);
        await newScene.setup();
        this.scenes.push(newScene);
        this.updateSortedScenes();

        if (newScene.inTransition != null) {
            newScene.currentTransition = newScene.inTransition;
            await newScene.currentTransition.start("in");
            newScene.currentTransition = null;
        }

        await newScene.activate();
        this.activeScene = newScene;

        if (outTransitionPromise != null) {
            await outTransitionPromise;
            currentScene.currentTransition = null;
        }

        this.scenes.splice(currentSceneIndex, 1);
        this.updateSortedScenes();
        currentScene.cleanup();
    }

    private updateSortedScenes(): void {
        this.sortedScenes = this.scenes.slice().sort((a, b) => {
            if (a.zIndex === b.zIndex) {
                return this.scenes.indexOf(a) - this.scenes.indexOf(b);
            } else {
                return a.zIndex - b.zIndex;
            }
        });
    }

    public update(dt: number): void {
        this.sortedScenes.forEach(scene => {
            scene.currentTransition?.update(dt);
            scene.update(dt);
        });
    }

    public draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        this.sortedScenes.forEach(scene => {
            ctx.save();
            if (scene.currentTransition != null) {
                scene.currentTransition.draw(ctx, () => scene.draw(ctx, width, height), width, height);
            } else {
                scene.draw(ctx, width, height);
            }
            ctx.restore();
        });
    }
}
