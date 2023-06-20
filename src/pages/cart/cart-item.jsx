import React, { useState } from 'react';

export const CartItem = ({ data, decrementCartItemQuantity, updateCartItemCount }) => {
  const { id, productName, price, productImage, quantity } = data;
  const imageURL = `http://localhost:8000${productImage}`;
  const [setCartItemAmount] = useState(0);

  const handleAddToCart = async () => {
    try {
      const response = await fetch(`http://localhost:8000/cart/${id}`, {
        method: 'POST',
      });
      if (response.ok) {
        window.location.reload()
        setCartItemAmount((prevAmount) => prevAmount + 1);
        
      } else {
        throw new Error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const handleDecrement = () => {
    decrementCartItemQuantity(id);
    if (quantity ===1){
      window.location.reload();} // Refresh the page
  };

  return (
    <div className="cartItem">
      <img src={imageURL} alt={productName} />
      <div className="description">
        <p>
          <b>{productName}</b>
        </p>
        <p>${price}</p>
        <div className="countHandler">
          <button onClick={handleDecrement}>-</button>
          <input
            value={quantity}
            onChange={(e) =>
              updateCartItemCount(id, Number(e.target.value))
            }
          />
          <button onClick={handleAddToCart}>
            +
          </button>
        </div>
      </div>
    </div>
  );
};
