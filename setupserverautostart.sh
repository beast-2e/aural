#!/bin/bash
# Must be run with sudo
# sudo sh setupserverautostart.sh

# Autostart server
sed -i 's!# By default this script does nothing.!(cd /home/pi/aural; /usr/bin/npm run start) \&!' /etc/rc.local
