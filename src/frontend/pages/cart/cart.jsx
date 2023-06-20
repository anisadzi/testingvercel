import React, { useEffect, useState } from 'react';
import { CartItem } from './cart-item';
import { useNavigate } from 'react-router-dom';

import './cart.css';

export const Cart = () => {
  const [cartData, setCartData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key

  const navigate = useNavigate();
  const goBack = () => {
    window.history.back();
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch('http://localhost:8000/cart');
        const data = await response.json();
        setCartData(data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, [refreshKey]);

  const getTotalCartAmount = () => {
    let total = 0;
    for (const product of cartData) {
      total += product.price * product.quantity;
    }
    return total.toFixed(2);
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8000/cart/${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCartData((prevCartData) =>
          prevCartData.filter((product) => product.id !== productId)
        );
      } else {
        throw new Error('Failed to remove product from cart');
      }
    } catch (error) {
      console.error('Error removing product from cart:', error);
    }
  };
  

  const updateCartItemCount = async (productId, quantity) => {
    try {
      if (quantity > 0) {
        const response = await fetch(`http://localhost:8000/cart/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity }),
        });
        if (response.ok) {
          const updatedProduct = await response.json();
          setCartData((prevCartData) =>
            prevCartData.map((product) => {
              if (product.id === productId) {
                return updatedProduct;
              }
              return product;
            })
          );
        } else {
          throw new Error('Failed to update product quantity in cart');
        }
      } else {
        throw new Error('Quantity cannot be negative');
      }
    } catch (error) {
      console.error('Error updating product quantity in cart:', error);
    }
  };

  const decrementCartItemQuantity = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8000/cart/minus/${productId}`, {
        method: 'PUT',
      });
      if (response.ok) {
        const updatedProduct = await response.json();
        if (updatedProduct.quantity === 0) {
          removeFromCart(productId); // Remove the product directly
        } else {
          setCartData((prevCartData) =>
            prevCartData.map((product) => {
              if (product.id === productId) {
                return updatedProduct;
              }
              return product;
            })
          );
        }
      } else {
        throw new Error('Failed to decrement product quantity in cart');
      }
      setRefreshKey((prevKey) => prevKey + 1); // Update the refresh key
    } catch (error) {
      console.error('Error decrementing product quantity in cart:', error);
    }
  };
  

  const checkout = async () => {
    try {
      await fetch('http://localhost:8000/cart', {
        method: 'DELETE',
      });
      setCartData([]); // Clear the cart data
      navigate('/checkout'); // Navigate to the checkout page
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };
  return (
    <div className="cart">
      <div>
        <h1>Your Cart Items</h1>
      </div>
      <div className="cartItems">
        {cartData
          .filter((product) => product.quantity > 0) // Filter out items with quantity 0
          .map((product) => (
            <CartItem
              key={product.id}
              data={product}
              removeFromCart={removeFromCart}
              updateCartItemCount={updateCartItemCount}
              decrementCartItemQuantity={decrementCartItemQuantity}
            />
          ))}
      </div>
      {cartData.length > 0 ? (
        <div className="checkout">
          <p>SubTotal: ${getTotalCartAmount()}</p>
          <button onClick={goBack}>Continue Shopping</button>
          <button onClick={checkout}>Checkout</button>
        </div>
      ) : (
        <h1>Your Cart is Empty</h1>
      )}
    </div>
  );
};
