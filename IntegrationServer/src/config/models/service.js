const mongoose = require('mongoose');
const {Schema} = mongoose;

const ServiceSchema = new Schema({
    ip: { type:String, required:true},
    port: { type:String, required:true},
    name: { type:String, required:true},

})

module.exports = mongoose.model('Service',ServiceSchema)


