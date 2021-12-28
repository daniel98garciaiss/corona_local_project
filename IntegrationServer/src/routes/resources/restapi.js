const express = require('express');
const { connect } = require('mongoose');
const router = express.Router();
const Restapi = require('../../models/restapi')
const passport = require('passport')

const {isAuthenticated} = require('../../helpers/auth')



router.get('/resources/securosapi', (req,res) => {           //ASYNC
    res.render('create_securos_restapi')
});

router.post('/resources/securosapi', async (req,res) => {           //ASYNC
    const {name,url,login,password} = req.body
    const errors = []
    console.log(req.body);
    
    if(name==''){
        errors.push( {text:'Por favor inserte un Nombre para el restapi'})
       }
    if(url==''){
        errors.push({text:'Por favor inserte una url'})
    }
    if(login==''){
        errors.push({text:'Por favor inserte un login'})
    }
    if(password==''){
        errors.push({text:'Por favor inserte una Contraseña'})
    }
    if(errors.length>0)   
        res.render('create_securos_restapi',{errors,name,url,login,password})

    else{ 
        const checksecurosAPI = await Restapi.findOne({url})
        if(checksecurosAPI){url
            req.flash('error_msg','El usuario ya existe')
            res.redirect('/resources')
        }
        const securosAPI = new Restapi({name,url,login,password})
        await securosAPI.save();      
        req.flash('success_msg', 'RestAPI creado satisfactoriamente!')
        console.log(securosAPI);
        res.redirect('/resources')
    }
});


module.exports = router;