// Reference to the section where products will be rendered
const productSection = document.getElementById("product-section");
// Reference to the search form element
const form = document.getElementById("search-form");
// Reference to the search input field
const searchbar = document.getElementById("search-bar");
// Optional reference to a suggestions list element (may not exist yet)
const suggestionsList = document.getElementById("suggestions-list");

// Fetch the products JSON from the dummy API
fetch("https://dummyjson.com/products")
  // Parse the response as JSON
  .then(res => res.json())
  // Destructure the products array and render each item
  .then(({ products }) => {
    // Clear the section before inserting products
    productSection.innerHTML = "";

    // Loop through each product and build a card
    products.forEach(item => {
      const product = document.createElement("div"); // create a card wrapper
      product.className = "product"; // set CSS class for styling

      // Build the inner HTML for the product card (image, title, price + add-to-cart button)
      product.innerHTML = `
        <img src="${item.thumbnail}" class="product-img" alt="${item.title}">
        <h3 class="product-title">${item.title}</h3>
        <p class="product-price">Price: $${item.price}</p>
        <div class="product-actions">
          <button class="add-to-cart" data-id="${item.id}">Add to cart</button>
        </div>
      `;

      // Append the constructed card to the product section
      productSection.appendChild(product);

      // Click on card navigates to product details, but clicking the add-to-cart button should not navigate
      product.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart')) return; // ignore clicks on the add button
        // record as viewed product (id, title, thumbnail, time)
        try{
          const raw = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
          const viewed = Array.isArray(raw) ? raw : [];
          // remove old instance of same id
          const filtered = viewed.filter(v => v.id !== item.id);
          filtered.unshift({ id: item.id, title: item.title, thumb: item.thumbnail || (item.images && item.images[0] || ''), time: Date.now() });
          const latest = filtered.slice(0, 50);
          localStorage.setItem('viewedProducts', JSON.stringify(latest));
        }catch(err){ console.warn('Could not record viewed product', err); }
        window.location.href = `product-details.html?id=${item.id}`;
      });

      // Wire add-to-cart button
      const addBtn = product.querySelector('.add-to-cart');
      if(addBtn){
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // prevent card click
          // Add item to cart (localStorage)
          addToCart({ id: item.id, title: item.title, price: item.price });
          // simple UI feedback
          const prev = addBtn.textContent;
          addBtn.textContent = 'Added';
          setTimeout(() => addBtn.textContent = prev, 1200);
        });
      }
    });
  })
  // Handle fetch errors gracefully 
  .catch(err => console.error("Fetch failed:", err));

// Listen for the form submit event to trigger a search
form.addEventListener("submit", (e) => {
  e.preventDefault(); // prevent the default page reload on submit

  const query = searchbar.value.trim(); // get trimmed search term
  if (!query) return; // ignore empty searches
  
  console.log("Query: ",query); // debug log of the search term

  // Load existing search history or use an empty array
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  console.log("History: ",history); // debug log of stored search history

  // Normalize history entries to objects {query, time}
  history = history.map(h => (typeof h === 'string') ? { query: h, time: 0 } : h);
  // Remove any existing entries for this query (case-insensitive) so newest appears first
  history = history.filter(h => h.query.toLowerCase() !== query.toLowerCase());

  // Insert newest at the front and keep only the latest 20
  history.unshift({ query: query, time: Date.now() });
  history = history.slice(0, 20);

  // Store the updated history back in localStorage
  localStorage.setItem("searchHistory",JSON.stringify(history));

  // Navigate to the search results page, encoding the query into the URL
  window.location.href = `search.html?search=${encodeURIComponent(query)}`;
});

// small enhancement: wire the "View History" button (if present) to open the history view
const viewHistoryBtn = document.getElementById('view-history-button');
if(viewHistoryBtn){
  viewHistoryBtn.addEventListener('click', () => {
    window.location.href = 'history.html';
  });
}

// Simple cart helper: stores cart items in localStorage under key 'cart'
function addToCart(item){
  const raw = JSON.parse(localStorage.getItem('cart') || '[]');
  const cart = Array.isArray(raw) ? raw : [];
  const existing = cart.find(ci => ci.id === item.id);
  if(existing){
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ id: item.id, title: item.title, price: item.price, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  console.log('Cart updated', cart);
  // update badge UI
  updateCartBadge();
}

// Return total quantity of items in cart
function getCartTotalQty(){
  const raw = JSON.parse(localStorage.getItem('cart') || '[]');
  const cart = Array.isArray(raw) ? raw : [];
  return cart.reduce((s, it) => s + (Number(it.qty) || 0), 0);
}

// Update the cart badge element with the current count
function updateCartBadge(){
  const badge = document.getElementById('cart-count');
  if(!badge) return;
  const total = getCartTotalQty();
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-block' : 'none';
}

// Wire cart button click (optional: navigate to cart page)
const cartButton = document.getElementById('cart-button');
if(cartButton){
  cartButton.addEventListener('click', () => {
    // if you have a cart page, navigate there; otherwise show the cart object
    // window.location.href = 'cart.html';
    const raw = JSON.parse(localStorage.getItem('cart') || '[]');
    // basic feedback
    if(raw.length === 0){
      alert('Your cart is empty');
    } else {
      // show a quick summary
      const summary = raw.map(it => `${it.title} x${it.qty}`).join('\n');
      alert('Cart:\n' + summary);
    }
  });
}

// initialize badge on load
updateCartBadge();
