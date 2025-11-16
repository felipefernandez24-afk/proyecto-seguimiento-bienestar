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

            if (email && contrasena) {// Validar que los campos no estén vacíos

                // integracion de datos 
                if(!usuariosExistentes[email])
                {
                    usuariosExistentes[email] =
                    {
                        email:email,
                        contrasena:contrasena,
                        habitos:{},
                        registros:{},
                        estadisticas:{
                            mesActual:{},
                            historialMensual:{}
                        }
                    }
                }

                localStorage.setItem("usuariosTrackMe", JSON.stringify(usuariosExistentes)); // Guarda todos los usuarios
                localStorage.setItem("usuarioActual", email); // Guarda quién inició sesión

                window.location.href = "index.html";
            } else {
                alert("Por favor, completa todos los campos."); // Por si acaso
            }
    }
    form.classList.add('was-validated')
    }, false)
})
})()
