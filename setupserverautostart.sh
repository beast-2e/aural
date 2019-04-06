#!/bin/bash
# Must be run with sudo

# Autostart server
sed -i 's!# By default this script does nothing.!/usr/bin/npm start --prefix /home/pi/aural/ &!' /etc/rc.local
