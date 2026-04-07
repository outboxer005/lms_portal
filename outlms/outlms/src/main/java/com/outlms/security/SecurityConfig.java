package com.outlms.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/h2-console/**", "/api/**") // Disable CSRF for H2 console and API
                                                                              // endpoints
                )
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin()) // Allow H2 console iframe
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/login", "/api/auth/forgot-password", "/api/auth/verify-otp",
                                "/api/auth/reset-password")
                        .permitAll()
                        .requestMatchers("/api/auth/validate").permitAll()
                        .requestMatchers("/api/student/register/**").permitAll()
                        .requestMatchers("/api/student/registration/**").permitAll()
                        .requestMatchers("/api/chat/guest").permitAll()
                        .requestMatchers("/error").permitAll()

                        // H2 Console
                        .requestMatchers("/h2-console/**").permitAll()

                        // Admin only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Shared staff/admin endpoints (keep out of /api/admin/** so STAFF can use
                        // them)
                        .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "STAFF")

                        // Library endpoints - method-level security handles fine-grained access
                        .requestMatchers("/api/books/**").authenticated() // Book retrieval is open to all authenticated
                                                                          // users
                        .requestMatchers("/api/ratings/**").authenticated() // Ratings are for all authenticated
                        .requestMatchers("/api/membership/**").authenticated()
                        .requestMatchers("/api/library/book-requests/**").authenticated()
                        .requestMatchers("/api/library/**").authenticated()

                        // Payment endpoints
                        .requestMatchers("/api/payments/**").authenticated()

                        // Student endpoints
                        .requestMatchers("/api/student/dashboard").hasRole("STUDENT")
                        .requestMatchers("/api/student/profile").hasRole("STUDENT")

                        // All other requests require authentication
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
