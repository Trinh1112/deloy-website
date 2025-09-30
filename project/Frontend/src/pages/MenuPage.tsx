import { useEffect, useState } from 'react';
import axiosClient from '@/apis/axiosClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/reducers/cartSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS cho toast
import { Skeleton } from '@/components/ui/skeleton'; // Giả định bạn đã cài shadcn/ui với skeleton

interface Menu {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: { id: number; name: string };
}

const MenuPage = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMenus = async () => {
      setIsLoadingMenus(true);
      try {
        const response = await axiosClient.get('/menus');
        setMenus(response.data);
      } catch (error) {
        console.error('Failed to fetch menus:', error);
        toast.error('Failed to fetch menus');
      } finally {
        setIsLoadingMenus(false);
      }
    };
    fetchMenus();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
          const response = await axiosClient.get(`/products?categoryId=${selectedMenu}`);
          setProducts(response.data);
        } catch (error) {
          console.error('Failed to fetch products:', error);
          toast.error('Failed to fetch products');
        } finally {
          setIsLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [selectedMenu]);
//
  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        imageUrl: '',
        menuId: product.category.id,
        quantity: 1,
      })
    );
   toast.success(`${product.name} added to cart!`);//gửi tb đến user
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-6">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
        Menu
      </h2>

      {/* Menu Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {isLoadingMenus ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="w-32 h-10 rounded-full" />
          ))
        ) : menus.length === 0 ? (
          <p className="text-gray-500">No menus available.</p>
        ) : (
          menus.map((menu) => (
            <Button
              key={menu.id}
              onClick={() => setSelectedMenu(menu.id)}
              variant={selectedMenu === menu.id ? 'default' : 'outline'}
              className={`
                rounded-full px-11 py-4 font-medium text-lg transition-all duration-300
                ${selectedMenu === menu.id 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-100 hover:border-indigo-300'}
                hover:shadow-md
              `}
            >
              {menu.name}
            </Button>
          ))
        )}
      </div>

      {/* Products Grid */}
      {selectedMenu ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingProducts ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="shadow-lg rounded-xl overflow-hidden">
                <Skeleton className="h-48 w-full rounded-t-xl" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            ))
          ) : products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              No products available for this menu.
            </p>
          ) : (
            products.map((product) => (
              <Card
                key={product.id}
                className="shadow-lg rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white"
              >
        
                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className='text-center'>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-lg font-bold text-indigo-600 mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 transition-colors duration-300"
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Please select a menu to view products.
        </p>
      )}
    </div>
  );
};

export default MenuPage;