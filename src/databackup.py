from typing import Annotated, Union
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pathlib import Path
from datetime import datetime, timedelta

import sqlite3
from sqlite3 import Error
from passlib.context import CryptContext
from jose import JWTError, jwt

app = FastAPI()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to create a new SQLite connection for each request
def get_db_connection():
    conn = sqlite3.connect("productstorage.db")
    return conn

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    }
}



# User model
class User(BaseModel):
    id: int
    name: str
    email: str
    password: str
    address: str
    telephone: str

# Pydantic model for user signup request
class UserSignupRequest(BaseModel):
    name: str
    email: str
    password: str
    address: str
    telephone: str

# Pydantic model for user login request
class UserLoginRequest(BaseModel):
    email: str
    password: str

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 password bearer for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# Hash the password
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Verify the password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Get a user by email
def get_user_by_email(email: str, conn: sqlite3.Connection):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    record = cursor.fetchone()
    cursor.close()

    if record:
        user = User(id=record[0], name=record[1], email=record[2], password=record[3], address=record[4], telephone=record[5])
        return user

# Create a new user
def create_user(user: UserSignupRequest, conn: sqlite3.Connection):
    cursor = conn.cursor()
    hashed_password = get_password_hash(user.password)
    cursor.execute(
        "INSERT INTO users (name, email, password, address, telephone) VALUES (?, ?, ?, ?, ?)",
        (user.name, user.email, hashed_password, user.address, user.telephone)
    )
    conn.commit()
    cursor.close()

# Generate an access token
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Signup route
@app.post("/signup")
async def signup(user: UserSignupRequest, conn: sqlite3.Connection = Depends(get_db_connection)):
    
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    record = cursor.fetchone()
    cursor.close()

    if record:
        raise HTTPException(status_code=400, detail="Email already registered")

    create_user(user, conn)
    return {"message": "User created successfully"}

# Login route
@app.post("/login")
async def login(user: UserLoginRequest, conn: sqlite3.Connection = Depends(get_db_connection)):
    
    db_user = get_user_by_email(user.email, conn)

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
# Your existing /products route
class Product(BaseModel):
    id: int
    productName: str
    price: float
    productImage: str
    description: str

app.mount("/assets", StaticFiles(directory=Path("assets")), name="assets")


@app.get("/products")
def get_all_products(conn: sqlite3.Connection = Depends(get_db_connection)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")
    records = cursor.fetchall()

    products = []
    for record in records:
        product = {
            "id": record[0],
            "productName": record[1],
            "price": record[2],
            "productImage": record[3],
            "description": record[4],
        }
        products.append(product)

    cursor.close()

    return products

@app.get("/products/{product_id}")
def get_product(product_id: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id=?", (product_id,))
    record = cursor.fetchone()

    if record is None:
        raise HTTPException(status_code=404, detail="Product not found")

    product = {
        "id": record[0],
        "productName": record[1],
        "price": record[2],
        "productImage": record[3],
        "description": record[4],
    }

    cursor.close()

    return product


@app.get("/cart")
def get_cart_items():
    # Create connections for the product and cart databases
    conn = sqlite3.connect("productstorage.db")

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cart_items")
    cart_items = cursor.fetchall()
    cursor.close()

    # Retrieve the product details for each cart item
    cart_items_with_total_price = [
        {
            "id": item[1],
            "productName": product[1],
            "price": product[2],
            "productImage": product[3],
            "description": product[4],
            "quantity": item[2],
            "total_price": product[2] * item[2]
        }
        for item in cart_items
        for product in conn.execute("SELECT * FROM products WHERE id = ? AND id = ?", (item[1], item[1]))
        if product
    ]

    # Close the connections
    conn.close()

    return cart_items_with_total_price



# Define the add_to_cart function
# Define the add_to_cart function
@app.post("/cart/{product_id}")
def add_to_cart(product_id: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    cursor = conn.cursor()

    # Check if the product exists in the products table
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    product = cursor.fetchone()

    if product:
        # Check if the product already exists in the cart_items table
        cursor.execute("SELECT * FROM cart_items WHERE product_id = ?", (product[0],))
        existing_item = cursor.fetchone()

        if existing_item:
            # Product already exists in the cart, update the quantity
            quantity = existing_item[2] + 1
            cursor.execute("UPDATE cart_items SET quantity = ? WHERE product_id = ?", (quantity, product[0]))
        else:
            # Product doesn't exist in the cart, add it with quantity 1
            cursor.execute(
                "INSERT INTO cart_items (product_id, quantity, timestamp) VALUES (?, 1, ?)",
                (product[0], datetime.now())
            )
        conn.commit()
        cursor.close()

        return {"message": "Product added to cart successfully."}

    cursor.close()

    raise HTTPException(status_code=404, detail="Product not found")


@app.delete("/cart")
def clear_cart(conn: sqlite3.Connection = Depends(get_db_connection)):
    cursor = conn.cursor()

    # Retrieve the cart items
    cursor.execute("SELECT * FROM cart_items")
    cart_items = cursor.fetchall()

    # Move cart items to history table
    for cart_item in cart_items:
        id = cart_item[1]
        quantity = cart_item[2]
        timestamp = cart_item[3]

        # Retrieve product details from the products table
        cursor.execute("SELECT * FROM products WHERE id=?", (id,))
        product = cursor.fetchone()

        if product:
            product_name = product[1]
            price = product[2]
            product_image = product[3]
            description = product[4]

            # Insert the cart item into the history table
            cursor.execute(
                "INSERT INTO history (productName, price, productImage, description, id, quantity, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (product_name, price, product_image, description, id, quantity, timestamp),
            )

    # Clear the cart_items table
    cursor.execute("DELETE FROM cart_items")
    conn.commit()

    cursor.close()

    return {"message": "Cart cleared. Cart items moved to history."}




@app.delete("/cart/{product_id}")
def remove_from_cart(product_id: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    cursor = conn.cursor()

    # Check if the product exists in the cart
    cursor.execute("SELECT * FROM cart_items WHERE product_id = ?", (product_id,))
    item = cursor.fetchone()

    if item:
        # Remove the product from the cart
        cursor.execute("DELETE FROM cart_items WHERE product_id = ?", (product_id,))
        conn.commit()
        cursor.close()

        return {"message": "Product removed from cart successfully."}

    cursor.close()

    raise HTTPException(status_code=404, detail="Product not found in the cart")

# API route to update the quantity of a product in the cart
@app.put("/cart/{product_id}")
def update_cart_item_quantity(product_id: int, quantity: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    cursor = conn.cursor()

    # Check if the product exists in the cart
    cursor.execute("SELECT * FROM cart_items WHERE product_id = ?", (product_id,))
    item = cursor.fetchone()

    if item:
        # Update the quantity of the product in the cart
        cursor.execute("UPDATE cart_items SET quantity = ? WHERE product_id = ?", (quantity, product_id))
        conn.commit()
        cursor.close()

        return {"message": "Cart item quantity updated successfully."}

    cursor.close()

    raise HTTPException(status_code=404, detail="Product not found in the cart")

# API route to calculate the total amount of the cart
@app.get("/cart/total")
def get_cart_total(conn: sqlite3.Connection = Depends(get_db_connection)):
    cursor = conn.cursor()

    # Calculate the total amount of the cart
    cursor.execute("SELECT SUM(products.price * cart_items.quantity) FROM cart_items JOIN products ON cart_items.product_id = products.id")
    total_amount = cursor.fetchone()[0]

    cursor.close()

    if total_amount:
        return {"total_amount": total_amount}
    else:
        return {"total_amount": 0.0}

# API route to increment the quantity of a product in the cart

@app.put("/cart/minus/{product_id}")
def decrement_cart_item_quantity(product_id: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    cursor = conn.cursor()

    # Check if the product exists in the cart_items table
    cursor.execute("SELECT * FROM cart_items WHERE product_id = ?", (product_id,))
    item = cursor.fetchone()

    if item:
        quantity = item[2] - 1

        if quantity >= 1:
            # Update the quantity of the product in the cart
            cursor.execute("UPDATE cart_items SET quantity = ? WHERE product_id = ?", (quantity, product_id))
        else:
            # Remove the product from the cart if the quantity becomes zero or negative
            cursor.execute("DELETE FROM cart_items WHERE product_id = ?", (product_id,))

        conn.commit()
        cursor.close()

        return {"message": "Cart item quantity decremented successfully."}

    cursor.close()

    raise HTTPException(status_code=404, detail="Product not found in the cart")

# API route to clear the cart history
@app.delete("/cart/history")
def clear_cart_history(conn: sqlite3.Connection = Depends(get_db_connection)):
    cursor = conn.cursor()

    # Clear the cart_history table
    cursor.execute("DELETE FROM history")
    conn.commit()
    cursor.close()

    return {"message": "Cart history cleared"}

# API route to retrieve the cart history from the database
@app.get("/cart/history")
def get_cart_history(conn: sqlite3.Connection = Depends(get_db_connection)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM history")
    history = cursor.fetchall()
    cursor.close()

    history_items = []
    for item in history:
        history_item = {
            "id": item[1],
            "quantity": item[7],
            "timestamp": item[8],
            "price": item[3],
            "description": item[5],
            "productName": item[2],
            "productImage": item[4]
        }
        history_items.append(history_item)

    return history_items




