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