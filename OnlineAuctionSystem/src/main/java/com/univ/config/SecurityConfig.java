//package com.univ.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
//@Configuration
//public class SecurityConfig {
//
////	private final JwtAuthenticationFilter jwtAuthenticationFilter;
////
////	SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
////		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
////	}
//
//	@Bean
//	public PasswordEncoder passwordEncoder() {
//		return new BCryptPasswordEncoder();
//	}
//
//	@Bean
//	public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
//			throws Exception {
//
//		http
//
////				.csrf(csrf -> csrf.disable())
////				.authorizeHttpRequests(
////						auth -> auth.requestMatchers("/register", "/login").permitAll().requestMatchers("/test").hasAnyRole("USER","ADMIN").requestMatchers("/user/**").hasRole("USER").requestMatchers("/admin/**").hasRole("ADMIN").anyRequest().authenticated())
////				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
////
//		
//		 .csrf(csrf -> csrf.disable())
//	        .authorizeHttpRequests(auth -> auth
//	            .anyRequest().permitAll()
//	        )
//	        .addFilterBefore(
//	            jwtAuthenticationFilter,
//	            UsernamePasswordAuthenticationFilter.class
//	        );
//				
//		return http.build();
//
//	}
//
//}

package com.univ.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
		org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
		configuration.setAllowedOriginPatterns(java.util.List.of("*"));
		configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
		configuration.setAllowedHeaders(java.util.List.of("*"));
		configuration.setAllowCredentials(true);
		org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
			throws Exception {

		http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				.authorizeHttpRequests(auth -> auth

						// Allow preflight OPTIONS requests
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						// Public APIs
						.requestMatchers("/register", "/login").permitAll()

						// Swagger
						.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

						// Admin Operations
						.requestMatchers("/auction/create").hasRole("ADMIN")
						.requestMatchers("/auction/close/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/auction/**").hasRole("ADMIN")
						.requestMatchers("/admin/**").hasRole("ADMIN")
						.requestMatchers("/auction/my").hasRole("ADMIN")
						.requestMatchers("/bid/all").hasRole("ADMIN")

						// User Operations
						.requestMatchers("/bid/place/**").hasRole("USER")
						.requestMatchers("/bid/my").hasRole("USER")

						// Common Authenticated APIs
						.requestMatchers("/auction/all").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/auction/*/winner").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/auction/**").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/bid/auction/**").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/bid/auction/*/page").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/dashboard/**").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/watchlist/**").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/notification/**").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/test").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/auction/closed").hasAnyRole("USER", "ADMIN")

						.anyRequest().authenticated())

				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
