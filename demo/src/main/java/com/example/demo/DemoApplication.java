package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
		System.out.println("✅ E-commerce Backend running on http://localhost:8080");
		System.out.println("📊 MongoDB: mongodb://localhost:27017/ecommerce");
		System.out.println("🌐 CORS enabled for: http://localhost:3000");
	}

}
