# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- The windows version of the app now uses a scalable icon in .ICO format to ensure
  that the look and feel of the launcher icon is as crisp as possible.

### Updated

- The Desktop apps are now based on Electron v23.1.2.
  As always, a new Electron runtime should offer improved performance, security and
  bug fixes, that may or may not be visible or even useful to end users.

## [2.7.0] - 2022-12-12

### Added

- The browser version of the game is now offline-capable by utilizing a service worker.
  The game can now be considered a modern progressive web app (PWA).

### Updated

- The Desktop apps are now based on Electron v22.0.0.
  As always, a new Electron runtime should offer improved performance, security and
  bug fixes, that may or may not be visible or even useful to end users.

## [2.6.2] - 2022-11-24

### Added

- ARM64 Builds for macOS and Linux have been added to the continuous integration pipeline.

### Changed

- The credits page now only shows the first seven characters of the Git SHA-1 sum
  to allow for easier bug reports.

### Updated

- The Desktop apps are now based on Electron v21.3.1.
  As always, a new Electron runtime should offer improved performance, security and
  bug fixes, that may or may not be visible or even useful to end users.

## [2.6.1] - 2022-11-18

### Fixed

- Support for Steam overlays in the Desktop app (introduced in the previous version)
  was broken and did not work as supposed to. The initialization procedure of the game
  has been reworked to address this issue and the overlay now works flawlessly.

- Switching from and to fullscreen mode in the Desktop app was broken and did not work
  as supposed to. The initialization procedure of the game has been reworked to address
  this issue and switching should work again.

## [2.6.0] - 2022-11-17

### Added

- New in-game configuration options have been added to allow the individual adjustment of
  music and sound volumes.

## [2.6.2] - 2022-11-24

### Added

- ARM64 Builds for macOS and Linux have been added to the continuous integration pipeline.

### Changed

- The credits page now only shows the first seven characters of the Git SHA-1 sum
  to allow for easier bug reports.

### Updated

- The Desktop apps are now based on Electron v21.3.1.
  As always, a new Electron runtime should offer improved performance, security and
  bug fixes, that may or may not be visible or even useful to end users.

## [2.6.1] - 2022-11-18

### Fixed

- Support for Steam overlays in the Desktop app (introduced in the previous version)
  was broken and did not work as supposed to. The initialization procedure of the game
  has been reworked to address this issue and the overlay now works flawlessly.

- Switching from and to fullscreen mode in the Desktop app was broken and did not work
  as supposed to. The initialization procedure of the game has been reworked to address
  this issue and switching should work again.

## [2.6.0] - 2022-11-17

### Added

- New in-game configuration options have been added to allow the individual adjustment of
  music and sound volumes.

- The possibility to toggle the game from windows to fullscreen (and vice versa) has been
  added as a menu option. The Desktop version of the game will persist the desired display
  mode and start windowed or in fullscreen mode according to the settings you made.

- The Desktop app of the game has gained support for Steam overlays. Prior to this release,
  it was not possible to use Steam's key combination (usually Shift+Tab)to toggle the Steam
  overlay. This should now be possible.

- Gamepad types can be automatically detected. It is still possible to overwrite the
  gamepad button styles to be shown in help tooltips in the "controls" screen, though.

- Full support for Google Stadia game pads has been added.
  All overlays have been adjusted to show tooltips that match the button layout of Stadia
  game pads, if a Stadia game pad has been detected or manually selected.

### Updated

- The Desktop apps are now based on Electron v21.3.0.
  As always, a new Electron runtime should offer improved performance, security and
  bug fixes, that may or may not be visible or even useful to end users.

## [2.5.0] - 2022-01-01

### Added

- A new command line flag has been added to the Desktop version of the game:
  `--version` Prints the version name and the version of the app and immediately exits the process
- The startup code of the Desktop apps has been overhauled. It should no longer be possible to
  run more than one instance of the game if installed properly.

### Updated

- The Desktop apps are now based on Electron v16.0.5.
  As always, a new Electron runtime should offer improved performance, security and
  bug fixes, that may or may not be visible or even useful to end users.

## [2.4.0] - 2021-05-01

### Added

- Two new command line flags have been added to the Desktop version of the game:
  `--dev` can be used to enable the Chromium Developer Tools upon startup and
  `--no-fullscreen` can be used to open the game in a window instead of switching
  to fullscreen mode immediately.
- Global state that keeps track of achieved endings (via localStorage)
- Little ending icons that appear in the main menu after finishing the game once to
  visualize which endings have been achieved and how many there are.
- A new credit song arrangement with female vocals. The ending song is picked depending
  on the selected character asset. Ending E will play an unused synth version of the
  ending song (with male vocals)

## [2.3.0] - 2020-11-30

### Added

- It is now possible to pet the dog! You heard that right... you can pet the dog!!
- Excessive petting of the dog might even lead to a surprising new ending.
- The wood can now be gifted to the smaller fire in the west as well for another surprising
  alternative ending.

### Updated

- The Desktop apps are now based on Electron v11.0.3.
  This runtime update introduces improved Gamepad support and should enable a whole bunch
  of non-Xinput-devices to just work out of the box.

### Fixed

- A bunch of dialogues have been improved and some typos have been fixed.

## [2.2.0] - 2020-09-06

### Added

- A preview sound is being played When switching the character's voice to indicate
  how the choice will affect perceived gameplay.

- The key combination Alt+Enter can now be used to toggle full screen mode.

### Changed

- A brand new scene graph API is now used to render certain parts of the game.

### Fixed

- Default key functionality in browsers is now prevented to suppress unwanted scrolling
  when using space and/or cursor keys. This affects scenarios where the game is embedded
  into another website.

- Text placement issues in conjunction with rendering issues and wrong placements of single
  characters have been fixed

- Some transparency issues when rendering overlays have been fixed.

## [2.1.2] - 2020-09-05

### Fixed

- Player is teleported back into level when accidentally dropping out of bounds.

## [2.1.1] - 2020-09-04

### Fixed

- The wise stone was still referencing the gender fairy. This reference has now been removed.
- A wrong directional hint when talking to the bird about the bird's nest has been fixed.

## [2.1.0] - 2020-09-02

### Added

- Information about the game's missing save feature have been added in the
  tutorial cave.

### Changed

- Text rendering has been improved / characters have been adjusted.

### Fixed

- Returning to main menu and restarting the game should now longer lead to all
  kinds of weird errors.
- Dancing while carrying an item should no longer crash the game.
- Fix misleading/wrong dialogue concerning the ability to run ("Fear of the Dark power-up").
- Fix wrong keyboard mapping hints.
- Include ending C for players who 'successfully' manage to end up soft-locked in the cave too early.
- An occasional game-restart bug has been fixed.
- Wrong gamepad button tooltips in control scheme have been fixed.
- A bunch of typos have been fixed.

## [2.0.2] - 2020-08-27

### Changed

- Closing the game window will now quit the app on macOS.

### Updated

- The Desktop apps are now based on Electron v10.1.0.

## [2.0.1] - 2020-08-27

This is a bugfix release that contains a critical bug that prevented
Electron-based apps from starting.

### Fixed

- Wrong icon paths prevented Electron-based app builds from starting on
  all platforms. This issue has now been fixed.

## [2.0.0] - 2020-08-27

### Changed

- The level has been completely redesigned
- Adjusted color scheme to better suit the mood
- New soundtrack and a fancy song in the credits
- New character selection mechanism
- Gamepad support has been improved

### Added

- Lots of gameplay-related stuff has been added, such as new non-player characters, riddles and dialogues
- Always play the latest version of the game on [friendlyfiregame.com](https://friendlyfiregame.com/)

### Removed

- The gender fairy has been removed as it's humor felt offensive to some players

## [1.0.0] - 2020-07-07

Initial release.
