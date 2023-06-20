import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Product = (props) => {
  const { id, productName, price, productImage, quantity } = props.data;
  const [cartItemAmount, setCartItemAmount] = useState(0);

  // Assuming FastAPI server is running on localhost:8000
  const imageURL = `http://localhost:8000${productImage}`;

  const handleAddToCart = async () => {
    try {
      const response = await fetch(`http://localhost:8000/cart/${id}`, {
        method: 'POST',
      });
      if (response.ok) {
        setCartItemAmount((prevAmount) => prevAmount + 1);
      } else {
        throw new Error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div className="product">
      <img src={imageURL} alt={productName} />
      <div className="description">
        <p>
          <Link to={`/description/${id}`}>{productName}</Link>
        </p>
        <p>${price}</p>
      </div>
      <button className="addToCart" onClick={handleAddToCart}>
        Add To Cart
      </button>
    </div>
  );
};
