import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Gear} from "phosphor-react"
import "./navbar.css";

export const Navbar = () => {
  return (
  <div className = "navbar">
    <div className = "links">
        <Link to = "/"> Shop </Link>
        <Link to = "/history">
          History
          </Link>

        <Link to = "/cart">
            <ShoppingCart size = {32}/>
        </Link>

        <Link to = "/setting">
            <Gear size = {32}/>
        </Link>
    </div>
  </div>
  );
};

