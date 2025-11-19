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

function cargarHabitos(habito) {
    const contenedor = document.querySelector("#lista-habitos");

    let habitosGuardados=getHabitosUsuario();
    const numero = habitosGuardados.findIndex(h => h.id === habito.id) + 1;

    const div = document.createElement("div"); 
    div.classList.add("d-flex", "flex-wrap", "justify-content-between", "align-items-center", "mb-3");

    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center w-100">
            <!-- Contenedor izquierdo: Número, Nombre y Duración -->
            <div class="d-flex align-items-center w-50">
                <span>${numero}.</span>
                <p class="w-100 ms-2">${habito.nombre}</p>
                <span class="px-2">Duración: ${habito.duracion}</span>
            </div>

            <!-- Contenedor derecho: Botón "Listo" -->
            <div>
                <button class="btn btn-outline-success">Listo</button>
            </div>
        </div>
    `;
    contenedor.appendChild(div);
    const hr = document.createElement("hr");
    contenedor.appendChild(hr);

    // botón Listo
    const btnListo = div.querySelector(".btn-outline-success");
    btnListo.addEventListener("click", function() {
        if(confirm(`¿Realmente ha completado este hábito?: \n"${habito.nombre} por ${habito.duracion} dias"`)) {
            completarHabito
        }
    });
}

function renderizarListaCompleta() { //para que los numeros no fallen al borrar
    const contenedor = document.querySelector("#lista-habitos");
    contenedor.innerHTML = ""; 
    let habitosArray = getHabitosUsuario();
    habitosArray.forEach(function(elemento) {
        cargarHabitos(elemento);    });
}
document.addEventListener("DOMContentLoaded", function(event) { 
    renderizarListaCompleta(); // para evitar cosas como que los numeros no cambien al eliminar habitos, etc
})