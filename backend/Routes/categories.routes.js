import express from "express";
import {
  createCategory,
  getCategories,
  getPostsByCategories,
} from "../Controllers/categories.controllers.js";

const router = express.Router();

//tested :working
router.post("/createCategory", createCategory);
//tested :working
router.get("/", getCategories);
//tested :working
router.get("/posts/:categoryId", getPostsByCategories);

export default router;
