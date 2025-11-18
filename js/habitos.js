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

    const today = new Date();
    const fechaCreacion = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const dateAfter30Days = new Date();
    dateAfter30Days.setDate(today.getDate() + meta); 
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
        let habitoArrayJSON = JSON.stringify(habitoArray);
        localStorage.setItem("habitos", habitoArrayJSON);
    }

    return true;
}

function insertarHabito(habito) {
    const contenedor = document.querySelector("#lista-habitos-creados .card-body");

    let habitosGuardados = JSON.parse(localStorage.getItem("habitos")) || [];
    const numero = habitosGuardados.findIndex(h => h.id === habito.id) + 1;

    const div = document.createElement("div"); 
    div.classList.add("d-flex", "flex-wrap", "justify-content-between", "align-items-center", "mb-3");

    div.innerHTML = `
        <span class="fs-5 me-2">${numero}.</span>
        <input type="text" class="form-control" style="width: 40%;" value="${habito.nombre}" disabled>
        <span class="text-muted mx-3">Duración: ${habito.duracion}</span>
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
    let habitos = JSON.parse(localStorage.getItem("habitos")) || [];
    const indice = habitos.findIndex(h => h.id === id);

    if (indice !== -1) { //validacion validar todo siempre aaa
        habitos[indice].nombre = nuevosDatos.nombre;
        habitos[indice].duracion = nuevosDatos.duracion;
        habitos[indice].meta = nuevosDatos.meta;
        habitos[indice].dias = nuevosDatos.dias;

        localStorage.setItem("habitos", JSON.stringify(habitos));
        renderizarListaCompleta();
    }
}

function eliminarHabito(id) {
    let habitos = JSON.parse(localStorage.getItem("habitos")) || [];
    let habitosActualizados = habitos.filter(h => h.id !== id);
    localStorage.setItem("habitos", JSON.stringify(habitosActualizados));
    renderizarListaCompleta();
}

function renderizarListaCompleta() { //para que los numeros no fallen al borrar
    const contenedor = document.querySelector("#lista-habitos-creados .card-body");
    contenedor.innerHTML = ""; 
    let habitosArray = JSON.parse(localStorage.getItem("habitos")) || [];
    habitosArray.forEach(function(elemento) {
        insertarHabito(elemento);
    });
}