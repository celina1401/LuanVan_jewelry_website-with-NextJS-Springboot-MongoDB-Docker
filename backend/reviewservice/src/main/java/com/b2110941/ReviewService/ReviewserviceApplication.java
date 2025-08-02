package com.b2110941.ReviewService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@EnableDiscoveryClient
public class ReviewserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReviewserviceApplication.class, args);
	}

	// @Bean
	// public CommandLineRunner commandLineRunner() {
	// 	return args -> {
	// 		System.out.println("=== Eureka Configuration Debug ===");
	// 		System.out.println("Eureka Server URL: " + eurekaServerUrl);
	// 		System.out.println("==================================");
	// 	};
	// }
}
