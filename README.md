Turtl desktop
=============

This is the desktop app wrapper around the Turtl [core](https://github.com/turtl/js).
It provides a native experience for Windows, Linux, and OSx allowing anyone to
use Turtl without a browser.

Setup
-----
To get the source working, download [node-webkit](https://github.com/rogerwang/node-webkit)
for your system.

Then create a symlink:

```bash
cd /path/to/turtl/desktop
ln -s /path/to/turtl/js data/app
```

Now

```bash
/path/to/node-webkit/nw .
```



