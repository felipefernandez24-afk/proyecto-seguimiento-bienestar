// Esperamos a que todo el contenido del DOM (la página HTML) esté cargado
document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Gráfico de Constancia (Línea) ---
    // (Datos de ejemplo, deberás reemplazarlos con los tuyos)
    const ctxConstancia = document.getElementById('graficoConstancia');
    
    // Verificamos que el elemento exista antes de intentar dibujar en él
    if (ctxConstancia) {
        new Chart(ctxConstancia, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Hábitos Completados',
                    data: [1, 3, 2, 4, 3, 5, 4], // Datos de ejemplo
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // --- 2. Gráfico de Categorías (Donut) ---
    const ctxCategorias = document.getElementById('graficoCategorias');
    if (ctxCategorias) {
        new Chart(ctxCategorias, {
            type: 'doughnut',
            data: {
                labels: ['Salud Física', 'Salud Mental', 'Aprendizaje', 'Productividad'],
                datasets: [{
                    label: 'Hábitos',
                    data: [5, 3, 2, 2], // Datos de ejemplo
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
                    ],
                    hoverOffset: 4
                }]
            }
        });
    }

    // --- 3. Gráfico de Rachas (Barras) ---
    const ctxRachas = document.getElementById('graficoRachas');
    if (ctxRachas) {
        new Chart(ctxRachas, {
            type: 'bar',
            data: {
                labels: ['Beber agua', 'Leer un libro', 'Trotar 25 min', 'Meditar 10 min'],
                datasets: [{
                    label: 'Días de racha',
                    data: [14, 8, 3, 5], // Datos de ejemplo
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ]
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // --- 4. Lógica para las tarjetas (KPIs) y barras de progreso ---
    // En el futuro, aquí es donde deberías poner la lógica para
    // cargar los datos (ej: desde localStorage) y actualizar los números
    // de las tarjetas y las barras de progreso.

    // Ejemplo (esto aún no es funcional, es para el siguiente paso):
    /*
    const habitosCompletados = 128; // Deberías calcular esto
    const mejorRacha = 14; // Deberías calcular esto
    const constancia = 82; // Deberías calcular esto

    document.getElementById('dato-habitos-completados').innerText = habitosCompletados;
    document.getElementById('dato-mejor-racha').innerText = `${mejorRacha} días`;
    document.getElementById('dato-constancia').innerText = `${constancia}%`;
    */
    
});