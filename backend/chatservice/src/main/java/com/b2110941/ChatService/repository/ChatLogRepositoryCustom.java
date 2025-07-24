package com.b2110941.ChatService.repository;

import java.util.List;

import com.b2110941.ChatService.entity.ChatSummary;

interface ChatLogRepositoryCustom {
    List<ChatSummary> aggregateLastMessagesPerUser();
    List<ChatSummary> aggregateLastMessagesBetweenAdminAndUsers();
}
