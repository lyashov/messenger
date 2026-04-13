package com.messenger.model;

import java.util.List;

public record ChatMessage(
        String type,
        String nickname,
        String target,
        String text,
        String sdp,
        Object candidate,
        List<String> users,
        long timestamp
) {}
