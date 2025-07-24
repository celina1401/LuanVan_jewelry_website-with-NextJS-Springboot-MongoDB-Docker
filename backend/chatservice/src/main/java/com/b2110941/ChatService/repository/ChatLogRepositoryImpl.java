package com.b2110941.ChatService.repository;

import com.b2110941.ChatService.entity.ChatLog;
import com.b2110941.ChatService.entity.ChatSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Repository
public class ChatLogRepositoryImpl implements ChatLogRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<ChatSummary> aggregateLastMessagesPerUser() {
        MatchOperation match = match(new Criteria().orOperator(
                Criteria.where("sender").ne("admin").and("receiver").is("admin"),
                Criteria.where("sender").is("admin").and("receiver").ne("admin")
        ));

        SortOperation sort = sort(Sort.Direction.DESC, "timestamp");

        ProjectionOperation projectUserId = project("sender", "receiver", "content", "timestamp", "read")
                .and(
                        ConditionalOperators.when(Criteria.where("sender").is("admin"))
                                .thenValueOf("receiver")
                                .otherwiseValueOf("sender")
                ).as("userId");

        GroupOperation group = group("userId")
                .first("userId").as("userId")
                .first("content").as("lastMessage")
                .first("timestamp").as("timestamp")
                .sum(ConditionalOperators.when(Criteria.where("read").is(false)).then(1).otherwise(0)).as("unreadCount");

        ProjectionOperation project = project("userId", "lastMessage", "timestamp", "unreadCount");

        Aggregation aggregation = newAggregation(
                match,
                sort,
                projectUserId,
                group,
                project
        );

        return mongoTemplate.aggregate(aggregation, ChatLog.class, ChatSummary.class).getMappedResults();
    }

    @Override
    public List<ChatSummary> aggregateLastMessagesBetweenAdminAndUsers() {
        MatchOperation match = match(new Criteria().orOperator(
                Criteria.where("sender").ne("admin").and("receiver").is("admin"),
                Criteria.where("sender").is("admin").and("receiver").ne("admin")
        ));

        SortOperation sort = sort(Sort.Direction.DESC, "timestamp");

        ProjectionOperation projectUserId = project("sender", "receiver", "content", "timestamp", "read")
                .and(
                        ConditionalOperators.when(Criteria.where("sender").is("admin"))
                                .thenValueOf("receiver")
                                .otherwiseValueOf("sender")
                ).as("userId");

        GroupOperation group = group("userId")
                .first("userId").as("userId")
                .first("content").as("lastMessage")
                .first("timestamp").as("timestamp")
                .sum(ConditionalOperators.when(Criteria.where("read").is(false)).then(1).otherwise(0)).as("unreadCount");

        ProjectionOperation project = project("userId", "lastMessage", "timestamp", "unreadCount");

        Aggregation aggregation = newAggregation(
                match,
                sort,
                projectUserId,
                group,
                project
        );

        return mongoTemplate.aggregate(aggregation, ChatLog.class, ChatSummary.class).getMappedResults();
    }
}
