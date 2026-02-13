package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // En pointant vers "file:/app/", Spring va chercher le reste du chemin
        // de l'URL (qui commence par /uploads/...) à l'intérieur de /app/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/app/");
    }
}