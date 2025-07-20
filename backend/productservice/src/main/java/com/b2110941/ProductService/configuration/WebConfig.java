package com.b2110941.ProductService.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static files từ thư mục uploads/products (tương đối với thư mục chạy project)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
    }
} 