// Подключение к серверу WebSocket
var conn = new WebSocket('ws://localhost:8080/socket');

// Функция для отправки сообщения на сервер
function send(message) {
    conn.send(JSON.stringify(message));
}

// Конфигурация для RTCPeerConnection (может быть расширена по мере необходимости)
var configuration = null;
var peerConnection = new RTCPeerConnection(configuration);

// Создание предложения и отправка на сервер
peerConnection.createOffer(function (offer) {
    send({
        event: "offer",
        data: offer
    });
    peerConnection.setLocalDescription(offer);
}, function (error) {
    console.error("Ошибка при создании предложения:", error);
});

// Обработка ICE-кандидатов и отправка на сервер
peerConnection.onicecandidate = function (event) {
    if (event.candidate) {
        send({
            event: "candidate",
            data: event.candidate
        });
    }
};

// Обработка сигнализационных данных от сервера
conn.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.event === "offer") {
        // Обработка предложения от другого клиента
        handleOffer(data.data);
    } else if (data.event === "answer") {
        // Обработка ответа от другого клиента
        handleAnswer(data.data);
    } else if (data.event === "candidate") {
        // Обработка ICE-кандидата от другого клиента
        handleCandidate(data.data);
    }
};

// Функция для обработки предложения
function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // Создание ответа
    peerConnection.createAnswer(function (answer) {
        send({
            event: "answer",
            data: answer
        });
        peerConnection.setLocalDescription(answer);
    }, function (error) {
        console.error("Ошибка при создании ответа:", error);
    });
}

// Функция для обработки ответа
function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

// Функция для обработки ICE-кандидата
function handleCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// Создание Data Channel
var dataChannel = peerConnection.createDataChannel("dataChannel", { reliable: true });

// Обработчики событий для Data Channel
dataChannel.onerror = function (error) {
    console.log("Error:", error);
};

dataChannel.onclose = function () {
    console.log("Data channel is closed");
};

dataChannel.onmessage = function (event) {
    console.log("Received message:", event.data);
};

dataChannel.onopen = function () {
    console.log("Data channel is open");
};

// Обработчик события для ondatachannel
peerConnection.ondatachannel = function (event) {
    dataChannel = event.channel;

    // Обработка событий datachannel, добавьте соответствующий код согласно инструкции.
};
