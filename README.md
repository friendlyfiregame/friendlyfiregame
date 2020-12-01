# Friendly Fire

## Playing the Game

Just head over to [friendlyfiregame.com](https://friendlyfiregame.com/) and pick the
launch options that best fits your style.

## Achieving all possible endings

There are multiple endings. Listed below you can find all endings and how to
achieve them.

### Ending A
This is the regular jam ending. Play the game regularly and feed the wood to the fire who gave you the quest.
This leads to a final boss fight.

### Ending B
Alternate ending. Play the game regularly but also finish the dog quest before feeding the wood to the fire.
The final boss fight is skipped and replaced with a special cutscene.

### Ending C
This is a gag ending. This can be achieved by soft locking yourself in the cave under the flame boy npc and talking
to the cave man. To get over the river without the double jump, you have to use the "stone skip jump" technique/bug.

### Ending D
This is a gag ending. As soon as you can fly, go to the tree in the west and talk to the dog. You'll have the option
to pet the dog. If you let the petting sequence run it's course, the game will end.

### Ending E
Alternate ending. Play the game regularly, you can also skip the dog side quest since this has no impact on this ending.
Instead of feeding the wood to the main fire, feed it to the flame boy. This will trigger the ending.

## Development

### Getting started

* Install [Node.js](https://nodejs.org/)
* Install [Visual Studio Code](https://code.visualstudio.com/)
* Clone the source code:

  ```sh
  git clone git@github.com:/friendlyfiregame/friendlyfiregame.git
  ```

* Initially run `npm i` in the project folder to install/update dependencies.

### Building the game

In Visual Studio Code press *Ctrl-Shift-B* to start the compiler in watch mode. This compiles the
TypeScript sources in the `src` folder to JavaScript in the `lib` folder. It also watches the `src`
folder for changes so changed files are compiled on-save.

Alternatively you can run `npm i` on the CLI to compile the project once or
`npm run watch` to continuously compile the project in watch mode.

### Running the game in a browser

There are four alternatives to run the game in the browser:

* In Visual Studio Code press *Ctrl-Shift-D* and launch the `webpack-dev-server` and
  one of the available browsers that can be selected by clicking on the drop down menu next to
  the "launch" button.
* Run `npm start` and point your browser to <http://localhost:8000/>. The browser automatically
  reloads the game when changes are detected (You still need to run the compiler in watch mode in VS
  Code or on the CLI to receive code changes).
* If you already have a local webserver you can simply open the `index.html` file in the project
  folder in your browser. This only works with a http(s) URL, not with a file URL.
* Run `npm run dist` to package the game into the `dist` folder. Open the `dist/index.html` in your
  browser to run the game. To publish the game simply copy the contents of the `dist` folder to a
  public web server.
