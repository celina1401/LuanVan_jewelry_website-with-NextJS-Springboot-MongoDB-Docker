package com.b2110941.ReviewService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
// @EnableDiscoveryClient
public class ReviewserviceApplication {

	// @Value("${eureka.client.service-url.defaultZone:http://discoveryserver:8761/eureka}")
	// private String eurekaServerUrl;

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
