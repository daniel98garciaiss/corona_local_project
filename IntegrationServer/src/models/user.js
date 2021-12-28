const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {Schema} = mongoose;

const newUser = new Schema({

    login: { type:String, required:true},
    password: { type:String, required:true},
    firstname: { type:String, required:false},
    lastname: { type:String, required:false},
    rol: { type:String, required:true}
})

newUser.methods.encryptPassword = async (password) =>{
   
  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hash(password,salt)
  return hash;
}
newUser.methods.matchPassword = async function (password) {
    console.log('encript');
    return await bcrypt.compare(password,this.password)
}


module.exports = mongoose.model('User',newUser)

