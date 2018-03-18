const uuid = require('uuid')
const mongoose = require('mongoose')

const systemComponentSchema = mongoose.Schema({
  name: { type: String, required: true },
  isHuman: { type: Boolean, required: true },
  safeTempThreshold: { type: Number, required: true },
  installedDate: { type: Date, required: true },
  readings: [{
    temperature: Number,
    date: Date
  }]
})

systemComponentSchema.methods.serialize = function () {
  return {
    id: this._id,
    name: this.name,
    isHuman: this.isHuman,
    safeTempThreshold: this.safeTempThreshold,
    installedDate: this.installedDate,
    readings: this.readings
  };
};

const SystemComponent = mongoose.model('SystemComponent', systemComponentSchema)

module.exports = { SystemComponent }
