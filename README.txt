hago esto pa contextualizar todo lo de localstorage pq es bien largo y latero jasjdasjd
ahi veremos si al final hacemos una introduccion de esas que hacen siempre en cada repositorio o matamos este archivo 
(eso podria servir como una chuleta pa ganar puntos (mentira))

estructura de la pagina;

    localStorage{}
    └─ usuariosTrackMe{} (esta es una variable en el localStorage que simula como una base de datos jasjdasjd)
        ├── usuario
        ├── usuario
        └── usuario

estructura de los usuarios;
cómo se veria (flujo/árbol)

    usuario
    ├── nombre
    ├── email
    ├── contrasena
    │
    ├── habitos[]
    │     └── habito
    │         ├── id
    │         ├── nombre
    │         ├── duracion (minutos)
    │         ├── meta (durante cuantos dias)
    │         ├── dias (lunes, martes...)
    │         ├── fechaCreacion (se saca el dia en que se crea el habito (api?))
    │         └── fechaTermino (entre fechaCreacion y meta)
    │     
    └── estadisticas
        │
        ├── registrosMensual[]
        │      └── registro
        │          ├── fecha
        │          ├── habitoId
        │          ├── habitoNombre
        │          ├── habitoDuracion
        │          └── completado (true/false)
        │      
        │
        ├── porMes[]
        │    ├── "2025-11" → [ registro, registro, ... ] (es el mismo registro de registrosMensual)
        │    ├── "2025-10" → [ registro, registro, ... ]
        │    └── ...
        │
        └── globales
            ├── totalHabitosCompletados
            └── mayorRacha
