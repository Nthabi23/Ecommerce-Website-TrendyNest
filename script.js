const apiURL = 'https://fakestoreapi.com/products';

// Fetch and display featured products on the landing page
function loadFeaturedProducts() {
    fetch(apiURL)
        .then(response => response.json())
        .then(products => {
            const featuredSection = document.getElementById('featured-products');
            featuredSection.innerHTML = products.slice(0, 12).map(product => `
                <div class="col-md-3">
                    <div class="card border-0 mb-4" style="background-color:#f4f3e6;">
                        <img class="img-fluid w-50 mx-auto d-block mt-3"  src="${product.image}"   alt="${product.title}">
                        <div class="card-body">
                            <h5 class="card-title text-center fw-bold" style="color:#809671;">${product.title}</h5>
                            <p class="card-text text-center fs-4 fw-bold" style="color:#809671;">$${product.price}</p>
                            <a href="product.html?id=${product.id}" class="btn fw-bold fs-5 " style="background-color:#809671; color:#f4f3e6;">View Details</a>
                        </div>
                    </div>
                </div>
            `).join('');
        });
}

// Load product details on the product page
function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    fetch(`${apiURL}/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('product-image').src = product.image;
            document.getElementById('product-title').textContent = product.title;
            document.getElementById('product-description').textContent = product.description;
            document.getElementById('product-price').textContent = `$${product.price}`;
            
            document.getElementById('add-to-cart').addEventListener('click', () => {
                addToCart(product);
            });
        });
}

// Add product to cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
}

// Update cart item count in the header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.querySelector('.badge').textContent = count;
}

// Load cart items on the cart page
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('cart-subtotal');

    cartItems.innerHTML = cart.map(item => `
        <tr>
            <td>${item.title}</td>
            <td>$${item.price}</td>
            <td>
                <input type="number" value="${item.quantity}" min="1" class="form-control update-quantity" data-id="${item.id}">
            </td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
            <td><button class="btn btn-danger remove-item" style="background-color:#809671; border: 1px solid #809671;" data-id="${item.id}">Remove</button></td>
        </tr>
    `).join('');

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    subtotalElement.textContent = subtotal.toFixed(2);

    document.querySelectorAll('.update-quantity').forEach(input => {
        input.addEventListener('change', updateQuantity);
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', removeItem);
    });
}

// Update quantity in the cart
function updateQuantity(event) {
    const id = parseInt(event.target.dataset.id);
    const newQuantity = parseInt(event.target.value);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(item => item.id === id);

    if (product) {
        product.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
    }
}

// Remove item from the cart
function removeItem(event) {
    const id = parseInt(event.target.dataset.id);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== id);

    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
    updateCartCount();
}

// Load order summary on the checkout page
function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderSummary = document.getElementById('order-summary');
    const orderTotalElement = document.getElementById('order-total');

    orderSummary.innerHTML = cart.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${item.title} (x${item.quantity})
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </li>
    `).join('');

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    orderTotalElement.textContent = total.toFixed(2);

    
}

// Initialize the page based on the current page
function initializePage() {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadFeaturedProducts();
        updateCartCount();
    } else if (window.location.pathname.includes('product.html')) {
        loadProductDetails();
        updateCartCount();
    } else if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
    } else if (window.location.pathname.includes('checkout.html')) {
        loadOrderSummary();
    }
}

document.addEventListener('DOMContentLoaded', initializePage);


// JavaScript to fetch and display categories
fetch('https://fakestoreapi.com/products/categories')
.then(response => response.json())
.then(categories => {
    const categoryList = document.getElementById('category-list');
    categories.forEach(category => {
        const listItem = document.createElement('li');
        
        const link = document.createElement('a');
        link.href = `products.html?category=${category}`;
        link.textContent = category;

        listItem.appendChild(link);
        categoryList.appendChild(listItem);
    });
})
.catch(error => console.error('Error fetching categories:', error));

// Function to get the value of a query parameter by name
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Fetch and display products based on category
const category = getQueryParameter('category');
const categoryTitle = document.getElementById('category-title');
const productList = document.getElementById('product-list');

if (category) {
    categoryTitle.textContent = `Products in ${category.charAt(0).toUpperCase() + category.slice(1)}`;

    fetch(`https://fakestoreapi.com/products/category/${category}`)
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const productItem = document.createElement('li');
                productItem.className = 'product-item';

                const productImage = document.createElement('img');
                productImage.src = product.image;
                productImage.alt = product.title;

                const productTitle = document.createElement('div');
                productTitle.className = 'product-title';
                productTitle.textContent = product.title;

                const productPrice = document.createElement('div');
                productPrice.className = 'product-price';
                productPrice.textContent = `$${product.price}`;

                productItem.appendChild(productImage);
                productItem.appendChild(productTitle);
                productItem.appendChild(productPrice);
                productList.appendChild(productItem);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
} 



document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products');
  
    // Fetch products from the API
    fetch('https://fakestoreapi.com/products')
      .then(response => response.json())
      .then(products => {
        products.forEach(product => {
          // Create a product card
          const productCard = document.createElement('div');
          productCard.classList.add('product-card');
  
          // Add product image
          const productImage = document.createElement('img');
          productImage.src = product.image;
          productImage.alt = product.title;
  
          // Add product title
          const productTitle = document.createElement('h2');
          productTitle.textContent = product.title;
  
          // Add product price
          const productPrice = document.createElement('p');
          productPrice.classList.add('price');
          productPrice.textContent = `$${product.price.toFixed(2)}`;
  
          // Add product description (optional)
          const productDescription = document.createElement('p');
          productDescription.textContent = product.description.substring(0, 100) + '...';
  
          // Add "Add to Cart" button
          const addToCartButton = document.createElement('button');
          addToCartButton.textContent = 'Add To Cart';
          addToCartButton.addEventListener('click', () => {
            // Handle adding the product to the cart
            alert(`${product.title} has been added to your cart!`);
          });
  
          // Append elements to the product card
          productCard.appendChild(productImage);
          productCard.appendChild(productTitle);
          productCard.appendChild(productPrice);
          productCard.appendChild(productDescription);
          productCard.appendChild(addToCartButton);
  
          // Append product card to the container
          productsContainer.appendChild(productCard);
        });
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        productsContainer.innerHTML ='<p>Failed to load products.</p>';
      });
  });

  document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); 
    alert('Form submitted!');
    window.location.href = 'index.html';
});