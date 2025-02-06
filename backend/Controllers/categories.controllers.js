import Category from "../models/category.model.js";
import Post from "../models/post.model.js";

export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newCategory = new Category({
      name,
      description,
    });

    const category = await newCategory.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("Error in create category controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getCategories = async (req, res) => {
  try {
    //get categories
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.log("error in get categories", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPostsByCategories = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    // get posts related to a categorie by id
    const posts = await Post.find({ category: categoryId })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .populate({
        path: "user category",
        select: "-password  -gender -createdAt -updatedAt", // Exclude password, popularity, gender
      });

    res.json(posts);
    //console.log(posts);
  } catch (error) {
    console.log("error in get categories posts", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
