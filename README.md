Turtl desktop
=============

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
# make sure you set up core-rs based on its own setup: https://github.com/turtl/core-rs
git clone https://github.com/turtl/core-rs
git clone https://github.com/turtl/desktop
cd js/
npm install
cd ../desktop/
npm install
npm install -g electron-rebuild
electron-rebuild -e node_modules/electron
```

NOTE (mostly to self): in windows, run `electron-rebuild` in cmd, not in
msys2/cygwin. Something with paths, npm, etc etc etc. Who the hell knows.

So we grab our Turtl js project's source and the mobile source as siblings (with
the name "js" preserved...renaming `js` to something else will break the build).

## Building

There are a few targets, but the most interesting is

```bash
make run
```

Which runs the build and opens nwjs with Turtl loaded.

