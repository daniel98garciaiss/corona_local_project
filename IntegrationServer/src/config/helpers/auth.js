const helpers = {}

helpers.isAuthenticated = (req,res,next) =>{
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg','No Autorizado');
    res.redirect('/login')
}
helpers.isNotAuthenticated = (req,res,next) =>{
    if(!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/resources')
}

helpers.isAdmin = (req,res,next) =>{
    // console.log(req.user.rol)
    if(req.user.rol == "admin"){
        return next();
    }
  
    req.flash('error_msg','No Autorizado');
    res.redirect('back');

}

module.exports = helpers;
