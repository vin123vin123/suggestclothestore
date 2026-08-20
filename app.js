// Simple Vanilla JS Clothing Store
// Data + rendering + cart (localStorage)

const products = [
  {
    id: 'p1',
    name: 'Classic White T-Shirt',
    price: 19.99,
    category: 'men',
    sizes: ['S','M','L','XL'],
    colors: ['White','Black'],
    image: 'https://images.unsplash.com/photo-1520975917363-6b0e3f1b6a0c?q=80&w=1200&auto=format&fit=crop&sat=-10',
    description: 'Comfortable cotton tee, perfect for daily wear.'
  },
  {
    id: 'p2',
    name: 'Blue Denim Jacket',
    price: 79.0,
    category: 'women',
    sizes: ['S','M','L'],
    colors: ['Blue'],
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop&sat=-20',
    description: 'Stylish denim jacket with a modern fit.'
  },
  {
    id: 'p3',
    name: 'Kids Hoodie',
    price: 29.5,
    category: 'kids',
    sizes: ['XS','S','M'],
    colors: ['Red','Gray'],
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop&sat=-20',
    description: 'Cozy hoodie for kids, soft fleece inside.'
  },
  {
    id: 'p4',
    name: 'Slim Chinos',
    price: 45.0,
    category: 'men',
    sizes: ['S','M','L','XL'],
    colors: ['Khaki','Navy'],
    image: 'https://images.unsplash.com/photo-1530845649237-7b6b4b01d06f?q=80&w=1200&auto=format&fit=crop&sat=-20',
    description: 'Smart casual chinos with stretch fabric.'
  },
  {
    id: 'p5',
    name: 'Floral Dress',
    price: 59.99,
    category: 'women',
    sizes: ['S','M','L'],
    colors: ['Floral'],
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1200&auto=format&fit=crop&sat=-20',
    description: 'Lightweight floral dress for warm days.'
  }
];

// DOM refs
const productsEl = document.getElementById('products');
const searchEl = document.getElementById('search');
const categoryEl = document.getElementById('category');
const sortEl = document.getElementById('sort');
const cartBtn = document.getElementById('cart-btn');
const cartCountEl = document.getElementById('cart-count');

const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalSize = document.getElementById('modal-size');
const modalColor = document.getElementById('modal-color');
const modalQty = document.getElementById('modal-qty');
const addToCartBtn = document.getElementById('add-to-cart');

const cartDrawer = document.getElementById('cart-drawer');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout');
const clearCartBtn = document.getElementById('clear-cart');

let state = {
  products,
  query: '',
  category: 'all',
  sort: 'default',
  selected: null, // product for modal
  cart: loadCart()
};

// --- utilities ---
function formatPrice(v){ return v.toFixed(2) }
function saveCart(){ localStorage.setItem('store_cart', JSON.stringify(state.cart)) }
function loadCart(){ try { return JSON.parse(localStorage.getItem('store_cart')) || []; } catch(e){ return []; } }
function cartCount(){ return state.cart.reduce((s,i)=>s+i.qty,0) }
function cartTotal(){ return state.cart.reduce((s,i)=>i.qty * i.price + s, 0) }

// --- render products ---
function renderProducts(){
  let list = state.products.slice();
  if(state.category !== 'all') list = list.filter(p => p.category === state.category);
  if(state.query.trim()){
    const q = state.query.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
  }
  if(state.sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if(state.sort === 'price-desc') list.sort((a,b)=>b.price-a.price);

  productsEl.innerHTML = '';
  if(list.length === 0){
    productsEl.innerHTML = '<p>No products found.</p>';
    return;
  }

  for(const p of list){
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img loading="lazy" src="${p.image}" alt="${p.name}" />
      <h4>${p.name}</h4>
      <div class="meta">${p.category.toUpperCase()}</div>
      <div class="price">$${formatPrice(p.price)}</div>
      <div class="actions">
        <button data-id="${p.id}" class="view">View</button>
        <button data-id="${p.id}" class="add">Add</button>
      </div>
    `;
    productsEl.appendChild(card);
  }
}

// --- product modal ---
function openModal(productId){
  const p = state.products.find(x=>x.id===productId);
  if(!p) return;
  state.selected = p;
  modalImg.src = p.image;
  modalTitle.textContent = p.name;
  modalDesc.textContent = p.description;
  modalPrice.textContent = `$${formatPrice(p.price)}`;
  modalSize.innerHTML = p.sizes.map(s=>`<option>${s}</option>`).join('');
  modalColor.innerHTML = p.colors.map(c=>`<option>${c}</option>`).join('');
  modalQty.value = 1;
  modal.classList.remove('hidden');
}

function closeModal(){ state.selected = null; modal.classList.add('hidden') }

// --- cart functions ---
function addToCartFromModal(){
  if(!state.selected) return;
  const size = modalSize.value || '';
  const color = modalColor.value || '';
  const qty = Math.max(1, parseInt(modalQty.value||1,10));
  addToCart(state.selected, size, color, qty);
  closeModal();
}

function addToCart(product, size='', color='', qty=1){
  const key = `${product.id}__${size}__${color}`;
  const existing = state.cart.find(i=>i.key===key);
  if(existing){ existing.qty += qty } else {
    state.cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      size,
      color,
      image: product.image
    });
  }
  saveCart();
  renderCart();
}

function updateQty(key, qty){
  const it = state.cart.find(i=>i.key===key);
  if(!it) return;
  it.qty = Math.max(1, qty);
  saveCart();
  renderCart();
}

function removeFromCart(key){
  state.cart = state.cart.filter(i=>i.key!==key);
  saveCart();
  renderCart();
}

function clearCart(){
  state.cart = [];
  saveCart();
  renderCart();
}

// --- render cart drawer ---
function renderCart(){
  cartItemsEl.innerHTML = '';
  if(state.cart.length === 0){
    cartItemsEl.innerHTML = '<li style="padding:12px">Cart is empty.</li>';
  } else {
    for(const item of state.cart){
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div style="flex:1">
          <div style="font-weight:600">${item.name}</div>
          <div style="font-size:0.9rem;color:#666">${item.size ? 'Size: '+item.size : ''} ${item.color ? ' • '+item.color : ''}</div>
          <div style="margin-top:6px">Price: $${formatPrice(item.price)} × 
            <input type="number" min="1" value="${item.qty}" data-key="${item.key}" class="qty-input" style="width:60px;margin-left:8px" />
            <button data-key="${item.key}" class="remove" style="margin-left:8px">Remove</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(li);
    }
  }
  cartCountEl.textContent = cartCount();
  cartTotalEl.textContent = formatPrice(cartTotal());
}

// --- events ---
productsEl.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.dataset.id;
  if(btn.classList.contains('view')) openModal(id);
  if(btn.classList.contains('add')){
    const p = state.products.find(x=>x.id===id);
    addToCart(p,'', '', 1);
  }
});

searchEl.addEventListener('input', (e)=>{
  state.query = e.target.value;
  renderProducts();
});

categoryEl.addEventListener('change', (e)=>{
  state.category = e.target.value;
  renderProducts();
});

sortEl.addEventListener('change', (e)=>{
  state.sort = e.target.value;
  renderProducts();
});

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });
addToCartBtn.addEventListener('click', addToCartFromModal);

cartBtn.addEventListener('click', ()=> cartDrawer.classList.toggle('hidden'));
closeCartBtn.addEventListener('click', ()=> cartDrawer.classList.add('hidden'));
clearCartBtn.addEventListener('click', ()=> { if(confirm('Clear cart?')) clearCart(); });
checkoutBtn.addEventListener('click', ()=> {
  if(state.cart.length===0){ alert('Cart empty') ; return; }
  alert('Checkout completed (mock). Cart cleared.');
  clearCart();
});

cartItemsEl.addEventListener('input', (e)=>{
  if(e.target.classList.contains('qty-input')){
    const key = e.target.dataset.key;
    const qty = parseInt(e.target.value||1,10);
    updateQty(key, qty);
  }
});
cartItemsEl.addEventListener('click', (e)=>{
  const btn = e.target.closest('button.remove');
  if(!btn) return;
  const key = btn.dataset.key;
  removeFromCart(key);
});

// initialize
renderProducts();
renderCart();