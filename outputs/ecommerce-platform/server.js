const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const sessions = new Map();

const seedProducts = [
  {
    id: "p-101",
    name: "Aurora Linen Shirt",
    category: "Apparel",
    price: 64,
    rating: 4.8,
    stock: 24,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
    description: "Breathable tailored linen with a soft drape for everyday polish.",
    tags: ["New", "Organic"]
  },
  {
    id: "p-102",
    name: "Orbit Smart Lamp",
    category: "Home",
    price: 89,
    rating: 4.7,
    stock: 18,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    description: "Warm dimmable lighting with touch controls and a compact metal base.",
    tags: ["Popular"]
  },
  {
    id: "p-103",
    name: "Nomad Day Pack",
    category: "Travel",
    price: 118,
    rating: 4.9,
    stock: 12,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    description: "Weather-resistant commuter pack with padded laptop storage.",
    tags: ["Limited"]
  },
  {
    id: "p-104",
    name: "Studio Ceramic Set",
    category: "Home",
    price: 76,
    rating: 4.6,
    stock: 30,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80",
    description: "Four hand-glazed bowls designed for daily meals and hosting.",
    tags: ["Handmade"]
  },
  {
    id: "p-105",
    name: "Pulse Wireless Buds",
    category: "Tech",
    price: 132,
    rating: 4.8,
    stock: 20,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
    description: "Compact earbuds with active noise control and 32-hour case battery.",
    tags: ["Best Seller"]
  },
  {
    id: "p-106",
    name: "Atlas Desk Organizer",
    category: "Office",
    price: 48,
    rating: 4.5,
    stock: 36,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    description: "Modular desk tray with cable routing, pen storage, and phone stand.",
    tags: ["Restocked"]
  },
  {
    id: "p-107",
    name: "Terra Running Shoes",
    category: "Apparel",
    price: 96,
    rating: 4.7,
    stock: 22,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    description: "Lightweight knit trainers with cushioned support for daily movement.",
    tags: ["New"]
  },
  {
    id: "p-108",
    name: "BrewCraft Coffee Maker",
    category: "Kitchen",
    price: 149,
    rating: 4.8,
    stock: 14,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=80",
    description: "Programmable brewer with thermal carafe and precise bloom control.",
    tags: ["Popular"]
  },
  {
    id: "p-109",
    name: "Mira Skincare Kit",
    category: "Beauty",
    price: 58,
    rating: 4.6,
    stock: 28,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
    description: "Cleanser, serum, and moisturizer set for a simple daily routine.",
    tags: ["Gift Pick"]
  },
  {
    id: "p-110",
    name: "Cove Cotton Throw",
    category: "Home",
    price: 52,
    rating: 4.5,
    stock: 32,
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=80",
    description: "Textured cotton throw blanket made for sofa, bed, or travel layering.",
    tags: ["Cozy"]
  },
  {
    id: "p-111",
    name: "Nova Fitness Watch",
    category: "Tech",
    price: 174,
    rating: 4.7,
    stock: 16,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    description: "Slim activity watch with sleep insights, GPS, and long battery life.",
    tags: ["Best Seller"]
  },
  {
    id: "p-112",
    name: "Hearth Spice Candle",
    category: "Home",
    price: 34,
    rating: 4.4,
    stock: 40,
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=900&q=80",
    description: "Soy wax candle with warm notes of cedar, clove, and amber.",
    tags: ["Handmade"]
  },
  {
    id: "p-113",
    name: "Clarity Water Bottle",
    category: "Travel",
    price: 42,
    rating: 4.6,
    stock: 44,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    description: "Insulated stainless bottle that keeps drinks cold for up to 24 hours.",
    tags: ["Eco"]
  },
  {
    id: "p-114",
    name: "Focus Notebook Trio",
    category: "Office",
    price: 27,
    rating: 4.5,
    stock: 54,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80",
    description: "Three lay-flat notebooks with dot-grid pages and recycled covers.",
    tags: ["Value Pack"]
  },
  {
    id: "p-115",
    name: "Echo Bluetooth Speaker",
    category: "Tech",
    price: 84,
    rating: 4.6,
    stock: 25,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
    description: "Portable speaker with rich bass, splash resistance, and 18-hour playtime.",
    tags: ["Portable"]
  },
  {
    id: "p-116",
    name: "Stoneware Dinner Plates",
    category: "Kitchen",
    price: 68,
    rating: 4.8,
    stock: 21,
    image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=80",
    description: "Set of four durable stoneware plates with a satin speckled finish.",
    tags: ["Restocked"]
  },
  {
    id: "p-117",
    name: "Aero Weekend Duffel",
    category: "Travel",
    price: 128,
    rating: 4.9,
    stock: 11,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    description: "Carry-on duffel with shoe storage, wide opening, and padded strap.",
    tags: ["Limited"]
  },
  {
    id: "p-118",
    name: "Luma Vanity Mirror",
    category: "Beauty",
    price: 72,
    rating: 4.7,
    stock: 19,
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80",
    description: "LED vanity mirror with three light temperatures and touch dimming.",
    tags: ["New"]
  }
];

function ensureDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    writeDb({ users: [], products: seedProducts, carts: {}, orders: [] });
    return;
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  const productsById = new Map((db.products || []).map((product) => [product.id, product]));
  seedProducts.forEach((product) => {
    if (!productsById.has(product.id)) db.products.push(product);
  });
  writeDb(db);
}

function readDb() {
  ensureDatabase();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function send(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(body);
}

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || "";
  return Object.fromEntries(cookieHeader.split(";").filter(Boolean).map((pair) => {
    const [key, ...value] = pair.trim().split("=");
    return [key, decodeURIComponent(value.join("="))];
  }));
}

function getUser(req) {
  const sid = parseCookies(req).sid;
  const userId = sid && sessions.get(sid);
  if (!userId) return null;
  const db = readDb();
  return db.users.find((user) => user.id === userId) || null;
}

function requireUser(req, res) {
  const user = getUser(req);
  if (!user) {
    send(res, 401, { error: "Please sign in to continue." });
    return null;
  }
  return user;
}

function collectJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function cartDetails(db, userId) {
  const cart = db.carts[userId] || {};
  const items = Object.entries(cart).map(([productId, quantity]) => {
    const product = db.products.find((item) => item.id === productId);
    return product ? { product, quantity, lineTotal: product.price * quantity } : null;
  }).filter(Boolean);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal > 125 || subtotal === 0 ? 0 : 9;
  const tax = Math.round(subtotal * 0.0825 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return { items, subtotal, shipping, tax, total };
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml"
    }[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    });
    res.end(content);
  });
}

async function handleApi(req, res, pathname) {
  const db = readDb();
  if (req.method === "GET" && pathname === "/api/products") {
    return send(res, 200, { products: db.products });
  }

  if (req.method === "GET" && pathname === "/api/me") {
    const user = getUser(req);
    return send(res, 200, { user: user ? publicUser(user) : null });
  }

  if (req.method === "POST" && pathname === "/api/register") {
    const body = await collectJson(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    if (!name || !email.includes("@") || password.length < 8) {
      return send(res, 400, { error: "Use a name, valid email, and password with at least 8 characters." });
    }
    if (db.users.some((user) => user.email === email)) {
      return send(res, 409, { error: "An account already exists for this email." });
    }
    const passwordHash = hashPassword(password);
    const user = { id: crypto.randomUUID(), name, email, role: "customer", ...passwordHash, createdAt: new Date().toISOString() };
    db.users.push(user);
    db.carts[user.id] = {};
    writeDb(db);
    const sid = crypto.randomBytes(32).toString("hex");
    sessions.set(sid, user.id);
    return send(res, 201, { user: publicUser(user) }, { "Set-Cookie": `sid=${sid}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800` });
  }

  if (req.method === "POST" && pathname === "/api/login") {
    const body = await collectJson(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = db.users.find((item) => item.email === email);
    if (!user) return send(res, 401, { error: "Email or password is incorrect." });
    const check = hashPassword(password, user.salt);
    if (!crypto.timingSafeEqual(Buffer.from(check.hash, "hex"), Buffer.from(user.hash, "hex"))) {
      return send(res, 401, { error: "Email or password is incorrect." });
    }
    const sid = crypto.randomBytes(32).toString("hex");
    sessions.set(sid, user.id);
    return send(res, 200, { user: publicUser(user) }, { "Set-Cookie": `sid=${sid}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800` });
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    const sid = parseCookies(req).sid;
    if (sid) sessions.delete(sid);
    return send(res, 200, { ok: true }, { "Set-Cookie": "sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" });
  }

  if (pathname === "/api/cart") {
    const user = requireUser(req, res);
    if (!user) return;
    const fresh = readDb();
    fresh.carts[user.id] = fresh.carts[user.id] || {};
    if (req.method === "GET") return send(res, 200, cartDetails(fresh, user.id));
    if (req.method === "PUT") {
      const body = await collectJson(req);
      const product = fresh.products.find((item) => item.id === body.productId);
      const quantity = Math.max(0, Math.min(Number(body.quantity || 0), product ? product.stock : 0));
      if (!product) return send(res, 404, { error: "Product not found." });
      if (quantity === 0) delete fresh.carts[user.id][product.id];
      else fresh.carts[user.id][product.id] = quantity;
      writeDb(fresh);
      return send(res, 200, cartDetails(fresh, user.id));
    }
    if (req.method === "DELETE") {
      fresh.carts[user.id] = {};
      writeDb(fresh);
      return send(res, 200, cartDetails(fresh, user.id));
    }
  }

  if (pathname === "/api/orders") {
    const user = requireUser(req, res);
    if (!user) return;
    const fresh = readDb();
    if (req.method === "GET") {
      const orders = fresh.orders.filter((order) => order.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return send(res, 200, { orders });
    }
    if (req.method === "POST") {
      const body = await collectJson(req);
      const currentCart = cartDetails(fresh, user.id);
      if (!currentCart.items.length) return send(res, 400, { error: "Your cart is empty." });
      if (!body.paymentToken || !String(body.paymentToken).startsWith("tok_demo_")) {
        return send(res, 402, { error: "Payment authorization failed." });
      }
      const order = {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        userId: user.id,
        customer: publicUser(user),
        items: currentCart.items,
        totals: {
          subtotal: currentCart.subtotal,
          shipping: currentCart.shipping,
          tax: currentCart.tax,
          total: currentCart.total
        },
        shippingAddress: body.shippingAddress,
        payment: { provider: "DemoPay", last4: body.last4 || "4242", status: "authorized" },
        status: "Processing",
        createdAt: new Date().toISOString()
      };
      fresh.orders.push(order);
      currentCart.items.forEach(({ product, quantity }) => {
        const stored = fresh.products.find((item) => item.id === product.id);
        if (stored) stored.stock = Math.max(0, stored.stock - quantity);
      });
      fresh.carts[user.id] = {};
      writeDb(fresh);
      return send(res, 201, { order });
    }
  }

  return send(res, 404, { error: "Route not found." });
}

ensureDatabase();

http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  if (pathname.startsWith("/api/")) {
    handleApi(req, res, pathname).catch((error) => {
      send(res, 500, { error: error.message || "Server error" });
    });
  } else {
    serveStatic(req, res, pathname);
  }
}).listen(PORT, () => {
  console.log(`Commerce server running at http://localhost:${PORT}`);
});
