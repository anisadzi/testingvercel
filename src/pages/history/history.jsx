import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './history.css';

export const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:8000/cart/history');
        const historyList = response.data;
        setHistory(historyList);
      } catch (error) {
        console.error(error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="history">
      <div>
        <div className="historyTitle">
          <h1>Cart History</h1>
        </div>
        <div className="historyList">
          {history.map((item) => (
            <div key={item.id}>
              <div className="historytext">
                <img className= "historyimage" src={`http://localhost:8000${item.productImage}`} alt={item.productName} />
                <h2>{item.productName}</h2>
                <p>Price: {item.price}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Checkout Date: {item.timestamp}</p>
              </div>
              <hr />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
