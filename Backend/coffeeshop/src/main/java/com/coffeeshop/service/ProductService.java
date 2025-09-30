package com.coffeeshop.service;

import com.coffeeshop.entity.Menu;
import com.coffeeshop.entity.Product;
import com.coffeeshop.repository.MenuRepository;
import com.coffeeshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final MenuRepository menuRepository;

    public ProductService(ProductRepository productRepository, MenuRepository menuRepository) {
        this.productRepository = productRepository;
        this.menuRepository = menuRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found."));
    }

    public Product createProduct(Product product, Long categoryId) {//lket vs categoryId
        Menu category = menuRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Menu category not found."));
        product.setCategory(category);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product product, Long categoryId) {
        Product existing = getProductById(id);
        existing.setName(product.getName());//update các trường
        existing.setPrice(product.getPrice());
        existing.setDescription(product.getDescription());
        if (categoryId != null) {
            Menu category = menuRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Menu category not found."));
            existing.setCategory(category);//set lại để tránh gán null
        }
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}