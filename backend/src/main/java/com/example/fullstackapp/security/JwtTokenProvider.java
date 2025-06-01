package com.example.fullstackapp.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.PublicKey;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.IOUtils;
import org.jose4j.jwk.JsonWebKey;
import org.jose4j.jwk.JsonWebKeySet;
import org.jose4j.lang.JoseException;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${clerk.jwks.url}")
    private String clerkJwksUrl;

    public String generateToken(Authentication authentication) {
        // This method might not be needed if token generation is handled by Clerk
        // If you need to generate tokens on the backend for other purposes,
        // you'll need a private key and use SignatureAlgorithm.RS256
        throw new UnsupportedOperationException("Token generation is handled by Clerk");
    }

    // Inside getUsernameFromToken method
    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getClerkPublicKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
    
            // Try to get username from various sources
            String username = claims.get("username", String.class);
            if (username == null) {
                // Try first_name + last_name
                String firstName = claims.get("first_name", String.class);
                String lastName = claims.get("last_name", String.class);
                
                if (firstName != null && lastName != null) {
                    username = firstName.toLowerCase() + "." + lastName.toLowerCase();
                } else {
                    // Try email
                    String email = claims.get("email", String.class);
                    if (email != null) {
                        username = email.split("@")[0];
                    } else {
                        // Use subject (user ID) as username
                        username = claims.getSubject();
                    }
                }
            }
    
            return username;
        } catch (Exception e) {
            log.error("Error extracting username from token: {}", e.getMessage());
            throw new RuntimeException("Error extracting username from token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getClerkPublicKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        } catch (IOException e) {
            log.error("Error reading public key: {}", e.getMessage());
        }
        return false;
    }

    public PublicKey getClerkPublicKey() throws IOException {
        try {
            URL url = new URL(clerkJwksUrl);
            try (InputStream is = url.openStream()) {
                String jwksJson = IOUtils.toString(is, StandardCharsets.UTF_8);
                JsonWebKeySet jwkSet = new JsonWebKeySet(jwksJson);

                // Get the first public key (can be improved later to match by "kid")
                JsonWebKey jwk = jwkSet.getJsonWebKeys().get(0);
                return (PublicKey) jwk.getKey();
            }
        } catch (JoseException | IOException e) {
            log.error("Error fetching Clerk public key: {}", e.getMessage());
            throw new IOException("Error parsing Clerk JWKS", e);
        }
    }
}