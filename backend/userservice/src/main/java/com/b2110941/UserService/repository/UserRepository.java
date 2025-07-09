package com.b2110941.UserService.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.b2110941.UserService.entity.UserEntity;

@Repository
public interface UserRepository extends MongoRepository<UserEntity, String> {
    Optional<UserEntity> findByUsername(String username);
    
    Optional<UserEntity> findByEmail(String email);
    
    Boolean existsByUsername(String username);

    Boolean existsByUserId(String userId);
    
    Boolean existsByEmail(String email);

    Optional<UserEntity> findByUserId(String userId);
}
