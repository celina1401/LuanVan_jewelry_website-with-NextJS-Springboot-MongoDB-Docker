package com.b2110941.ChatService.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Date;

@Data
@AllArgsConstructor
public class ChatSummary {
    private String userId;
    private String username;
    private String lastMessage;
    private Date timestamp;
    private long unreadCount; // nhớ đúng kiểu `long`

}
