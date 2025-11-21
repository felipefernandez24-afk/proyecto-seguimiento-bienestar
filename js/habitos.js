const usuarioActual = localStorage.getItem("usuarioActual");

if (!usuarioActual) {
    window.location.href = "login.html";
}

function getHabitosUsuario() {
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let usuario = bd[usuarioActual];
    if (!usuario || !usuario.habitos || !Array.isArray(usuario.habitos)) {
        return [];
    }
    return usuario.habitos;
}

function setHabitosUsuario(lista) {
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    if (bd[usuarioActual]) {
        bd[usuarioActual].habitos = lista;
        localStorage.setItem("usuariosTrackMe", JSON.stringify(bd));
    }
}

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

document.addEventListener("DOMContentLoaded", function(event) { 
    renderizarListaCompleta(); // para evitar cosas como que los numeros no cambien al eliminar habitos, etc
    document.getElementById("btn-guardar-edicion").addEventListener("click", guardarEdicionDesdeModal); //para guardar desde el modal
})
function conversion(habitoFormData){ 
    let id = crypto.randomUUID();
    let nombre = habitoFormData.get("nombre-habito");
    let duracion = habitoFormData.get("duracion-diaria");
    let meta = habitoFormData.get("meta-habito");
    let dias = habitoFormData.getAll("dias"); 

    //para lo que son las fechas ** al momento de crear y al momento de terminar
    const today = new Date();
    const fechaCreacion = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const dateAfter30Days = new Date();
    dateAfter30Days.setDate(today.getDate() + Number(meta)); 
    const fechaTermino = `${String(dateAfter30Days.getDate()).padStart(2, '0')}/${String(dateAfter30Days.getMonth() + 1).padStart(2, '0')}/${dateAfter30Days.getFullYear()}`;

    return {
        "id" : id,
        "nombre" : nombre,
        "duracion" : duracion,
        "meta" : meta,
        "dias" : dias,
        "fechaCreacion" : fechaCreacion,
        "fechaTermino" : fechaTermino} 
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

    //validaciones para que escriba solo letras y solo numeros en el nombre, la duracion y la meta respectivamente
    if(!validacionSoloLetras(habito.nombre)){
        alert("El nombre del hábito solo puede tener letras");
        return false;
    }

    if(!validacionSoloNumeros(habito.duracion)){
        alert("La duración solo puede tener numeros");
        return false;
    }  

    if(!validacionSoloNumeros(habito.meta)){
        alert("la meta solo puede tener numeros");
        return false
    }

    return true;
}

function validacionSoloLetras(texto){ //funcion para validar  que solo tenga letras
    let permitidas = "abcdefhijklmnñopqrstuvwxyzáéíóú ";
    texto = texto.toLowerCase();

    for(let caracter of texto){ //si llegase a no tener alguna que retorne falso
        if(!permitidas.includes(caracter))
            return false;
    }
    return true;
}

function validacionSoloNumeros(texto){
    let numeros = "0123456789";
    for(let caracter of texto){
        if(!numeros.includes(caracter))
            return false;
    }
    return true;
}


function guardarLocalStorage(habito){
    let habitoArray = getHabitosUsuario(); //aggara del localstorage la info que tengo y las guarda en una variable
    
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
        setHabitosUsuario(habitoArray);
    }

    return true;
}

function insertarHabito(habito) {
    const contenedor = document.querySelector("#lista-habitos-creados .card-body");

    let habitosGuardados = getHabitosUsuario();
    const numero = habitosGuardados.findIndex(h => h.id === habito.id) + 1;

    const div = document.createElement("div"); 
    div.classList.add("d-flex", "flex-wrap", "justify-content-between", "align-items-center", "mb-3");

    div.innerHTML = `
        <span class="fs-5 me-2">${numero}.</span>
        <input type="text" class="form-control" style="width: 40%;" value="${habito.nombre}" disabled>
        <span class="text-muted mx-1">Duración: ${habito.duracion} min</span>
        <span class="text-muted mx-1">Meta: ${habito.duracion} dias</span>
        <div class="btn-group mt-2 mt-md-0">
            <button class="btn btn-outline-primary btn-modificar" data-bs-toggle="modal" data-bs-target="#modalEditarHabito">Modificar</button>
            <button class="btn btn-outline-danger btn-eliminar">Eliminar</button>
        </div>
    `;
    contenedor.appendChild(div);

    const hr = document.createElement("hr");
    contenedor.appendChild(hr);

    // botón Eliminar
    const btnEliminar = div.querySelector(".btn-eliminar");
    btnEliminar.addEventListener("click", function() {
        if(confirm(`¿Estás seguro de eliminar "${habito.nombre}"?`)) {
            eliminarHabito(habito.id);
        }
    });

    // Botón Modificar
    const btnModificar = div.querySelector(".btn-modificar");
    btnModificar.addEventListener("click", function() {
        cargarDatosAlModal(habito);
    });
}


function cargarDatosAlModal(habito) {
    document.getElementById("edit-id").value = habito.id;
    document.getElementById("edit-nombre").value = habito.nombre;
    document.getElementById("edit-duracion").value = habito.duracion;
    document.getElementById("edit-meta").value = habito.meta;

    document.querySelectorAll(".edit-dia").forEach(check => check.checked = false);

    habito.dias.forEach(dia => {
        let checkbox = document.querySelector(`.edit-dia[value="${dia}"]`);
        if(checkbox) {
            checkbox.checked = true;
        }
    });
}

function guardarEdicionDesdeModal() {
    const id = document.getElementById("edit-id").value;
    const nombre = document.getElementById("edit-nombre").value;
    const duracion = document.getElementById("edit-duracion").value;
    const meta = document.getElementById("edit-meta").value;
    
    const diasSeleccionados = [];
    document.querySelectorAll(".edit-dia:checked").forEach(check => {
        diasSeleccionados.push(check.value);
    });

    if (!nombre.trim() || !duracion.trim() || !meta.trim() || diasSeleccionados.length === 0) { //validacion por si el chistoso edita dejando todo vacio
        alert("Por favor completa todos los campos y selecciona al menos un día.");
        return;
    }

    if(!validacionSoloLetras(nombre)){
        alert("El nombre del hábito solo puede tener letras");
        return;
    }
    
    if(!validacionSoloNumeros(duracion)){
        alert("La duración solo puede tener numeros");
        return;
    }

    if (!validacionSoloNumeros(meta)){
        alert("La meta solo puede tener numeros");
        return;
    }

    const nuevosDatos = {
        nombre: nombre,
        duracion: duracion,
        meta: meta,
        dias: diasSeleccionados
    };

    actualizarHabito(id, nuevosDatos);

    // Cerrar modal
    const modalElement = document.getElementById('modalEditarHabito');
    const modalInstance = bootstrap.Modal.getInstance(modalElement); 
    modalInstance.hide();
}

function actualizarHabito(id, nuevosDatos) {
    let habitos = getHabitosUsuario();
    const indice = habitos.findIndex(h => h.id === id);

    if (indice !== -1) { //validacion validar todo siempre aaa
        habitos[indice].nombre = nuevosDatos.nombre;
        habitos[indice].duracion = nuevosDatos.duracion;
        habitos[indice].meta = nuevosDatos.meta;
        habitos[indice].dias = nuevosDatos.dias;

        setHabitosUsuario(habitos);
        renderizarListaCompleta();
    }
}

function eliminarHabito(id) {
    let habitos = getHabitosUsuario();
    let habitosActualizados = habitos.filter(h => h.id !== id);
    setHabitosUsuario(habitosActualizados);
    renderizarListaCompleta();
}

function renderizarListaCompleta() { //para que los numeros no fallen al borrar
    const contenedor = document.querySelector("#lista-habitos-creados .card-body");
    contenedor.innerHTML = ""; 
    let habitosArray = getHabitosUsuario();
    habitosArray.forEach(function(elemento) {
        insertarHabito(elemento);
    });
}