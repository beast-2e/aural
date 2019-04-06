#!/usr/bin/env python

import RPi.GPIO as GPIO
import time
import alsaaudio
import subprocess

GPIO.setmode(GPIO.BCM)
UP = 21
DOWN = 20

inc = 1# how much each switch changes volume
GPIO.setup(UP, GPIO.IN)
GPIO.setup(DOWN, GPIO.IN)
m = alsaaudio.Mixer('PCM')

current_vol = m.getvolume()[0] # Get the current Volume
new_vol = current_vol

secret_code_buffer = [" "]
secret_code_timer = 0
SECRET_CODE_TIMEOUT = 20
SECRET_CODE_IP_SPEAK = list("^ ^ ^ v v v ^ v ^ v")
IP_SPEAK_COMMAND = "hostname -I | sed 's/ /\\n/g' | espeak -s 130 -v en-us"

while True:
    # Read from pins
    vol_up = GPIO.input(UP)
    vol_down = GPIO.input(DOWN)

    # Increment if needed
    symbol = " "

    if (vol_up and not vol_down):
        new_vol += inc
        symbol = "^"
    elif (vol_down and not vol_up):
        new_vol -= inc
        symbol = "v"

    if secret_code_buffer[-1] != symbol:
        secret_code_timer = SECRET_CODE_TIMEOUT
        secret_code_buffer.append(symbol)
        if len(secret_code_buffer) > len(SECRET_CODE_IP_SPEAK):
            secret_code_buffer.pop(0)

        # print secret_code_buffer
        if secret_code_buffer == SECRET_CODE_IP_SPEAK:
            subprocess.Popen(IP_SPEAK_COMMAND, shell=True)

    if secret_code_timer > 0:
        secret_code_timer-=1
        if(secret_code_timer == 0):
            secret_code_buffer = [" "]

    # Make sure the volume is within valid range
    new_vol = min(max(new_vol,0),100)

    # Set volume only if it has changed
    if current_vol != new_vol:
        current_vol = new_vol;
        m.setvolume(int(round(current_vol))) # Set the volume to new value
        print "volume set to: ", current_vol

    time.sleep(0.04)
