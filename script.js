const grid = document.querySelector('#product-grid');
const cartCount = document.querySelector('#cart-count');
const emptyCart = document.querySelector('#empty-cart');
const selectedCart = document.querySelector('#selected-cart');
const cartItems = document.querySelector('#cart-items');
const orderTotal = document.querySelector('#order-total');
const dialog = document.querySelector('#order-dialog');
const confirmationItems = document.querySelector('#confirmation-items');
const confirmationTotal = document.querySelector('#confirmation-total');
const confirmButton = document.querySelector('#confirm-order');
const newOrderButton = document.querySelector('#new-order');

const products = JSON.parse(document.querySelector('#product-data').textContent);
const cart = new Map();
const money = value => `$${value.toFixed(2)}`;
const escapeHtml = value => value.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));

function productImage(product, size) {
  return `<picture><source media="(min-width: 1051px)" srcset="${product.image.desktop}"><source media="(min-width: 481px)" srcset="${product.image.tablet}"><img class="product-image" src="${product.image.mobile}" alt="${escapeHtml(product.name)}"></picture>`;
}

function renderProducts() {
  grid.innerHTML = products.map((product, index) => {
    const quantity = cart.get(index) || 0;
    const action = quantity
      ? `<div class="product-action quantity-control" role="group" aria-label="Quantity for ${escapeHtml(product.name)}"><button type="button" data-action="decrease" data-index="${index}" aria-label="Decrease ${escapeHtml(product.name)} quantity"><img src="images/icon-decrement-quantity.svg" alt=""></button><span class="quantity-value">${quantity}</span><button type="button" data-action="increase" data-index="${index}" aria-label="Increase ${escapeHtml(product.name)} quantity"><img src="images/icon-increment-quantity.svg" alt=""></button></div>`
      : `<button class="product-action" type="button" data-action="increase" data-index="${index}"><img class="cart-icon" src="images/icon-add-to-cart.svg" alt="">Add to Cart</button>`;
    return `<article class="product-card ${quantity ? 'is-selected' : ''}"><div class="product-visual">${productImage(product, 'desktop')}${action}</div><p class="category">${escapeHtml(product.category)}</p><h3 class="product-name">${escapeHtml(product.name)}</h3><p class="price">${money(product.price)}</p></article>`;
  }).join('');
}

function totalUnits() { return [...cart.values()].reduce((sum, quantity) => sum + quantity, 0); }
function totalPrice() { return [...cart].reduce((sum, [index, quantity]) => sum + products[index].price * quantity, 0); }

function renderCart() {
  const units = totalUnits();
  cartCount.textContent = `(${units})`;
  emptyCart.hidden = units > 0;
  selectedCart.hidden = units === 0;
  cartItems.innerHTML = [...cart].map(([index, quantity]) => {
    const product = products[index];
    return `<div class="cart-item"><div><p class="cart-item-name">${escapeHtml(product.name)}</p><div class="cart-item-details"><span class="cart-quantity">${quantity}x</span><span class="unit-price">@ ${money(product.price)}</span><span class="line-total">${money(product.price * quantity)}</span></div></div><button class="remove-button" type="button" data-action="remove" data-index="${index}" aria-label="Remove ${escapeHtml(product.name)} from cart"><img src="images/icon-remove-item.svg" alt=""></button></div>`;
  }).join('');
  orderTotal.textContent = money(totalPrice());
  confirmButton.disabled = units === 0;
}

function render() { renderProducts(); renderCart(); }
function changeQuantity(index, amount) {
  const next = (cart.get(index) || 0) + amount;
  if (next > 0) cart.set(index, next); else cart.delete(index);
  render();
}

document.addEventListener('click', event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const index = Number(control.dataset.index);
  if (control.dataset.action === 'remove') cart.delete(index); else changeQuantity(index, control.dataset.action === 'increase' ? 1 : -1);
  render();
});

function showConfirmation() {
  confirmationItems.innerHTML = [...cart].map(([index, quantity]) => {
    const product = products[index];
    return `<div class="confirmation-item"><img class="confirmation-thumb" src="${product.image.thumbnail}" alt=""><div class="confirmation-item-info"><p class="confirmation-item-name">${escapeHtml(product.name)}</p><p class="confirmation-item-meta">${quantity}x @ ${money(product.price)}</p></div><span class="confirmation-item-total">${money(product.price * quantity)}</span></div>`;
  }).join('');
  confirmationTotal.textContent = money(totalPrice());
  dialog.showModal();
  newOrderButton.focus();
}

confirmButton.addEventListener('click', showConfirmation);
newOrderButton.addEventListener('click', () => { cart.clear(); dialog.close(); render(); confirmButton.focus(); });
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

render();
