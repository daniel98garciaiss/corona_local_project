const mongoose = require('mongoose');
const {Schema} = mongoose;

const OpcSchema = new Schema({
    name: { type:String, required:true},
    url: { type:String, required:true},
    state:{ type:String, required:false, "default" : 'Desconectado'},
    methods: { type:Array, "default" : [] }
})

module.exports = mongoose.model('Opc',OpcSchema)

