// routes/productRoutes.js
import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import { upload } from "../utils/upload.js";
import {
  addProduct,
  getProductsByShop,
  deleteProduct,
  updateProductStock,
  updateProduct // 🆕 Imported new controller
} from "../controllers/productController.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, upload.single("image"), addProduct);
router.get("/", verifyFirebaseToken, getProductsByShop);
router.delete("/:id", verifyFirebaseToken, deleteProduct);
router.put("/:id/stock", verifyFirebaseToken, updateProductStock);

// 🆕 PUT - Full Product Update (Handles new image uploads)
router.put("/:id", verifyFirebaseToken, upload.single("image"), updateProduct);

export default router;