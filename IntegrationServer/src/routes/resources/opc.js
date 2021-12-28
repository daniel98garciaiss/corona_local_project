const express = require('express');
const { connect } = require('mongoose');
const Opc = require('../../models/opc')
const router = express.Router();
const passport = require('passport')
const {isAuthenticated, isAdmin} = require('../../helpers/auth')



const opcDriver = require('../../drivers/opc')


var startOpcRead = true;

if(startOpcRead) {
    setTimeout(opcDriver.start, 20000);
    startOpcRead = false;
    console.log(startOpcRead+"iniciando lectura opc")
}

router.get('/resource/create/opc', (req,res) => {
    res.render('create_resource');
});

////////////////////////////////////////////////////////////
///////////////////////// VISTAS ///////////////////////////
////////////////////////////////////////////////////////////

/////////////////// GET - CREAR OPC //////////////////////
router.get('/resources/opc',[isAuthenticated, isAdmin], (req,res) => {           
    res.render('create_opc')
});

router.post('/resources/opc/test', (req,res) => {           
   
    opcDriver.test();
    
    res.redirect('/resources')
});

/////////////////// GET - EDITAR OPC //////////////////////
router.get('/resources/opc/:id',isAuthenticated, async (req,res) => {           //ASYNC
    let opc = await Opc.findById(req.params.id).lean();
    res.render('edit_opc',{opc})
});
/////////////////// GET - MONITOR OPC //////////////////////
router.get('/resources/opc/:id/monitor',isAuthenticated, async (req,res) =>{
    let opc = await Opc.findById(req.params.id).lean();
    res.render('monitor_opc',{opc})
});

////////////////////////////////////////////////////////////
///////////////////////// METODOS //////////////////////////
////////////////////////////////////////////////////////////

/////////////////// POST - CREAR OPC //////////////////////
router.post('/resources/opc',[isAuthenticated, isAdmin], async (req,res) => {           //ASYNC
    const {name,url} = req.body
    const errors = []
    console.log(req.body);
    
    if(name==''){
        errors.push( {text:'Por favor inserte un Nombre para el recurso'})
       }
    if(url==''){
        errors.push({text:'Por favor inserte una url'})
    }
   
    if(errors.length>0)   
        res.render('create_opc',{errors,name,url})
    else{ 
        const checkopc = await Opc.findOne({url})
        if(checkopc){
            req.flash('error_msg','El servidor OPC ya existe')
            res.redirect('/resources')
        }
        const opc = new Opc({name,url})
        await opc.save();      
        req.flash('success_msg', 'Servidor OPC creado satisfactoriamente!')
        opcDriver.add(opc._id);
        res.redirect('/resources')
    }
});
/////////////////// PUT - EDITAR OPC //////////////////////
router.put('/resources/opc/:id',isAuthenticated, async (req,res) =>{
    const errors = [];
    let {name,url} = req.body;
 
    if(name==''){
        errors.push( {text:'Por favor inserte un Login'})
        res.redirect('/resources')
    }
    if(url==''){
        errors.push( {text:'Por favor inserte una direccion URL valida'})
        res.redirect('/resources')
    }
    else{ 
        await Opc.findByIdAndUpdate(req.params.id,{name,url});
        req.flash('success_msg', 'Servidor OPC editado satisfactoriamente!')
        opcDriver.add(req.params.id);
        res.redirect('/resources')
    }
});

/////////////////// DELETE - ELIMINAR OPC //////////////////////
router.delete('/resources/opc/:id',[isAuthenticated, isAdmin], async (req,res) =>{
    await Opc.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Servidor OPC eliminado satisfactoriamente!')
    res.redirect('/resources')
});

////////////////////////////////////////////////////////////
///////////////////////// API //////////////////////////////
////////////////////////////////////////////////////////////

router.get('/api/opc', async (req,res) =>{
    let opc = await Opc.find().lean();
    res.send(opc)
});

router.get('/api/opc/:id', async (req,res) =>{
    let _id =req.params.id
    let opc = await Opc.findOne({_id}).lean();
    res.send(opc)
});
router.get('/api/opc/:id/methods/', async (req,res) =>{
    let _id =req.params.id
    let opc = await Opc.findOne({_id}).lean();
    res.send(opc.methods)
});
router.get('/api/opc/:id/methods/:name', async (req,res) =>{
    let _id =req.params.id
    let opc = await Opc.findOne({_id}).lean();
    let name = req.params.name;
    res.send(opc.methods.name)
});

module.exports = router;