document.addEventListener('DOMContentLoaded', () =>
{
    const emailActual=localStorage.getItem("usuarioActual");
    if(!emailActual)return;

    const usuarios=JSON.parse(localStorage.getItem("usuariosTrackMe")||"{}");
    const usuario=usuarios[emailActual];
    if(!usuario)return;

    const menu=document.getElementById('menu');
    if(!menu)return;

    let nombreUsuario = usuario.nombre || emailActual;
    menu.innerHTML=
    `
        <ul class="navbar-nav ms-auto">
            <li class="nav-item"><a class="nav-link" href="nosotros.html">Nosotros</a></li>
            <li class="nav-item"><a class="nav-link" href="contacto.html">Contacto</a></li>
            <!-- <li class="nav-item"><a class="nav-link" href="registro.html">Registro</a></li> -->
            <li class="nav-item"><a class="nav-link" href="habitos.html">Crear Hábitos</a></li>
            <li class="nav-item"><a class="nav-link" href="seguimiento.html">Seguimiento</a></li>
            <li class="nav-item"><a class="nav-link" href="estadisticas.html">Estadísticas</a></li>
            <!--  <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li> -->
            <li class="nav-item"><a class="nav-link" data-bs-toggle="modal" data-bs-target="#modal-cerrar-sesion" href="#">Cerrar sesión</a></li>
        </ul>
    `;
    let modalCerrarSesion =  //modal que se crea nuevo solo cuando haga click en cerrar sesion
    `
        <div class="modal fade" id="modal-cerrar-sesion" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content text-center shadow-lg border-0 rounded-4 overflow-hidden">
                    <div class="modal-header justify-content-center py-4">
                        <div class="d-flex flex-column align-items-center">
                            <h6 class="text-uppercase fw-bold mt-2 mb-0 ls-2" style="letter-spacing: 2px;">${nombreUsuario}</h6>
                        </div>
                    </div>
                    <div class="modal-body p-4">
                        <h3 class="fw-bold mb-3" id="modal-titulo">¿Estás segur@ que deseas cerrar sesión?</h3>
                    </div>
                    <div class="modal-footer border-0 justify-content-center pb-4">
                        <button type="button" class="btn btn-light px-5 py-2 fw-bold rounded-pill btn-cerrar-modal" data-bs-dismiss="modal">Todavía no</button>
                        <button type="button" class="btn btn-light px-5 py-2 fw-bold rounded-pill btn-cerrar-modal" data-bs-dismiss="modal" id="confirmar">Cerrar Sesión</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalCerrarSesion); //para colocar el modal nuevo al hacer click en cerrar sesion
    const boton = document.getElementById('confirmar');
    boton.addEventListener('click', () => {
        localStorage.removeItem("usuarioActual");
        window.location.href = "login.html";
    });
});