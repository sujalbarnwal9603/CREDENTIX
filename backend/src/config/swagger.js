import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Credentix AaaS API",
      version: "1.0.0",
      description: "Complete Authentication as a Service (AaaS) API Documentation",
      contact: {
        name: "Credentix Support",
        email: "support@credentix.com",
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:8000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            fullName: { type: "string" },
            email: { type: "string", format: "email" },
            isVerified: { type: "boolean" },
            status: { type: "string", enum: ["active", "suspended"] },
            provider: { type: "string", enum: ["local", "google"] },
            tenant: { $ref: "#/components/schemas/Tenant" },
            role: { $ref: "#/components/schemas/Role" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Tenant: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
            createdBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Role: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", enum: ["admin", "user", "editor"] },
            permissions: { type: "array", items: { type: "string" } },
          },
        },
        Client: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            client_id: { type: "string" },
            client_secret: { type: "string" },
            redirect_uris: { type: "array", items: { type: "string" } },
            createdBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            statusCode: { type: "number" },
            data: { type: "object" },
            message: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
    tags: [
      { name: "Authentication", description: "User authentication endpoints" },
      { name: "OAuth2", description: "OAuth2 and OpenID Connect endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "Tenants", description: "Tenant management endpoints" },
      { name: "Roles", description: "Role management endpoints" },
      { name: "Clients", description: "OAuth2 client management endpoints" },
      { name: "Admin", description: "Admin management endpoints" },
      { name: "Health", description: "Health check endpoints" },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"], // Path to the API files
}

const specs = swaggerJsdoc(options)

export { specs, swaggerUi }
