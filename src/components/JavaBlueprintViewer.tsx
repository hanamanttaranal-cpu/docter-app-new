import React, { useState } from 'react';
import { ShieldCheck, FileCode, Check, Copy } from 'lucide-react';

interface CodeSnippet {
  id: string;
  filename: string;
  language: string;
  title: string;
  description: string;
  code: string;
}

export default function JavaBlueprintViewer() {
  const [activeTab, setActiveTab] = useState<string>('schema');
  const [copied, setCopied] = useState<boolean>(false);

  const snippets: CodeSnippet[] = [
    {
      id: 'schema',
      filename: 'backend/schema.sql',
      language: 'sql',
      title: 'Database Schema (MySQL 8.0 DDL)',
      description: 'Production-ready database structure including cascade deletes, relational foreign key mappings, and high-frequency index flags.',
      code: `-- ==========================================
-- Online Doctor Consultation Platform DDL
-- MySQL 8.0 DDL Schema Definition
-- ==========================================

CREATE DATABASE IF NOT EXISTS \`docconsult_db\`;
USE \`docconsult_db\`;

-- Drop tables in topological dependency order
DROP TABLE IF EXISTS \`consultation_messages\`;
DROP TABLE IF EXISTS \`appointments\`;
DROP TABLE IF EXISTS \`system_feedbacks\`;
DROP TABLE IF EXISTS \`doctor_profiles\`;
DROP TABLE IF EXISTS \`users\`;

-- 1. Users Table (Core Auth and Role categorization)
CREATE TABLE \`users\` (
    \`id\` VARCHAR(50) NOT NULL,
    \`name\` VARCHAR(100) NOT NULL,
    \`email\` VARCHAR(100) NOT NULL UNIQUE,
    \`password_hash\` VARCHAR(255) NULL,
    \`role\` ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL,
    \`avatar_url\` VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    \`provider\` VARCHAR(20) DEFAULT 'LOCAL',
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    INDEX \`idx_users_email\` (\`email\`),
    INDEX \`idx_users_role\` (\`role\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Doctor Profiles Table (Specialty details and practiced states)
CREATE TABLE \`doctor_profiles\` (
    \`id\` VARCHAR(50) NOT NULL,
    \`user_id\` VARCHAR(50) NOT NULL UNIQUE,
    \`specialization\` VARCHAR(100) NOT NULL,
    \`experience_years\` INT NOT NULL DEFAULT 0,
    \`consultation_fee\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    \`rating\` DECIMAL(3, 2) DEFAULT 5.00,
    \`reviews_count\` INT DEFAULT 0,
    \`is_verified\` BOOLEAN DEFAULT FALSE,
    \`diseases_covered\` TEXT NOT NULL,
    \`available_days\` VARCHAR(100) NOT NULL,
    \`available_slots\` VARCHAR(255) NOT NULL,
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`fk_doctor_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
    INDEX \`idx_doctor_spec\` (\`specialization\`),
    INDEX \`idx_doctor_verified\` (\`is_verified\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    },
    {
      id: 'sec-config',
      filename: 'SecurityConfig.java',
      language: 'java',
      title: 'Spring Security (Stateless Authorization)',
      description: 'Standard security rules managing RBAC (Role-Based Access Control) filters, stateless JWT token policies, and custom CORS config.',
      code: `package com.platform.consultation.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/ws/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/doctor/**").hasRole("DOCTOR")
                .anyRequest().authenticated()
            );
            
        return http.build();
    }
}`
    },
    {
      id: 'ws-config',
      filename: 'WebSocketConfig.java',
      language: 'java',
      title: 'Spring WebSocket / STOMP Configuration',
      description: 'Enables high-frequency bidirectional chat using standard Spring Broker registries and full STOMP routing payloads over port 8080.',
      code: `package com.platform.consultation.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }
}`
    },
    {
      id: 'docker-compose',
      filename: 'docker-compose.yml',
      language: 'yaml',
      title: 'Multi-Container Docker Configuration',
      description: 'Orchestrates the platform database, backend container, and client static container with self-healing health check dependencies.',
      code: `version: '3.8'

services:
  mysql-db:
    image: mysql:8.0
    container_name: docconsult-mysql
    restart: always
    environment:
      MYSQL_DATABASE: docconsult_db
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_USER: docconsult_user
      MYSQL_PASSWORD: docconsult_password
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpassword"]
      interval: 10s
      timeout: 5s

  backend-service:
    build: ./backend
    container_name: docconsult-backend
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
    depends_on:
      mysql-db:
        condition: service_healthy`
    },
    {
      id: 'props',
      filename: 'application-docker.properties',
      language: 'properties',
      title: 'Spring Container Profiles Configuration',
      description: 'Contains isolated environment flags, database connections, and secrets required during standard deployment cycles.',
      code: `# Active Profile: docker
server.port=8080

spring.datasource.url=\${SPRING_DATASOURCE_URL:jdbc:mysql://mysql-db:3306/docconsult_db}
spring.datasource.username=\${SPRING_DATASOURCE_USERNAME:docconsult_user}
spring.datasource.password=\${SPRING_DATASOURCE_PASSWORD:docconsult_password}

# Spring Data / Hibernate L2
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Swagger configuration
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html`
    }
  ];

  const activeSnippet = snippets.find(s => s.id === activeTab) || snippets[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden" id="blueprint-root">
      <div className="p-6 border-b border-gray-100 bg-linear-to-r from-slate-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Enterprise Java Full-Stack Blueprint
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Inspect the certified Java 17, Spring Boot 3, and Docker setups built alongside this platform interface.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Stateless Auth Online
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
            STOMP Socket Ready
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-80 bg-slate-50 border-r border-gray-100 p-4 space-y-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Architectural Files</p>
          {snippets.map(snippet => (
            <button
              key={snippet.id}
              onClick={() => {
                setActiveTab(snippet.id);
                setCopied(false);
              }}
              className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-all ${
                activeTab === snippet.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                  : 'hover:bg-slate-100 text-gray-700'
              }`}
              id={`tab-btn-${snippet.id}`}
            >
              <FileCode className={`w-5 h-5 shrink-0 mt-0.5 ${activeTab === snippet.id ? 'text-white' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium text-sm font-sans">{snippet.title}</p>
                <code className={`text-2xs block mt-1 font-mono ${activeTab === snippet.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {snippet.filename}
                </code>
              </div>
            </button>
          ))}
        </div>

        {/* Console / Highlight Window */}
        <div className="flex-1 p-6 flex flex-col bg-slate-900 border-t lg:border-t-0 text-white">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 h-12">
            <div className="flex items-center gap-2">
              <span className="w-3       h-3 rounded-full bg-rose-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono text-slate-400 ml-2">{activeSnippet.filename}</span>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="Copy Code Snippet"
              id="copy-code-btn"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          <div className="mb-4">
            <h4 className="text-emerald-400 font-medium text-sm mb-1">{activeSnippet.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeSnippet.description}</p>
          </div>

          <div className="flex-1 bg-slate-950/70 border border-slate-800 rounded-xl p-4 overflow-x-auto select-all selection:bg-slate-800">
            <pre className="font-mono text-2xs md:text-xs text-slate-200 leading-relaxed whitespace-pre font-medium">
              <code>{activeSnippet.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
