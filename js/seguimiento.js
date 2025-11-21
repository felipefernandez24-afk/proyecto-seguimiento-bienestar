const usuarioActual = localStorage.getItem("usuarioActual"); //verifica primero si hay un usuario logeado

if (!usuarioActual) {
    window.location.href = "login.html"; //si no hay, se devuelve a inicio
}

function getHabitosUsuario() {
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let usuario = bd[usuarioActual];
    if (!usuario || !usuario.habitos || !Array.isArray(usuario.habitos)) {
        return [];
    }
    return usuario.habitos;
}

//variables futuras para lo que van a ser las cards de libros
let categoria = document.querySelector("#selector");
let listaDeLibros = [];

//revisar estos
let cardFrente = document.querySelector(".flip-card-front");
let cardAtras = document.querySelector(".flip-card-back");

selector.addEventListener("change", mostrarLibros); //si llegsae a cambiar el valor del selector

function mostrarLibros(){
        let categoriaIngresada = categoria.value;
        if (categoriaIngresada === "Seleccionar Categoría") //por si elige la default
            return;
        listaDeLibros = []; //para limpiar la busqueda por si quier otra
        fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${categoriaIngresada}`)
        .then(response =>{
            if(!response.ok){
                throw new Error("ERROR. No se pudo cargar los datos correctamente.");
            }
            return response.json();
        })
        .then(data => {
            listaDeLibros = data.items || []; //por si pueden no haber libros y que quede undefined
            i = 0;
            cargarDatos();
        })
        .catch(error => {
            cardAtras.innerHTML = `<p style="text-align:center;"> Lo siento, hubo un error con la Api </p> `;
        });
}

function getFechaHoy() {
    const today = new Date();
    return `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;
}

function verificarSiCompletadoHoy(id, fechaHoy) {
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let usuario = bd[usuarioActual];
    if (!usuario.estadisticas || !usuario.estadisticas.registrosMensual) return false;
    return usuario.estadisticas.registrosMensual.some(r => r.fecha === fechaHoy && r.habitoId === id);
}

function cargarHabitos(habito) {
    const contenedor = document.querySelector("#lista-habitos");

    let habitosGuardados=getHabitosUsuario();
    const numero = habitosGuardados.findIndex(h => h.id === habito.id) + 1;

    const hoy = getFechaHoy();
    const yaCompletado = verificarSiCompletadoHoy(habito.id, hoy);

    const div = document.createElement("div"); 
    div.classList.add("d-flex", "flex-wrap", "justify-content-between", "align-items-center", "mb-3");

    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center w-100">
            <div class="d-flex align-items-center w-50">
                <span>${numero}.</span>
                <p class="w-100 ms-2 mb-0">${habito.nombre}</p>
                <span class="px-2 text-nowrap">Duración: ${habito.duracion} minutos</span>
            </div>

            <div>
                <button class="btn ${yaCompletado ? 'btn-success disabled' : 'btn-outline-success'} btn-listo">
                    ${yaCompletado ? 'Completado' : 'Listo'}
                </button>
            </div>
        </div>
    `;
    contenedor.appendChild(div);
    const hr = document.createElement("hr");
    contenedor.appendChild(hr);

    const btnListo = div.querySelector(".btn-listo"); // botón Listo
    if (!yaCompletado) {
        btnListo.addEventListener("click", function() {
            if(confirm(`¿Realmente ha completado este hábito?: \n"${habito.nombre} por ${habito.duracion} minutos"`)) {
                completarHabito(habito);
                btnListo.className = "btn btn-success disabled";
                btnListo.textContent = "Completado";
                btnListo.disabled = true;
            }
        });
    }
}

function completarHabito(habito) {
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let usuario = bd[usuarioActual];
    const fechaHoy = getFechaHoy();

    if (!usuario.estadisticas) usuario.estadisticas = {};
    if (!usuario.estadisticas.registrosMensual) usuario.estadisticas.registrosMensual = [];
    if (!usuario.estadisticas.globales) usuario.estadisticas.globales = { totalHabitosCompletados: 0 };

    const nuevoRegistro = {
        fecha: fechaHoy,
        habitoId: habito.id,
        habitoNombre: habito.nombre,
        fechaCreacion: habito.fechaCreacion,
        fechaTermino: habito.fechaTermino,
        habitoDuracion: habito.duracion,
        completado: true
    };

    usuario.estadisticas.registrosMensual.push(nuevoRegistro);
    usuario.estadisticas.globales.totalHabitosCompletados++;

    localStorage.setItem("usuariosTrackMe", JSON.stringify(bd));
    actualizarBarraProgreso();
}

function actualizarBarraProgreso() {
    let habitos = getHabitosUsuario();
    let totalHabitos = habitos.length;
    
    if (totalHabitos === 0) {
        actualizarHTMLBarra(0, 0);
        return;
    }

    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let registros = bd[usuarioActual]?.estadisticas?.registrosMensual || [];
    const hoy = getFechaHoy();

    let completadosHoy = habitos.filter(h => 
        registros.some(r => r.fecha === hoy && r.habitoId === h.id)
    ).length;

    actualizarHTMLBarra(totalHabitos, completadosHoy);
}

function actualizarHTMLBarra(total, completados) {
    const barra = document.querySelector(".progress-bar");
    const porcentaje = total === 0 ? 0 : Math.round((completados / total) * 100);

    barra.style.width = `${porcentaje}%`;
    barra.setAttribute("aria-valuenow", porcentaje);
    barra.textContent = `${completados}/${total}`;
    
    if (porcentaje === 100) {
        barra.classList.remove("bg-success");
        barra.classList.add("bg-primary");
    }
}

function renderizarListaCompleta() { //para que los numeros no fallen al borrar
    const contenedor = document.querySelector("#lista-habitos");
    contenedor.innerHTML = ""; 
    let habitosArray = getHabitosUsuario();
    
    if (habitosArray.length === 0) {
        contenedor.innerHTML = '<p class="text-center text-muted mt-3">No tienes hábitos activos para hoy.</p>';
    } else {
        habitosArray.forEach(function(elemento) {
            cargarHabitos(elemento);    
        });
    }
    actualizarBarraProgreso();
}

document.addEventListener("DOMContentLoaded", function(event)
{
    renderizarListaCompleta();

    const today=new Date();
    const fechaHoy=`${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;

    document.querySelector(".fecha-hoy").textContent=fechaHoy;
})