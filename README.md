Turtl desktop
=============

This is the desktop app wrapper around the Turtl [core](https://github.com/turtl/js).
It provides a native experience for Windows, Linux, and OSx allowing local packaging
of Turtl for desktop platforms.

## Setup

Let's assume you have Node.js/NPM install already. Make sure you have [NWJS](https://github.com/nwjs/nw.js)
installed on your machine and in your PATH.

```bash
mkdir turtl
cd turtl/
git clone https://github.com/turtl/js.git
git clone https://github.com/turtl/desktop.git
```

So we grab our Turtl js project's source and the mobile source as siblings (with
the name "js" preserved...renaming `js` to something else will break the build).

## Building

There are a few targets, but the most interesting is

```bash
make run
```

Which runs the build and opens nwjs with Turtl loaded. Then there's

```bash
make package
```

Which creates a package.nw file containing the app, ready to be run by any NWJS
installation.

