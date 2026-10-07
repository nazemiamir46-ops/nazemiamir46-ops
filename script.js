// سبد خرید عمداً در localStorage ذخیره نمی‌شود؛ با Refresh خالی می‌شود.
const products = [
  {id:1,n:"اتصال اتوکلاو F-3/8",c:"اتصالات فشار بالا",p:0,img:"product-1.jpg",d:"اتصال صنعتی مشکی با مشخصات F-3/8 اتوکلاو، دارای ورودی F1/2 NPT و مناسب برای کاربردهای تخصصی و تجهیزات فشار بالا."},
  {id:2,n:"اتصال رزوه‌ای F1/2 به M1/8",c:"اتصالات فشار بالا",p:0,img:"product-2.jpg",d:"قطعه اتصال رزوه‌ای صنعتی با ورودی F1/2 NPT و خروجی M1/8 NPT، مناسب برای تجهیزات و مدارهای تخصصی."},
  {id:3,n:"آداپتور F-3/8 اتوکلاو به 1/2 NPT",c:"آداپتور صنعتی",p:0,img:"product-3.jpg",d:"آداپتور صنعتی مشکی با مشخصات F-3/8 AUToclave و 1/2 NPT، طراحی‌شده برای اتصال تجهیزات و خطوط فشار بالا."},
  {id:4,n:"اتصال F1/2 NPT به M1/2 NPT",c:"اتصالات رزوه‌ای",p:0,img:"product-4.jpg",d:"اتصال رزوه‌ای شش‌گوش با ورودی F1/2 NPT و خروجی M1/2 NPT، مناسب برای کاربردهای صنعتی و مهندسی."}
];

let cart = [];
const toman = n => n ? n.toLocaleString("fa-IR") + " تومان" : "استعلام قیمت";
const $ = id => document.getElementById(id);
const normalize = s => String(s).replace(/ي/g,"ی").replace(/ك/g,"ک").trim().toLowerCase();

function toast(text){
  const el = $("toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function render(list = products){
  const grid = $("productsGrid");
  if(!grid) return;
  if(!list.length){ grid.innerHTML = '<div class="empty-state">محصولی در این دسته پیدا نشد.</div>'; return; }
  grid.innerHTML = list.map(p => `
    <article class="card">
      <button class="card-image" type="button" aria-label="مشاهده ${p.n}" data-product="${p.id}">
        <img src="${p.img}" alt="${p.n}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-error')">
      </button>
      <div class="card-body">
        <h3>${p.n}</h3><p>${p.c}</p><div class="price">${toman(p.p)}</div>
        <div class="card-actions">
          <button class="details-btn" type="button" data-product="${p.id}">جزئیات</button>
          <button class="add-btn" type="button" data-add="${p.id}">${p.p ? "افزودن به سبد" : "استعلام قیمت"}</button>
        </div>
      </div>
    </article>`).join("");
}

function add(id){
  const p = products.find(x => x.id === Number(id));
  if(!p) return;
  if(!p.p){ openProduct(p.id); return; }
  const item = cart.find(x => x.id === p.id);
  item ? item.q++ : cart.push({id:p.id,q:1});
  renderCart(); toast("محصول به سبد خرید اضافه شد");
}
function changeQty(id, delta){
  const item = cart.find(x => x.id === Number(id));
  if(!item) return;
  item.q += delta;
  if(item.q <= 0) cart = cart.filter(x => x.id !== item.id);
  renderCart();
}
function removeItem(id){ cart = cart.filter(x => x.id !== Number(id)); renderCart(); }

function renderCart(){
  const count = cart.reduce((sum,x) => sum + x.q, 0);
  $("cartCount").textContent = count.toLocaleString("fa-IR");
  if(!cart.length){
    $("cartItems").innerHTML = '<p class="empty-cart">سبد خرید شما خالی است.</p>';
    $("cartTotal").textContent = "۰ تومان";
    $("orderBtn").disabled = true;
    return;
  }
  let total = 0;
  $("cartItems").innerHTML = cart.map(x => {
    const p = products.find(y => y.id === x.id);
    total += p.p * x.q;
    return `<div class="cart-item">
      <img src="${p.img}" alt="${p.n}" loading="lazy">
      <div><h4>${p.n}</h4><small>${toman(p.p)} برای هر عدد</small></div>
      <div class="qty"><button type="button" data-minus="${p.id}">−</button><b>${x.q.toLocaleString("fa-IR")}</b><button type="button" data-plus="${p.id}">+</button></div>
      <button class="remove" type="button" data-remove="${p.id}">حذف</button>
    </div>`;
  }).join("");
  $("cartTotal").textContent = toman(total);
  $("orderBtn").disabled = false;
}

function modal(id, show=true){
  const el = $(id); if(!el) return;
  el.classList.toggle("show", show);
  document.body.classList.toggle("modal-open", document.querySelector(".modal.show") !== null);
  if(show) setTimeout(() => el.querySelector("input,button:not(.x),textarea")?.focus(), 50);
}
function openProduct(id){
  const p = products.find(x => x.id === Number(id)); if(!p) return;
  $("productDetail").innerHTML = `<div class="product-detail"><img src="${p.img}" alt="${p.n}"><div><small>${p.c}</small><h2>${p.n}</h2><p>${p.d}</p><strong>${toman(p.p)}</strong><br><button class="btn" type="button" data-detail-add="${p.id}">${p.p ? "افزودن به سبد خرید" : "درخواست استعلام قیمت"}</button></div></div>`;
  modal("productModal");
}

function searchProducts(q){
  q = normalize(q);
  if(!q){ $("searchResults").innerHTML = '<p class="search-hint">نام محصول موردنظر را وارد کنید.</p>'; return; }
  const found = products.filter(p => normalize(`${p.n} ${p.c} ${p.d}`).includes(q));
  $("searchResults").innerHTML = found.length ? found.map(p => `<div class="result"><span>${p.n}</span><button type="button" data-search-product="${p.id}">مشاهده</button></div>`).join("") : '<p>محصولی پیدا نشد.</p>';
}

document.addEventListener("click", e => {
  const addBtn = e.target.closest("[data-add]"); if(addBtn){ add(addBtn.dataset.add); return; }
  const details = e.target.closest("[data-product]"); if(details){ openProduct(details.dataset.product); return; }
  const plus = e.target.closest("[data-plus]"); if(plus){ changeQty(plus.dataset.plus,1); return; }
  const minus = e.target.closest("[data-minus]"); if(minus){ changeQty(minus.dataset.minus,-1); return; }
  const remove = e.target.closest("[data-remove]"); if(remove){ removeItem(remove.dataset.remove); return; }
  const result = e.target.closest("[data-search-product]"); if(result){ openProduct(result.dataset.searchProduct); modal("searchModal",false); return; }
  const detailAdd = e.target.closest("[data-detail-add]"); if(detailAdd){ add(detailAdd.dataset.detailAdd); if(products.find(p=>p.id===Number(detailAdd.dataset.detailAdd))?.p) modal("productModal",false); }
});

document.querySelectorAll(".filters button").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".filters button").forEach(x => x.classList.remove("active"));
  btn.classList.add("active");
  const f = btn.dataset.filter;
  render(f === "all" ? products : products.filter(p => p.c === f));
}));

if($("cartBtn")) $("cartBtn").onclick = () => { renderCart(); modal("cartModal"); };
if($("searchBtn")) $("searchBtn").onclick = () => { $("searchInput").value=""; searchProducts(""); modal("searchModal"); };
if($("searchInput")) $("searchInput").oninput = e => searchProducts(e.target.value);
if($("contactForm")) $("contactForm").onsubmit = e => { e.preventDefault(); $("message").textContent = "درخواست شما ثبت شد. این فرم فعلاً نمایشی است و برای ارسال واقعی باید به سرویس یا بک‌اند متصل شود."; e.target.reset(); toast("درخواست ثبت شد"); };
if($("orderBtn")) $("orderBtn").onclick = () => toast(cart.length ? "مرحله ثبت سفارش در نسخه بعدی به سیستم واقعی متصل می‌شود." : "سبد خرید خالی است.");

document.querySelectorAll(".x").forEach(btn => btn.onclick = () => modal(btn.dataset.close,false));
document.querySelectorAll(".modal").forEach(m => m.addEventListener("click", e => { if(e.target === m) modal(m.id,false); }));
document.addEventListener("keydown", e => { if(e.key === "Escape") document.querySelectorAll(".modal.show").forEach(m => modal(m.id,false)); });

render(); renderCart();
