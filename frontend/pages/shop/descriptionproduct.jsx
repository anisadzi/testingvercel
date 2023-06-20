import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { ShopContext } from '../../context/shop-context';
import './descriptionproduct.css';

export const Descriptionproduct = (props) => {
  const { id } = props.data;
  const [product, setProduct] = useState({});
  const { addToCart } = useContext(ShopContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/products/${id}`);
        const fetchedProduct = response.data;
        setProduct(fetchedProduct);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const imageURL = `http://localhost:8000${product.productImage}`;

  const handleAddToCart = async () => {
    try {
      await addToCart(id); // Use the addToCart function from ShopContext
      console.log('Product added to cart successfully.');
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div className="product">
      <img src={imageURL} alt={product.productName} />
      <div className="description">
        <p>
          <b>{product.productName}</b>
        </p>
        <p>${product.price}</p>
        <p>{product.description}</p>
      </div>
      <button className="addToCart" onClick={handleAddToCart}>
        Add To Cart
      </button>
    </div>
  );
};
