(() => { //validacion de bootstrap
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')

  forms.forEach(form => { //loop para que se realice la validacion hasta que se llenen los campos y sean validos
    form.addEventListener('submit', event => {
        event.preventDefault()

    const alertaPrev = form.querySelector('.alerta-flotante')
    if (alertaPrev) alertaPrev.remove()
        
    if (!form.checkValidity()) {
        const alerta = document.createElement('div')
        alerta.className = 'alert alert-danger alerta-flotante text-center'
        alerta.innerText = 'Por favor, completa todos los campos requeridos.'
        form.appendChild(alerta)

    }
    else{
        event.preventDefault()
    }
        form.classList.add('was-validated')
    }, false)
})
})()
