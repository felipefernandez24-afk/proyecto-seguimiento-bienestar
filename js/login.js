(() => { //validacion de bootstrap
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')

    forms.forEach(form => { //loop para que se realice la validacion hasta que se llenen los campos y sean validos
    form.addEventListener('submit', event => {
    if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
        alert("Debes agregar datos al formulario", "danger");
    }
    else{
        event.preventDefault();
            const email = form.querySelector('#formGroupExampleInput').value.trim(); // Obtener los datos del formulario
            const contrasena = form.querySelector('#formGroupExampleInput2').value.trim(); // Obtener los datos del formulario
            const usuariosExistentes=JSON.parse(localStorage.getItem("usuariosTrackMe")||"{}") // usuariosTrackMe es como la bd

                // Comprobar si el usuario existe
            const usuario = usuariosExistentes[email];
            if (usuario) {
                // Comprobar si la contraseña es correcta
                if (contrasena === usuario.contrasena) {
                    // Si la contraseña es correcta
                    localStorage.setItem("usuarioActual", email); // Mantener sesión en localStorage
                    window.location.href = "index.html"; // Redirigir a la página de inicio
                } else {
                    // Contraseña incorrecta
                    alert("Contraseña incorrecta.", "danger");
                }
            } else {
                // Usuario no encontrado
                alert("El usuario no existe", "danger");
        }
        }
        form.classList.add('was-validated')
        }, false)
    })
})()
