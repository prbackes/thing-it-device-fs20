/**
 * Created by backes on 11/8/15.
 */

module.exports = {
    metadata: {
        family: "cul",
        plugin: "cul868fs20s16remote",
        sensorTypes: [],
        state : [{
            id: "plug",
            label : "Switch State",
            type : {
                id : "boolean"
            },

        }],
        services: [{
            id: "switchOn",
            label: "Switch Socket to state On"
        },
            {
                id: "switchOff",
                label: "Switch Socket to state Off"
            },
            {
                id: "toggle",
                label: "Toggle Switch"
            }],
        configuration: [{
            id: "home_id",
            label: "Home ID",
            type: { id: "string"},
            default: "00000F"
        },
        {
            id: "serialport",
            label : "Serial Port",
            type: {id:"string"},
            default: "/dev/ttyUSB0"
        },
        {
            id: "socket_id",
            label: "Socket ID",
            type: {id: "string"},
            default: "F0FF"
        }]
    },
    create: function (device) {
        return new Cul868FS20S16Remote();
    }
};

var q = require('q');

var Cul = require('cul');


/*
 FS20 devices are programmed by using their keypad or their IR interface and a special programming device.
 Adresses are composed like: 8digit_house_code + 2digit_main_group + 2digit_sub_group
 For the address groups only these values are valid:
    11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43
 The value 44 has a special meaning for setting up 'global' groups to which actors can listen
 in addition to their individual address.
 4444 is the global master group
 4411, 4412, 4424 etc are addresses for up to 15 functional groups, e.g. for switcing on/off all
 floor lights in your house.
 1144, 1244, 2444 etc are addresses for up to 15 local mastergroups, e.g. for switching on/off all
 devices in room 11.

    The FS20S16 is a 18 button remote control that has the following features:
        - Each row of two buttons can work as a pair of on and off switch for a device or group address.
          In this mode the control has 8 groups of on/off switches.
        - All 16 buttons can be assigned individual device o group addresses.
          In this mode, each of the 16 buttons operates as a toogle (on/off) button.
        - A button press of less than 0.4s sends a 'switch on' or 'switch off' command.
        - Pressing a button for more than 0.4s sends a dimming command 'dim up' or 'dim down'.
            - Each new dimming command changes direction.

    CUL is set to receive with e.g. X01
 */

var localconf = {
    on : "0F",
    off : "F0",
    send_intertechno : "is"
};

function Cul868FS20S16Remote() {
    /**
     *
     */
    Cul868FS20S16Remote.prototype.start = function () {
        var deferred = q.defer();

        this.state = { switch: false};

        if (this.isSimulated()) {
            deferred.resolve();
        } else {
            this.cul = new Cul({
                serialport: '/dev/ttyUSB0',
                mode: 'SlowRF',
                baudrate: '38400'
            });

            // ready event is emitted after serial connection is established and culfw acknowledged data reporting
            this.cul.on('ready', function () {
                // send commands to culfw
                this.cul.write('V');
            }.bind(this));

            this.cul.on('data', function(raw) {
                console.log(raw);
                this.publishStateChange();
            }.bind(this))

            deferred.resolve();
        }
        return deferred.promise;
    };
    /**
     *
     */
    Cul868FS20S16Remote.prototype.setState = function (state) {
        this.state = state;
    };
    /**
     *
     */
    Cul868FS20S16Remote.prototype.getState = function () {
        return this.state;
    };
    /**
     *
     */
    Cul868FS20S16Remote.prototype.switchOn = function () {
        if (this.isSimulated()) {
            console.log("Cul433Unitec.switchOn");
            this.state.switch = true;
        }
        else {
            var command = localconf.send_intertechno + this.configuration.home_id + this.configuration.socket_id + localconf.on;
            console.log("Command: "+command);
            this.cul.write(command);
            this.state.switch = true;
        }
        this.publishStateChange();
    };
    /**
     *
     */
    Cul868FS20S16Remote.prototype.toggle = function () {
        if (this.state.switch) {
            this.switchOff();
        }
        else {
            this.switchOn()
        }
    };
    /**
     *
     */
    Cul868FS20S16Remote.prototype.switchOff = function () {
        if (this.isSimulated()) {
            console.log("Cul433Unitec.switchOff");
            this.state.switch = false;
        }
        else {
            this.cul.write(localconf.send_intertechno + this.configuration.home_id + this.configuration.socket_id + localconf.off);
            this.state.switch = false;
        }
        this.publishStateChange();
    };
}

