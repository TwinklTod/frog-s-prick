// Создаем WebSocket-соединение с сервером сигнализации
var conn = new WebSocket('ws://localhost:8080/socket');

// Функция для отправки сообщений по WebSocket
function send(message) {
    conn.send(JSON.stringify(message));
}

// Конфигурация серверов ICE (STUN и TURN)
var configuration = {
    "iceServers" : [
        {
            "url" : "stun:stun2.1.google.com:19302"
        },
        {
            'urls': 'turn:your-turn-server-ip:3478?transport=udp',
            'credential': 'your-credential',
            'username': 'your-username'
        },
        {
            'urls': 'turn:your-turn-server-ip:3478?transport=tcp',
            'credential': 'your-credential',
            'username': 'your-username'
        }
    ]
};

// Создаем объект RTCPeerConnection с использованием конфигурации
var peerConnection = new RTCPeerConnection(configuration);

// Создаем канал данных для передачи сообщений
var dataChannel = peerConnection.createDataChannel("dataChannel", { reliable: true });

// Обработчик ошибок на канале данных
dataChannel.onerror = function(error) {
    console.log("Ошибка:", error);
};

// Обработчик закрытия канала данных
dataChannel.onclose = function() {
    console.log("Канал данных закрыт");
};

// Обработчик события приема оффера от другого пира
function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    peerConnection.createAnswer(function(answer) {
        peerConnection.setLocalDescription(answer);
        send({
            event : "answer",
            data : answer
        });
    }, function(error) {
        console.error("Ошибка создания ответа:", error);
    });
}

// Обработчик события приема ICE-кандидата от другого пира
function handleCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// Обработчик события приема сообщения от сервера сигнализации
conn.onmessage = function(event) {
    var message = JSON.parse(event.data);

    switch (message.event) {
        case "offer":
            handleOffer(message.data);
            break;
        case "answer":
            handleAnswer(message.data);
            break;
        case "candidate":
            handleCandidate(message.data);
            break;
    }
};

// Обработчик события генерации ICE-кандидата
peerConnection.onicecandidate = function(event) {
    if (event.candidate) {
        send({
            event : "candidate",
            data : event.candidate
        });
    }
};

// Обработчик события открытия канала данных
peerConnection.ondatachannel = function (event) {
    dataChannel = event.channel;
};

// Добавьте код для обработки видео- и аудиоканалов здесь

// Остальной код вашего client.js...
