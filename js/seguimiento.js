let categoria = document.querySelector("#selector");
let listaDeLibros = [];
let categoriaActual = "";

selector.addEventListener("change", mostrarLibros); //si llegsae a cambiar el valor del selector

function mostrarLibros(){
        let categoriaIngresada = categoria.value;
        if (categoriaIngresada === "Seleccionar Categoría") return; //por si elige la default

        if (categoriaIngresada !== categoriaActual) { //por si cambia de categoria como pa que empeice de cero
            listaDeLibros = [];
            categoriaActual = categoriaIngresada;
        }

        if(listaDeLibros.length === 0){
            fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${categoriaIngresada}`)
            .then(response =>{
                if(!response.ok){
                    throw new Error("ERROR. No se pudo cargar los datos correctamente.");
                }
                return response.json();
            })
            .then(data => {
                listaDeLibros = data.items || []; //por si pueden no haber libros y que quede undefined
                cargarDatos();
            })
            .catch(error => {
                let cardAtras = document.querySelectorAll(".flip-card-back");
                cardAtras.forEach(card => {
                    card.innerHTML = `<p>Hubo un error con la Api </p> `;
                });
            });
        } else {
            cargarDatos();
        }
}

function cargarDatos(){
    const cardsFrente = document.querySelectorAll(".flip-card-front img");
    const cardsAtras = document.querySelectorAll(".flip-card-back");

    cardsFrente.forEach((img, index) => {
        if(!listaDeLibros[index]) return; // si faltan libros, no falla

        let info = listaDeLibros[index].volumeInfo;

        if(info.imageLinks && info.imageLinks.thumbnail) { //la portada a veces no hay
            img.src = info.imageLinks.smallThumbnail;
        } else {
            img.src = "https://via.placeholder.com/150";
        }
        
        let titulo = cardsAtras[index].querySelector(".titulo-libro");
        let link   = cardsAtras[index].querySelector("a");
        let autor  = cardsAtras[index].querySelector(".autor-libro");

        if(info.title){
            titulo.textContent =info.title;
        } else{
            titulo.textContent = "No se encontró titulo";
        }

        if (info.authors) {
            tituloAutores = info.authors.join(", ");
        } else {
            tituloAutores = "Autor desconocido";
        }

        autor.textContent = tituloAutores;
        link.href = info.infoLink || "#";
    });

}