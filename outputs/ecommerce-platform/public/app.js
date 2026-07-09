const state = {
  products: [],
  cart: { items: [], subtotal: 0, shipping: 0, tax: 0, total: 0 },
  user: null,
  orders: [],
  filters: { search: "", category: "all", sort: "featured" }
};

const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${Number(value || 0).toFixed(2)}`;

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Something went wrong.");
  return payload;
}

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => node.classList.remove("show"), 2600);
}

function renderIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function filteredProducts() {
  let products = [...state.products];
  const query = state.filters.search.toLowerCase();
  if (query) {
    products = products.filter((product) =>
      [product.name, product.category, product.description].join(" ").toLowerCase().includes(query)
    );
  }
  if (state.filters.category !== "all") {
    products = products.filter((product) => product.category === state.filters.category);
  }
  if (state.filters.sort === "price-asc") products.sort((a, b) => a.price - b.price);
  if (state.filters.sort === "price-desc") products.sort((a, b) => b.price - a.price);
  if (state.filters.sort === "rating") products.sort((a, b) => b.rating - a.rating);
  return products;
}

function renderProducts() {
  const grid = $("#productGrid");
  const products = filteredProducts();
  grid.innerHTML = products.map((product) => `
    <article class="product-card">
      <div class="product-image" style="background-image:url('${product.image}')">
        <div class="badge-row">${product.tags.map((tag) => `<span class="badge">${tag}</span>`).join("")}</div>
      </div>
      <div class="product-body">
        <div class="product-title">
          <h3>${product.name}</h3>
          <span class="price">${money(product.price)}</span>
        </div>
        <p>${product.description}</p>
        <div class="product-meta">
          <span>${product.category}</span>
          <span>${product.rating} rating · ${product.stock} left</span>
        </div>
        <button class="primary-button" data-add="${product.id}">
          <i data-lucide="shopping-cart"></i>Add to cart
        </button>
      </div>
    </article>
  `).join("") || `<div class="empty-state">No products match your filters.</div>`;
  grid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });
  renderIcons();
}

function renderCategoryFilter() {
  const select = $("#categoryFilter");
  const categories = [...new Set(state.products.map((product) => product.category))].sort();
  select.innerHTML = `<option value="all">All categories</option>${categories.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
}

function renderCart() {
  $("#cartCount").textContent = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  $("#subtotalText").textContent = money(state.cart.subtotal);
  $("#shippingText").textContent = state.cart.shipping ? money(state.cart.shipping) : "Free";
  $("#taxText").textContent = money(state.cart.tax);
  $("#totalText").textContent = money(state.cart.total);
  $("#cartMetric").textContent = money(state.cart.total);

  $("#cartItems").innerHTML = state.cart.items.map(({ product, quantity, lineTotal }) => `
    <div class="cart-item">
      <img src="${product.image}" alt="${product.name}">
      <div>
        <div class="cart-line">
          <strong>${product.name}</strong>
          <span>${money(lineTotal)}</span>
        </div>
        <div class="quantity" aria-label="Quantity controls">
          <button data-qty="${product.id}" data-next="${quantity - 1}" aria-label="Decrease quantity">−</button>
          <span>${quantity}</span>
          <button data-qty="${product.id}" data-next="${quantity + 1}" aria-label="Increase quantity">+</button>
        </div>
      </div>
    </div>
  `).join("") || `<div class="empty-state">Your cart is empty.</div>`;

  $("#cartItems").querySelectorAll("[data-qty]").forEach((button) => {
    button.addEventListener("click", () => setQuantity(button.dataset.qty, Number(button.dataset.next)));
  });
}

function renderAccount() {
  const content = $("#accountContent");
  if (state.user) {
    content.innerHTML = `
      <p class="eyebrow">Account</p>
      <h2>${state.user.name}</h2>
      <p>${state.user.email}</p>
      <button class="primary-button" id="logoutButton"><i data-lucide="log-out"></i>Sign out</button>
    `;
    $("#logoutButton").addEventListener("click", logout);
  } else {
    content.innerHTML = `
      <p class="eyebrow">Account</p>
      <h2>Sign in to shop</h2>
      <div class="auth-tabs">
        <button class="active" data-auth-tab="login">Login</button>
        <button data-auth-tab="register">Register</button>
      </div>
      <form id="authForm">
        <label class="name-field" hidden>Name<input name="name" autocomplete="name"></label>
        <label>Email<input name="email" type="email" required autocomplete="email"></label>
        <label>Password<input name="password" type="password" required minlength="8" autocomplete="current-password"></label>
        <button class="primary-button" type="submit">Continue</button>
      </form>
    `;
    let mode = "login";
    content.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        mode = tab.dataset.authTab;
        content.querySelectorAll("[data-auth-tab]").forEach((item) => item.classList.toggle("active", item === tab));
        content.querySelector(".name-field").hidden = mode !== "register";
      });
    });
    $("#authForm").addEventListener("submit", (event) => submitAuth(event, mode));
  }
  renderIcons();
}

function renderOrders() {
  $("#ordersMetric").textContent = state.orders.filter((order) => order.status !== "Delivered").length;
  $("#revenueMetric").textContent = money(state.orders.reduce((sum, order) => sum + order.totals.total, 0));
  $("#orderList").innerHTML = state.orders.map((order) => `
    <article class="order-card">
      <div class="order-top">
        <div>
          <strong>${order.id}</strong>
          <span>${new Date(order.createdAt).toLocaleString()}</span>
        </div>
        <span class="order-status">${order.status}</span>
      </div>
      <div>${order.items.map((item) => `${item.quantity} × ${item.product.name}`).join(", ")}</div>
      <strong>${money(order.totals.total)}</strong>
    </article>
  `).join("") || `<div class="empty-state">Sign in and place an order to see order tracking here.</div>`;
}

async function refreshCart() {
  if (!state.user) {
    state.cart = { items: [], subtotal: 0, shipping: 0, tax: 0, total: 0 };
    renderCart();
    return;
  }
  state.cart = await api("/api/cart");
  renderCart();
}

async function refreshOrders() {
  if (!state.user) {
    state.orders = [];
    renderOrders();
    return;
  }
  const payload = await api("/api/orders");
  state.orders = payload.orders;
  renderOrders();
}

async function addToCart(productId) {
  if (!state.user) {
    openModal("#accountModal");
    toast("Create an account or sign in to use the cart.");
    return;
  }
  const existing = state.cart.items.find((item) => item.product.id === productId);
  await setQuantity(productId, existing ? existing.quantity + 1 : 1);
  toast("Added to cart.");
}

async function setQuantity(productId, quantity) {
  state.cart = await api("/api/cart", {
    method: "PUT",
    body: JSON.stringify({ productId, quantity })
  });
  renderCart();
}

async function submitAuth(event, mode) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = Object.fromEntries(form.entries());
  const result = await api(mode === "register" ? "/api/register" : "/api/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  state.user = result.user;
  closeModals();
  await Promise.all([refreshCart(), refreshOrders()]);
  renderAccount();
  toast(`Welcome to SmartStore, ${state.user.name}.`);
}

async function logout() {
  await api("/api/logout", { method: "POST" });
  state.user = null;
  state.orders = [];
  closeModals();
  await refreshCart();
  renderAccount();
  renderOrders();
  toast("Signed out.");
}

function openModal(selector) {
  $(selector).classList.add("open");
  $(selector).setAttribute("aria-hidden", "false");
}

function closeModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
}

function tokenizePayment(form) {
  const card = String(form.get("card") || "").replace(/\D/g, "");
  if (card.length < 12) throw new Error("Enter a valid demo card number.");
  return {
    paymentToken: `tok_demo_${cryptoRandom()}`,
    last4: card.slice(-4)
  };
}

function cryptoRandom() {
  const values = new Uint32Array(2);
  window.crypto.getRandomValues(values);
  return Array.from(values).map((value) => value.toString(36)).join("");
}

async function submitCheckout(event) {
  event.preventDefault();
  if (!state.user) {
    closeModals();
    openModal("#accountModal");
    toast("Please sign in before checkout.");
    return;
  }
  const form = new FormData(event.currentTarget);
  const token = tokenizePayment(form);
  const shippingAddress = {
    name: form.get("name"),
    email: form.get("email"),
    address: form.get("address"),
    city: form.get("city"),
    postal: form.get("postal")
  };
  const payload = await api("/api/orders", {
    method: "POST",
    body: JSON.stringify({ ...token, shippingAddress })
  });
  closeModals();
  await Promise.all([loadProducts(), refreshCart(), refreshOrders()]);
  toast(`Order ${payload.order.id} placed.`);
}

async function loadProducts() {
  const payload = await api("/api/products");
  state.products = payload.products;
  renderCategoryFilter();
  renderProducts();
}

async function init() {
  const me = await api("/api/me");
  state.user = me.user;
  renderAccount();
  await loadProducts();
  await Promise.all([refreshCart(), refreshOrders()]);

  $("#searchInput").addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderProducts();
  });
  $("#categoryFilter").addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    renderProducts();
  });
  $("#sortSelect").addEventListener("change", (event) => {
    state.filters.sort = event.target.value;
    renderProducts();
  });
  $("#cartButton").addEventListener("click", () => $("#cartDrawer").classList.add("open"));
  $("#closeCartButton").addEventListener("click", () => $("#cartDrawer").classList.remove("open"));
  $("#accountButton").addEventListener("click", () => openModal("#accountModal"));
  $("#demoAccountButton").addEventListener("click", () => openModal("#accountModal"));
  $("#checkoutButton").addEventListener("click", () => {
    if (!state.cart.items.length) return toast("Your cart is empty.");
    openModal("#checkoutModal");
  });
  $("#refreshOrdersButton").addEventListener("click", () => refreshOrders().then(() => toast("Orders refreshed.")));
  $("#checkoutForm").addEventListener("submit", submitCheckout);
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModals));
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModals();
    });
  });
  renderIcons();
}

init().catch((error) => toast(error.message));
