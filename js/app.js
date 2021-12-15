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
const productSelect = document.querySelector(".productSelect");
const CartsBody = document.querySelector(".shoppingCart-body");
const CartsTotalPrice = document.querySelector(".shoppingCart-totalPrice");
const discardAllBtn = document.querySelector(".discardAllBtn");
const orderInfoBtn = document.querySelector(".orderInfo-btn");
const orderInfoForm = document.querySelector(".orderInfo-form")
const orderInputGroup = document.querySelectorAll("input[type=text], input[type=tel], input[type=email], select[id=tradeWay]");


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
            renderProductsList(productsData);

            // 執行 取得篩選分類
            getProductsCategory();
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 渲染 產品列表
function renderProductsList(productsData) {
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

// 篩選 產品列表功能
// 取得 篩選分類
function getProductsCategory() {
    // output [床架, 收納, 窗簾]
    productsCategory = {};
    productsData.forEach((item) => {        
        if (!productsCategory[item.category]) {
            productsCategory[item.category] = 0;
        }
    })
    // console.log(productsCategory); // {床架: 0, 收納: 0, 窗簾: 0}

    let finalProductsCategory = Object.keys(productsCategory); // [床架, 收納, 窗簾]

    // 執行 渲染篩選分類
    renderProductsCategory(finalProductsCategory);
}

// 渲染 篩選分類
function renderProductsCategory(finalProductsCategory) {
    let str = `<option value="全部" selected>全部</option>`;
    finalProductsCategory.forEach((item) => {
        str += `<option value="${item}">${item}</option>`;
    })
    productSelect.innerHTML = str;
}

// 篩選分類 change 事件
productSelect.addEventListener("change", productSelectChange);
function productSelectChange(e) {
    let selectFilterData = productsData.filter((item) => {
        if (e.target.value === item.category || e.target.value === "全部") {
            return item
        }
    })
    // 執行 渲染產品列表
    renderProductsList(selectFilterData);
}



// 取得 購物車列表
let cartsData = [];
function getCartsList() {
    axios.get(urlCarts)
        .then((response) => {
            // console.log(response.data.carts);
            cartsData = response.data.carts;

            // 執行 渲染購物車列表
            renderCartsList(cartsData);
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 渲染 購物車列表
function renderCartsList(cartsData) {
    if (cartsData.length === 0) {
        CartsBody.innerHTML = `<tr><td></td><td colspan="2" class="noCart">購物車目前沒有商品！</td><td></td</tr>`;
        CartsTotalPrice.textContent = "NT$0";
    } else {
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
                <a href="#"><span class="material-icons cartAmount-icon" data-cartid="${item.id}" data-editnum="${item.quantity - 1}">remove</span></a>
                <span>${item.quantity}</span>
                <a href="#"><span class="material-icons cartAmount-icon" data-cartid="${item.id}" data-editnum="${item.quantity + 1}">add</span></a>
            </td>
            <td>NT$${item.product.price * item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-cartid="${item.id}">clear</a>
            </td>
        </tr>`

            // 購物車總金額
            totalPrice += item.product.price * item.quantity;
        })
        CartsBody.innerHTML = str;
        CartsTotalPrice.textContent = `NT$${totalPrice}`;

        // 執行 編輯購物車數量 click 事件
        editCartsNumClick();

        // 清除指定購物車產品 click 事件
        deleteCartsItemClick();
    }
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
            // console.log(response);
            cartsData = response.data.carts;

            // 防呆
            if (!quantity) {
                alert("要填寫數量哦~~~");
                return
            }

            // 執行 渲染購物車列表
            renderCartsList(cartsData);
            alert("成功加入購物車！！！");
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

    addCardBtn.forEach((item) => {
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

                    // 清空數量欄位
                    i.value = "";
                }
            })
        })
    })
}

// 編輯購物車數量
function editCartsNum(cartid, editnum) {
    let editData = {
        data: {
            id: cartid,
            quantity: editnum
        }
    }
    axios.patch(urlCarts, editData)
        .then((response) => {
            // console.log(response.data);
            cartsData = response.data.carts;

            // 執行 渲染購物車列表
            renderCartsList(cartsData);
            alert("已修改產品數量！")
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 編輯購物車數量 click 事件
function editCartsNumClick() {
    const cartAmountBtn = document.querySelectorAll(".cartAmount-icon");
    cartAmountBtn.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            let cartid = e.target.dataset.cartid;
            let editnum = parseInt(e.target.dataset.editnum);

            // 執行 編輯購物車數量
            editCartsNum(cartid, editnum);
        })
    })
}

// 清除購物車全部產品
function deleteCartsAll() {
    axios.delete(urlCarts)
        .then((response) => {
            // console.log(response);
            cartsData = response.data.carts;

            // 執行 渲染購物車列表
            renderCartsList(cartsData);
            alert("商品已全部清空！");
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 清除購物車全部產品 click 事件
discardAllBtn.addEventListener("click", discardAllBtnClick);
function discardAllBtnClick(e) {
    e.preventDefault();

    // 執行 清除購物車全部產品
    deleteCartsAll();
}

// 清除指定購物車產品
function deleteCartsItem(cartid) {
    let urlCarts = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartid}`;
    axios.delete(urlCarts)
        .then((response) => {
            // console.log(response);
            cartsData = response.data.carts;

            // 執行 渲染購物車列表
            renderCartsList(cartsData);
            alert("指定商品已清除！");
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 清除指定購物車產品 click 事件
function deleteCartsItemClick() {
    const discardBtn = document.querySelectorAll(".discardBtn");

    discardBtn.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            let cartid = e.target.dataset.cartid;

            // 執行 清除指定購物車產品
            deleteCartsItem(cartid);
        })
    })
}

// 送出訂單
function createOrder(userInfo) {
    let userData = {
        "data": {
            "user": userInfo
        }
    }
    axios.post(urlOrders, userData)
        .then((response) => {
            // console.log(response.data); // 這邊的 data 是訂單的 data
            
            // 將購物車資料清空
            cartsData = [];

            // 執行 渲染購物車列表
            renderCartsList(cartsData);
            alert("成功送出訂單！");

            // 清空表單
            orderInfoForm.reset();
        })
        .catch((error) => {
            console.log(error);
            if (error.response.data.status === false) {
                alert(error.response.data.message);
            }
        })
}

// 送出訂單 click 事件
orderInfoBtn.addEventListener("click", orderInfoBtnClick);
function orderInfoBtnClick() {
    let userInfo = {};
    orderInputGroup.forEach((item, index, arr) => {
        let orderInfoError = validate(orderInfoForm, constraints);
        if (orderInfoError) {
            // console.log("有錯誤");
            document.querySelector(`[data-message=${item.name}]`).textContent = orderInfoError[item.name];
        } else {
            userInfo.name = arr[0].value.trim();
            userInfo.tel = arr[1].value.trim();
            userInfo.email = arr[2].value.trim();
            userInfo.address = arr[3].value.trim();
            userInfo.payment = arr[4].value.trim();
        }
    })
    // 執行 送出訂單
    createOrder(userInfo);


}

// 送出訂單 change 事件
orderInputGroup.forEach((item) => {
    item.addEventListener("change", (e) => {
        // 預設為空字串 324行 & 350 行都可以
        document.querySelector(`[data-message=${item.name}]`).textContent = "";ㄋ

        let orderInfoError = validate(orderInfoForm, constraints);

        if (orderInfoError) {
            document.querySelector(`[data-message=${item.name}]`).textContent = orderInfoError[item.name];
        } 
        // else {
        //     document.querySelector(`[data-message=${item.name}]`).textContent = "";
        // }
    })
})

// 訂單驗證
let constraints = {
    "姓名": {
        presence: {
            message: "必填！"
        }
    },
    "電話": {
        presence: {
            message: "必填！"
        },
        length: {
            is: 10,
            message: "必須要 10 碼！"
        },
        numericality: {
            onlylnteger: true,
            message: "請輸入數字！"
        }
    },
    "Email": {
        presence: {
            message: "必填！"
        },
        email: {
            message: "格式錯誤！"
        }
    },
    "寄送地址": {
        presence: {
            message: "必填！"
        }
    },
    "交易方式": {
        presence: {
            message: "必填！"
        }
    }
}