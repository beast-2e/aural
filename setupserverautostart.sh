#!/bin/bash
# Must be run with sudo
# sudo sh setupserverautostart.sh

# Autostart server
sed -i 's!# By default this script does nothing.!/usr/bin/nodejs /home/pi/aural/server.js 80 \&!' /etc/rc.local
