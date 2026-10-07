import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [customer, setCustomer] = useState(null);


  useEffect(() => {
    api.get("/customers/me")
      .then((res) => setCustomer(res.data))
      .catch(() => {

      });
  }, []);


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (search.trim()) {
          params.search = search.trim();
        }
        if (category && category !== "All Categories") {
          params.category = category;
        }

        const response = await api.get("/products", { params });
        setProducts(response.data.products || []);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar customer={customer} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Product Catalog</h1>
          <p className="text-gray-600 text-sm">Discover and search our available products</p>
        </div>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />

        {loading && (
          <div className="py-16 text-center">
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        )}

        {error && !loading && (
          <div className="py-16 text-center">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="py-16 text-center bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">No products found.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;
