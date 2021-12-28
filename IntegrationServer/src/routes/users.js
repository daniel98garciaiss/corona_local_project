/* 
 *SECUROS INTEGRATION SERVER - USER ROUTES MODULE
 *@Authors: 
 *			Alejandra Aguirre  - alejandra.aguirre@issivs.com
 *			Santiago Rondon    - santiago@ivsss.com
 *			Alejandro Garcia   - alejandro@issivs.com
 *Version 1.0 
 *SecurOS 10.9
 *
*/ 
const express = require('express');
const { connect } = require('mongoose');
const router = express.Router();
const user = require('../models/user')
const service = require('../models/service')
const passport = require('passport')
const {isAuthenticated, isNotAuthenticated, isAdmin} = require('../helpers/auth')

////////////////////////////////////////////////////////////
//////////////////////////VISTAS ///////////////////////////
////////////////////////////////////////////////////////////

/////////////////// GET - VISTA LOGIN //////////////////////
router.get('/login', isNotAuthenticated,async(req,res) => {           //ASYNC
     res.render('login');
});

/////////////////// POST AUTHENTICATION LOGIN /////////////////////////////
router.post('/login',passport.authenticate('local',{
    successRedirect:'/resources',
    failureRedirect:'/login',
    failureFlash:true
}));

/////////////////// GET - VISTA GENERAL DE USUARIOS //////////////////////
router.get('/users', [isAuthenticated, isAdmin],  async(req,res) => {           //ASYNC
     toolbar = { title: 'Usuarios',
                 buttons: [{
                     text:'Crear nuevo Usuario',
                     link:'/users/create'
                 }]
    };
     let users = await user.find({"_id": {$ne : req.user._id}}).lean().sort({login: 'ascending'});
     res.render('users/users',{users,toolbar})
});

/////////////////// VISTA CREAR USUARIOS //////////////////////
router.get('/users/create',isAuthenticated, (req,res) => {
    res.render('users/create_user');
});

/////////////////// VISTA EDITAR USUARIOS //////////////////////
router.get ('/users/edit/:id', isAuthenticated, async (req,res) =>{
    const User = await user.findById(req.params.id).lean()
    res.render('users/edit_user',{User})
});

/////////////////// VISTA CAMBIAR CONTRASEÑA USUARIOS //////////////////////
router.get ('/users/change_password/:id',isAuthenticated,  async (req,res) =>{
    const User = await user.findById(req.params.id).lean()
    res.render('users/change_password',{User})
});





////////////////////////////////////////////////////////////
//////////////////////////METODOS ///////////////////////////
////////////////////////////////////////////////////////////

/////////////////// METODO ELIMINAR USUARIOS //////////////////////
router.delete('/users/delete/:id',isAuthenticated, async (req,res) =>{
    await user.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Usuario eliminado satisfactoriamente!')
    res.redirect('/users')
});

/////////////////// METODO LOGOUT USUARIOS //////////////////////
router.get('/users/logout',isAuthenticated, (req,res) => {           
    req.logout();
    res.redirect('/login')  
});

/////////////////// METODO EDITAR USUARIOS //////////////////////
router.put('/users/edit/:id',isAuthenticated, async (req,res) =>{
    const errors = []
    let {login,firstname,lastname} = req.body;
    const NewUser = new user({login,firstname,lastname})  
    if(login==''){
        errors.push( {text:'Por favor inserte un Login'})
        res.redirect('/users')
    }
    else{ 
        await user.findByIdAndUpdate(req.params.id,{login,firstname,lastname});
        req.flash('success_msg', 'Usuario editado satisfactoriamente!')
        res.redirect('/users')
    }
});
/////////////////// METODO CAMBIAR CONTRASEÑA USUARIOS //////////////////////
router.put('/users/change_password/:id',isAuthenticated, async (req,res) =>{
    const errors = []
    let {password,password2} = req.body;
    if(password ==''){
        errors.push( {text:'Por favor inserte una contraseña'})
        res.redirect('/users')
    }
    if(password === password2)
    {
        const NewUser = new user()
        password = await  NewUser.encryptPassword(password)
        await user.findByIdAndUpdate(req.params.id,{password});
        req.flash('success_msg', 'Contraseña editada satisfactoriamente!')
        res.redirect('/users')
    }
});
/////////////////// METODO CREAR USUARIOS //////////////////////
router.post('/users/new/',isAuthenticated, async (req,res) => {                
    const {login,password,firstname,lastname, rol} = req.body
    const errors = []
    // console.log(req.body);
    if(login==''){
        errors.push( {text:'Por favor inserte un Login'})
       }
    if(password==''){
        errors.push({text:'Por favor inserte una Contraseña'})
    }
    if(errors.length>0)   
        res.render('users/create_user',{errors,login,password,firstname,lastname, rol})
    else{ 
        const loginUser = await user.findOne({login:login})
        if(loginUser){
            req.flash('error_msg','El usuario ya existe')
            res.redirect('/users/create')
        }
        const NewUser = new user({login,password,firstname,lastname, rol})
        NewUser.password = await  NewUser.encryptPassword(password)
        await NewUser.save();      
        req.flash('success_msg', 'Usuario creado satisfactoriamente!')
        console.log(NewUser);
        res.redirect('/users')
    }
});

router.post('/users/root/', async (req,res) => {                
    const {login,password,firstname,lastname} = req.body
    const errors = []
    console.log(req.body);
    if(login==''){
        errors.push( {text:'Por favor inserte un Login'})
       }
    if(password==''){
        errors.push({text:'Por favor inserte una Contraseña'})
    }
    if(errors.length>0)   
        res.render('users/create_user',{errors,login,password,firstname,lastname})
    else{ 
        const loginUser = await user.findOne({login:login})
        if(loginUser){
            req.flash('error_msg','El usuario ya existe')
            res.redirect('/users/create')
        }
        const NewUser = new user({login,password,firstname,lastname, rol:"admin"})
        NewUser.password = await  NewUser.encryptPassword(password)
        await NewUser.save(); 
        
        const server = new service({ip:"localhost", port:8182, name:"opc"});
        await server.save(); 

        req.flash('success_msg', 'Usuario creado satisfactoriamente!')
        console.log(NewUser);
        res.redirect('/users')
    }
});
//////////////////////////////////////////////////////////////////
/////////////////// API GENERAL DE USUARIOS //////////////////////
//////////////////////////////////////////////////////////////////

router.get('/api/users', async(req,res) => {           //ASYNC
    let users = await user.find().lean().sort({login: 'asc'});
    res.send(users)
});

module.exports = router;