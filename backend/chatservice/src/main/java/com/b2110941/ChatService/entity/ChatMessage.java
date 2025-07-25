package com.b2110941.ChatService.entity;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    private String sender;
    private String nickname;
    private String receiver;
    private String role;
    private String content;
    private Date timestamp;
    private String type;
    
    public ChatMessage(String sender, String role, String content, Date timestamp) {
        this.sender = sender;
        this.role = role;
        this.content = content;
        this.timestamp = timestamp;
    }

}
