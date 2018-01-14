#!/bin/bash

echo "$(rustup run stable sh -c 'echo $LD_LIBRARY_PATH')/../bin"

