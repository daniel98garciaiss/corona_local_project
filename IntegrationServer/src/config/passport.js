const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user')



passport.use(new LocalStrategy({
    usernameField: 'login'
}, async (login,password, done) =>{
    const user = await User.findOne({login:login})
    // console.log(user);
    if(!user){
        return done(null,false,{message: 'Usuario no encontrado'});
    }else{
        const match = await user.matchPassword(password)
        console.log('match',match)
        if(match){
            return done(null,user);
        }
        else{
            return done(null,false,{message:'Password incorrecto'});
        }
    }
}));


passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser((id,done)=>{
    User.findById(id)
    .lean()
    .exec(function (err, user) {
      done(err, user);
    });
});
