package com.b2110941.UserService.configuration.security;

import com.b2110941.UserService.entity.UserEntity;
import com.b2110941.UserService.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;    
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserRepository userRepository;
    private final String headerName;
    private final String tokenPrefix;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider,
                                   UserDetailsServiceImpl userDetailsService,
                                   UserRepository userRepository,
                                   @Value("${clerk.token.header:Authorization}") String headerName,
                                   @Value("${clerk.token.prefix:Bearer }") String tokenPrefix) {
        this.tokenProvider     = tokenProvider;
        this.userDetailsService = userDetailsService;
        this.userRepository    = userRepository;
        this.headerName        = headerName;
        this.tokenPrefix       = tokenPrefix;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path.equals("/api/users/sync-role") || path.equals("/api/users/test")) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            String jwt = extractToken(request);
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                // Parse claims and extract user info
                Claims claims = Jwts.parser()
                                    .setSigningKey(tokenProvider.getClerkPublicKey())
                                    .parseClaimsJws(jwt)
                                    .getBody();

                String clerkUserId = claims.getSubject();
                String email       = claims.get("email", String.class);
                String username    = claims.get("username", String.class);

                // OAuth provider info
                String provider = claims.get("oauth_provider", String.class);
                String firstName = claims.containsKey("first_name")
                                    ? claims.get("first_name", String.class)
                                    : claims.get("given_name", String.class);
                String lastName  = claims.containsKey("last_name")
                                    ? claims.get("last_name", String.class)
                                    : claims.get("family_name", String.class);
                String imageUrl  = claims.containsKey("picture")
                                    ? claims.get("picture", String.class)
                                    : claims.get("image_url", String.class);

                // Get role using the new extraction method
                String role = tokenProvider.extractRole(claims);

                // Persist or update UserEntity in DB
                Optional<UserEntity> opt = userRepository.findById(clerkUserId);
                UserEntity currentUser = opt.orElse(null);
                // Build Authentication and set in context nếu user đã tồn tại
                if (currentUser != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(currentUser.getId());
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (Exception ex) {
            log.error("Cannot set user authentication: {}", ex.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(headerName);
        if (StringUtils.hasText(header) && header.startsWith(tokenPrefix)) {
            return header.substring(tokenPrefix.length());
        }
        return null;
    }
}
