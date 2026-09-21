import Category from "../Model/Category.js";
import uploadToCloudinary from "../utils/uploadToClodinary.js";
// Sab cate k liye

export const getAllCate= async(req,res)=>{
try {
  const categories = await Category.find({iaActive:true}).sort({createdAt: -1})
  res.status(200).json({
    success:true,
    count: categories.length,
    categories,
  });

} catch (error) {
  console.log("error to get category: ", error)

  res.status(500).json({
    success:false,
    message:"Failed to fetch categories",
  });
}
};

// Get on Cate

export const getCategory = async(req, res)=>{
  try {
    const {id} = req.params;

    const category= await Category.findById(id);
    if(!category || !category.isActive){
      return res.status(404).json({
        success:false,
        message:"Category not found"
      });
    }
res.status(200).json({
  success:true,
  category,
});

  } catch (error) {
   console.error("Get category error: ",error)
   res.status(500).json({
    success:false,
    message:"Failed to fetch category",
   });    
  }
};

//  Add category

export const addCategory=async(req,res)=>{
  try {
    const {title, gender}=req.body
    if(!title || !gender){
      return res.status(400).json({
        success:false,
        message:"Title and gender are required"
      });
    };
    const existingCategory = await Category.findOne({title: title.trim(),
      gender
    });

    if(existingCategory){
      return res.status(400).json({
        success:false,
        message:"Category already exists",
      });
    };
    let imageUrl=[];
    if(!req.files){
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const category = await Category.create({
      title:title.trim(),
      gender,
      image: imageUrl,
    });
    res.status(200).json({
      success:true,
      message:"Category added successfully",
      category
    });
  } catch (error) {
    console.log("Add category error: ", error)
    res.status(500).json({
      success:false,
      message:"Failed to add category"
    });
  }
};

// Upadate category

export const updateCategor = async (req, res)=>{
  try {
    const {id} = req.params
    const {title, gender, isActive}=req.body;
    const category = await Category.findByIdAndUpdate(id)

    if(!category){
      return res.status(404).json({
        success:false,
        message:"Category not found "
      });
    }

    category.title = title ?? category.title;
    category.gender = gender ?? category.gender;
    category.image = image ?? category.image;
    category.isActive = isActive ?? category.isActive;
     if(req.file){
      category.image = await uploadToCloudinary(req.file.buffer);
     }
    await category.save();
    res.status(200).json({
      success:true,
      message:"Category updated successfully",
      category,

    })
  } catch (error) {
    console.error("Update category error: ", error)
    res.status(500).json({
      success:false,
      message:"Failed to update category"
    });
  }
};


//  Delete category

export const deleteCategory = async(req, res)=>{
  try {
    const{id}=req.params;
    const category = await Category.findById(id)
    if(!category){
    return res.status(400).json({ 
       success:false,
       message: "Category not found"})
    }
    await Category.findByIdAndDelete(id)
    res.status(200).json({
        success:true,
       message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Delete category error: ", error)
    res.status(500).json({
        success:false,
       message: "failed to delete category"
    })
  }
}