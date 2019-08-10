### How to use Aural as a beast resident
1. Go to auralsex.mit.edu (10.238.0.20)
2. pick which bathroom/place
3. type in box your song name or url (youtube will pick top music result)
4. dequeue as needed in website
5. adjust volume with physical switch (ask Isabelle for super secret switch locations)

### How aural works (for people maintaining/fixing it)
Software : 
- Walcott is the server pi and every other pi is the client pi. Walcott pi maintains the song lists and listens to website requests then broadcasts/receives statuses from all the other pis.
- To ssh into the pi : 
flip the switch uuudddudud to get the each pi's IP over speakers
- everything runs off vue/node js
- a couple scripts in the repo : volume switch,  restart pi whenever lose wifi (bemis pi had the weird problem of freezing whenever it lost wifi)

Hardware : 
- pi 3.5mm out --> amp --> speaker
- volume switch pulled up--> digital pin on pi as input ( see walcott as example )
- consult Isabelle if need help

### How to setup a new aural client for dummies
- get a pi 3a+ (wifi built in), a sd card, a power supply 5V 3A
- get amp and matching speaker (ask sudermap)and some sort of switch and ethernet cable (or any 4 wire cable will do)
- download the aural repo from github into home/pi/aural
- on pi run : 
```
sudo apt install nodejs
sudo apt install npm
sudo npm run start
```
that should download all the packages necessary for aural to run properly
- load the extension in the repo into google chromium ( have to be in developer mode)
- enter IP to connect to : auralsex.mit.edu
- Enter location : <location name> (note : this will be the name showing up in auralsex.mit.edu dropdown)
- also install these chromium extensions : uBlock Origin (or some other adblocker), Audio Only Youtube (pi 3a+ wifi can't handle loading both video and audio smoothly), youtube nonstop (https://chrome.google.com/webstore/detail/youtube-nonstop/nlkaejimjacpillmajjnopmpbkbnocid)
- enable vncviewer in pi's settings (it will make everyone's life easier)

TIPs : 
- when ssh into pi, use tmux it will make your life easier. also if you need to mess with chromium don't forget to export the display ```export DISPLAY=:0.0
chromium-browser ```
- 
