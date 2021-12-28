port = 3003;
var socket = io.connect();



 
socket.on('modified-resourse', function (data) {
    // console.log(data);
    renderResources(data);
});

async function renderResources(data){
    if(data.newOpcs){
        var newHtml = await data.newOpcs.map((resource) => {
            return(`
            <div class="col-md-6 mt-2">
                    <div class="card shadow rounded">
                        <div class="card-body">
                            <h4 class="card-title d-flex justify-content-between align-items-center">
                                <i class="fa fa-cogs" aria-hidden="true"></i> 
                                <a alt="Edit" class="link-light" href="/resources/opc/${resource._id}/monitor">OPC - ${resource.name} (${resource.methods ? Object.keys(resource.methods[0]).length  : 0}) </a> 
                                <a alt="Edit" class="link-light" href="/resources/opc/${resource._id}"><i class="fas fa-edit"></i></a>
                            </h4>
                            <p>${resource.url}</p>
                            <p>${resource.state}</p>
                            <h4 class="card-title d-flex justify-content-between align-items-center">

                            <form action="/resources/opc/${resource._id}?_method=DELETE" method="POST">
                                <input type="hidden" name="_method" value="DELETE">
                                <button class="btn btn-danger btn-sm" type="submit"><i class="fas fa-trash-alt"></i> 
                            </form> 

                            </button> <i class="fas fa-circle ${resource.state}"></i>
                            </h4>
                        </div>
                    </div>
            </div>`
            );
        }).join(" ");
    }

    if(document.getElementById('resources_container')){
        document.getElementById('resources_container').innerHTML= newHtml;
    }
}


socket.on('renderVariables', function (data) {
    // console.log("newVariables");
    // console.log(data);
    if(data){
        renderVariables(data);
    }
});


async function renderVariables(data){
    let obj = Object.keys(data.methods);
    //console.log(obj)
    var newHtml = await obj.map((key, index) =>{
          return(
            `
                <tr>
                    <th scope="row">${index}</th>
                    <td>${key}</td>
                    <td>${data.methods[key]}</td>
                </tr>
            `
          )
    }).join(" ");

        // console.log(newHtml);
        if(document.getElementById('resource_variables')){
            document.getElementById('resource_variables').innerHTML= newHtml;
        }
}


function monitorOpc (id){

    socket.emit("monitorOpc", id);
}

// --> this go to sockets.js
async function updatePriority (id, priority){
    socket.emit("updatePriority", id, priority);

}

// <--- this come back from sockets.js
socket.on('succesMessage', function (sensors) {
    
   document.getElementById('succes_message').className += " fade-in";

   setTimeout(() => {
    document.getElementById('succes_message').className = "succes_message";
   },1800)
});


// --> this go to sockets.js
async function sensorsSearch(value){
    socket.emit("sensorsSearch", value);
}

// <--- this come back from sockets.js
socket.on('renderSensors', function (sensors) {
    if(sensors){
        renderSensors(sensors);
    }
});

async function renderSensors(sensors){
    // console.log(sensors);
    var newHtml = await sensors.map((sensors, index) =>{
          return(
            `
            <tr class="table table-striped text-light ">
                <td class="pt-3">${sensors.id}</td>
                <td class="pt-3">${sensors.name}</td>
                
                <td class="w-25">
                <select required class="sensor-select form-select mb-1 "aria-label="Default select example" name="server_on">
                    <option selected > Seleccione una prioridad</option>
                    <option ${sensors.tp_name === "Alta" ? 'selected' : ''} class="sensor-option" id=${sensors.id} value="Alta">Alta</option>
                    <option ${sensors.tp_name === "Media" ? 'selected' : ''} class="sensor-option" id=${sensors.id} value="Media">Media</option>
                    <option ${sensors.tp_name === "Baja" ? 'selected' : ''} class="sensor-option" id=${sensors.id} value="Baja">Baja</option>
                </select>
                </td>
            </tr>
            `
          )
    }).join(" ");
        // console.log(newHtml);

        if(document.getElementById('tbody')){
            document.getElementById('tbody').innerHTML= newHtml;
        }
        handleEventSearch();
}