const form = document.getElementById("form-habitos");

form.addEventListener("submit", function(event) {
    event.preventDefault(); //evitamos que se recargue para que queden los datos
    let habitoFormData = new FormData(form); //habito va a ser un objeto formdata que viene del formulario de habitos
    let habito = conversion(habitoFormData);

    if(!validarHabito(habito)){
        return;
    }

    if(!guardarLocalStorage(habito)){
        return;
    }

    insertarHabito(habito) //le pasamos el objeto ya listaylor
    document.getElementById("vista-previa-titulo").textContent = habito.nombre; //modificar la parte de la vista previa al crear el habito
})

document.addEventListener("DOMContentLoaded", function(event) { //para que se muestren los datos ya mostrados en el localstorage
    let habitoArray = JSON.parse(localStorage.getItem("habitos"))
    habitoArray.forEach(
        function(elemento){
            insertarHabito(elemento)
        }
    )
})

//le psasmos form data y obtiene los datos que tenga
function conversion(habitoFormData){ 
    let nombre = habitoFormData.get("nombre-habito");
    let duracion = habitoFormData.get("duracion-diaria");
    let meta = habitoFormData.get("meta-habito");
    let dias = habitoFormData.getAll("dias"); //devuelve un getAll por ser varias opciones ["L" , "MA" "J" ]
    return {
        "nombre" : nombre,
        "duracion" : duracion,
        "meta" : meta,
        "dias" : dias } //me devuelve un objeto que tenga sus respectivas clave valor
}

function validarHabito(habito){ //funcion para validar que cumpla con las cosas
    if (!habito.nombre.trim()) {
        alert("El nombre del hábito no puede estar vacío");
        return false;
    }

    if (!habito.duracion.trim()) {
        alert("La duración no puede estar vacía");
        return false;
    }

    if (!habito.meta.trim()) {
        alert("La meta no puede estar vacía");
        return false;
    }

    if (habito.dias.length === 0) {
        alert("Debes seleccionar al menos un día para el hábito");
        return false;
    }

    return true;
}

function guardarLocalStorage(habito){
    let habitoArray = JSON.parse(localStorage.getItem("habitos")) || []; //aggara del localstorage la info que tengo y las guarda en una variable
    
    if (habitoArray.some(h => h.nombre.toLowerCase() === habito.nombre.toLowerCase())) {
        alert("Ese hábito ya existe.");
        return false;
    }

    if (habitoArray.length >= 10) {
        alert("Sólo puedes tener 10 hábitos al mismo tiempo");
        return false;
    }
    else{
        habitoArray.push(habito);
        //convierto mi array a un json
        let habitoArrayJSON = JSON.stringify(habitoArray);
        //haciendo setitem para guardarr en el local storage formato json
        localStorage.setItem("habitos", habitoArrayJSON);
    }

    return true;
}

function insertarHabito(habito) {
    const contenedor = document.querySelector("#lista-habitos-creados .card-body");

    let habitosGuardados = JSON.parse(localStorage.getItem("habitos")) || [];
    let numero = habitosGuardados.length; //para los indices

    const div = document.createElement("div"); //el div que se va agregar al igual que se tenia antes en el html
    div.classList.add("d-flex", "flex-wrap", "justify-content-between", "align-items-center", "mb-3");

    div.innerHTML = `
        <span class="fs-5 me-2">${numero}.</span>
        <input type="text" class="form-control" style="width: 40%;" value="${habito.nombre}" disabled>
        <span class="text-muted mx-3">Duración: ${habito.duracion}</span>
        <div class="btn-group mt-2 mt-md-0">
            <button class="btn btn-outline-primary btn-modificar">Modificar</button>
            <button class="btn btn-outline-danger btn-eliminar">Eliminar</button>
        </div>
    `;
    contenedor.appendChild(div);

    const hr = document.createElement("hr");
    contenedor.appendChild(hr);
}
