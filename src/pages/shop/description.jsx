import React, { useEffect, useState } from 'react';
import { Descriptionproduct } from './descriptionproduct';
import { Link, useParams } from 'react-router-dom';
import './description.css';

export const Description = () => {
  const { id } = useParams();
  const productId = parseInt(id, 10);
  const [product, setProduct] = useState(null);
  

  useEffect(() => {
    fetch(`http://localhost:8000/products/${productId}`)
      .then(response => response.json())
      .then(data => setProduct(data))
      .catch(error => console.error(error));
  }, [productId]);
  
  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="shop">
      <div>
        <div className="shopTitle">
          <h1>Description</h1>
          <Link to="/">
            <button>Back</button>
          </Link>
        </div>
        <div className="products">
          <Descriptionproduct data={product} />
        </div>
      </div>
    </div>
  );
};
