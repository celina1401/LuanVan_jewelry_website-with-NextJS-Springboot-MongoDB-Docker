package com.example.fullstackapp.security;

import com.example.fullstackapp.model.User;
import com.example.fullstackapp.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.Optional;
import java.util.Set;
import java.util.Map;

// Import JWT Classes
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsServiceImpl userDetailsService; // Keep if you still need UserDetailsImpl for roles/authorities

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
    
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                // Get claims from the token
                Claims claims = Jwts.parserBuilder()
                                    .setSigningKey(tokenProvider.getClerkPublicKey())
                                    .build()
                                    .parseClaimsJws(jwt)
                                    .getBody();
    
                String clerkUserId = claims.getSubject(); // Subject (sub) claim in JWT is usually the user ID
                String email = claims.get("email", String.class); // Assuming Clerk adds email claim
                String username = claims.get("username", String.class); // Assuming Clerk adds username claim
                
                // Thêm xử lý cho OAuth providers (Google, Facebook)
                String provider = null;
                String firstName = null;
                String lastName = null;
                String imageUrl = null;
                
                // Kiểm tra thông tin OAuth provider từ claims
                if (claims.containsKey("oauth_provider")) {
                    provider = claims.get("oauth_provider", String.class);
                }
                
                // Lấy thông tin tên từ claims
                if (claims.containsKey("first_name")) {
                    firstName = claims.get("first_name", String.class);
                } else if (claims.containsKey("given_name")) {
                    firstName = claims.get("given_name", String.class);
                }
                
                if (claims.containsKey("last_name")) {
                    lastName = claims.get("last_name", String.class);
                } else if (claims.containsKey("family_name")) {
                    lastName = claims.get("family_name", String.class);
                }
                
                // Lấy avatar URL nếu có
                if (claims.containsKey("picture")) {
                    imageUrl = claims.get("picture", String.class);
                } else if (claims.containsKey("image_url")) {
                    imageUrl = claims.get("image_url", String.class);
                }
    
                // *** Lấy publicMetadata và role từ claims ***
                String role = null;
                if (claims.containsKey("public_metadata")) {
                    Object publicMetadata = claims.get("public_metadata");
                    if (publicMetadata instanceof Map) {
                        Map<?, ?> publicMetadataMap = (Map<?, ?>) publicMetadata;
                        if (publicMetadataMap.containsKey("role")) {
                            role = publicMetadataMap.get("role").toString();
                        }
                    }
                }
                // *****************************************
    
                // Check if user exists in DB, if not, save them
                Optional<User> existingUser = userRepository.findById(clerkUserId);
    
                User currentUser;
    
                if (!existingUser.isPresent()) {
                    // Nếu username chưa có, tạo từ firstName và lastName hoặc email
                    if (username == null) {
                        if (firstName != null && lastName != null) {
                            username = firstName.toLowerCase() + "." + lastName.toLowerCase();
                        } else if (email != null) {
                            username = email.split("@")[0];
                        } else {
                            username = clerkUserId;
                        }
                    }
                    
                    User newUser = User.builder()
                                     .id(clerkUserId)
                                     .username(username)
                                     .email(email)
                                     .roles(role != null ? Set.of("ROLE_" + role.toUpperCase()) : Set.of("ROLE_USER"))
                                     .createdAt(new Date().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime())
                                     .updatedAt(new Date().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime())
                                     .provider(provider) // Lưu thông tin provider
                                     .firstName(firstName)
                                     .lastName(lastName)
                                     .imageUrl(imageUrl)
                                     .build();
                    currentUser = userRepository.save(newUser);
                    log.info("New user saved to DB: {}", currentUser.getUsername());
                } else {
                     // Optional: Update user info and role if needed
                     User userToUpdate = existingUser.get();
                     boolean updated = false;
                     
                     // Cập nhật thông tin cơ bản
                     if (email != null && !email.equals(userToUpdate.getEmail())) {
                         userToUpdate.setEmail(email);
                         updated = true;
                     }
                     if (username != null && !username.equals(userToUpdate.getUsername())) {
                         userToUpdate.setUsername(username);
                         updated = true;
                     }
                     
                     // Cập nhật thông tin từ OAuth provider
                     if (provider != null && !provider.equals(userToUpdate.getProvider())) {
                         userToUpdate.setProvider(provider);
                         updated = true;
                     }
                     if (firstName != null && !firstName.equals(userToUpdate.getFirstName())) {
                         userToUpdate.setFirstName(firstName);
                         updated = true;
                     }
                     if (lastName != null && !lastName.equals(userToUpdate.getLastName())) {
                         userToUpdate.setLastName(lastName);
                         updated = true;
                     }
                     if (imageUrl != null && !imageUrl.equals(userToUpdate.getImageUrl())) {
                         userToUpdate.setImageUrl(imageUrl);
                         updated = true;
                     }
                     
                     // *** Cập nhật role nếu có trong claims và khác với role hiện tại ***
                     Set<String> currentRoles = userToUpdate.getRoles();
                     Set<String> newRoles = role != null ? Set.of("ROLE_" + role.toUpperCase()) : Set.of("ROLE_USER");
    
                     if (!currentRoles.equals(newRoles)) {
                         userToUpdate.setRoles(newRoles);
                         updated = true;
                     }
                     // **********************************************************
    
                     if (updated) {
                         userToUpdate.setUpdatedAt(new Date().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
                         currentUser = userRepository.save(userToUpdate);
                         log.info("User info updated for: {}", currentUser.getUsername());
                     } else {
                         currentUser = userToUpdate;
                     }
                }
    
                // Proceed with setting authentication in SecurityContextHolder
                // We now have the User object with correct roles from DB
                // We need UserDetails based on the roles saved in our DB
                UserDetails userDetails = userDetailsService.loadUserByUsername(currentUser.getId()); // Assuming UserDetailsServiceImpl can load by ID and get roles from the User object
    
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }
    
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}