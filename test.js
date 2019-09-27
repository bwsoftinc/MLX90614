'use strict'

const { exec } = require('child_process');
const driver = require('./mlx90614');
const mlx = new driver();

const log = async () => {
    console.log("Object1: " + await mlx.readObject1());
    //console.log("Object2: " + await mlx.readObject2());
    console.log("Ambient: " + await mlx.readAmbient());
    setTimeout(log, 500);
};

log();
exec('omxplayer /home/pi/git/Rick-Astley-Never-Gonna-Give-You-Up.mp3');