package com.example.fullstackapp.security;

import com.example.fullstackapp.model.User;
import com.example.fullstackapp.repository.UserRepository;
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
        try {
            String jwt = extractToken(request);
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                // Parse claims and extract user info
                Claims claims = Jwts.parserBuilder()
                                    .setSigningKey(tokenProvider.getClerkPublicKey())
                                    .build()
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

                // Persist or update User in DB
                Optional<User> opt = userRepository.findById(clerkUserId);
                User currentUser;
                if (opt.isEmpty()) {
                    // Determine username if absent
                    if (!StringUtils.hasText(username)) {
                        if (StringUtils.hasText(firstName) && StringUtils.hasText(lastName)) {
                            username = firstName.toLowerCase() + "." + lastName.toLowerCase();
                        } else if (StringUtils.hasText(email)) {
                            username = email.split("@")[0];
                        } else {
                            username = clerkUserId;
                        }
                    }
                    currentUser = User.builder()
                            .id(clerkUserId)
                            .username(username)
                            .email(email)
                            .roles(Set.of("ROLE_" + role.toUpperCase()))
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .provider(provider)
                            .firstName(firstName)
                            .lastName(lastName)
                            .imageUrl(imageUrl)
                            .build();
                    currentUser = userRepository.save(currentUser);
                    log.info("New user saved: {}", currentUser.getUsername());
                } else {
                    // Update existing user's info/roles if changed
                    currentUser = opt.get();
                    boolean updated = false;

                    if (StringUtils.hasText(email) && !email.equals(currentUser.getEmail())) {
                        currentUser.setEmail(email);
                        updated = true;
                    }
                    if (StringUtils.hasText(username) && !username.equals(currentUser.getUsername())) {
                        currentUser.setUsername(username);
                        updated = true;
                    }
                    if (StringUtils.hasText(provider) && !provider.equals(currentUser.getProvider())) {
                        currentUser.setProvider(provider);
                        updated = true;
                    }
                    if (StringUtils.hasText(firstName) && !firstName.equals(currentUser.getFirstName())) {
                        currentUser.setFirstName(firstName);
                        updated = true;
                    }
                    if (StringUtils.hasText(lastName) && !lastName.equals(currentUser.getLastName())) {
                        currentUser.setLastName(lastName);
                        updated = true;
                    }
                    if (StringUtils.hasText(imageUrl) && !imageUrl.equals(currentUser.getImageUrl())) {
                        currentUser.setImageUrl(imageUrl);
                        updated = true;
                    }
                    Set<String> newRoles = Set.of("ROLE_" + role.toUpperCase());
                    if (!currentUser.getRoles().equals(newRoles)) {
                        currentUser.setRoles(newRoles);
                        updated = true;
                    }
                    if (updated) {
                        currentUser.setUpdatedAt(LocalDateTime.now());
                        currentUser = userRepository.save(currentUser);
                        log.info("User updated: {}", currentUser.getUsername());
                    }
                }

                // Build Authentication and set in context
                UserDetails userDetails = userDetailsService.loadUserByUsername(currentUser.getId());
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
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
