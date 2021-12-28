const mongoose = require('mongoose');
const {Schema} = mongoose;

const SecurOSRestapiSchema = new Schema({

    name: { type:String, required:true},
    url: { type:String, required:true},
    login: { type:String, required:true},
    password: { type:String, required:true},
    state:{ type:String, required:false, "default" : ''},
    methods: { type:Array, "default" : [] }

})

module.exports = mongoose.model('Restapi',SecurOSRestapiSchema)

