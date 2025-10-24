// Global variables
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

//initialize on page load
document.addEventListener('DOMContentLoaded',function()
            {
                updateCartCount();
                updateWishlistCount();
                setupEventListeners();
                loadAllProducts();
            });

//Setup event listeners
function setupEventListeners()
{
    //Search functionality
    const searchBtn=document.getElementById('searchBtn');
    const searchClose=document.getElementById('searchClose');
    const searchSubmit=document.getElementById('searchSubmit');
    const searchInput=document.getElementById('searchInput');
    const cartBtn=document.getElementById('cartBtn');
    const wishlistBtn=document.getElementById('wishlistBtn');

    if (searchBtn)
        {
            searchBtn.addEventListener('click',toggleSearch);    
        }
    if (searchClose)    
        {
            searchClose.addEventListener('click',toggleSearch)
        }
    if (searchSubmit)
        {
            searchSubmit.addEventListener('click',performSearch)
        }   
    if (searchInput)
        {
            searchInput.addEventListener('keyup',function(e){
                if (e.key === 'Enter')
                {
                    performSearch();
                }
            })
     }
    if (cartBtn)
        {
            cartBtn.addEventListener('click',function(){
                window.location.href='cart.html';
            });
        }
    if (wishlistBtn)
        {
            wishlistBtn.addEventListener('click',function(){
                window.location.href='wishlist.html';
            });
        }         
}   

//Toggle Search bar
function toggleSearch()
{
    const searchContainer=document.getElementById('searchContainer');
    if (searchContainer.style.display === 'none' || searchContainer.style.display === '')
    {
        searchContainer.style.display='block';
        document.getElementById('searchInput').focus();
    }
    else 
    {
        searchContainer.style.display='none';
        document.getElementById('searchResults').innerHTML= ' ';
    }
}

// Load all products for search
function loadAllProducts()
    {
        const categories = ['vegetables','fruits','spices','milkproducts'];
        const promises = categories.map(category =>
                fetch(`JSON-Data/${category}.json`)
                .then(response => response.json())
                .then(data => {
                        const products = data[category].map(product => ({
                            ...product,
                            category:category
                        }));
                        return products;
                })
                .catch(error => {
                        console.error(`Error loading ${category}:`,error);
                        return [];
                })
        );
        Promise.all(promises).then(results => {
                allProducts = results.flat();
        });
    }

// Perform search
function performSearch()
    {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '')
        {
            searchResults.innerHTML = '<p class="text-muted">Please Enter a search term</p>';
            return;
        }
        const results = allProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
        if (results.length === 0)
        {
            searchResults.innerHTML = '<p class="text-muted">No products found</p>';
            return;
        }
        let html = '<div class="list-group">';
        results.forEach(product => {
            html += `
                <div class="search-result-item" onclick="window.location.href='${product.category}.html'">
                <img src="${product.image_url}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/60'">
                <div>
                <h6 class="mb-0">${product.name}</h6>
                <small class="text-muted">${product.category}</small>
                <p class="mb-0 text-success">${product.price}</p>
                </div>
                </div>
            `;
        });
        html += '</div>';
        searchResults.innerHTML = html;
    }

// Load category products
function loadCategoryProducts(category)
        {
            fetch(`JSON-Data/${category}.json`)
            .then(response => response.json())
            .then(data => {
                const products =data[category];
                displayProducts(products,category);
            })
            .catch(error => {
                console.error('Error loading products:',error);
                document.getElementById('productsContainer').innerHTML =
                    '<p class="text-danger">Error loading products.Please try again later.</p>';
            });
        }  
        
// Display products
function displayProducts(products,category)
    {
        const container = document.getElementById('productsContainer');
        if (!container) return;

        let html = '';
        products.forEach((product,index) => {
            const isInWishlist = wishlist.some(item =>
                item.name === product.name && item.category ===category
            );
            html +=`
                <div class="col-md-6 col-lg-3">
                    <div class="card product-card">
                         <img src="${product.image_url}" class="card-img-top" alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/200'">
                        <div class="card-body">
                        <h6 class="card-title">${product.name}</h6>  
                        <p class="card-text small text-muted">${product.description.substring(0,60)}...</p>
                        <p class="product-price">₹${product.price}</p>
                        <div class="d-flex gap-2">
                        <button class="btn btn-outline-danger wishlist-btn ${isInWishlist ? 'active' : ''}"
                        onclick="toggleWishlist('${category}', ${index})">
                        <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn btn-success cart-btn flex-grow-1" 
                                    onclick="addToCart('${category}', ${index})">
                                <i class="fas fa-shopping-cart"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>          
            `;
        });
        container.innerHTML = html;
    }   
    
  //Add to cart
  function addToCart(category,index)
    {
        fetch(`JSON-Data/${category}.json`)
        .then(response => response.json())
        .then(data => {
            const product = data[category][index];
            const existingItem = cart.find(item =>
                item.name === product.name && item.category === category
            );
            if (existingItem)
            {
                existingItem.quantity += 1;
            }
            else
            {
                cart.push({
                    ...product,
                    category:category,
                    quantity:1
                });
            }
            localStorage.setItem('cart',JSON.stringify(cart));
            updateCartCount();
            showNotification('Product added to cart!');
        });
    }  
    //Toggle wishlist
    function toggleWishlist(category,index)
        {
            fetch(`JSON-Data/${category}.json`)
            .then(response => response.json())
            .then(data => {
                const product = data[category][index];
                const existingIndex = wishlist.findIndex(item =>
                    item.name === product.name && item.category === category
                );
                if (existingIndex !== -1)
                {
                    wishlist.splice(existingIndex,1);
                    showNotification('Removed from wishlist');
                }
                else
                {
                    wishlist.push({
                        ...product,
                        category:category
                    });
                    showNotification('Added to wishlist!');
                }
                localStorage.setItem('wishlist',JSON.stringify(wishlist));
                updateWishlistCount();
                // Refresh page if on category page
                if (window.location.pathname.includes(category))
                {
                    loadCategoryProducts(category);
                }
                //Refresh wishlist page
                if (window.location.pathname.includes('wishlist'))
                {
                    loadWishlist();
                }
            });
        }
  //Update cart count
  function updateCartCount()
  {
    const cartCount = document.getElementById('cartCount');
    if (cartCount)
            {
                const total = cart.reduce((sum,item) => sum + item.quantity,0);
                cartCount.textContent = total;
            }
  }   
  // Update wishlist count
  function updateWishlistCount()
  {
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount)
    {
        wishlistCount.textContent = wishlist.length;
    }
  }  

  // Load Cart
  function loadCart()
  {
    const container = document.getElementById('cartItemsContainer');
    const emptyCart =document.getElementById('emptyCart');

    if (cart.length === 0)
    {
        container.style.display = 'none';
        emptyCart.style.display = 'block';
        updateCartSummary();
        return;
    }
    container.style.display = 'block';
    emptyCart.style.display = 'none';

    let html = '';
    cart.forEach((item,index) => 
    {
        html += `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${item.image_url}" alt="${item.name}" 
                             onerror="this.src='https://via.placeholder.com/100'">
                    </div>
                    <div class="col-md-4">
                        <h5>${item.name}</h5>
                        <small class="text-muted">${item.category}</small>
                    </div>
                    <div class="col-md-2">
                        <p class="text-success mb-0">₹${item.price}</p>
                    </div>
                    <div class="col-md-3">
                        <div class="quantity-controls">
                            <button class="btn btn-sm btn-outline-secondary" onclick="decreaseQuantity(${index})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span>${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="increaseQuantity(${index})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>      
        `;
    });
    container.innerHTML = html;
    updateCartSummary();
  }

  // Increase quantity
function increaseQuantity(index) {
    cart[index].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

// Decrease quantity
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
    showNotification('Item removed from cart');
}

// Update cart summary
function updateCartSummary()
{
    const subtotal = cart.reduce((sum,item) => sum + (item.price * item.quantity),0);
    const delivery = cart.length > 0 ? 50 : 0;
    const total = subtotal + delivery;

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('delivery').textContent = `₹${delivery}`;
    document.getElementById('total').textContent = `₹${total}`;

}

// Load wishlist
function loadWishlist() {
    const container = document.getElementById('wishlistContainer');
    const emptyWishlist = document.getElementById('emptyWishlist');
    
    if (wishlist.length === 0) {
        container.style.display = 'none';
        emptyWishlist.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyWishlist.style.display = 'none';
    
    let html = '';
    wishlist.forEach((item, index) => {
        html += `
            <div class="wishlist-item">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${item.image_url}" alt="${item.name}" 
                             onerror="this.src='https://via.placeholder.com/100'">
                    </div>
                    <div class="col-md-5">
                        <h5>${item.name}</h5>
                        <p class="text-muted mb-0">${item.description.substring(0, 80)}...</p>
                        <small class="text-muted">${item.category}</small>
                    </div>
                    <div class="col-md-2">
                        <p class="text-success h5 mb-0">₹${item.price}</p>
                    </div>
                    <div class="col-md-3">
                        <button class="btn btn-success me-2" onclick="addToCartFromWishlist(${index})">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn btn-danger" onclick="removeFromWishlist(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Add to cart from wishlist
function addToCartFromWishlist(index) {
    const item = wishlist[index];
    const existingItem = cart.find(cartItem => 
        cartItem.name === item.name && cartItem.category === item.category
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart!');
}

// Remove from wishlist
function removeFromWishlist(index) {
    wishlist.splice(index, 1);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    loadWishlist();
    showNotification('Removed from wishlist');
}

// Show notification
function showNotification(message) {
    // Create a simple alert
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    notification.style.zIndex = '9999';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}
