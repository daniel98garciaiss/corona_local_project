var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
     name:'SecurOS - Alarmnet Integration Module 10.x',
     description: 'SecurOS Plugin to Integrate Alarmnet Module',
     script: 'index.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('uninstall',function(){
	 console.log("Removing Service...")
     svc.stop();
});

svc.uninstall();