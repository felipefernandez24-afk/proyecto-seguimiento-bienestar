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

                localStorage.setItem("usuario", JSON.stringify(usuario))
                window.location.href="index.html"
            }

            form.classList.add('was-validated')
        }, false)
    })
})()
