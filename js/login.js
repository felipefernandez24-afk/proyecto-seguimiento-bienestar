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
            const password = form.querySelector('#formGroupExampleInput2').value.trim(); // Obtener los datos del formulario

            if (email && password) {// Validar que los campos no estén vacíos
                localStorage.setItem("usuario", JSON.stringify({ email: email, password: password })); // Guardar el email y la contraseña en localStorage
                window.location.href = "index.html"; // O redirigir a cualquier otra página
            } else {
                alert("Por favor, completa todos los campos."); // Por si acaso
            }
    }
    form.classList.add('was-validated')
    }, false)
})
})()