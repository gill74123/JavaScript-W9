// 全域變數
const api_path = "gill74123";
// products url
const urlProducts = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`;
// carts url
const urlCarts = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`;
// orders url
const urlOrders = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`;

// DOM 指向
const productList = document.querySelector(".productList");
const CartsBody = document.querySelector(".shoppingCart-body");
const CartsTotalPrice = document.querySelector(".shoppingCart-totalPrice");


// 初始化
function init() {
    // 執行 取得產品列表
    getProductsList();

    // 執行 取得購物車列表
    getCartsList();
}
init();

// 取得 產品列表
let productsData = [];
function getProductsList() {
    axios.get(urlProducts)
        .then((response) => {
            // console.log(response.data.products);
            productsData = response.data.products;

            // 執行 渲染產品列表
            renderProductsList();
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 渲染 產品列表
function renderProductsList() {
    let str = "";
    productsData.forEach((item) => {
        str += `
        <li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}"
            alt="${item.description}">
            <a href="#" class="addCardBtn" data-productid="${item.id}">加入購物車</a>
            <div class="productsInfo">
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
                <div>
                    <label for="" class="productsLabel">數量：</label>
                    <input type="number" id="num" class="productsNum" placeholder="請填寫數量" min="1" data-productid="${item.id}">
                </div>
            </div>
        </li>`
    })
    productList.innerHTML = str;

    // 執行 加入購物車 click 事件
    addCartsClick();
}

// 取得 購物車列表
let cartsData = [];
function getCartsList() {
    axios.get(urlCarts)
        .then((response) => {
            // console.log(response.data.carts);
            cartsData = response.data.carts;

            // 執行 渲染購物車列表
            renderCartsList();
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 渲染 購物車列表
function renderCartsList() {
    let str = "";
    let totalPrice = 0;
    cartsData.forEach((item) => {
        str += `
        <tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="${item.product.description}">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td class="amountArea">
                <a href="#"><span class="material-icons cartAmount-icon">remove</span></a>
                <span>${item.quantity}</span>
                <a href="#"><span class="material-icons cartAmount-icon">add</span></a>
            </td>
            <td>NT$${item.product.price * item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons">clear</a>
            </td>
        </tr>`

        // 購物車總金額
        totalPrice += item.product.price * item.quantity;
    })
    CartsBody.innerHTML = str;
    CartsTotalPrice.textContent = `NT$${totalPrice}`;
    
}

// 加入購物車
function addCarts(productid, quantity) {
    let addData = {
        "data": {
            "productId": productid,
            "quantity": quantity
        }
    };

    axios.post(urlCarts, addData)
        .then((response) => {
            // console.log(response.data);

            // 執行 取得購物車列表
            getCartsList();
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message)
        })
}

// 加入購物車 click 事件
function addCartsClick() {
    const addCardBtn = document.querySelectorAll(".addCardBtn");
    const productsNum = document.querySelectorAll(".productsNum");

    addCardBtn.forEach((item)=> {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            // console.log(e.target.dataset.productsid);
            let quantity;
            productsNum.forEach((i) => {
                // console.log(i.dataset.productsid);
                if (e.target.dataset.productid === i.dataset.productid) {
                    quantity = parseInt(i.value);

                    // 執行 加入購物車
                    addCarts(e.target.dataset.productid, quantity);
                }
            })
        })
    })
}