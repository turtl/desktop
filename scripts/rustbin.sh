#!/bin/bash

libdir="$(rustup run stable sh -c 'echo $LD_LIBRARY_PATH')"
if [ -f $libdir/*std* ]; then
	echo "${libdir}"
else
	echo "${libdir}/../bin"
fi

