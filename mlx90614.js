'use strict';

const
//ram registers
REG_RAW1         = 0x04,
REG_RAW2         = 0x05,
REG_TA           = 0x06,
REG_TOBJ1        = 0x07,
REG_TOBJ2        = 0x08,

//eeprom addresses
ADDR_TOMAX       = 0x20,
ADDR_TOMIN       = 0x21,
ADDR_CTL_PM      = 0x22,
ADDR_TA_RANGE    = 0x23,
ADDR_EMISSIVITY  = 0x24,
ADDR_CONFIG      = 0x25,
ADDR_COMMAND     = 0x2E, //0x0E?
ADDR_ID1         = 0x3C,
ADDR_ID2         = 0x3E,
ADDR_ID3         = 0x3D,
ADDR_ID4         = 0x3F,

//config registers
CFG_IRR          = 0x00,
CFG_FIR          = 0x06,
CFG_DUAL         = 0x01,
CFG_GAIN         = 0x0B;

class mlx90614 {
  constructor(busId, address) {
    this.ADDRESS = address || 0x5A;
    this.bus = require('i2c-bus').openSync(busId || 1);
    this.dualZone = !!(this.bus.readWordSync(this.ADDRESS, ADDR_CONFIG)  & 0x40);
  }

  readWord(reg) {
    return new Promise((resolve, reject) =>
      this.bus.readWord(
        this.ADDRESS,
        reg,
        (err, data) => {
          if(err)
            reject(err);

          //if(data & 0x80)
          //  reject('temperature read error: ' + data.toString(16));

          resolve(data);
        }
      )
    )
  }

  async readTemp(reg) {
    var mKelvins = await this.readWord(reg);
    var celcius = (mKelvins * 0.02) - 273.15;
    return 32 + celcius * 9 / 5;
  }

  async readAmbient() {
    return await this.readTemp(REG_TA);
  }
  
  async readObject1() {
    return await this.readTemp(REG_TOBJ1);
  }

  async readObject2() {
    if(!this.dualZone) return NaN;
    return await this.readTemp(REG_TOBJ2);
  }
}

var _locks = {};
mlx90614.acquireLock = function(val) {
  return new Promise(function exec(resolve, reject) {
    if(!_lock[val]) {
      _lock[val] = true;
      resolve();
    }
    else
      setImmediate(() => exec(resolve, reject));
  });
};

mlx90614.releaseLock = function(val) {
  delete _lock[val];
};

module.exports = mlx90614;
