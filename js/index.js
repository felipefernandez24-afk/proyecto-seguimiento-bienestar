document.addEventListener("DOMContentLoaded", () => {
  AOS.init();
  const fraseContainer = document.querySelector(".frase-motivacional");

  async function cargarFrase() {
    try {
      const response = await fetch('https://www.positive-api.online/phrases/esp');
      const data = await response.json(); //respuesta api

      const fraseAleatoria = data[Math.floor(Math.random() * data.length)];

      //colocando la frase
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
  cargarFrase();
});