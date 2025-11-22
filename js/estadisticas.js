//Convierte una cadena dd/mm/yyyy a un objeto 
//si la cadena está vacía devuelve la fecha actual.
function parseFecha(fechaStr)
{
    if(!fechaStr)return new Date(); //si no hay cadena, se usa hoy (evita fallos en fechas no definidas)
    const [dia,mes,anio]=fechaStr.split('/').map(Number);
    const fecha=new Date(anio,mes-1,dia); //-1 para su valor correcto (antes se le suma 1 para coincidir "visualmente" (de 1 a 12))
    fecha.setHours(0,0,0,0); //como comparamos con datos tipo Date, la hora da problema, la inicializamos en 00:00 para que no ocurra ese problema
    return fecha;
}

//deja fecha en formato dd/mm/yyyy naturalmente viene en dd-mm-yy-hora-minuto-segundo-milisegundo
function formatearFecha(fecha)
{
    return `${String(fecha.getDate()).padStart(2,'0')}/${String(fecha.getMonth()+1).padStart(2,'0')}/${fecha.getFullYear()}`; //crea la cadena exacta usada en historial y en comparaciones
}

// esto ayuda con el calculo de los dias, js toma domingo como 0 por lo que si calculamos de lunes a domingo (1,2,3,4,5,6, "0" <-- problema) pasan cosas
function getDiasArray(arrDias)
{
    const mapa={"D":0,"L":1,"MA":2,"MI":3,"J":4,"V":5,"S":6}; //mapa fijo para traducir tus abreviaturas al índice real de JS
    return arrDias.map(d=>mapa[d]);
}
//Comprueba si la fecha dada cae en uno de los días programados del habito (habito.dias)
function esDiaProgramado(fecha,habito)
{
    return getDiasArray(habito.dias).includes(fecha.getDay()); //verifica si coincide el día calendario con los días definidos por el hábito
}
//esto genera que sea de lunes a domingo, 
function getUltimos7Dias()
{
    const dias=[];
    const nombresVisuales=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']; //orden explícito para que el gráfico no dependa del 0-domingo de JS
    
    for(let i=6;i>=0;i--)
    {
        const d=new Date();
        d.setDate(d.getDate()-i); //retrocede "i" días desde hoy
        d.setHours(0,0,0,0); //como comparamos con datos tipo Date, la hora da problema, la inicializamos en 00:00 para que no ocurra ese problema

        let diaNativo=d.getDay(); //0-6 nativo JS
        let indexVisual=(diaNativo+6)%7; //traduce el domingo(0) al final del arreglo visual (Dom)

        dias.push({
            date:d, //objeto Date directo, útil en cálculos
            fechaStr:formatearFecha(d), //para comparar contra historial
            nombreDia:nombresVisuales[indexVisual] //para ejes del gráfico
        });
    }
    return dias; //lista completa usada por el gráfico semanal
}
// Calcula la racha actual para un habito, recorriendo hacia atrás desde hoy y contando días programados que estén presentes en historial. 
// se validó si aún no se registra.
function calcularRachaHabito(habito,historial)
{
    let racha=0;
    let fechaCheck=new Date(); //punto de inicio: hoy
    fechaCheck.setHours(0,0,0,0); //como comparamos con datos tipo Date, la hora da problema, la inicializamos en 00:00 para que no ocurra ese problema

    const diasHabito=getDiasArray(habito.dias);
    const historialHabito=historial.filter(r=>r.habitoId===habito.id); //se filtra solo por el habito actual
    const hoyStr=formatearFecha(new Date()); //sirve para permitir que hoy no cuente como fallo si aún no se registra

    for(let i=0;i<365;i++) //1 año hacia atrás
    {
        if(!diasHabito.includes(fechaCheck.getDay())) //si el dia de hoy no está en los dias que se tiene que realizar el habito
        {
            fechaCheck.setDate(fechaCheck.getDate()-1); //solo retrocede sin cortar la racha
            continue;
        }

        const strFecha=formatearFecha(fechaCheck);
        const hecho=historialHabito.some(r=>r.fecha===strFecha); //verifica si el hábito se completó ese día

        if(hecho)
        {
            racha++; //si el día estaba cumplido, aumenta racha
            fechaCheck.setDate(fechaCheck.getDate()-1); //retrocede y sigue
        }
        else
        {
            if(strFecha===hoyStr)
            {
                fechaCheck.setDate(fechaCheck.getDate()-1); //si es hoy, no rompe racha (no corresponde exigir registro)
                continue;
            }
            break; //si no se hizo un día programado (no hoy), la racha termina
        }
    }
    return racha;
}

//calcula la racha máxima contando desde hoy (dias seguidos con todos los habitos completados)
function calcularMejorRacha(habitos, historial) {
    let racha = 0;
    let fechaCheck = new Date();
    fechaCheck.setHours(0, 0, 0, 0);  //como comparamos con datos tipo Date, la hora da problema, la inicializamos en 00:00 para que no ocurra ese problema

    //365 días hacia atrás
    for (let i = 0; i < 365; i++) {
        const strFecha = formatearFecha(fechaCheck);
        const diaSemana = fechaCheck.getDay(); // 0-6

        const habitosDelDia = habitos.filter(h => {
            const diasHabito = getDiasArray(h.dias);
            const fechaCrea = parseFecha(h.fechaCreacion);
            return diasHabito.includes(diaSemana) && fechaCrea.getTime() <= fechaCheck.getTime();
        });

        // si no toca habito ese dia
        if (habitosDelDia.length === 0) {
            fechaCheck.setDate(fechaCheck.getDate() - 1);
            continue;
        }

        // si TODOS se hicieron
        const todosCompletados = habitosDelDia.every(h => 
            historial.some(r => r.fecha === strFecha && r.habitoId === h.id)
        );

        if (todosCompletados) {
            racha++;
            fechaCheck.setDate(fechaCheck.getDate() - 1);
        } else {
            // validacion si el dia es hoy mismo (aun hay tiempo)
            const hoyStr = formatearFecha(new Date());
            if (strFecha === hoyStr) {
                fechaCheck.setDate(fechaCheck.getDate() - 1); // Simplemente no la sumo y salto a ayer.
                continue;
            }
            // Si fue ayer y no cumplí todo, se deja de contar
            break;
        }
    }
    return racha;
}
document.addEventListener("DOMContentLoaded", function() {
    const usuarioActual = localStorage.getItem("usuarioActual"); //verificar si existe un usuario actual
    if (!usuarioActual) {
        window.location.href = "login.html"; //si no, se redirige a login
        return; //evita que el resto del script siga sin un usuario
    }

    const bd = JSON.parse(localStorage.getItem("usuariosTrackMe")) || {}; //carga la base de usuarios completa
    const usuario = bd[usuarioActual]; //extrae el usuario activo

    if (!usuario) return; //si no existe el usuario en la BD, cortar ejecución

    const misHabitos = usuario.habitos || []; //lista completa de hábitos creados
    const miHistorial = usuario.estadisticas?.registrosMensual || []; //historial mensual de hábitos completados
    const misGlobales = usuario.estadisticas?.globales || { totalHabitosCompletados: 0, mayorRacha: 0 }; //estructura de estadísticas globales

    const historialMap = new Map(); //estructura rápida para buscar por habitoId sin tener que filtrar cada vez
    miHistorial.forEach(r => {
        if (!historialMap.has(r.habitoId)) historialMap.set(r.habitoId, new Set());
        historialMap.get(r.habitoId).add(r.fecha); //cada hábito queda asociado a un Set para búsqueda O(1)
    });

    //habitos completados
    if (document.getElementById('dato-habitos-completados')) {
        document.getElementById('dato-habitos-completados').innerText = miHistorial.length; //en el registro solo entran habitos ya completados, por eso la asignacion directa
    }

    //constancia general
    if (document.getElementById('dato-constancia')) {
        let totalOportunidades = 0; //basicamente el total
        let totalCumplidos = 0; 
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // ya se entendió setHours

        misHabitos.forEach(h => {
            //se hace para calcular unicamente los dias en el que el habito se puede hacer, para el calculo correcto
            const fechaInicio = parseFecha(h.fechaCreacion); //desde cuándo empezó a contar el hábito
            const diasProgramados = getDiasArray(h.dias); 
            const historialHabito = historialMap.get(h.id) || new Set(); //Set de fechas ya cumplidas

            let fechaIteracion = new Date(fechaInicio);
            fechaIteracion.setHours(0, 0, 0, 0); // .

            while (fechaIteracion <= hoy) {
                if (diasProgramados.includes(fechaIteracion.getDay())) {
                    totalOportunidades++; //este día es una oportunidad del hábito
                    const strFecha = formatearFecha(fechaIteracion);
                    const seHizo = historialHabito.has(strFecha); //consulta O(1)
                    if (seHizo)
                        totalCumplidos++; //el hábito sí se marcó como hecho ese día
                }
                fechaIteracion.setDate(fechaIteracion.getDate() + 1); //avanza al siguiente día
            }
        });

        let porcentaje = 0;
        if (totalOportunidades > 0) {
            porcentaje = Math.round((totalCumplidos / totalOportunidades) * 100); //porcentaje exacto, evita división por 0
        }
        document.getElementById('dato-constancia').innerText = `${porcentaje}%`;
    }

    //mejor racha
    if (document.getElementById('dato-mejor-racha')) {
        const rachaActual = calcularMejorRacha(misHabitos, miHistorial); //calcular racha actual perfecta
        let record = misGlobales.mayorRacha || 0; // paraomparar con récord histórico guardado
        
        //si superamos el récord tenemos que cambiar el valor de la bd
        if (rachaActual > record) {
            record = rachaActual;
            usuario.estadisticas.globales.mayorRacha = record;
            bd[usuarioActual] = usuario; 
            localStorage.setItem("usuariosTrackMe", JSON.stringify(bd));
        }

        document.getElementById('dato-mejor-racha').innerText = `${record} días`;
    }

    //constancia diaria
    const ctxConstancia = document.getElementById('graficoConstancia');
    if (ctxConstancia) {
        const ultimos7 = getUltimos7Dias(); //con esto se logra "sincronizar" el grafico, siendo el ultimo valor; hoy 

        const dataSemana = ultimos7.map(diaObj => {
            const habitosDelDia = misHabitos.filter(h => {
                //esto es para revisar los habitos correspondientes por dia
                const diasHabito = getDiasArray(h.dias);
                const fechaCrea = parseFecha(h.fechaCreacion);
                return diasHabito.includes(diaObj.date.getDay()) && fechaCrea.getTime() <= diaObj.date.getTime(); //el hábito debe existir y aplicarse ese día
            });

            if (habitosDelDia.length === 0) return 0; //si no hay hábitos activos, ese día es 0%

            const completadosReales = habitosDelDia.filter(h =>
                miHistorial.some(r => r.fecha === diaObj.fechaStr && r.habitoId === h.id) //Busca si existe un registro para ese habito con esa fecha
            ).length;

            return Math.round((completadosReales / habitosDelDia.length) * 100); //porcentaje del día
        });

        new Chart(ctxConstancia, {
            type: 'line',
            data: {
                labels: ultimos7.map(d => d.nombreDia), //Lun a Dom sincronizado
                datasets: [{
                    label: 'Cumplimiento Diario (%)',
                    data: dataSemana, //valores 0–100 por día
                    borderColor: '#0d6efd', //línea azul
                    backgroundColor: 'rgba(13,110,253,0.1)', //relleno suave
                    fill: true,
                    tension: 0.3 //curvatura visual suave
                }]
            },
            options: {
                scales: { y: { beginAtZero: true, max: 100 } },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) { return context.parsed.y + '% Completado'; }
                        }
                    }
                }
            }
        });
    }

    //resumen mensual
    const ctxCategorias = document.getElementById('graficoCategorias');
    if (ctxCategorias) {
        const fechaHoy = new Date();
        const mesActual = fechaHoy.getMonth(); //mes actual en número JS
        const anioActual = fechaHoy.getFullYear();

        const registrosEsteMes = miHistorial.filter(r => {
            const fechaR = parseFecha(r.fecha);
            return fechaR.getMonth() === mesActual && fechaR.getFullYear() === anioActual; //filtra solo los registros que pertenecen al mes
        });

        const conteo = {}; //conteo por nombre de hábito
        registrosEsteMes.forEach(r => {
            conteo[r.habitoNombre] = (conteo[r.habitoNombre] || 0) + 1; //incremento básico
        });

        new Chart(ctxCategorias, {
            type: 'doughnut',
            data: {
                labels: Object.keys(conteo).length ? Object.keys(conteo) : ['Sin datos'], //evita gráficos vacíos
                datasets: [{
                    data: Object.keys(conteo).length ? Object.values(conteo) : [1], //un valor ficticio si no hay datos
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], //colores para distinguir hábitos
                    hoverOffset: 4
                }]
            }
        });
    }

    //rachas actuales por habito
    const ctxRachas = document.getElementById('graficoRachas');
    if (ctxRachas) {
        const dataRachas = misHabitos.map(h => {
            return {
                nombre: h.nombre,
                racha: calcularRachaHabito(h, miHistorial) //se calcula racha por hábito
            };
        });

        new Chart(ctxRachas, {
            type: 'bar',
            data: {
                labels: dataRachas.map(d => d.nombre), //nombres de hábitos como eje X
                datasets: [{
                    label: 'Días seguidos',
                    data: dataRachas.map(d => d.racha),
                    backgroundColor: 'rgba(75,192,192,0.6)', 
                    borderColor: 'rgba(75,192,192,1)', 
                    borderWidth: 1
                }]
            },
            options: {
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } 
            }
        });
    }

    //progreso individual del habito
    const contenedorProgreso = document.getElementById('contenedor-progreso-individual');
    if (contenedorProgreso) {
        contenedorProgreso.innerHTML = '<h5 class="mb-3">Progreso de Meta (Total)</h5>'; //titulo base antes de agregar barras

        misHabitos.forEach(h => {
            const totalHechos = miHistorial.filter(r => r.habitoId === h.id).length; //cuántas veces se completó
            const meta = parseInt(h.meta) || 1;
            let porcentaje = Math.round((totalHechos / meta) * 100);
            if (porcentaje > 100) porcentaje = 100; //para evitar barras que se pasen

            const html = `
                <div class="mb-3">
                    <div class="d-flex justify-content-between">
                        <span>${h.nombre}</span>
                        <small class="text-muted">${totalHechos} / ${meta} días</small> <!--resumen compacto-->
                    </div>
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${porcentaje}%" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100"></div> <!--barra proporcional-->
                    </div>
                </div>
            `;
            contenedorProgreso.innerHTML += html; //se va acumulando cada barra
        });
    }
});