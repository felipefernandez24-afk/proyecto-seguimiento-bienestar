document.addEventListener('DOMContentLoaded', () =>
{
    const emailActual=localStorage.getItem("usuarioActual");
    if(!emailActual)return;

    const usuarios=JSON.parse(localStorage.getItem("usuariosTrackMe")||"{}");
    const usuario=usuarios[emailActual];
    if(!usuario)return;

    const main=document.querySelector('main');
    if(!main)return;

    main.innerHTML=
    `
        <div style="padding:40px;">
            <h1>Usuario Actual</h1>
            <p><strong>Nombre:</strong> ${usuario.nombre||"(sin nombre)"}</p>
            <p><strong>Email:</strong> ${usuario.email}</p>
            <p><strong>Contraseña:</strong> ${usuario.contrasena}</p>
            <hr>
            <p>Este bloque reemplaza completamente el contenido del main solo como prueba.</p>
        </div>
    `;
});