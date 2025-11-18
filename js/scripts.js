document.addEventListener('DOMContentLoaded', () =>
{
    const emailActual=localStorage.getItem("usuarioActual");
    if(!emailActual)return;

    const usuarios=JSON.parse(localStorage.getItem("usuariosTrackMe")||"{}");
    const usuario=usuarios[emailActual];
    if(!usuario)return;

    const menu=document.getElementById('menu');
    if(!menu)return;

    menu.innerHTML=
    `
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item"><a class="nav-link" href="index.html">Inicio</a></li>
                        <li class="nav-item"><a class="nav-link" href="nosotros.html">Nosotros</a></li>
                        <li class="nav-item"><a class="nav-link" href="contacto.html">Contacto</a></li>
                        <!-- <li class="nav-item"><a class="nav-link" href="registro.html">Registro</a></li> -->
                        <li class="nav-item"><a class="nav-link" href="habitos.html">Creación de hábitos</a></li>
                        <li class="nav-item"><a class="nav-link" href="seguimiento.html">Seguimiento</a></li>
                        <li class="nav-item"><a class="nav-link" href="estadisticas.html">Estadisticas</a></li>
                        <!--  <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li> -->
                    </ul>
    `;
});