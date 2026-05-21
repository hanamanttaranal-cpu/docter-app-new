# Enterprise Doctor Consultation Platform - Architecture Blueprint

This repository contains a complete, production-grade, and horizontally scalable **Online Doctor Consultation Platform** designed under a modern decoupled **Java Full Stack Architecture**.

Below is the definitive reference blueprint for the backend codebase, relational tables, microscale configurations, and multi-container deployment models.

---

## 🏛️ System Architecture Blueprint

The platform enforces a strict separation of concerns, decoupling our stateless Spring Boot 3 microserver from the optimized React.js SPA frontend.

```
                  +-----------------------------------------------+
                  |          React.js + Vite Desktop Frontend     |
                  |     (Patient, Doctor, and Admin Dashboards)   |
                  +-----------------------+-----------------------+
                                          |
                        HTTPS (REST API)  |  WebSockets (STOMP Hub)
                                          v
                  +-----------------------+-----------------------+
                  |         NGINX Reverse Proxy (Port 3000)       |
                  +-----------------------+-----------------------+
                                          | Router Match: /api, /ws
                                          v
+-----------------------------------------+-----------------------------------------+
|                  Spring Boot 3 Enterprise Backend Engine (Java 17)                |
|                                                                                   |
|  +---------------------+   +---------------------+   +-------------------------+  |
|  |   Spring Security   |   |   Spring MVC        |   |    Spring WebSocket     |  |
|  |   (Stateless JWT &  |   |   (REST Domain      |   |    STOMP Messaging      |  |
|  |    Google OAuth2)   |   |    Controllers)     |   |    Bi-Directional Chat) |  |
|  +----------+----------+   +----------+----------+   +------------+------------+  |
|             |                         |                           |               |
|             +-------------------------+-------------+-------------+               |
|                                                     |                             |
|                                                     v                             |
|                                         +-----------+-----------+                 |
|                                         |     Spring Data JPA   |                 |
|                                         |     (Hibernate L2)    |                 |
|                                         +-----------+-----------+                 |
+-----------------------------------------------------|-----------------------------+
                                                      |
                                                      v
                                        +-------------+-------------+
                                        |    MySQL 8.0 Primary DB   |
                                        |    (Port 3306 Instance)   |
                                        +---------------------------+
```

---

## 🔐 Relational Database Entity Model (MySQL 8.0)

Refer to `/backend/schema.sql` for the formal, fully-indexed DDL definitions. 

1. **`users` Table**: Auth registry holding patient, doctor, and admin accounts. Supports both standard bcrypt passwords and `GOOGLE` provider links.
2. **`doctor_profiles` Table**: Extended profile details, specialty classifications, fees, verified tags, and JSON arrays of symptomatic diseases.
3. **`appointments` Table**: Critical transaction log indexing patient appointments, timeslots, and scheduling states (`PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`).
4. **`consultation_messages` Table**: Persistent safehouse for STOMP bi-directional chats.
5. **`system_feedbacks` Table**: Aggregated reviews and complaints, parsed semantically on save using AI NLP.

---

## 📡 REST API Route & Interface Inventory

The Spring Boot backend exposes the following endpoint inventory designed under Richardson Maturity Level 2 specs, returning correct JSON headers and HTTP statuses (`200 OK`, `201 Created`, `401 Unauthorized`, `403 Forbidden`):

### 1. Authentication Service (`AuthResource`)
*   `POST /api/auth/register` — Standard registration for patients.
    *   *Request Body*: `{ "name": "John Doe", "email": "john@ex.com", "password": "securePass" }`
    *   *Response (201)*: `{ "status": "Registration successful", "userId": "usr_..." }`
*   `POST /api/auth/login` — Stateless JWT credentials verification.
    *   *Request Body*: `{ "email": "john@ex.com", "password": "securePass" }`
    *   *Response (200)*: `{ "token": "eyJhbGciOiJIUzI1Ni...", "user": { ... } }`
*   `GET /api/auth/google/callback` — Handles OAuth2 redirection exchange.

### 2. Patient Domain Services (`PatientController`)
*   `GET /api/doctors/search` — Dynamic multi-parameter query (search by specialization, disease Covered, symptoms, and availability).
    *   *Query Parameters*: `?query=rash&specialty=Dermatology`
    *   *Response (200)*: `[ { "id": "doc-2", "name": "Dr. Sarah Jenkins", ... } ]`
*   `POST /api/appointments/request` — Routes a pending consultation request.
    *   *Request Body*: `{ "doctorId": "doc-2", "date": "2026-05-25", "timeSlot": "11:30 AM", "notes": "Cold fever..." }`
    *   *Response (201)*: `{ "appointmentId": "apt_781", "status": "PENDING" }`
*   `GET /api/patient/appointments` — Lists the authenticated patient's historical or pending slots.

### 3. Doctor Dashboard Operations (`DoctorController`)
*   `PUT /api/appointments/{id}/status` — Real-time approval routing (Approve / Reject workflow).
    *   *Request Body*: `{ "status": "APPROVED" }` (or `REJECTED`)
    *   *Response (200)*: `{ "msg": "Appointment approved. Live chat console unlocked." }`
*   `GET /api/doctor/analytics` — Fetches practice performance logs (weekly consultations, total patient count, fee revenue averages).
    *   *Response (200)*: `{ "consultationsCount": 18, "totalRevenue": 2400.00, "rating": 4.9 }`

### 4. Admin Management Central (`AdminController`)
*   `GET /api/admin/users` — Read-only registry detailing active Patients/Doctors on the system.
*   `DELETE /api/admin/users/{id}` — Susbends or purges accounts failing compliance, cascaded to child profiles.
*   `GET /api/admin/metrics` — Global Platform Health (active users, transaction counts, average patient ratings).
*   `GET /api/admin/feedback` — Aggregating patient reviews, sorting categories, and analyzing complaints.

### 5. WebSocket & Image Upload Proxies
*   `POST /api/media/upload` — Multipart file pipeline uploading doctor licensing PDFs or patient symptoms photos to **Cloudinary CDN** on behalf of client, returning a secure CORS asset URL.
*   *STOMP Endpoint*: Client subscribes to `/topic/chat/{appointmentId}` and posts message packets to `/app/chat` for high-frequency, low-overhead secure messaging.

---

## 🐳 Quickstart Container Development

Deploy the complete multi-container setup locally using Docker:

```bash
# Clone and enter directory
cd doc-consult-platform

# Spin up MySQL, Spring Boot Core, and React Nginx App in parallel
docker-compose up --build -d

# Verify all profiles are online
docker-compose ps
```

The React front-end is hosted securely on [http://localhost:3000](http://localhost:3000), reverse proxying `/api` routing to the Java JVM booting on port `8080`.
