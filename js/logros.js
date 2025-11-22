/* logros.js - Sistema de Gamificación TrackMe (Con Cola de Notificaciones) */

const listaLogros = [
    // por habitos completados
    { id: "total_1", titulo: "Primer Paso", descripcion: "Completa tu primer hábito.", icono: "🌱", condicion: (stats) => stats.totalCompletados >= 1 },
    { id: "total_5", titulo: "Buen Comienzo", descripcion: "Completa 5 hábitos en total.", icono: "🖐️", condicion: (stats) => stats.totalCompletados >= 5 },
    { id: "total_10", titulo: "Tomando Ritmo", descripcion: "Completa 10 hábitos en total.", icono: "🚴", condicion: (stats) => stats.totalCompletados >= 10 },
    { id: "total_25", titulo: "Constancia Pura", descripcion: "Completa 25 hábitos en total.", icono: "🥈", condicion: (stats) => stats.totalCompletados >= 25 },
    { id: "total_100", titulo: "Maestro de Hábitos", descripcion: "¡100 hábitos completados! Eres una leyenda.", icono: "👑", condicion: (stats) => stats.totalCompletados >= 100 },

    //por rachas
    { id: "racha_2", titulo: "Calentando", descripcion: "Racha de 2 días seguidos.", icono: "🕯️", condicion: (stats) => stats.mejorRacha >= 2 },
    { id: "racha_3", titulo: "En Llamas", descripcion: "Racha de 3 días seguidos.", icono: "🔥", condicion: (stats) => stats.mejorRacha >= 3 },
    { id: "racha_5", titulo: "Incinerado", descripcion: "Racha de 5 días seguidos.", icono: "🔥🔥🔥", condicion: (stats) => stats.mejorRacha >= 5 },
    { id: "racha_10", titulo: "Invencible", descripcion: "Racha de 10 días seguidos.", icono: "../img/logro_racha_10.png", condicion: (stats) => stats.mejorRacha >= 10 },

    //cuantos habitos hay a la vez
    { id: "activos_3", titulo: "Organizado", descripcion: "Ten 3 hábitos activos al mismo tiempo.", icono: "📂", condicion: (stats, habitos) => habitos.length >= 3 },
    { id: "activos_5", titulo: '"Puedo hacer 5 cosas a la vez 🤓"', descripcion: "Ten 5 hábitos activos al mismo tiempo.", icono: "🤓", condicion: (stats,habitos) => habitos.length >= 5 },
    { id: "activos_10", titulo: "Persona ocupada", descripcion: "Ten 10 hábitos activos al mismo tiempo.", icono: "📅", condicion: (stats, habitos) => habitos.length >= 10 },

    // acciones especificas
    { id: "dia_perfecto", titulo: "Día Perfecto", descripcion: "Completaste TODOS tus hábitos de hoy.", icono: "✨", condicion: () => false },
    { id: "modificar", titulo: "Mejora Continua", descripcion: "Modificaste un hábito para adaptarlo mejor.", icono: "🔧", condicion: () => false },
    { id: "eliminar", titulo: "Soltar y Avanzar", descripcion: "Eliminaste un hábito. A veces es necesario...", icono: "🗑️", condicion: () => false },
    { id: "ambicioso", titulo: "Oye, tranquilo viejo", descripcion: "Intentaste exceder los límites...", icono: "../img/logro_ambicioso.png", condicion: () => false }
];

let colaModales = [];  //para evitar bug de que al desbloquear 2 logros a la vez se rompe todo
let modalActivo = false;   // flag que indica si hay un modal (logro desbloquedo) en pantalla

// para estadisticas
function verificarDesbloqueoLogros() {
    const usuarioActual = localStorage.getItem("usuarioActual");
    if (!usuarioActual) return;

    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let usuario = bd[usuarioActual];

    if (!usuario.logros) usuario.logros=[]; //si no existe la variable para guardar logros se crea una

    const stats = {
        totalCompletados: usuario.estadisticas?.globales?.totalHabitosCompletados || 0, //por si alguna razon falla la validacion de usuario, se hace otra
        mejorRacha: usuario.estadisticas?.globales?.mayorRacha || 0
    };
    const habitos = usuario.habitos || [];

    let huboNuevosLogros = false; //flag para mostrar logro, false por defecto

    listaLogros.forEach(logro => {
        if (logro.condicion(stats, habitos) && !usuario.logros.includes(logro.id)) { // Verificamos condición Y que no lo tenga ya
            usuario.logros.push(logro.id);
            
            agregarAColaGlobal( //agregar logro a la cola, por correcion de error si se desbloquean 2+ logros a la vez
                "¡LOGRO DESBLOQUEADO!", 
                logro.titulo, 
                logro.descripcion, 
                logro.icono, 
                "warning"
            );
            
            huboNuevosLogros = true; //como hay un logro nuevo, se activa la flag
        }
    });

    if (huboNuevosLogros) {
        localStorage.setItem("usuariosTrackMe", JSON.stringify(bd));
        if (document.getElementById("contenedor-logros-visual"))
            renderizarLogros();
    }
}
//logros por acciones
function desbloquearLogroPorAccion(idLogro) { //idLogro se pasa especificamente por cada llamado de la funcion, por cada "accion" jeje
    const usuarioActual = localStorage.getItem("usuarioActual");
    if (!usuarioActual) return;

    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let usuario = bd[usuarioActual];

    if (!usuario.logros) usuario.logros = [];

    if (!usuario.logros.includes(idLogro)) { //pregunta si no tiene el logro del id 
        usuario.logros.push(idLogro); //lo agrega
        
        const logroData = listaLogros.find(l => l.id === idLogro); //y saca la info del nuevo logro conseguido
        if (logroData) {
             agregarAColaGlobal(
                "¡LOGRO DESBLOQUEADO!", 
                logroData.titulo, 
                logroData.descripcion, 
                logroData.icono, 
                "warning"
            );
        }

        localStorage.setItem("usuariosTrackMe", JSON.stringify(bd));
    }
}

//esta es la función pública que llamamos desde cualquier parte
//no muestra el modal, solo lo forma en la fila
function agregarAColaGlobal(subtitulo, titulo, mensaje, icono, tipo = 'primary') {
    colaModales.push({ subtitulo, titulo, mensaje, icono, tipo }); //agregamos los datos al final del array
    procesarColaModales(); //intentamos procesar la cola (si no hay nada mostrándose, arrancará)
}

// función interna que gestiona el flujo
function procesarColaModales() {
    if (modalActivo || colaModales.length === 0) return; // si ya hay un modal en pantalla o la cola está vacía, no hacemos nada
    const siguiente = colaModales.shift(); // tomamos el primer elemento de la cola y lo quitamos de la lista
    desplegarModalLogro(siguiente); // Lo mostramos
}

// funcion que manipula el DOM
function desplegarModalLogro(data) {
    modalActivo = true; // bloqueamos la cola (evita mostrar más de 1 modal)

    if (!document.getElementById('modal-logro')) { // preguntar si existe el modal (se crea más adelante en el código, pero se llama antes)
        crearModalEnDOM();
    }

    // referenciar elementos
    const modalEl = document.getElementById('modal-logro');
    const modalIcono = document.getElementById('modal-logro-icono');
    const modalSubtitulo = document.getElementById('modal-logro-subtitulo');
    const modalTitulo = document.getElementById('modal-logro-titulo');
    const modalMensaje = document.getElementById('modal-logro-mensaje');
    const modalHeader = document.querySelector('#modal-logro .modal-header');
    const modalBtn = document.querySelector('#modal-logro .btn-cerrar-modal');

    // verificamos si el icono es un emoji
    let iconoHTML = "";
    if (data.icono.startsWith("../")) {
        // Si es una imagen lo tratamos como una imagen
        iconoHTML = `<img src="${data.icono}" alt="Icono" style="width: 64px; height: 64px; object-fit: contain;" class="mb-3 w-100">`;
    } else {
        // Si es un emoji lo mostramos como un emoji
        iconoHTML = `<span style="font-size: 64px;" class="mb-3 w-100">${data.icono}</span>`;
    }

    // llenar datos
    modalIcono.innerHTML = iconoHTML;
    modalSubtitulo.textContent = data.subtitulo;
    modalTitulo.textContent = data.titulo;
    modalMensaje.textContent = data.mensaje;

    // estilos
    modalHeader.className = `modal-header bg-${data.tipo} text-white justify-content-center`;
    modalBtn.className = `btn btn-${data.tipo} btn-cerrar-modal`;
    if(data.tipo === 'warning') {
        modalHeader.classList.add('text-dark');
        modalHeader.classList.remove('text-white');
    }

    // mostrar modal
    const bootstrapModal = new bootstrap.Modal(modalEl);
    bootstrapModal.show();
}

// funcion para inyectar el modal en el dom antes del cierre de main

function crearModalEnDOM() {
    const modalHTML = `
    <div class="modal fade" id="modal-logro" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content text-center shadow-lg border-0 rounded-4 overflow-hidden">
                <div class="modal-header justify-content-center py-4">
                    <div class="d-flex flex-column align-items-center">
                        <span id="modal-logro-icono" style="font-size: 3rem;"></span>
                        <h6 class="text-uppercase fw-bold mt-2 mb-0 ls-2" id="modal-logro-subtitulo" style="letter-spacing: 2px;">NOTIFICACIÓN</h6>
                    </div>
                </div>
                <div class="modal-body p-4">
                    <h3 class="fw-bold mb-3" id="modal-logro-titulo">Título</h3>
                    <p class="text-muted mb-0 fs-5" id="modal-logro-mensaje">Mensaje...</p>
                </div>
                <div class="modal-footer border-0 justify-content-center pb-4">
                    <button type="button" class="btn px-5 py-2 fw-bold rounded-pill btn-cerrar-modal" data-bs-dismiss="modal">¡Genial!</button>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // esuchar cuando se cierra el modal
    const modalEl = document.getElementById('modal-logro');
    modalEl.addEventListener('hidden.bs.modal', function () {
        modalActivo = false; // liberamos el bloqueo
        // pausa 300ms para que sea agradable visualmente y llamamos al siguiente
        setTimeout(procesarColaModales, 300);
    });
}

// renderizar logros en html (estadisticas.html)
// como los logros están guardados en logros.js (aquí), se intectan a un div vacio
function renderizarLogros() {
    const contenedor = document.getElementById("contenedor-logros-visual");
    if (!contenedor) return;

    const usuarioActual = localStorage.getItem("usuarioActual");
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let usuario = bd[usuarioActual];
    const misLogros = usuario ? (usuario.logros || []) : []; 

    contenedor.innerHTML = "";

    listaLogros.forEach(logro => {
        const estaDesbloqueado = misLogros.includes(logro.id); // Para cambiar aspecto del logro si está desbloqueado o no
        const opacidad = estaDesbloqueado ? "1" : "0.5";
        const escala = estaDesbloqueado ? "transform: scale(1.02);" : "filter: grayscale(100%);"; 
        const icono = estaDesbloqueado ? logro.icono : "🔒"; // Si no está desbloqueado, mostrar candado

        // verificamos si el icono es un emoji
        let iconoHTML = "";
        if (icono.startsWith("../")) {
            // si es una imagen lo tratamos como una imagen
            iconoHTML = `<img src="${icono}" alt="Icono" style="width: 64px; height: 64px; object-fit: contain;" class="mb-3 w-100">`;
        } else {
            // si es un emoji lo mostramos directamente
            iconoHTML = `<span style="font-size: 64px;" class="mb-3 w-100">${icono}</span>`;
        }
        const html = `
            <div class="col-md-6 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm" style="opacity: ${opacidad}; ${escala} transition: all 0.3s;">
                    <div class="card-body d-flex flex-column justify-content-center align-items-center text-center">
                        ${iconoHTML}
                        <h5 class="card-title">${logro.titulo}</h5>
                        <p class="card-text small text-muted">${logro.descripcion}</p>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += html;
    });
}


document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById("contenedor-logros-visual")) renderizarLogros();
});