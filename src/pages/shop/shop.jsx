import React, { useEffect, useContext, useState } from 'react';
import { Product } from './product';
import axios from 'axios';
import "./shop.css";

export const Shop = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/products');
        const productList = response.data;
        setProducts(productList);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    try {
      await axios.post(`http://localhost:8000/cart/${productId}`);
      console.log('Product added to cart successfully.');
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  };

  return (
    <div className="shop">
      <div>
        <div className="shopTitle">
          <h1>Shops</h1>
        </div>
        <div className="products">
          {products.map((product) => (
            <Product key={product.id} data={product} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </div>
  );
};
