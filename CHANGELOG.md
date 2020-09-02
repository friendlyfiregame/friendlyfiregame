# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2020-09-02

### Added

- Information about the game's missing save fature have been added in the
  tutorial cave.

### Changed

- Text rendering has been improved / characters have been adjusted.

### Fixed

- Returning to main menu and restarting the game should now longer lead to all
  kinds of weird errors.
- Dancing while carrying an item should no longer crash the game.
- Fix misleading/wrong dialogue concerning the ability to run ("Fear of the Deark power-up").
- Fix wrong keyboard mapping hints.
- Include ending C for players who 'successfully' manage to end up soft-locked in the cave too early.
- An occasional game-restart bug has been fixed.
- Wrong gamepad button tooltips in control scheme have been fixed.
- A bunch of typos and have been fixed.

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
