
#!/usr/bin/env python
import RPi.GPIO as GPIO
import time
import alsaaudio


GPIO.setmode(GPIO.BCM)
UP = 21
DOWN = 20



inc = 1# how much each switch changes volume
GPIO.setup(UP, GPIO.IN)
GPIO.setup(DOWN, GPIO.IN)
m = alsaaudio.Mixer('PCM')

current_vol = m.getvolume()[0] # Get the current Volume
new_vol = current_vol

while True:
    # Read from pins
    vol_up = GPIO.input(UP)
    vol_down = GPIO.input(DOWN)
    
    # Increment if needed
    if (vol_up and not vol_down):
        new_vol += inc
    elif (vol_down and not vol_up):
        new_vol -= inc
    
    # Make sure the volume is within valid range
    new_vol = min(max(new_vol,0),100)
        
    # Set volume only if it has changed
    if current_vol != new_vol:
        current_vol = new_vol;
        m.setvolume(int(round(current_vol))) # Set the volume to new value
        print "volume set to: ", current_vol

    time.sleep(0.04)
