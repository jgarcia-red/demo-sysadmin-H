
function cleanContainer() {
    // Este metodo se encarga de limpiar el contenedor principal, para desplegar nuevo contenido
    let content = document.querySelector('#content');
    content.innerHTML = '';
}

function checkSession() {
    // Este metodo es el encargado de revisar si hay una sesion en el navegador
    let sessionId = localStorage.getItem("sessionID");
    let customerCode = localStorage.getItem("customerCode");
    let storeCode = localStorage.getItem("storeCode");

    if(sessionId == null && customerCode == null && storeCode == null) {
        return false;
    } else {
        return true;
    }
}

function loadFormLogin() {
    // Metodo encargado de construir el formulario de login en el contenedor principal
    let content = document.querySelector('#content');
    content.innerHTML =`
    <div class="row">
        <div class="col-md-12 mt-3">

            <h3>Login de usuario</h3>

            <div class="form-group mt-2">
                <label for="email">Nombre de usuario</label>
                <input type="email" class="form-control" id="email" placeholder="Username">
            </div>

            <div class="form-group mt-2">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Password">
            </div>

            <a class="btn btn-primary mt-3" onclick="login();">Obtener una Sesión</a>

        </div>
    </div>
    `;
}

function loadButtons() {
    // Si hay una sesion en el navegador, se construyen los botones para interactuar con el sistema
    let content = document.querySelector('#content');
    content.innerHTML =`
    <div class="row">
        <div class="col-md-12 mt-3 text-center">

            <h3>Encender Leds</h3>

            <label for="colorSelect">Selecciona el color:</label>
            <select class="form-select" id="colorSelect">
                <option value="red" selected>Rojo</option>
                <option value="green">Verde</option>
                <option value="blue">Azul</option>
            </select>

            <a class="btn btn-primary mt-2" onclick="loadTurnONLeds('Update Completed');">Update Completed</a>
            <a class="btn btn-primary mt-2" onclick="loadTurnONLeds('Disassociated');">Disassociated</a>

        </div>
    </div>

    <div class="row mt-3 text-center">
        <div class="col-md-12 mt-3">

            <h3>Cambiar pantalla</h3>

            <div class="form-group">
                <label for="skuProduct">SKU Producto:</label>
                <input type="text" class="form-control" id="skuProduct" placeholder="Enter SKU">
            </div>

            <a class="btn btn-primary mt-2" onclick="changeScreen('Normal');">Activa Estado Normal</a>
            <a class="btn btn-primary mt-2" onclick="changeScreen('BuenFin');">Activa BuenFin</a>
            <a class="btn btn-primary mt-2" onclick="changeScreen('MartesFrescura');">Activa MartesFrescura</a>

        </div>
    </div>

    <div class="row mt-3">
        <div class="text-center">
            <a class="btn btn-danger mt-2" onclick="logout();">Cerrar sesion</a>
        </div>
    </div>

    `;
}

function logout() {
    // Cierra la sesion del navegador, borrando datos de navegacion
    localStorage.removeItem("sessionID");
    localStorage.removeItem("customerCode");
    localStorage.removeItem("storeCode");
    window.location.reload();
}

function login() {
    // Metodo encargado de hacer el login

    // Se recuperan los datos vaciados en el form de login
    let email = document.querySelector("#email");
    let password = document.querySelector("#password");
    let data = [];
    data.push(email.value, password.value);

    // Se realiza la peticon ajax al api, para ser enviada a PriSmart
    $.ajax({
        type: "POST",
        url: 'model/api-v1.php',
        data: $(this).serialize() + "&data_login="+data,
        success: function(response) {
            var jsonData = JSON.parse(response);

            // Se revisa si la respuesta fue positiva o no
            if(jsonData.result == "succeed") {
                localStorage.setItem("sessionID", jsonData.data["jsessionid"]);
                localStorage.setItem("customerCode", jsonData.data["customerCode"]);
                localStorage.setItem("storeCode", jsonData.data["storeCode"]);

                cleanContainer();
                loadButtons();

                Swal.fire({
                    icon: 'success',
                    title: 'Exito',
                    text: 'Inicio de sesión completo!'
                });

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR',
                    text: 'Datos invalidos!'
                });
            }

        }
    });

}

function loadTurnONLeds(value2ON) {
    // Metodo encargado de encender leds de las etiquetas

    // Se recuperan datos de la sesion y de la configuracion a encender
    let sessionId = localStorage.getItem("sessionID");
    let customerCode = localStorage.getItem("customerCode");
    let storeCode = localStorage.getItem("storeCode");
    let color = document.querySelector("#colorSelect");

    // Se verifica si la sesion realmente existe
    if(sessionId == null && customerCode == null && storeCode == null) {
        Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'No hay datos de una sesion iniciada'
        });

    } else {
        let data = [];
        data.push(value2ON, sessionId, customerCode, storeCode, color.value);

        // Se realiza la peticion ajax
        $.ajax({
            type: "POST",
            url: 'model/api-v1.php',
            data: $(this).serialize() + "&data_leds="+data,
            success: function(response) {
                var jsonData = JSON.parse(response);

                // Se verifica la respuesta obtenida por el API
                if(jsonData.message == "success") {
                    Swal.fire({
                        icon: 'success',
                        title: 'Exito',
                        text: 'Los leds se encenderan a continuación.'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'ERROR',
                        text: jsonData.message
                    });
                    localStorage.removeItem("sessionID");
                    localStorage.removeItem("customerCode");
                    localStorage.removeItem("storeCode");
                    window.location.reload();
                }

            }
        });

    }

}

function changeScreen(option) {
    // Metodo encargado de cambiar el template a una etiqueta

    // Se recuperan datos
    let sku = document.querySelector("#skuProduct");
    let sessionId = localStorage.getItem("sessionID");
    let customerCode = localStorage.getItem("customerCode");
    let storeCode = localStorage.getItem("storeCode");

    // Se verifica que haya una sesion iniciada
    if(sessionId == null && customerCode == null && storeCode == null) {
        Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'No hay datos de una sesion iniciada'
        });

    } else {
        let data = [];
        data.push(sku.value, option, sessionId, customerCode, storeCode);

        // Se realiza la peticion ajax
        $.ajax({
            type: "POST",
            url: 'model/api-v1.php',
            data: $(this).serialize() + "&data_promo="+data,

            success: function(response) {

                var jsonData = JSON.parse(response);

                // Se verifican los datos que responde el API
                if(jsonData.storeCode != null) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Exito',
                        text: 'Los cambios se aplicaron satisfactoriamente!'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'ERROR',
                        text: 'SKU invalido.'
                    });

                    if(jsonData.message != 'Nonexistent_goods' && jsonData.message != 'NoUser') {
                        localStorage.removeItem("sessionID");
                        localStorage.removeItem("customerCode");
                        localStorage.removeItem("storeCode");
                        window.location.reload();
                    }
                }

            }
        });

    }

}


$(document).ready(function() {
    if( !checkSession() ) {
        loadFormLogin();
    } else {
        loadButtons();
    }

});
