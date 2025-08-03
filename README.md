# 🔐 Credentix – Auth-as-a-Service

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
</div>

<div align="center">
  <p>
    <b>Credentix</b> is a secure, scalable, and developer-friendly authentication microservice – your own mini Auth0. Built for multi-tenant applications, it offers centralized user management, token-based auth, and fine-grained access control.
  </p>
  <blockquote>
    Think of <b>Credentix</b> as your personal Auth0 — but open, extensible, and 100% under your control.
  </blockquote>
</div>

---

## ✨ Features

-   **JWT-based Access & Refresh Tokens**: Secure, stateless authentication with automatic token refresh and validation.
-   **Secure Password Hashing (bcrypt)**: Industry-standard hashing for robust password security.
-   **Multi-Tenant Support**: Isolate users and data across different applications or organizations with complete separation and security.
-   **Role-Based Access Control (RBAC)**: Granular permissions and role management for fine-tuned access control.
-   **OAuth2-like Flow for Integration**: Streamlined process for integrating third-party applications.
-   **Redis-backed Rate Limiting & Brute-Force Protection**: Enhance security and prevent abuse with efficient request throttling.
-   **Swagger API Docs**: Comprehensive and interactive API documentation for easy integration.
-   **Dockerized for Production**: Ready for containerized deployment, ensuring consistency across environments.
-   **Google OAuth Integration**: Seamless social login support.
-   **Email Verification & Password Reset**: Essential features for user account management.
-   **Admin Dashboard**: A comprehensive frontend for managing users, clients, and system settings.

---

## 🛠️ Tech Stack

**Backend:**
-   **Node.js** + **Express**: Fast, unopinionated web framework for the API.
-   **MongoDB Atlas (Mongoose)**: Scalable NoSQL database for data storage.
-   **Redis**: High-performance in-memory data store for caching and rate limiting.
-   **JWT** + **bcrypt**: For secure token-based authentication and password hashing.
-   **Docker**: For containerization and consistent deployment.
-   **Swagger (OpenAPI)**: For API documentation.

**Frontend:**
-   **Next.js**: React framework for building modern web applications.
-   **TypeScript**: For type safety and improved developer experience.
-   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
-   **shadcn/ui**: Beautiful and accessible UI components.

---

## 🏗 Architecture

```mermaid title="Credentix System Architecture" type="diagram"
graph TD;
    A[Frontend: Next.js] -->|HTTP/S| B(Backend: Node.js/Express);
    B -->|MongoDB Driver| C[Database: MongoDB Atlas];
    B -->|Redis Client| D[Cache: Redis];
    B -->|Email Service| E[External: SMTP Provider];
    B -->|OAuth Providers| F[External: Google OAuth];

    subgraph Credentix Core
        B;
        C;
        D;
    end