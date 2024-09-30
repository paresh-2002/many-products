import { useNavigate, useParams } from "react-router";
import myContext from "../../context/myContext";
import { useContext, useEffect, useState } from "react";
import { Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import toast from "react-hot-toast";
import Loader from "../../components/loader/Loader";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const categoryList = [
  { name: "fashion" },
  { name: "shirt" },
  { name: "jacket" },
  { name: "mobile" },
  { name: "laptop" },
  { name: "shoes" },
  { name: "home" },
  { name: "books" },
];

const UpdateProductPage = () => {
  const context = useContext(myContext);
  const { loading, setLoading, getAllProductFunction } = context;

  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState({
    title: "",
    price: "",
    productImage: null,
    category: "",
    description: "",
    time: Timestamp.now(),
    date: new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  });

  const getSingleProductFunction = async () => {
    setLoading(true);
    try {
      const productTemp = await getDoc(doc(fireDB, "products", id));
      const productData = productTemp.data();
      setProduct({
        title: productData?.title,
        price: productData?.price,
        productImage: null,
        category: productData?.category,
        description: productData?.description,
        quantity: productData?.quantity,
        time: productData?.time,
        date: productData?.date,
        productImageUrl: productData?.productImageUrl, // Store the existing image URL
      });
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const updateProduct = async () => {
    setLoading(true);
    try {
      let imageUrl = product.productImageUrl;

      if (product.productImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `images/${id}`);
        await uploadBytes(storageRef, product.productImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      const updatedProduct = {
        title: product.title,
        price: parseFloat(product.price),
        productImageUrl: imageUrl,
        category: product.category,
        description: product.description,
        quantity: product.quantity,
        time: product.time,
        date: product.date,
      };

      await setDoc(doc(fireDB, "products", id), updatedProduct);
      toast.success("Product Updated successfully");
      getAllProductFunction();
      setLoading(false);
      navigate("/admin-dashboard");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getSingleProductFunction();
  }, []);

  return (
    <div>
      <div className="flex justify-center items-center h-screen">
        {loading && <Loader />}
        <div className="login_Form bg-pink-50 px-8 py-6 border border-pink-100 rounded-xl shadow-md">
          <div className="mb-5">
            <h2 className="text-center text-2xl font-bold text-pink-500">
              Update Product
            </h2>
          </div>

          <div className="mb-3">
            <input
              type="text"
              name="title"
              value={product.title}
              onChange={(e) => {
                setProduct({ ...product, title: e.target.value });
              }}
              placeholder="Product Title"
              className="bg-pink-50 border text-pink-300 border-pink-200 px-2 py-2 w-96 rounded-md outline-none placeholder-pink-300"
            />
          </div>

          <div className="mb-3">
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={(e) => {
                setProduct({ ...product, price: e.target.value });
              }}
              placeholder="Product Price"
              className="bg-pink-50 border text-pink-300 border-pink-200 px-2 py-2 w-96 rounded-md outline-none placeholder-pink-300"
            />
          </div>

          <div className="mb-3">
            <input
              type="file"
              onChange={(e) => {
                setProduct({ ...product, productImage: e.target.files[0] });
              }}
              className="bg-pink-50 border text-pink-300 border-pink-200 px-2 py-2 w-96 rounded-md outline-none placeholder-pink-300"
            />
          </div>

          {/* Display Current Product Image */}
          {product.productImageUrl && (
            <div className="mb-3">
              <img
                src={product.productImageUrl}
                alt="Current Product"
                className="w-32 h-32 object-cover mb-2"
              />
            </div>
          )}

          <div className="mb-3">
            <select
              value={product.category}
              onChange={(e) => {
                setProduct({ ...product, category: e.target.value });
              }}
              className="w-full px-1 py-2 text-pink-300 bg-pink-50 border border-pink-200 rounded-md outline-none"
            >
              <option disabled>Select Product Category</option>
              {categoryList.map((value, index) => (
                <option key={index} value={value.name}>
                  {value.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <textarea
              value={product.description}
              onChange={(e) => {
                setProduct({ ...product, description: e.target.value });
              }}
              name="description"
              placeholder="Product Description"
              rows="5"
              className="w-full px-2 py-1 text-pink-300 bg-pink-50 border border-pink-200 rounded-md outline-none placeholder-pink-300"
            ></textarea>
          </div>

          <div className="mb-3">
            <button
              onClick={updateProduct}
              type="button"
              className="bg-pink-500 hover:bg-pink-600 w-full text-white text-center py-2 font-bold rounded-md"
            >
              Update Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProductPage;
