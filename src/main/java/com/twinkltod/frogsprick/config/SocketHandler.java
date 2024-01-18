package com.twinkltod.frogsprick.config;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;

@Component
public class SocketHandler extends TextWebSocketHandler {

    private List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        for (WebSocketSession otherSession : sessions) {
            if (otherSession.isOpen() && !session.getId().equals(otherSession.getId())) {
                otherSession.sendMessage(message);
            }
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
    }

    // Метод для обработки сигнализации
    public void handleSignalingData(WebSocketSession session, String signalingData) throws IOException {
        for (WebSocketSession otherSession : sessions) {
            if (otherSession.isOpen() && !session.getId().equals(otherSession.getId())) {
                // Отправляем сигнализационные данные другим клиентам
                otherSession.sendMessage(new TextMessage(signalingData));
            }
        }
    }
}
