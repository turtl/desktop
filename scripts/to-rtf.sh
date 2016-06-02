#!/bin/bash

in=$1
echo -n '{\rtf1\ansi\ansicpg1252\deff0\deflang1033{\fonttbl{\f0\fnil\fcharset0 Calibri;}}'
echo
echo -n '\viewkind4\uc1\pard\sa200\sl276\slmult1\f0\fs24 '
cat ${in} \
	| sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/\\line\n/g'


