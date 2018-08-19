Turtl desktop
=============

_Opening an issue? See the [Turtl project tracker](https://github.com/turtl/tracker/issues)_

This is the desktop app wrapper around the Turtl [core](https://github.com/turtl/js).
It provides a native experience for Windows, Linux, and OSx allowing local packaging
of Turtl for desktop platforms.

## Setup

Let's assume you have Node.js/NPM install already. Make sure you have [NWJS](https://github.com/nwjs/nw.js)
installed on your machine and in your PATH. Also the `rsync` utility is used
throughout the Turtl build processes, so please make sure you have it installed.

```bash
mkdir turtl
cd turtl/
git clone https://github.com/turtl/js
# make sure to follow the build instructions for turtl core: https://github.com/turtl/core-rs
git clone https://github.com/turtl/core-rs core
git clone https://github.com/turtl/desktop
cd js/
npm install
cp config/config.js.default config/config.js
cd ../desktop/
npm install
make electron-rebuild
```

NOTE (mostly to self): in windows, run `electron-rebuild` in cmd, not in
msys2/cygwin. Something with paths, npm, etc etc etc. Who the hell knows.

## Building

There are a few targets, but the most gratifying is

```bash
make run
```

Which runs the build and opens electron with Turtl loaded.

