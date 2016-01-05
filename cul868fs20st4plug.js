/**
 * Created by backes on 28/12/15.
 */

module.exports = {
    metadata: {
        family: "cul",
        plugin: "cul868fs20st4plug",
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
            label: "Switch Plug to state On"
        },
            {
                id: "switchOff",
                label: "Switch Plug to state Off"
            }],
        configuration: [{
            id: "home_id",
            label: "Home ID (e.g. ",
            type: { id: "string"},
            default: "4422 1242"
        },
        {
            id: "serialport",
            label : "Serial Port",
            type: {id:"string"},
            default: "/dev/ttyUSB0"
        },
        {
            id: "main_group_id",
            label: "Main Group ID",
            type: {id: "string"},
            default: "34"
        },
        {
            id: "sub_group_id",
            label: "Sub Group ID",
            type: {id: "string"},
            default: "11"
        }]
    },
    create: function (device) {
        return new Cul868FS20ST4Plug();
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

    The FS20ST4 is an RC switched plug that can switch currencies of 16 amperes with the built in relais.
        - It can be programmed with an FS20 remote control.
        - A timer based automatic switch off can be programmed.
        - The plug can listen to commands on 4 different FS20 addresses
          (e.g. own address, local group, functional group and global mastergroup).
          Actually it can also be 4 different individual device addresses.

   My one is programmed to
    - switch on with F51DB0011 --> '4422 1242' + '34' + '11' + '1212' --> cul.cmd('FS20', '4422 1242', '3411', 'on')
    - switch of with F51DB0000 --> '4422 1242' + '34' + '11' + '1111' --> cul.cmd('FS20', '4422 1242', '3411', 'off')
 */

var localconf = {
    on : "on",
    off : "off",
    send_FS20 : "FS20"
};

function Cul868FS20ST4Plug() {
    /**
     *
     */
    Cul868FS20ST4Plug.prototype.start = function () {
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
    Cul868FS20ST4Plug.prototype.setState = function (state) {
        this.state = state;
    };
    /**
     *
     */
    Cul868FS20ST4Plug.prototype.getState = function () {
        return this.state;
    };
    /**
     *
     */
    Cul868FS20ST4Plug.prototype.switchOn = function () {
        if (this.isSimulated()) {
            console.log("Cul868FS20ST4Plug.switchOn");
            this.state.switch = true;
        }
        else {
            var command = localconf.send_FS20+","
                +this.configuration.home_id+","
                +this.configuration.main_group_id + this.configuration.sub_group_id+","
                +localconf.on;
            console.log("Command: "+command);
            this.cul.cmd(localconf.send_FS20,
                this.configuration.home_id,
                this.configuration.main_group_id + this.configuration.sub_group_id,
                localconf.on);
            this.state.switch = true;
        }
        this.publishStateChange();
    };
    /**
     *
     */
    Cul868FS20ST4Plug.prototype.switchOff = function () {
        if (this.isSimulated()) {
            console.log("Cul868FS20ST4Plug.switchOff");
            this.state.switch = false;
        }
        else {
            var command = localconf.send_FS20+","
                +this.configuration.home_id+","
                +this.configuration.main_group_id + this.configuration.sub_group_id+","
                +localconf.off;
            console.log("Command: "+command);
            this.cul.cmd(localconf.send_FS20,
                this.configuration.home_id,
                this.configuration.main_group_id + this.configuration.sub_group_id,
                localconf.off);
            this.state.switch = false;
        }
        this.publishStateChange();
    };
}

