// Parse the query string parameters from the current URL
const params = new URLSearchParams(window.location.search);
// Read the 'search' parameter or use an empty string if missing
const query = params.get("search") || "";

// Reference to the section where filtered products will be displayed
const productSection = document.getElementById("product-section");
// Reference to the search form (to re-use behavior on submit)
const form = document.getElementById("search-form");
// Reference to the search input element
const searchbar = document.getElementById("search-bar");

// Populate the search input with the value from the query string so users can see their term
searchbar.value = query;

// Fetch all products and then filter client-side using the query
fetch("https://dummyjson.com/products")
  // Parse JSON response
  .then(res => res.json())
  // Destructure products and filter by title containing the query (case-insensitive)
  .then(({ products }) => {
    const filtered = products.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase())
    );

    // Clear previous content before rendering filtered results
    productSection.innerHTML = "";

    // If no matching products are found, show a friendly message
    if (filtered.length === 0) {
      productSection.innerHTML = "<p>No products found.</p>";
      return;
    }

    // Render each filtered product as a card
    filtered.forEach(item => {
      const product = document.createElement("div"); // wrapper div for product
      product.className = "product"; // apply product styles

      // Fill the card with image, title and price
      product.innerHTML = `
        <img src="${item.thumbnail}" class="product-img" alt="${item.title}">
        <h3 class="product-title">${item.title}</h3>
        <p class="product-price">Price: $${item.price}</p>
      `;

      // Add the card to the product section
      productSection.appendChild(product);
    });
  })
  // Log fetch errors to the console for debugging
  .catch(err => console.error("Product fetch failed:", err));

// Re-use the form submit to update the URL with a new search term
form.addEventListener("submit", (e) => {
  e.preventDefault(); // prevent default navigation

  const value = searchbar.value.trim(); // get trimmed input value
  if (!value) return; // ignore empty submit

  // Redirect to the same search page with updated query parameter
  window.location.href = `search.html?search=${encodeURIComponent(value)}`;
});
