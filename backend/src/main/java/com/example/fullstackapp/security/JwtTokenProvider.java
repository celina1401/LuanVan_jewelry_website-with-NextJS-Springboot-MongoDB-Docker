package com.example.fullstackapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.jose4j.jwk.JsonWebKey;
import org.jose4j.jwk.JsonWebKeySet;
import org.jose4j.lang.JoseException;
import org.springframework.stereotype.Component;

import com.example.fullstackapp.model.ClerkProperties;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.PublicKey;

@Component
@Slf4j
public class JwtTokenProvider {

    private final ClerkProperties clerkProps;

    public JwtTokenProvider(ClerkProperties clerkProps) {
        this.clerkProps = clerkProps;
    }

    /**
     * Lấy PublicKey từ JWKS URL cấu hình trong ClerkProperties
     */
    public PublicKey getClerkPublicKey() throws IOException {
        String jwksUrl = clerkProps.getJwksUrl();
        try (InputStream is = new URL(jwksUrl).openStream()) {
            String jwksJson = IOUtils.toString(is, StandardCharsets.UTF_8);
            JsonWebKeySet jwkSet = new JsonWebKeySet(jwksJson);
            JsonWebKey jwk = jwkSet.getJsonWebKeys().get(0); // có thể lọc theo kid nếu cần
            return (PublicKey) jwk.getKey();
        } catch (JoseException | IOException e) {
            log.error("Error fetching Clerk public key from {}: {}", jwksUrl, e.getMessage());
            throw new IOException("Failed to load Clerk JWKS", e);
        }
    }

    /**
     * Kiểm tra tính hợp lệ của JWT
     */
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

    /**
     * Trích Claims ra từ JWT sau khi đã validate
     */
    public Claims parseClaims(String token) throws IOException {
        return Jwts.parserBuilder()
                   .setSigningKey(getClerkPublicKey())
                   .build()
                   .parseClaimsJws(token)
                   .getBody();
    }
}
