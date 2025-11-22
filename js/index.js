document.addEventListener("DOMContentLoaded", () => {
  AOS.init();
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
          <h3 class="fw-bold">"${fraseAleatoria.text}"</h3>
      `;
    } catch (error) {
      console.error("Error al cargar la API:", error);
      fraseContainer.innerHTML = `
          <strong>Error:</strong> No se pudo cargar la frase.
      `;
    }
  }
  cargarFrase(); // Llamamos a la función
});