package com.platform.consultation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class ConsultationApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConsultationApplication.class, args);
    }
}
