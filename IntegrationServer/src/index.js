/* 
 *SECUROS INTEGRATION SERVER - MAIN MODULE
 *@Authors: 
 *			Alejandra Aguirre  - alejandra.aguirre@issivs.com
 *			Santiago Rondon    - santiago@ivsss.com
 *			Alejandro Garcia   - alejandro@issivs.com
 *Version 1.0 
 *SecurOS 10.9
 *
*/ 

const http = require('http')
const express = require('express')
const app = express();
const cors = require('cors');
app.use(cors());

const exphbs = require('express-handlebars')
const path = require('path')
const session = require('express-session')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const passport = require('passport')
const config = require('./config/opc')
const server = http.createServer(app);
const socketio = require('socket.io')(server)
const io = socketio.listen(server)

module.exports = socketio;

require('./database')
require('./config/passport')
require('./helpers/sockets')(io)



//settings
port = 3003;
app.set('views', path.join(__dirname,'view'));
app.engine('.hbs',exphbs({
    helpers: require('./helpers/handlebars').helpers,
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'),'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
}))


app.set('view engine','.hbs')



//middlewares
app.use(express.urlencoded({extended:false}))
app.use(methodOverride('_method'))
app.use(session({
    secret: 'key',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())
app.use(express.json());


//global variables
app.use((req,res,next) =>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error_msg = req.flash('error')
    if(req.user)
        res.locals.user = req.user || null
    next();
})
//routes
app.use(require('./routes/index'))
app.use(require('./routes/users'))
app.use(require('./routes/sensors'))
app.use(require('./routes/relays'))
app.use(require('./routes/servicesConfig'))

app.use(require('./routes/resources/restapi'))
app.use(require('./routes/resources/opc'))
app.use(require('./routes/resources/resources'))
//statics files


app.use(function (req, res, next) {
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // Website you wish to allow to connect
   // res.setHeader('Access-Control-Allow-Origin', '*:*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
   // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-auth-token');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use(express.static(__dirname + '/public'));
//server is listenning

app.use((req, res, next) => {
    res.status(404).render('page_not_found');
});

server.listen(port, function(){
    console.log(`SERVER Listening http://localhost:${port}`)
});