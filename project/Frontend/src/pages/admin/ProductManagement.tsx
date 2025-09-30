import { useEffect, useState } from "react";
import axiosClient from "@/apis/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

interface Menu {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: Menu;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    description: "",
    categoryId: 0,
  });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await axiosClient.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products");
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await axiosClient.get("/menus");
      setMenus(response.data);
    } catch (error) {
      console.error("Failed to fetch menus:", error);
      toast.error("Failed to fetch menus");
    }
  };

  const handleCreateProduct = async () => {
    // Kiểm tra categoryId hợp lệ
    if (newProduct.categoryId === 0) {
      toast.error("Please select a menu category");
      return;
    }
    if (!newProduct.name || newProduct.price <= 0) {
      toast.error("Please provide a valid name and price");
      return;
    }

    try {
      const response = await axiosClient.post(
        `/products?categoryId=${newProduct.categoryId}`,
        {
          name: newProduct.name,
          price: newProduct.price,
          description: newProduct.description,
        }
      );
      setProducts([...products, response.data]);
      setNewProduct({ name: "", price: 0, description: "", categoryId: 0 });
      toast.success("Product created successfully");
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product");
    }
  };

  const handleUpdateProduct = async () => {
    if (!editProduct) return;
    if (editProduct.category.id === 0) {
      toast.error("Please select a menu category");
      return;
    }

    try {
      const response = await axiosClient.put(
        `/products/${editProduct.id}?categoryId=${editProduct.category.id}`,
        {
          name: editProduct.name,
          price: editProduct.price,
          description: editProduct.description,
        }
      );
      setProducts(
        products.map((product) =>
          product.id === editProduct.id ? response.data : product
        )
      );
      setEditProduct(null);
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await axiosClient.delete(`/products/${id}`);
      setProducts(products.filter((product) => product.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMenus();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Product Management</h2>
      <div className="mb-4 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Product name</label>
          <Input
            placeholder="Product name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Number</label>
          <Input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: Number(e.target.value) })
            }
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Description</label>
          <Input
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Select menu</label>
          <Select
            onValueChange={(value) =>
              setNewProduct({ ...newProduct, categoryId: Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select menu" />
            </SelectTrigger>
            <SelectContent>
              {menus.map((menu) => (
                <SelectItem key={menu.id} value={menu.id.toString()}>
                  {menu.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreateProduct}>Create Product</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Menu</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => {
                        setEditProduct(product);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <Input
                      value={editProduct?.name || ""}
                      onChange={(e) =>
                        setEditProduct({
                          ...editProduct!,
                          name: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      value={editProduct?.price || 0}
                      onChange={(e) =>
                        setEditProduct({
                          ...editProduct!,
                          price: Number(e.target.value),
                        })
                      }
                    />
                    <Input
                      value={editProduct?.description || ""}
                      onChange={(e) =>
                        setEditProduct({
                          ...editProduct!,
                          description: e.target.value,
                        })
                      }
                    />
                    <Select
                      onValueChange={(value) =>
                        setEditProduct({
                          ...editProduct!,
                          category: {
                            ...editProduct!.category,
                            id: Number(value),
                          },
                        })
                      }
                      defaultValue={editProduct?.category.id.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select menu" />
                      </SelectTrigger>
                      <SelectContent>
                        {menus.map((menu) => (
                          <SelectItem key={menu.id} value={menu.id.toString()}>
                            {menu.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={async () => {
                        await handleUpdateProduct();
                        setIsDialogOpen(false);
                      }}
                    >
                      Save
                    </Button>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductManagement;
