por el momento esto lo usaremos para contextualizar el proyecto pa crearlo
ahi veremos si al final hacemos una introduccion
(eso podria servir como una chuleta pa ganar puntos (mentira))
estructura de la pagina;


estructura de los usuarios;
cómo se veria (flujo/árbol)

    usuario
    │
    ├── mesActual
    │
    ├── habitos[]
    │     ├── habito
    │     │      id
    │     │      nombre
    │     │      duracion
    │     │      descripcion
    │     │      fechaCreacion
    │     │      fechaTermino
    │     └── ...
    │
    └── estadisticas
        │
        ├── registrosMensual[]
        │      ├── registro
        │      │      fecha
        │      │      habitoId
        │      │      habitoNombre
        │      │      habitoDuracion
        │      │      completado (true/false)
        │      └── ...
        │
        ├── porMes
        │      ├── "2025-11" → [ registro, registro, ... ]
        │      ├── "2025-10" → [ registro, registro, ... ]
        │      └── ...
        │
        └── globales
                totalHabitosCompletados
                mayorRacha
