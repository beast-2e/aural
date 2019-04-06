#!/bin/bash
# Must be run with sudo
# sudo sh setupclientautostart.sh


# Allow raspi display to be on even when not plugged in
sed -i 's/#hdmi_force_hotplug=1/hdmi_force_hotplug=1/' /boot/config.txt

# Autostart Chromium on boot
cat > /lib/systemd/system/chromiumautostart.service << 'END_OF_DAEMON'

[Unit]
Description=Chromium Autostart
Wants=graphical.target
After=graphical.target

[Service]
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/pi/.Xauthority
Type=simple
ExecStart=/usr/bin/chromium-browser
Restart=on-abort
User=pi
Group=pi

[Install]
WantedBy=graphical.target

END_OF_DAEMON

systemctl enable chromiumautostart.service

# Autostart volume control on boot
cat > /lib/systemd/system/hardwarevolumectl.service << 'END_OF_DAEMON'

[Unit]
Description=Chromium Autostart
Wants=graphical.target
After=graphical.target

[Service]
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/pi/.Xauthority
Type=simple
ExecStart=/usr/bin/python2.7 /home/pi/aural/volume.py
Restart=on-abort
User=pi
Group=pi

[Install]
WantedBy=graphical.target

END_OF_DAEMON

systemctl enable hardwarevolumectl.service
