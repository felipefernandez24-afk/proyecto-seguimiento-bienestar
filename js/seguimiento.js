const usuarioActual = localStorage.getItem("usuarioActual"); //obtiene la cuenta activa del navegador

if (!usuarioActual) {
    window.location.href = "login.html"; //si no existe usuario, redirige a login; evita acceso sin sesión
}

function getHabitosUsuario() {
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let usuario = bd[usuarioActual]; //extrae datos del usuario actual
    if (!usuario || !usuario.habitos || !Array.isArray(usuario.habitos)) {
        return []; //si algo no existe o está corrupto, entrega lista vacía para no romper el flujo
    }
    return usuario.habitos; //retorna solo el array de hábitos del usuario
}

//variables futuras para lo que van a ser las cards de libros
let categoria = document.querySelector("#selector");
let listaDeLibros = [];

//revisar estos
let cardFrente = document.querySelector(".flip-card-front");
let cardAtras = document.querySelector(".flip-card-back");

if(categoria) {
    selector.addEventListener("change", mostrarLibros); //si llegsae a cambiar el valor del selector
}

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
            // cargarDatos(); // Asegúrate de tener esta función definida si la usas
        })
        .catch(error => {
            if(cardAtras) cardAtras.innerHTML = `<p style="text-align:center;"> Lo siento, hubo un error con la Api </p> `;
        });
}

function getFechaHoy() {
    const today = new Date(); //instancia la fecha actual
    return `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`; //formato dd/mm/yyyy consistente con tu estructura de registros
}

// Helper para parsear fechas dd/mm/yyyy a objetos Date (00:00:00)
function parseFecha(fechaStr) {
    if(!fechaStr) return new Date();
    const [dia, mes, anio] = fechaStr.split('/').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    fecha.setHours(0,0,0,0);
    return fecha;
}

function verificarSiCompletadoHoy(id, fechaHoy) {
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let usuario = bd[usuarioActual];
    if (!usuario.estadisticas || !usuario.estadisticas.registrosMensual) return false; //si no hay estadísticas, no ha completado nada
    return usuario.estadisticas.registrosMensual.some(r => r.fecha === fechaHoy && r.habitoId === id); 
    //verifica si existe un registro para ese hábito en la fecha de hoy
}

function cargarHabitos(habito) {
    const contenedor = document.querySelector("#lista-habitos"); //zona donde se insertan los hábitos renderizados

    let habitosGuardados=getHabitosUsuario(); //lista total del usuario
    const numero = habitosGuardados.findIndex(h => h.id === habito.id) + 1; //calcula el índice visual del hábito

    const hoy = getFechaHoy(); //fecha actual en formato dd/mm/yyyy
    const yaCompletado = verificarSiCompletadoHoy(habito.id, hoy); //determina si ya fue marcado listo hoy

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

    const btnListo = div.querySelector(".btn-listo"); //botón del hábito
    if (!yaCompletado) {
        btnListo.addEventListener("click", function() {
            if(confirm(`¿Realmente ha completado este hábito?: \n"${habito.nombre} por ${habito.duracion} minutos"`)) {
                completarHabito(habito); //registra en BD
                btnListo.className = "btn btn-success disabled"; //deshabilita visualmente
                btnListo.textContent = "Completado";
                btnListo.disabled = true; //anula interacción
            }
        });
    }
}

function completarHabito(habito) {
    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {}; 
    let usuario = bd[usuarioActual]; //usuario activo
    const fechaHoy = getFechaHoy(); //fecha de registro ("dd/mm/yyyy")

    if (!usuario.estadisticas) usuario.estadisticas = {}; //estructura base si falta
    if (!usuario.estadisticas.registrosMensual) usuario.estadisticas.registrosMensual = []; //mensual por hábito
    if (!usuario.estadisticas.globales) usuario.estadisticas.globales = { totalHabitosCompletados: 0 }; //conteo general

    const nuevoRegistro = {
        fecha: fechaHoy,
        habitoId: habito.id,
        habitoNombre: habito.nombre, //Snapshot: nombre por si se borra el original
        fechaCreacion: habito.fechaCreacion, //Snapshot: fechas para reconstrucción de historial
        fechaTermino: habito.fechaTermino,
        habitoDuracion: habito.duracion,
        completado: true
    }; //estructura con datos completos para independencia del registro

    usuario.estadisticas.registrosMensual.push(nuevoRegistro); // agrega registro del día
    usuario.estadisticas.globales.totalHabitosCompletados++; //acumula métrica global
    
    //para calcular total de veces completado (incluyendo el de hoy)
    const totalCompletadosH = usuario.estadisticas.registrosMensual.filter(r => r.habitoId === habito.id).length;
    const meta = parseInt(habito.meta);

    //comparar fechas (hoy vs fechaTermino)
    const fechaHoyObj = parseFecha(fechaHoy);
    const fechaTerminoObj = parseFecha(habito.fechaTermino);

    //si alcanzó la meta numérica o la fecha de fechaTermino es hoy o ya pasó
    if (totalCompletadosH >= meta || fechaHoyObj >= fechaTerminoObj) {
        // Borrar de la lista de hábitos activos
        usuario.habitos = usuario.habitos.filter(h => h.id !== habito.id);
        alert(`¡Felicidades! Has completado el ciclo de tu hábito "${habito.nombre}".`); //dar un mensaje para notificar la buena noticia 
    
    }

    localStorage.setItem("usuariosTrackMe", JSON.stringify(bd)); //guarda cambios
    renderizarListaCompleta(); //refresca ui
}

function actualizarBarraProgreso() {
    let habitos = getHabitosUsuario(); // lista total
    const diasMap = ["L", "MA", "MI", "J", "V", "S", "D"]; //map para los códigos de días
    
    // Corrección para día lunes a domingo
    const diaNativo = new Date().getDay(); // 0=domingo nativo
    const indiceCorregido = (diaNativo === 0) ? 6 : diaNativo - 1; //ajusta a tu propio orden
    const diaHoy = diasMap[indiceCorregido]; //día actual
    
    let habitosDeHoy = habitos.filter(h => h.dias.includes(diaHoy)); //filtra hábitos configurados para hoy
    let totalHabitos = habitosDeHoy.length; //cantidad total del día
    
    if (totalHabitos === 0) {
        actualizarHTMLBarra(0, 0); //si no tiene hábitos hoy, barra en vacío
        return;
    }

    let bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {};
    let registros = bd[usuarioActual]?.estadisticas?.registrosMensual || []; //acceso seguro
    const hoy = getFechaHoy(); //fecha clave

    let completadosHoy = habitosDeHoy.filter(h => 
        registros.some(r => r.fecha === hoy && r.habitoId === h.id)
    ).length; //compara hábitos programados vs hábitos completados

    actualizarHTMLBarra(totalHabitos, completadosHoy); //actualiza ui
}

function actualizarHTMLBarra(total, completados) {
    const barra = document.querySelector(".progress-bar"); //ref barra
    const porcentaje = total === 0 ? 0 : Math.round((completados / total) * 100); //cálculo directo del porcentaje

    barra.style.width = `${porcentaje}%`; //ancho visual
    barra.setAttribute("aria-valuenow", porcentaje); //accesibilidad
    barra.textContent = `${completados}/${total}`; //texto dentro de la barra
    
    if (porcentaje === 100) {
        barra.classList.remove("bg-success"); //cambia color cuando está completa
        barra.classList.add("bg-primary");
    }
}

function renderizarListaCompleta() { 
    const contenedor = document.querySelector("#lista-habitos"); //zona donde se imprime todo
    contenedor.innerHTML = ""; //limpia anterior renderizado
    let habitosArray = getHabitosUsuario(); //obtiene hábitos
    const diasMap = ["L", "MA", "MI", "J", "V", "S", "D"]; //códigos de día
    
    // Corrección para día lunes a domingo
    const diaNativo = new Date().getDay(); 
    const indiceCorregido = (diaNativo === 0) ? 6 : diaNativo - 1; 
    const diaHoy = diasMap[indiceCorregido]; //día actual traducido
    
    let habitosDeHoy = habitosArray.filter(h => h.dias.includes(diaHoy)); //filtra hábitos del día
    
    if (habitosDeHoy.length === 0) {
        contenedor.innerHTML = '<p class="text-center text-muted mt-3">No tienes hábitos programados para hoy.</p>'; //mensaje vacío si no hay nada
    } else {
        habitosDeHoy.forEach(function(elemento) {
            cargarHabitos(elemento); //pinta cada hábito
        });
    }
    actualizarBarraProgreso(); //refresca barra
}

document.addEventListener("DOMContentLoaded", function(event)
{
    renderizarListaCompleta(); //render inicial de hábitos del día

    const today=new Date(); //fecha actual
    const fechaHoy=`${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`; //formato final

    document.querySelector(".fecha-hoy").textContent=fechaHoy; //actualiza con la fecha mostrada en pantalla
})