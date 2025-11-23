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
            const email = form.querySelector('#formGroupExampleInput').value.trim(); //se obtienen datos del formulario y usuariosTrackMe es donde se tienen todos los usuarios fomato js
            const contrasena = form.querySelector('#formGroupExampleInput2').value.trim();
            const usuariosExistentes=JSON.parse(localStorage.getItem("usuariosTrackMe")||"{}") 
            
            const usuario = usuariosExistentes[email];
            if (usuario) { //si existe el usuario y su contraseña es correcta
                if (contrasena === usuario.contrasena) {
                    localStorage.setItem("usuarioActual", email); //se mantiene la sesion iniciada y el usuario actual seria quien inicio a la pag
                    window.location.href = "habitos.html"; //que lo lleve al tiro a crear habitos
                } else {
                    alert("Contraseña incorrecta.", "danger");
                }
            } else {
                alert("El usuario no existe", "danger");
            }
        }
        form.classList.add('was-validated')
        }, false)
    })
})()
