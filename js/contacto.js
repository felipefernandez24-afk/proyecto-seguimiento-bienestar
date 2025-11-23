(() => { //validacion de bootstrap
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')

    forms.forEach(form => { //loop para que se realice la validacion hasta que se llenen los campos y sean validos
    form.addEventListener('submit', event => {

    const alertaPrev = form.querySelector('.alerta-flotante')
    if (alertaPrev) alertaPrev.remove()
        
    if (!form.checkValidity()) {
        event.preventDefault()
        const alerta = document.createElement('div')
        alerta.className = 'alert alert-danger alerta-flotante text-center'
        alerta.innerText = 'Por favor, completa todos los campos requeridos.'
        form.appendChild(alerta)

    }
    else{
        event.preventDefault()
        const alerta = document.createElement('div')
        alerta.className = 'alert alert-primary alerta-flotante text-center'
        alerta.innerText = 'Se han enviado los datos exitosamente. Muchas gracias :3'
        form.appendChild(alerta)

        event.preventDefault(); 
        setTimeout(() => {
            form.submit();
        }, 1000);
    }
        form.classList.add('was-validated')
    }, false)
})
})()
