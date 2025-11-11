document.addEventListener("DOMContentLoaded", () => {
  const fraseContainer = document.querySelector(".frase-motivacional");

  // Llamar a la API para obtener las frases
  async function cargarFrase() {
    try {
      const response = await fetch('https://www.positive-api.online/phrases/esp');
      const data = await response.json(); // Respuesta de la API

      // Selecciona una frase aleatoria de la respuesta
      const fraseAleatoria = data[Math.floor(Math.random() * data.length)];

      // Inyecta la frase aleatoria en el contenedor
      fraseContainer.innerHTML = `
        <section class="frase-motivacional text-center py-4">
          <h3 class="fw-bold">"${fraseAleatoria.text}"</h3>
        </section>
      `;
    } catch (error) {
      console.error("Error al cargar la API:", error);
      fraseContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <strong>Error:</strong> No se pudo cargar la frase.
        </div>
      `;
    }
  }
  cargarFrase(); // Llamamos a la función
});
