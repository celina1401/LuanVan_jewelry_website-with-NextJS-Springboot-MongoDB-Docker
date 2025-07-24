package com.b2110941.ChatService.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Date;

@Data
@AllArgsConstructor
public class ChatSummary {
    private String userId;
    private String lastMessage;
    private Date timestamp;
    private long unreadCount; // nhớ đúng kiểu `long`

    // Nếu không dùng @AllArgsConstructor, thêm thủ công:
    // public ChatSummary(String userId, String lastMessage, Date timestamp, long unreadCount) { ... }
}
