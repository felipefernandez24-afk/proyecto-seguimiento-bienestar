//funciones 


//Convierte una cadena dd/mm/yyyy a un objeto 
//si la cadena está vacía devuelve la fecha actual.
function parseFecha(fechaStr)
{
    if(!fechaStr)return new Date();
    const [dia,mes,anio]=fechaStr.split('/').map(Number);
    const fecha=new Date(anio,mes-1,dia);
    fecha.setHours(0,0,0,0);
    return fecha;
}

//deja fecha en formato dd/mm/yyyy naturalmente viene en dd-mm-yy-hora-minuto-segundo-milisegundo
function formatearFecha(fecha)
{
    return `${String(fecha.getDate()).padStart(2,'0')}/${String(fecha.getMonth()+1).padStart(2,'0')}/${fecha.getFullYear()}`;
}

// esto ayuda con el calculo de los dias, js toma domingo como 0 por lo que si calculamos de lunes a domingo (1,2,3,4,5,6, "0" <-- problema) pasan cosas
function getDiasArray(arrDias)
{
    const mapa={"D":0,"L":1,"MA":2,"MI":3,"J":4,"V":5,"S":6};
    return arrDias.map(d=>mapa[d]);
}
//Comprueba si la fecha dada cae en uno de los días programados del habito (habito.dias)
function esDiaProgramado(fecha,habito)
{
    return getDiasArray(habito.dias).includes(fecha.getDay());
}
//esto genera que sea de lunes a domingo, 
function getUltimos7Dias()
{
    const dias=[];
    const nombresVisuales=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    
    for(let i=6;i>=0;i--)
    {
        const d=new Date();
        d.setDate(d.getDate()-i);
        d.setHours(0,0,0,0);

        let diaNativo=d.getDay();
        let indexVisual=(diaNativo+6)%7;

        dias.push({
            date:d,
            fechaStr:formatearFecha(d),
            nombreDia:nombresVisuales[indexVisual]
        });
    }
    return dias;
}
// Calcula la racha actual para un habito, recorriendo hacia atrás desde hoy y contando días programados que estén presentes en historial. 
// se validó si aún no se registra.
function calcularRachaHabito(habito,historial)
{
    let racha=0;
    let fechaCheck=new Date();
    fechaCheck.setHours(0,0,0,0);

    const diasHabito=getDiasArray(habito.dias);
    const historialHabito=historial.filter(r=>r.habitoId===habito.id);
    const hoyStr=formatearFecha(new Date());

    for(let i=0;i<365;i++)
    {
        if(!diasHabito.includes(fechaCheck.getDay()))
        {
            fechaCheck.setDate(fechaCheck.getDate()-1);
            continue;
        }

        const strFecha=formatearFecha(fechaCheck);
        const hecho=historialHabito.some(r=>r.fecha===strFecha);

        if(hecho)
        {
            racha++;
            fechaCheck.setDate(fechaCheck.getDate()-1);
        }
        else
        {
            if(strFecha===hoyStr)
            {
                fechaCheck.setDate(fechaCheck.getDate()-1);
                continue;
            }
            break;
        }
    }
    return racha;
}

function crearGrafico(ctx,type,labels,datasets,optionsExtra={})
{
    return new Chart(ctx,{
        type:type,
        data:{
            labels:labels,
            datasets:datasets
        },
        options:{
            scales:{y:{beginAtZero:true}},
            ...optionsExtra
        }
    });
}

document.addEventListener("DOMContentLoaded",function()
{
    const usuarioActual=localStorage.getItem("usuarioActual"); //verificar si existe un usuario actual
    if(!usuarioActual)
    {
        window.location.href="login.html"; //si no, se redirige a login
        return;
    }

    const bd=JSON.parse(localStorage.getItem("usuariosTrackMe"))||{};
    const usuario=bd[usuarioActual];

    if(!usuario)return;

    const misHabitos=usuario.habitos||[];
    const miHistorial=usuario.estadisticas?.registrosMensual||[];
    const misGlobales=usuario.estadisticas?.globales||{totalHabitosCompletados:0,mayorRacha:0};

    const historialMap=new Map();
    miHistorial.forEach(r=>
    {
        if(!historialMap.has(r.habitoId))historialMap.set(r.habitoId,new Set());
        historialMap.get(r.habitoId).add(r.fecha);
    });

    //habitos completados
    if(document.getElementById('dato-habitos-completados'))
    {
        document.getElementById('dato-habitos-completados').innerText=miHistorial.length;
    }

    //constancia general
    if(document.getElementById('dato-constancia'))
    {
        let totalOportunidades=0;
        let totalCumplidosReales=0;
        const hoy=new Date();
        hoy.setHours(0,0,0,0);
        
        misHabitos.forEach(h=>
        {
            const fechaInicio=parseFecha(h.fechaCreacion);
            const diasProgramados=getDiasArray(h.dias);
            const historialHabito=historialMap.get(h.id)||new Set();

            let fechaIteracion=new Date(fechaInicio);
            fechaIteracion.setHours(0,0,0,0);

            while(fechaIteracion<=hoy)
            {
                if(diasProgramados.includes(fechaIteracion.getDay()))
                {
                    totalOportunidades++;
                    const strFecha=formatearFecha(fechaIteracion);
                    const seHizo=historialHabito.has(strFecha);
                    if(seHizo)totalCumplidosReales++;
                }
                fechaIteracion.setDate(fechaIteracion.getDate()+1);
            }
        });

        let porcentaje=0;
        if(totalOportunidades>0)
        {
            porcentaje=Math.round((totalCumplidosReales/totalOportunidades)*100);
        }
        document.getElementById('dato-constancia').innerText=`${porcentaje}%`;
    }

    //mejor racha
    if(document.getElementById('dato-mejor-racha'))
    {
        const record=misGlobales.mayorRacha||0;
        document.getElementById('dato-mejor-racha').innerText=`${record} días`;
    }

    //constancia diaria
    const ctxConstancia=document.getElementById('graficoConstancia');
    if(ctxConstancia)
    {
        const ultimos7=getUltimos7Dias();
        
        const dataSemana=ultimos7.map(diaObj=>
        {
            const habitosDelDia=misHabitos.filter(h=>
            {
                const diasHabito=getDiasArray(h.dias);
                const fechaCrea=parseFecha(h.fechaCreacion);
                return diasHabito.includes(diaObj.date.getDay())&&fechaCrea.getTime()<=diaObj.date.getTime();
            });

            if(habitosDelDia.length===0)return 0;

            const completadosReales=habitosDelDia.filter(h=>
                miHistorial.some(r=>r.fecha===diaObj.fechaStr&&r.habitoId===h.id)
            ).length;

            return Math.round((completadosReales/habitosDelDia.length)*100);
        });

        crearGrafico(
            ctxConstancia,
            'line',
            ultimos7.map(d=>d.nombreDia),
            [{
                label:'Cumplimiento Diario (%)',
                data:dataSemana,
                borderColor:'#0d6efd',
                backgroundColor:'rgba(13,110,253,0.1)',
                fill:true,
                tension:0.3
            }],
            {
                scales:{y:{beginAtZero:true,max:100}},
                plugins:{
                    tooltip:{
                        callbacks:{
                            label:function(context){return context.parsed.y+'% Completado';}
                        }
                    }
                }
            }
        );
    }

    //resumen mensual
    const ctxCategorias=document.getElementById('graficoCategorias');
    if(ctxCategorias)
    {
        const fechaHoy=new Date();
        const mesActual=fechaHoy.getMonth();
        const anioActual=fechaHoy.getFullYear();

        const registrosEsteMes=miHistorial.filter(r=>
        {
            const fechaR=parseFecha(r.fecha);
            return fechaR.getMonth()===mesActual&&fechaR.getFullYear()===anioActual;
        });

        const conteo={};
        registrosEsteMes.forEach(r=>
        {
            conteo[r.habitoNombre]=(conteo[r.habitoNombre]||0)+1;
        });

        crearGrafico(
            ctxCategorias,
            'doughnut',
            Object.keys(conteo).length?Object.keys(conteo):['Sin datos'],
            [{
                data:Object.keys(conteo).length?Object.values(conteo):[1],
                backgroundColor:['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF'],
                hoverOffset:4
            }]
        );
    }

    //rachas actuales por habito
    const ctxRachas=document.getElementById('graficoRachas');
    if(ctxRachas)
    {
        const dataRachas=misHabitos.map(h=>
        {
            return {
                nombre:h.nombre,
                racha:calcularRachaHabito(h,miHistorial)
            };
        });

        crearGrafico(
            ctxRachas,
            'bar',
            dataRachas.map(d=>d.nombre),
            [{
                label:'Días seguidos',
                data:dataRachas.map(d=>d.racha),
                backgroundColor:'rgba(75,192,192,0.6)',
                borderColor:'rgba(75,192,192,1)',
                borderWidth:1
            }],
            {scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
        );
    }

    //progreso individual del habito
    const contenedorProgreso=document.getElementById('contenedor-progreso-individual');
    if(contenedorProgreso)
    {
        contenedorProgreso.innerHTML='<h5 class="mb-3">Progreso de Meta (Total)</h5>';
        
        misHabitos.forEach(h=>
        {
            const totalHechos=miHistorial.filter(r=>r.habitoId===h.id).length;
            const meta=parseInt(h.meta)||1;
            let porcentaje=Math.round((totalHechos/meta)*100);
            if(porcentaje>100)porcentaje=100;

            const html=`
                <div class="mb-3">
                    <div class="d-flex justify-content-between">
                        <span>${h.nombre}</span>
                        <small class="text-muted">${totalHechos} / ${meta} días</small>
                    </div>
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${porcentaje}%" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            `;
            contenedorProgreso.innerHTML+=html;
        });
    }
});