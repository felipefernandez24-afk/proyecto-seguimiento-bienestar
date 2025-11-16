(() =>
{
    'use strict'
    const forms=document.querySelectorAll('.needs-validation')

    forms.forEach(form =>
    {
        form.addEventListener('submit', event =>
        {
            if(!form.checkValidity())
            {
                event.preventDefault()
                event.stopPropagation()
                alert("Debes completar todos los campos")
            }
            else
            {
                event.preventDefault()

                const nombre=form.querySelector('#inputNombre').value.trim()
                const email=form.querySelector('#inputEmail').value.trim()
                const pass=form.querySelector('#inputPass').value.trim()
                const pass2=form.querySelector('#inputPass2').value.trim()
                const usuariosExistentes=JSON.parse(localStorage.getItem("usuariosTrackMe")||"{}") // usuariosTrackMe es como la bd

                if (usuariosExistentes[email]) {
                    alert("El usuario con ese email ya está registrado.")
                    return
                }

                if(pass!==pass2)
                {
                    alert("Las contraseñas no coinciden")
                    return
                }

                const usuario=
                {
                    nombre:nombre,
                    email:email,
                    contrasena:pass
                }

                let bd=JSON.parse(localStorage.getItem("usuariosTrackMe"))||{}
                bd[email]=usuario
                localStorage.setItem("usuariosTrackMe", JSON.stringify(bd))

                localStorage.setItem("usuarioActivo", email)
                alert("Te has registrado correctamente, redirigiendo a página de inicio de sesión.");
                window.location.href="login.html"
            }

            form.classList.add('was-validated')
        }, false)
    })
})()
