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
        event.preventDefault()
        //deberia aqui ir lo que se guarden los datos y mostrar su inicio de sesion
    }
    form.classList.add('was-validated')
    }, false)
})
})()