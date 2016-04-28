/*jslint node:true,vars:true, unparam:true */
/*jshint unused:true */


/*
The Touch Notifier Node.js sample application distributed within Intel® XDK IoT Edition under the IoT with Node.js Projects project creation option showcases how to read digital data from a Grover Starter Kit Plus – IoT Intel® Edition Touch Sensor, start a web server and communicate wirelessly using WebSockets.

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.

Steps for installing MRAA & UPM Library on Intel IoT Platform with IoTDevKit Linux* image
Using a ssh client: 
1. echo "src maa-upm http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf
2. opkg update
3. opkg upgrade

Article: https://software.intel.com/en-us/html5/articles/iot-touch-notifier-nodejs-and-html5-samples
*/

//MRAA Library was installed on the board directly through ssh session
var mraa = require("mraa");
var upmMicrophone = require("jsupm_mic");
var LCD  = require ('jsupm_i2clcd');

var upmBuzzer = require("jsupm_buzzer");
var myBuzzer = new upmBuzzer.Buzzer(6);
myBuzzer.stopSound;
myBuzzer.setVolume(0.2);

var chords = [];
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.FA);
chords.push(upmBuzzer.SOL);
chords.push(upmBuzzer.SOL);
chords.push(upmBuzzer.FA);
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.RE);
chords.push(upmBuzzer.DO);
chords.push(upmBuzzer.DO);
chords.push(upmBuzzer.RE);
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.RE);
chords.push(upmBuzzer.RE);

chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.FA);
chords.push(upmBuzzer.SOL);
chords.push(upmBuzzer.SOL);
chords.push(upmBuzzer.FA);
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.RE);
chords.push(upmBuzzer.DO);
chords.push(upmBuzzer.DO);
chords.push(upmBuzzer.RE);
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.RE);
chords.push(upmBuzzer.RE);
chords.push(upmBuzzer.DO);
chords.push(upmBuzzer.DO);
var chordIndex = 0;

//LCD Screen
var myLCD = new LCD.Jhd1313m1(6, 0x3E, 0x62);
myLCD.setColor(5,5,200);


//GROVE Kit Shield D6 --> GPIO6
//GROVE Kit Shield D2 --> GPIO2
function startSensorWatch(socket) {
    'use strict';
    var touch_sensor_value = 0, last_t_sensor_value,last_s_t_sensor_value;
    var current_state=0;

    //Touch Sensor connected to D2 connector
    var digital_pin_D2 = new mraa.Gpio(2);
    digital_pin_D2.dir(mraa.DIR_IN);

    //Buzzer connected to D6 connector
    //var digital_pin_D6 = new mraa.Gpio(6);
    //digital_pin_D6.dir(mraa.DIR_OUT);
    //digital_pin_D6.write(0);
    
    
    
    // Attach microphone to analog port A0
    var myMic = new upmMicrophone.Microphone(0);
    var threshContext = new upmMicrophone.thresholdContext;
    threshContext.averageReading = 0;
    threshContext.runningAverage = 0;
    threshContext.averagedOver = 2;
    
    setInterval(function () {
        touch_sensor_value = digital_pin_D2.read();
        var buffer = new upmMicrophone.uint16Array(128);
        var len = myMic.getSampledWindow(2, 128, buffer);
        var thresh = myMic.findThreshold(threshContext, 30, buffer, len);
        myMic.printGraph(threshContext);
        console.log("Threshold is " + thresh);
        myLCD.setCursor(0,0);
        myLCD.write("Th= " + thresh);
        if ((touch_sensor_value === 1 && last_t_sensor_value === 0)) {
            console.log("Buzz ON touch!!!");
            socket.emit('message', "touch");
            current_state=1;
            last_t_sensor_value=1;
            //digital_pin_D6.write(current_state);
            //myLCD.setCursor(1,0);
            //myLCD.write(".°(>__<)°.     ");
            //melody(myLCD);
            //myBuzzer.playSound(upmBuzzer.RE,1000000);
        } else if ((touch_sensor_value === 0 && thresh > 150)) {
            console.log("Buzz ON Sound!!!");
            current_state=0;
            last_t_sensor_value=1;
            //digital_pin_D6.write(current_state);
            //myLCD.setCursor(1,0);
            //myLCD.write("             ");
            //myBuzzer.stopSound;
            myLCD.setCursor(1,0);
            myLCD.write(".°(>__<)°.     ");
            melody(myLCD);
            socket.emit('message', "sound");
        }
        last_t_sensor_value = touch_sensor_value;
        last_s_t_sensor_value = thresh;
    }, 500);
}

//Create Socket.io server
var http = require('http');
var app = http.createServer(function (req, res) {
    'use strict';
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('<h1>Hello world from Intel IoT platform!</h1>');
}).listen(1337);
var io = require('socket.io')(app);

console.log("Sample Reading Touch Sensor");

//Attach a 'connection' event handler to the server
io.on('connection', function (socket) {
    'use strict';
    console.log('a user connected');
    //Emits an event along with a message
    socket.emit('connected', 'Welcome');

    //Start watching Sensors connected to Galileo board
    startSensorWatch(socket);

    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

function melody()
{
    
    if (chords.length != 0)
    {
        for(var i=0;i<chords.length;i++)
        {
        //Play sound for one second
        console.log( myBuzzer.playSound(chords[i], 550000) );
        }
        myBuzzer.stopSound();
        myLCD.setCursor(1,0);
        myLCD.write("*(^_^)*       ");
    }
}
