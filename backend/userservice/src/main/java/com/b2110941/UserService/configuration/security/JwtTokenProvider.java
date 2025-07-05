package com.b2110941.UserService.configuration.security;

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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.PublicKey;
import java.util.Map;

@Component
@Slf4j
public class JwtTokenProvider {
    private final String jwksUrl;
    private final String issuer;

    public JwtTokenProvider(
            @Value("${clerk.jwks-url}") String jwksUrl,
            @Value("${clerk.issuer}") String issuer) {
        this.jwksUrl = jwksUrl;
        this.issuer = issuer;
    }

    /**
     * Lấy PublicKey từ JWKS URL cấu hình
     */
    public PublicKey getClerkPublicKey() throws IOException {
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
            Claims claims = Jwts.parser()
                .setSigningKey(getClerkPublicKey())
                .parseClaimsJws(token)
                .getBody();

            // Validate issuer
            String tokenIssuer = claims.getIssuer();
            if (!issuer.equals(tokenIssuer)) {
                log.error("Invalid JWT issuer: {}", tokenIssuer);
                return false;
            }

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
        return Jwts.parser()
                   .setSigningKey(getClerkPublicKey())
                   .parseClaimsJws(token)
                   .getBody();
    }

    public String extractRole(Claims claims) {
        // Try to get role from public_metadata
        Map<String, Object> publicMetadata = claims.get("public_metadata", Map.class);
        if (publicMetadata != null && publicMetadata.containsKey("role")) {
            return publicMetadata.get("role").toString();
        }

        // Try to get role from session token
        String sessionToken = claims.get("session", String.class);
        if (sessionToken != null) {
            try {
                Claims sessionClaims = parseClaims(sessionToken);
                Map<String, Object> sessionMetadata = sessionClaims.get("public_metadata", Map.class);
                if (sessionMetadata != null && sessionMetadata.containsKey("role")) {
                    return sessionMetadata.get("role").toString();
                }
            } catch (Exception e) {
                log.error("Error parsing session token: {}", e.getMessage());
            }
        }

        return "user"; // Default role
    }
}
