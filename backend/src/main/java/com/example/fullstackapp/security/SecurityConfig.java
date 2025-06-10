package com.example.fullstackapp.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.fullstackapp.model.ClerkProperties;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(ClerkProperties.class)
public class SecurityConfig {

    private final ClerkProperties clerkProps;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    @Autowired
    public SecurityConfig(ClerkProperties clerkProps,
                          JwtAuthenticationEntryPoint unauthorizedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          CustomAccessDeniedHandler customAccessDeniedHandler) {
        this.clerkProps = clerkProps;
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
    }

    /**
     * Tạo JwtDecoder từ JWKS URL cấu hình
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri(clerkProps.getJwksUrl()).build();
    }

    /**
     * Converter trích authorities từ claim public_metadata.role
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Map<String, Object> publicMetadata = jwt.getClaimAsMap("public_metadata");
            if (publicMetadata == null) {
                return Collections.emptyList();
            }
            Object roleClaim = publicMetadata.get("role");
            List<String> roles;
            if (roleClaim instanceof String) {
                roles = Collections.singletonList((String) roleClaim);
            } else if (roleClaim instanceof List) {
                roles = ((List<?>) roleClaim).stream()
                    .filter(o -> o instanceof String)
                    .map(Object::toString)
                    .collect(Collectors.toList());
            } else {
                return Collections.emptyList();
            }
            return roles.stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                .collect(Collectors.toList());
        });
        return converter;
    }

    /**
     * CORS configuration cho phép frontend tại localhost
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Cấu hình SecurityFilterChain: CORS, CSRF, exception, session, authorize, JWT resource server
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // Cấu hình CORS
            .csrf(csrf -> csrf.disable())  // Tắt CSRF cho các API sử dụng JWT
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(unauthorizedHandler)  // Entry point cho các request không hợp lệ
                .accessDeniedHandler(customAccessDeniedHandler)  // Access denied handler cho quyền không đủ
            )
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // Stateless session (không lưu session)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/products/**", "/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()  // Cho phép công khai các API auth và public
                .requestMatchers("/api/admin/**").hasRole("ADMIN")  // Chỉ ADMIN có quyền truy cập vào các API admin
                .requestMatchers("/api/role/user").hasAnyRole("USER", "ADMIN")  // Cho phép cả USER và ADMIN truy cập vào "/api/role/user"
                .requestMatchers("/api/role/admin").hasRole("ADMIN")  // Chỉ ADMIN có quyền truy cập vào "/api/role/admin"
                .anyRequest().authenticated()  // Các yêu cầu còn lại phải được xác thực
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())  // Cấu hình JwtDecoder
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())  // Cấu hình converter để lấy roles từ JWT
                )
            );

        // Thêm custom filter đã được Spring quản lý
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);  // Thêm filter kiểm tra JWT vào trước filter authentication mặc định
        return http.build();  // Xây dựng và trả về cấu hình HTTP
    }
}
