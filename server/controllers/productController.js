// controllers/productController.js
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import { bucket } from "../config/firebase.js";

// 🛠️ HELPER FUNCTION: Uploads buffer to Firebase and returns the public URL
const uploadImageToFirebase = async (file) => {
  // Create a unique filename and replace spaces with underscores to prevent broken URLs
  const fileName = `products/${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
  const fileUpload = bucket.file(fileName);

  // Upload the file from memory to Firebase
  await fileUpload.save(file.buffer, {
    metadata: { contentType: file.mimetype },
  });

  // Make the file public so your React frontend can display it
  await fileUpload.makePublic();

  // Return the permanent public URL
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
};


export const addProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    const shop = await Shop.findOne({ ownerId: req.user.uid });

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    // 🆕 FIREBASE FIX: Upload image if one exists
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImageToFirebase(req.file);
    }

    const product = await Product.create({
      shopId: shop._id,
      name,
      price,
      description,
      category,
      stock,
      image: imageUrl, // Save the permanent Firebase URL
    });

    res.status(201).json({ success: true, message: "Product added successfully", product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductsByShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.uid });

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const products = await Product.find({ shopId: shop._id });
    res.json({ success: true, products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update ONLY stock quantity
export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    product.stock = stock;
    await product.save();

    res.json({ success: true, message: "Stock updated successfully", product });
  } catch (err) {
    console.error("Error updating stock:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update FULL product details including optional new image
export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    let updateData = { name, price, description, category, stock };

    // 🆕 FIREBASE FIX: If a new image was uploaded, send it to Firebase
    if (req.file) {
      updateData.image = await uploadImageToFirebase(req.file);
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};