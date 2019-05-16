# Taken from: https://weworkweplay.com/play/rebooting-the-raspberry-pi-when-it-loses-wireless-connection-wifi/
# You need to sudo chmod 775 this file
# Then crontab -e and add */5 * * * * /usr/bin/sudo -H /home/pi/aural/checkwifiandreboot.sh >> /dev/null 2>&1


ping -c4 auralsex.mit.edu > /dev/null

if [ $? != 0 ] 
then
  sudo /sbin/shutdown -r now
fi
