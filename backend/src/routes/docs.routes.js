import { Router } from "express"
import { specs, swaggerUi } from "../config/swagger.js"

const router = Router()

// Swagger UI
router.use("/", swaggerUi.serve)
router.get(
  "/",
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Credentix API Documentation",
  }),
)

// JSON endpoint for the OpenAPI spec
router.get("/json", (req, res) => {
  res.setHeader("Content-Type", "application/json")
  res.send(specs)
})

export default router
