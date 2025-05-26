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

    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getClerkPublicKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
            throw new RuntimeException("Error extracting username from token", e);
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            throw new RuntimeException("Error extracting username from token", e);
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
            throw new RuntimeException("Error extracting username from token", e);
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
            throw new RuntimeException("Error extracting username from token", e);
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
            throw new RuntimeException("Error extracting username from token", e);
        } catch (IOException e) {
            log.error("Error reading public key: {}", e.getMessage());
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