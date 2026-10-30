const initialFoods = [
  {
    id: 1,
    name: "Fresh Bread Packets",
    qty: 20,
    location: "Sunrise Bakehouse, Pune",
    donor: "Sunrise Bakehouse",
    image: "images/Bread.jpg",
    deadline: Date.now() + 3 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🥖"
  },
  {
    id:2,
    name: "Cookie Cakes",
    qty: 10,
    location: "Sunrise Bakehouse, Pune",
    donor: "Sunrise Bakehouse",
    image: "images/Cookie cake.jpg",
    deadline: Date.now() + 3 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🥖"
  },
  {
    id: 3,
    name: "Vegetable Meal Boxes",
    qty: 10,
    location: "Green Bowl Bistro, Pune",
    donor: "Green Bowl Bistro",
    image: "images/Meal.jpg",
    deadline: Date.now() + 4 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🥗"
  },
  {
    id: 4,
    name: "Pizza Slices",
    qty: 12,
    location: "Oven & Olive Pizzeria, Pune",
    donor: "Oven & Olive Pizzeria",
    image: "images/Pizza.jpg",
    deadline: Date.now() + 2 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🍕"
  },
  {
    id: 5,
    name: "Garlic Bread",
    qty: 5,
    location: "Oven & Olive Pizzeria, Pune",
    donor: "Oven & Olive Pizzeria",
    image: "images/Garlic Bread.jpg",
    deadline: Date.now() + 2 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🍕"
  },
  {
    id: 6,
    name: "Veg Burger",
    qty: 10,
    location: "Urban Bite Burgers, Pune",
    donor: "Urban Bite Burgers",
    image: "images/Burger.jpg",
    deadline: Date.now() + 3 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🍔"
  },
  {
    id: 7,
    name: "Paneer Butter Masala Meals",
    qty: 25,
    location: "Spice Garden Restaurant, Pune",
    donor: "Spice Garden Restaurant",
    image: "images/Paneer.jpg",
    deadline: Date.now() + 3 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🍛"
  },
  {
    id: 8,
    name: "Paneer Tikka Portions",
    qty: 10,
    location: "Spice Garden Restaurant, Pune",
    donor: "Spice Garden Restaurant",
    image: "images/Paneer Tikka.jpg",
    deadline: Date.now() + 3 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🍢"
  },
  {
    id: 9,
    name: "Garlic Naan",
    qty: 10,
    location: "Spice Garden Restaurant, Pune",
    donor: "Spice Garden Restaurant",
    image: "images/Naan.jpg",
    deadline: Date.now() + 3 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🫓"
  },
  {
    id: 10,
    name: "Roti",
    qty: 25,
    location: "Daily Dabba Kitchen, Pune",
    donor: "Daily Dabba Kitchen",
    image: "images/Roti.jpg",
    deadline: Date.now() + 4 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🫓"
  },
  {
    id: 11,
    name: "Dal Fry",
    qty: 12,
    location: "Daily Dabba Kitchen, Pune",
    donor: "Daily Dabba Kitchen",
    image: "images/Dal Fry.jpg",
    deadline: Date.now() + 4 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
  },
  {
    id: 12,
    name: "Veg Biryani Boxes",
    qty: 14,
    location: "Royal Biryani House, Pune",
    donor: "Royal Biryani House",
    image: "images/Biryani.jpg",
    deadline: Date.now() + 2 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🍲"
  },
  {
    id: 13,
    name: "Veg Paneer Biryani",
    qty: 20,
    location: "Royal Biryani House, Pune",
    donor: "Royal Biryani House",
    image: "images/Paneer biryani.jpg",
    deadline: Date.now() + 2 * 60 * 60 * 1000,
    status: "Available",
    receiver: "",
    icon: "🍲"
  },
]

const STORAGE_KEY = "trusttrayFoods";

let foods = loadFoods();
let pendingAction = null;
let toastTimer;

const foodList = document.getElementById("foodList");
const donationForm = document.getElementById("donationForm");
const filter = document.getElementById("filter");
const modal = document.getElementById("modal");
const toastBox = document.getElementById("toast");

function loadFoods() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Could not load saved food listings:", error);
  }

  return initialFoods.map(food => ({ ...food }));
}

function saveFoods() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
  } catch (error) {
    showToast("Could not save data in this browser.");
  }
}

function showToast(message) {
  toastBox.textContent = message;
  toastBox.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastBox.hidden = true;
  }, 3000);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  });
}


function renderFoods() {
  const selectedStatus = filter.value;

  const filteredFoods = foods.filter(food =>
    selectedStatus === "All" || food.status === selectedStatus
  );

  if (filteredFoods.length === 0) {
    foodList.innerHTML =
      '<div class="empty">No food listings found in this category.</div>';
    updateDashboard();
    return;
  }

  // Group available food items by hotel name
  const hotelGroups = new Map();

  filteredFoods.forEach(food => {
    const hotelName = food.donor || "Community Food Donor";

    if (!hotelGroups.has(hotelName)) {
      hotelGroups.set(hotelName, []);
    }

    hotelGroups.get(hotelName).push(food);
  });

  foodList.innerHTML = [...hotelGroups.entries()].map(
    ([hotelName, hotelFoods]) => `
      <section class="hotel-section">
        <h3 class="hotel-heading">
          🏨 ${escapeHTML(hotelName)}
        </h3>

        <div class="hotel-food-grid">
          ${hotelFoods.map(food => {
            let actionButton = "";

            if (food.status === "Available") {
              actionButton = `
                <button class="btn primary-btn"
                  data-action="claim" data-id="${food.id}">
                  Claim Food
                </button>`;
            } else if (food.status === "Claimed") {
              actionButton = `
                <button class="btn gold-btn"
                  data-action="complete" data-id="${food.id}">
                  Confirm Pickup
                </button>`;
            }

            const imageHTML = food.image
              ? `<img class="food-photo"
                  src="${escapeHTML(food.image)}"
                  alt="${escapeHTML(food.name)}"
                  onerror="this.outerHTML='<div class=&quot;food-emoji&quot;>${food.icon || "🥡"}</div>'">`
              : `<div class="food-emoji">${food.icon || "🥡"}</div>`;

            return `
              <article class="food-card">
                ${imageHTML}

                <div class="food-info">
                  <h3>${escapeHTML(food.name)}</h3>

                <div class="food-meta">
                📦 ${Number(food.qty)} food packs<br>
                📍 ${escapeHTML(food.location)}<br>
                ⏰ Collect by ${formatDate(Number(food.deadline))}<br>
                🥗 Food expiry: ${formatDate(Number(food.expiryDate || food.deadline))}
                ${food.receiver
                  ? `<br>🤝 Receiver: ${escapeHTML(food.receiver)}`
                  : ""}
                </div>

                  <span class="status ${food.status.toLowerCase()}">
                    ${escapeHTML(food.status)}
                  </span>

                  <div class="food-actions">
                    ${actionButton}
                    <button class="btn reset-btn"
                      data-action="details" data-id="${food.id}">
                      Details
                    </button>
                  </div>
                </div>
              </article>`;
          }).join("")}
        </div>
      </section>`
  ).join("");

  updateDashboard();
}


function updateDashboard() {
  const available = foods.filter(food => food.status === "Available").length;
  const claimed = foods.filter(food => food.status === "Claimed").length;
  const completed = foods.filter(food => food.status === "Completed").length;
  const totalPacks = foods.reduce(
    (sum, food) => sum + Number(food.qty || 0), 0
  );

  document.getElementById("availableCount").textContent = available;
  document.getElementById("claimedCount").textContent = claimed;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("totalCount").textContent = totalPacks;
}

function openModal(title, message, action) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalText").textContent = message;
  pendingAction = action;
  modal.hidden = false;
}

function closeModal() {
  modal.hidden = true;
  pendingAction = null;
}

function claimFood(id) {
  const food = foods.find(item => item.id === id);

  if (!food || food.status !== "Available") {
    showToast("This food listing is no longer available.");
    return;
  }

  if (Number(food.deadline) <= Date.now()) {
    showToast("Collection deadline has passed.");
    return;
  }

  openModal(
    "Claim this food?",
    `Claim ${food.qty} packs of ${food.name}? This is a demo action.`,
    () => {
      food.status = "Claimed";
      food.receiver = "Demo Receiver";

      saveFoods();
      renderFoods();
      showToast("Food claimed in demo mode!");
    }
  );
}

function completePickup(id) {
  const food = foods.find(item => item.id === id);

  if (!food || food.status !== "Claimed") {
    showToast("Only claimed food can be completed.");
    return;
  }

  openModal(
    "Confirm Pickup?",
    `Mark ${food.name} as picked up? This updates the local demo only.`,
    () => {
      food.status = "Completed";

      saveFoods();
      renderFoods();
      showToast("Pickup completed in demo mode!");
    }
  );
}

function showDetails(id) {
  const food = foods.find(item => item.id === id);

  if (!food) return;

  openModal(
    food.name,
    `Status: ${food.status}\n` +
    `Quantity: ${food.qty} packs\n` +
    `Donor: ${food.donor}\n` +
    `Location: ${food.location}\n` +
    `Collect by: ${formatDate(Number(food.deadline))}\n\n` +
    "Demo record only. No blockchain transaction has been sent.",
    null
  );
}

// Handle food-card buttons
foodList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "claim") claimFood(id);
  if (action === "complete") completePickup(id);
  if (action === "details") showDetails(id);
});

// Publish a new donation
donationForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("foodName").value.trim();
  const qty = Number(document.getElementById("quantity").value);
  const location = document.getElementById("location").value.trim();
  const donor = document.getElementById("donor").value.trim();
  const deadline = new Date(
    document.getElementById("deadline").value
  ).getTime();
  const expiryDate = new Date(
  document.getElementById("expiryDate").value
).getTime();

  if (!name || !location || !donor) {
    showToast("Please complete all the fields.");
    return;
  }

  if (!Number.isInteger(qty) || qty < 1 || qty > 10000) {
    showToast("Enter a valid quantity from 1 to 10000.");
    return;
  }

  if (!Number.isFinite(deadline) || deadline <= Date.now()) {
    showToast("Please choose a future collection deadline.");
    return;
  }
  if (!Number.isFinite(expiryDate) || expiryDate <= Date.now()) {
  showToast("Please choose a future food expiry date and time.");
  return;
}

if (expiryDate < deadline) {
  showToast("Food expiry must be after the collection deadline.");
  return;
}

  const lowerName = name.toLowerCase();

  let icon = "🥡";
  let image = "";

  if (/bread|bun|roti|bakery/.test(lowerName)) {
    icon = "🥖";
    image = "images/Bread.jpg";
  } else if (/fruit|apple|banana/.test(lowerName)) {
    icon = "🍎";
  } else if (/meal|rice|lunch|vegetable/.test(lowerName)) {
    icon = "🍱";
    image = "images/Meal.jpg";
  }

  const newFood = {
    id: Date.now(),
    name,
    qty,
    location,
    donor,
    deadline,
    expiryDate,
    status: "Available",
    receiver: "",
    image,
    icon
  };

  foods.unshift(newFood);
  saveFoods();

  filter.value = "All";
  renderFoods();
  donationForm.reset();
  setDefaultDeadline();

  showToast("Food listing published successfully!");
});

// Filter food listings
filter.addEventListener("change", renderFoods);

// Modal buttons
document.getElementById("modalCancel").addEventListener("click", closeModal);

document.getElementById("modalConfirm").addEventListener("click", () => {
  const action = pendingAction;
  closeModal();

  if (action) action();
});

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

// Reset demo data
document.getElementById("resetBtn").addEventListener("click", () => {
  openModal(
    "Reset Sample Demo?",
    "This clears the saved demo listings and restores the original samples.",
    () => {
      foods = initialFoods.map(food => ({ ...food }));
      saveFoods();
      filter.value = "All";
      renderFoods();
      showToast("Sample listings restored.");
    }
  );
});

// Set a future collection deadline by default
function setDefaultDeadline() {
  const input = document.getElementById("deadline");
  const now = new Date();
  const minimum = new Date(now.getTime() + 60 * 1000);
  const defaultDate = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const toLocalInput = date => {
    const local = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 16);
  };

  input.min = toLocalInput(minimum);
  input.value = toLocalInput(defaultDate);
}

setDefaultDeadline();
renderFoods();


let cart = JSON.parse(
  localStorage.getItem("trustTrayCart") || "[]"
);

function saveCart() {
  localStorage.setItem(
    "trustTrayCart",
    JSON.stringify(cart)
  );
}

function addToCart(foodId) {
  // Existing food list madhun food shodha
  const food = sampleFoods.find(
    item => String(item.id) === String(foodId)
  );

  if (!food) {
    alert("Food not found!");
    return;
  }

  if (food.status !== "Available") {
    alert("This food is no longer available.");
    return;
  }

  if (cart.some(item => String(item.id) === String(foodId))) {
    alert("This food is already in your cart.");
    return;
  }

  cart.push(food);
  saveCart();
  renderCart();

  alert(food.name + " added to cart!");
}

function removeFromCart(foodId) {
  cart = cart.filter(
    item => String(item.id) !== String(foodId)
  );

  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");

  cartCount.textContent =
    cart.length + (cart.length === 1
      ? " item selected"
      : " items selected");

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p class="empty-cart">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = cart.map(food => `
    <div class="cart-item">
      <div>
        <h3>${escapeHTML(food.name)}</h3>
        <p>📦 ${Number(food.qty)} food packs</p>
        <p>📍 ${escapeHTML(food.location)}</p>
      </div>

      <button
        class="remove-cart-btn"
        onclick="removeFromCart('${food.id}')">
        Remove
      </button>
    </div>
  `).join("");
}

renderCart();