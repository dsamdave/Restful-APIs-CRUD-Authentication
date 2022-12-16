import Products from "../models/producModel"


const productCtr = {
  getProducts: async (req, res) => {
    try {
      const products = await Products.find()

      if(!products) return res.status(400).json({msg: "No products available."})

      return res.status(200).json(products)

    } catch (err) {
      return res.status(500).json({msg: err.message})
    }
  },
  getProduct: async(req, res) => {
    try {

      const { id } = req.params

      if(!id) return res.status(400).json({msg: "Please specify a product!"})

      const product = await Products.findById(id)

      if(!product) 
        return res.status(404).json({msg: 'This product does not exist.'})

      return res.status(200).json(product)

    } catch (err) {
      return res.status(500).json({msg: err.message})
    }
  },
  addProduct: async (req, res) => {
    try {
      const { title, price, description, category, image } = req.body;

      if(!title || !price || !description || !category || !image)
        return res.status(400).json({msg: "Please enter all fields!"})

      const newProduct = new Products({title, price, description, category, image})

      await newProduct.save()

      return res.status(200).json(newProduct)

    } catch (err) {
      return res.status(500).json({msg: err.message})
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params

      const { title, price, description, category, image } = req.body;
      
      const product = await Products.findByIdAndUpdate(id, {
        title, price, description, category, image
      }, { new: true })

      if(!product) 
        return res.status(404).json({msg: 'This product does not exist.'})

      return res.status(200).json(product)

    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params

      const product = await Products.findByIdAndDelete(id)

      if(!product) 
        return res.status(404).json({msg: 'This product does not exist.'})

      return res.status(200).json({msg: 'Product deleted Successfully!'})
      
    } catch (err) {
      return res.status(500).json({msg: err.message})
    }
  }
}

export default productCtr;