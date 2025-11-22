const usuarioActual = localStorage.getItem("usuarioActual"); //obtiene el usuario logeado actualmente (clave para segmentar la BD por usuario)

if (!usuarioActual) { //si no hay usuario, bloqueo de acceso directo vía URL
    window.location.href = "login.html"; //redirijo a login
}

function getHabitosUsuario() { //obtiene la lista de hábitos del usuario activo desde localStorage
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {}; //cargo toda la BD, aislada por usuarios
    let usuario = bd[usuarioActual]; //acceso a la “subtabla” del usuario actual
    if (!usuario || !usuario.habitos || !Array.isArray(usuario.habitos)) { //manejo defensivo: usuario sin hábitos o estructura corrupta
        return [];
    }
    return usuario.habitos;
}

function setHabitosUsuario(lista) { //actualiza la lista de hábitos del usuario activo
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {}; //levanto la BD
    if (bd[usuarioActual]) { //valido existencia del usuario para no generar basura
        bd[usuarioActual].habitos = lista; //actualizo solo esa parte
        localStorage.setItem("usuariosTrackMe", JSON.stringify(bd)); //persisto cambios
    }
}

const form = document.getElementById("form-habitos"); //formulario de creación

form.addEventListener("submit", function(event) {
    event.preventDefault(); //evita recarga y mantiene el estado actual de la página
    let habitoFormData = new FormData(form); //agarra todos los campos del formulario
    let habito = conversion(habitoFormData); //construyo un objeto habito con formato estándar

    if(!validarHabito(habito)){ //validación rápida antes de escribir
        return;
    }

    if(!guardarLocalStorage(habito)){ //evita duplicados, límite, etc.
        return;
    }

    insertarHabito(habito); //inserta visualmente el hábito recién creado
    document.getElementById("vista-previa-titulo").textContent = habito.nombre; //actualiza vista previa
})

document.addEventListener("DOMContentLoaded", function(event) { 
    renderizarListaCompleta(); //render inicial para mantener numeración y sincronización
    document.getElementById("btn-guardar-edicion").addEventListener("click", guardarEdicionDesdeModal); //botón del modal de edición
})

function conversion(habitoFormData){ //convierte los datos crudos del form en objeto habito con sus fechas calculadas
    let id = crypto.randomUUID(); //id único, clave para edición/eliminación
    let nombre = habitoFormData.get("nombre-habito");
    let duracion = habitoFormData.get("duracion-diaria");
    let meta = habitoFormData.get("meta-habito");
    let dias = habitoFormData.getAll("dias"); //array de días seleccionados

    //para lo que son las fechas ** al momento de crear y al momento de terminar
    const today = new Date();
    const fechaCreacion = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`; //fecha estandarizada dd/mm/yyyy

    //cálculo de fecha de término basado en días activos + meta
    const mapDias = {"L": 1, "MA": 2, "MI": 3, "J": 4, "V": 5, "S": 6, "D": 0}; //adaptado a lun=0 y dom=6
    const diasSeleccionados = dias.map(d => mapDias[d]); //normalizo los días al formato JS
    let calcularFecha = new Date(today); //cursor de fecha
    let diasContados = 0;
    let metaNum = Number(meta);

    while (diasContados < metaNum) { //avanzo solo por días elegidos hasta llegar a la meta
        if (diasSeleccionados.includes(calcularFecha.getDay())) {
            diasContados++;
        }
        if (diasContados < metaNum) {
            calcularFecha.setDate(calcularFecha.getDate() + 1); //salto día a día
        }
    }

    const fechaTermino = `${String(calcularFecha.getDate()).padStart(2, '0')}/${String(calcularFecha.getMonth() + 1).padStart(2, '0')}/${calcularFecha.getFullYear()}`; //formato final

    return {
        "id" : id,
        "nombre" : nombre,
        "duracion" : duracion,
        "meta" : meta,
        "dias" : dias,
        "fechaCreacion" : fechaCreacion,
        "fechaTermino" : fechaTermino
    };
}

function validarHabito(habito){ //validaciones mínimas antes de guardar
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

    if (habito.dias.length === 0) { //impide hábitos sin días activos
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
    let habitoArray = getHabitosUsuario(); //cargo la lista actual

    if (habitoArray.some(h => h.nombre.toLowerCase() === habito.nombre.toLowerCase())) { //evito duplicados por nombre
        alert("Ese hábito ya existe.");
        return false;
    }

    if (habitoArray.length >= 10) { //límite de hábitos por usuario
        if (typeof desbloquearLogroPorAccion === 'function') desbloquearLogroPorAccion("ambicioso"); //logro 
        alert("Sólo puedes tener 10 hábitos al mismo tiempo");
        return false;
    }
    else{
        habitoArray.push(habito); //agrego
        setHabitosUsuario(habitoArray); //persisto
    }

    return true;
}

function insertarHabito(habito) { //inserta un hábito visual en la lista
    const contenedor = document.querySelector("#lista-habitos-creados .card-body");

    let habitosGuardados = getHabitosUsuario();
    const numero = habitosGuardados.findIndex(h => h.id === habito.id) + 1; //numeración dinámica

    const div = document.createElement("div"); //estructura del item
    div.classList.add("d-flex", "flex-wrap", "justify-content-between", "align-items-center", "mb-3");

    div.innerHTML = `
        <span class="fs-5 me-2">${numero}.</span>
        <input type="text" class="form-control" style="width: 40%;" value="${habito.nombre}" disabled>
        <span class="text-muted mx-3">Duración: ${habito.duracion} minutos</span>
        <div class="btn-group mt-2 mt-md-0">
            <button class="btn btn-outline-primary btn-modificar" data-bs-toggle="modal" data-bs-target="#modalEditarHabito">Modificar</button>
            <button class="btn btn-outline-danger btn-eliminar">Eliminar</button>
        </div>
    `;
    contenedor.appendChild(div);

    const hr = document.createElement("hr"); //separador visual
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
        cargarDatosAlModal(habito); //abre modal con datos cargados
    });
}

function cargarDatosAlModal(habito) { //carga los datos del hábito al modal de edición
    document.getElementById("edit-id").value = habito.id;
    document.getElementById("edit-nombre").value = habito.nombre;
    document.getElementById("edit-duracion").value = habito.duracion;
    document.getElementById("edit-meta").value = habito.meta;

    document.querySelectorAll(".edit-dia").forEach(check => check.checked = false); //reseteo

    habito.dias.forEach(dia => { //marco los días del hábito actual
        let checkbox = document.querySelector(`.edit-dia[value="${dia}"]`);
        if(checkbox) {
            checkbox.checked = true;
        }
    });
}

function guardarEdicionDesdeModal() { //procesa cambios desde el modal
    const id = document.getElementById("edit-id").value;
    const nombre = document.getElementById("edit-nombre").value;
    const duracion = document.getElementById("edit-duracion").value;
    const meta = document.getElementById("edit-meta").value;
    
    const diasSeleccionados = [];
    document.querySelectorAll(".edit-dia:checked").forEach(check => {
        diasSeleccionados.push(check.value);
    });

    if (!nombre.trim() || !duracion.trim() || !meta.trim() || diasSeleccionados.length === 0) { //evita edición "vacía"
        alert("Por favor completa todos los campos y selecciona al menos un día.\nTambién asegurese de que los valores sean correctos (Meta y duración deben ser números)");
        return;
    }

    const nuevosDatos = { //paquete de actualización
        nombre: nombre,
        duracion: duracion,
        meta: meta,
        dias: diasSeleccionados
    };

    actualizarHabito(id, nuevosDatos);
    if (typeof desbloquearLogroPorAccion === 'function') desbloquearLogroPorAccion("modificar"); //logro
    // Cerrar modal
    const modalElement = document.getElementById('modalEditarHabito');
    const modalInstance = bootstrap.Modal.getInstance(modalElement); 
    modalInstance.hide();
}

function actualizarHabito(id, nuevosDatos) { //aplica cambios al hábito en la BD
    let habitos = getHabitosUsuario();
    const indice = habitos.findIndex(h => h.id === id);

    if (indice !== -1) { //solo actualizo si existe
        habitos[indice].nombre = nuevosDatos.nombre;
        habitos[indice].duracion = nuevosDatos.duracion;
        habitos[indice].meta = nuevosDatos.meta;
        habitos[indice].dias = nuevosDatos.dias;

        setHabitosUsuario(habitos); //persisto cambios
        renderizarListaCompleta(); //refresca numeración y vista
    }
}

function eliminarHabito(id) { //borra un hábito del usuario y actualiza estadística asociada
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let usuario = bd[usuarioActual];

    if (usuario) {
        //setea fechaTermino en los registros pasados antes del borrado
        if (usuario.estadisticas && usuario.estadisticas.registrosMensual) {
            const today = new Date();
            const fechaHoy = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
            
            usuario.estadisticas.registrosMensual.forEach(r => {
                if (r.habitoId === id) {
                    r.fechaTermino = fechaHoy; //marcado de cierre
                }
            });
        }

        //eliminación física del hábito
        if (usuario.habitos) {
            usuario.habitos = usuario.habitos.filter(h => h.id !== id);
        }

        localStorage.setItem("usuariosTrackMe", JSON.stringify(bd)); //persisto cambios
        if (typeof desbloquearLogroPorAccion === 'function') desbloquearLogroPorAccion("eliminar"); //logro
        renderizarListaCompleta(); //actualiza vista
    }
}

function renderizarListaCompleta() { //re-render para mantener numeración y orden correcto
    const contenedor = document.querySelector("#lista-habitos-creados .card-body");
    contenedor.innerHTML = ""; //limpio la vista
    let habitosArray = getHabitosUsuario(); //cargo hábitos actualizados
    habitosArray.forEach(function(elemento) { //vuelvo a renderizar uno por uno
        insertarHabito(elemento);
    });
}
