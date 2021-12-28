const mongoose = require('mongoose');
const {Schema} = mongoose;

const SecurOSSchema = new Schema({
    name: { type:String, required:true},
    type: { type:String, required:true},
    typeID:{ type:String, required:true},
    actions: { type:Array, "default" : [] }
})

module.exports = mongoose.model('Relay',SecurOSSchema)

