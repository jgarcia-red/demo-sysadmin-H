<?php

if ( isset($_POST['data_login']) ) {

    // Recuperamos los parametros enviados por POST
    $dataPost = explode(",", $_POST['data_login']);

    $url = 'https://{endpoint_url}.net/esl/login';

    // Iniciamos la peticion POST
    $curl = curl_init();
    $fields = array(
        'username' => $dataPost[0],
        'password' => $dataPost[1]
    );
    $json_string = json_encode($fields);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, TRUE);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $json_string);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json;charset=utf-8'));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true );
    $data = curl_exec($curl);
    curl_close($curl);

    // Devolvemos el JSON obtenido de la peticion POST
    echo $data;

} else if ( isset($_POST['data_leds']) ) {

    // Recuperamos los parametros enviados por POST
    $dataPost = explode(",", $_POST['data_leds']);

    // Concatenamos la url para realizar la primera peticion y revisar el status de los ESL
    $url = 'https://{endpoint_url}.net/esl/esl/'.$dataPost[2].'/'.$dataPost[3];

    // Iniciamos la peticion GET
    $curl = curl_init();
    $fields = array();
    $json_string = json_encode($fields);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_GET, TRUE);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json;charset=utf-8',
                                                'client-id:{private id}',
                                                'client-secret:{private client secret}'));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true );
    $data = curl_exec($curl);
    curl_close($curl);

    // Convertimos el JSON obtenido de la peticion en un array que pueda manejar PHP
    $data = json_decode($data, true);

    // Una vez que tenemos la información de todos los ESL, verificamos cuales tenemos que encender
    // Revisamos cuales ESL tenemos que encender y las guardamos en el arreglo $toTurnOn
    $toTurnOn = array();
    for ($i=0; $i < sizeof($data["eslList"]); $i++) {
        if( $data["eslList"][$i]["status"] ==  $dataPost[0]) {
            array_push($toTurnOn, $data["eslList"][$i]);
        }
    }

    // Sacamos el color a encender
    $color = $dataPost[4];

    // Preparamos el JSON que se envia a la peticion para encender los N ESL
    $arrayToSend = array();
    for ($i=0; $i < sizeof($toTurnOn); $i++) {
        $toPush = array(
            "eslId" => $toTurnOn[$i]["eslId"],
            "led_color" => [$color],
            "led_count" => "100"
        );
        array_push($arrayToSend, $toPush);
    }


    // Concatenamos la URL de la peticion para encender leds
    $url = 'https://{endpoint_url}.net/esl/setEslControl;jsessionid=';
    $url .= $dataPost[1];

    // Iniciamos la peticion POST
    $curl = curl_init();
    $json_string = json_encode($arrayToSend);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, TRUE);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $json_string);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json;charset=utf-8',
                                                'client-id:{private id}',
                                                'client-secret:{private client secret}'));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true );
    $data = curl_exec($curl);
    curl_close($curl);

    // Devolvemos el JSON obtenido de la peticion POST
    echo $data;

} else if ( isset($_POST['data_promo']) ) {

    // Recuperamos los parametros enviados por POST
    $dataPost = explode(",", $_POST['data_promo']);

    // Verificamos la pantalla que se va a poner
    switch ($dataPost[1]) {
        case 'BuenFin':
            $promoFlag = 1;
            break;

        case 'MartesFrescura':
            $promoFlag = 2;
            break;

        default:
            $promoFlag = 0;
            break;
    }

    // Se tiene que buscar que exista el producto antes de intentar cambiarlo
    // Se concatena la url para obtener la informacion de un articulo
    $url = 'https://{endpoint_url}.net/esl/getGoodsByIdOrBarcode;jsessionid=';
    $url .= $dataPost[2];

    // Se inicia la peticion POST para saber la información de un producto
    $curl = curl_init();
    $arrayToFind = array(
        "code" => $dataPost[0]
    );
    $json_string = json_encode($arrayToFind);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, TRUE);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $json_string);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json;charset=utf-8',
                                                'client-id:{private id}',
                                                'client-secret:{private client secret}'));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true );
    $data = curl_exec($curl);
    curl_close($curl);

    // Convertimos el JSON devuelto en un array que PHP pueda manejar
    $data = json_decode($data, true);

    // Revisamos si hemos conseguido un articulo, o un mensaje de error por parte del API
    if($data['message'] != "success") {
        echo json_encode($data);

    } else {
        // Si existe el producto entonces se procede a cambiar la pantalla

        // Concatenamos la url para realizar la peticion
        $url = 'https://{endpoint_url}.net/integration/'.$dataPost[3].'/'.$dataPost[4];

        // Se inicia la peticion POST
        $curl = curl_init();
        $fields = array(
            'storeCode' => $dataPost[4],
            'customerStoreCode' => $dataPost[3],
            'batchNo' => rand(0, 200).time().rand(0,200),
            'items' => array(
                array( 'sku' => $dataPost[0],
                'promoFlag' => $promoFlag )
            )
        );
        $json_string = json_encode($fields);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_POST, TRUE);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $json_string);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json;charset=utf-8',
                                                    'client-id:{private id}',
                                                    'client-secret:{private client secret}'));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true );
        $data = curl_exec($curl);
        curl_close($curl);

        // Se devuelve el JSON obtenido con la peticion
        echo $data;
    }

}