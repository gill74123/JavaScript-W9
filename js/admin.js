// 全域變數
const api_path = "gill74123";
const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`;
const token = "dgaz1bgRuGbf5qIIS2r3jyjFdJj2";
const config = {
    headers: {
        Authorization: `${token}`
    }
}

// DOM 指向
const orderPageTbody = document.querySelector("tbody");
const discardAllBtn = document.querySelector(".discardAllBtn");
const c3PieSelect = document.querySelector(".c3PieSelect");
const c3PieTitle = document.querySelector(".c3PieTitle");
const chartArea = document.querySelector(".chartArea");
const orderPageInfo = document.querySelector(".orderPage-info")

// 初始化
function init() {
    // 執行 取得訂單列表
    getOrderList();
}
init();

// 取得 訂單列表
let orderData = [];
function getOrderList() {
    axios.get(url, config)
        .then((response) => {
            // console.log(response.data);
            orderData = response.data.orders;

            // 執行 渲染訂單列表
            renderOrderList(orderData);

            // 執行 圖表
            if(orderData.length === 0){
                orderPageInfo.textContent = "目前沒有訂單！"
            } else{
                // 執行 渲染 C3 圖表
                renderC3Chart();
            }            
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 渲染 訂單列表
function renderOrderList(orderData) {
    // 將資料排序(後到先)
    orderDataSort = orderData.sort((a, b) => {
        return b.createdAt - a.createdAt
    })
    // console.log(orderDataSort);

    let str = "";
    orderDataSort.forEach((item) => {
        // 日期轉換
        let date = new Date(item.createdAt * 1000).toLocaleDateString();

        // 顯示全部訂單品項
        let productsTitle = "";
        item.products.forEach((i) => {
            productsTitle += `<p>${i.title} X ${i.quantity}</p>`;
        })

        // 累加列表字串
        str += `
        <tr>
            <td>${item.createdAt}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                <p>${productsTitle}</p>
            </td>
            <td>${date}</td>
            <td class="orderStatus">
                <a href="#" data-orderid="${item.id}">${item.paid ? "已處理" : "未處理"}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn" data-orderid="${item.id}" value="刪除">
            </td>
        </tr>`
    })
    // console.log(str);
    orderPageTbody.innerHTML = str;

    // 執行 清除指定訂單 click 事件
    deleteOrderItemClick();

    // 執行 修改訂單狀態 click 事件
    editOrderStatusClick();
}

// 清除全部訂單
function deleteOrderAll() {
    axios.delete(url, config)
        .then((response) => {
            // console.log(response);
            orderData = response.data.orders;

            // 執行 取得訂單列表
            // 因為要一起渲染圖表
            getOrderList();
            alert("訂單已全部清空搂~~~~~~~");
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 清除全部訂單 click 事件
discardAllBtn.addEventListener("click", discardAllBtnClick);
function discardAllBtnClick(e) {
    e.preventDefault();

    // 執行 清除全部訂單
    deleteOrderAll();
}

// 清除指定訂單
function deleteOrderItem(orderid) {
    let url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderid}`;
    axios.delete(url, config)
        .then((response) => {
            // console.log(response);
            orderData = response.data.orders;

            // 執行 取得訂單列表
            // 因為要一起渲染圖表
            getOrderList();
            alert("成功清除指定訂單啦！！！")
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 清除指定訂單 click 事件
function deleteOrderItemClick() {
    const delSingleOrderBtn = document.querySelectorAll(".delSingleOrder-Btn");

    delSingleOrderBtn.forEach((item) => {
        // console.log(item);
        item.addEventListener("click", (e) => {
            let orderid = e.target.dataset.orderid;

            // 執行 清除指定訂單
            deleteOrderItem(orderid);
        })
    })
}

// 修改訂單狀態
function editOrderStatus(editData) {
    let data = {
        "data": editData
    }
    axios.put(url, data, config)
        .then((response) => {
            // console.log(response);
            orderData = response.data.orders;

            // 執行 渲染訂單列表
            renderOrderList(orderData);
            alert("成功修改訂單狀態優~~~~")
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 修改訂單狀態 click 事件
function editOrderStatusClick() {
    const orderStatus = document.querySelectorAll(".orderStatus");

    orderStatus.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            let editData = {
                id: e.target.dataset.orderid
            }
            if (e.target.textContent === "未處理") {
                editData.paid = true;
            } else {
                editData.paid = false;
            }

            // 執行 修改訂單狀態
            editOrderStatus(editData);
        })
    })
}

// 圖表 change 事件
c3PieSelect.addEventListener("change", renderC3Chart);

// 渲染 C3 圖表
function renderC3Chart(){
    // console.log(c3PieSelect.value);
    if (c3PieSelect.value === "c3AllItemsFilter") {
        c3PieTitle.textContent = "全品項營收比重(篩選)";
        c3AllItemsFilter();
    } else if (c3PieSelect.value === "c3AllItems") {
        c3PieTitle.textContent = "全品項營收比重";
        c3AllItems();
    } else if (c3PieSelect.value === "c3AllItemsCategory") {
        c3PieTitle.textContent = "全品項類別營收比重";
        c3AllItemsCategory();
    }
}

// 圖表 (全品項營收比重篩選)
function c3AllItemsFilter() {
    // output {title: total, title: total....}
    let productsObj = {};
    orderData.forEach((item) => {
        item.products.forEach((i) => {
            // console.log(i.title);
            if (productsObj[i.title]) {
                productsObj[i.title] += (i.quantity) * (i.price);
            } else {
                productsObj[i.title] = (i.quantity) * (i.price);
            }
        })
    })
    // console.log(productsObj);

    // output [[title: total], [title: total],....]
    let productsTitle = Object.keys(productsObj);
    let c3Data = [];
    productsTitle.forEach((item) => {
        let ary = [];
        ary.push(item);
        ary.push(productsObj[item]);
        c3Data.push(ary)
    })
    // console.log(c3Data);

    // 依照營收排序(大到小)
    c3DataSort = c3Data.sort((a, b) => {
        return b[1] - a[1]
    })
    // console.log(c3DataSort);

    // 組出最終 Data
    let finalc3Data = [];
    let otherData = ["其他", 0]
    c3DataSort.forEach((item, index, arr) => {
        if (index < 3) {
            finalc3Data.push(item);
        } else {
            otherData[1] += item[1];

            // 到最後一筆將 otherData 加到 finalc3Data 裡
            if (index === arr.length - 1) {
                finalc3Data.push(otherData);
            }
        }
    })
    // console.log(finalc3Data);

    // C3.js
    let chart = c3.generate({
        bindto: '#chart',
        data: {
            type: "pie",
            columns: finalc3Data,
        },
        color: {
            pattern: ["#484891", "#7373B9", "#9393FF", "#B9B9FF"]
        }
    });
}

// 圖表(全品項營收比重)
function c3AllItems() {
    // output {title: total, title: total....}
    let productsObj = {};
    orderData.forEach((item) => {
        item.products.forEach((i) => {
            if (productsObj[i.title]) {
                productsObj[i.title] += (i.quantity) * (i.price);
            } else {
                productsObj[i.title] = (i.quantity) * (i.price);
            }
        })
    })
    // console.log(productsObj);

    // output [[title, total], [title, total]....]
    let productsTitle = Object.keys(productsObj);
    let finalc3Data = [];
    productsTitle.forEach((item) => {
        let ary = [];
        ary.push(item);
        ary.push(productsObj[item]);
        finalc3Data.push(ary)
    })
    // console.log(finalc3Data);

    // C3.js
    let chart = c3.generate({
        bindto: '#chart',
        data: {
            type: "pie",
            columns: finalc3Data,
        },
        color: {
            pattern: ["#336666", "#3D7878", "#408080", "#4F9D9D", "#5CADAD", "#6FB7B7", "#81C0C0", "#95CACA"]
        }
    });

}

// 圖表(全品項種類營收比重)
function c3AllItemsCategory() {
    // 篩選出有哪些類別
    // output {title: total, title: total....}
    let categoryObj = {};
    orderData.forEach((item) => {
        item.products.forEach((i) => {
            if (categoryObj[i.category]) {
                categoryObj[i.category] += (i.quantity) * (i.price);
            } else{
                categoryObj[i.category] = (i.quantity) * (i.price)
            }
        })
    })
    // console.log(categoryObj);

    // output [[title, total], [title, total]....]
    let itemsCategory = Object.keys(categoryObj);    
    let finalc3Data = []
    itemsCategory.forEach((item) => {
        let ary = [];
        ary.push(item);
        ary.push(categoryObj[item])
        finalc3Data.push(ary)
    })
    // console.log(finalc3Data);
    
    // C3.js
    let chart = c3.generate({
        bindto: '#chart',
        data: {
            type: "pie",
            columns: finalc3Data,
        },
        color: {
            pattern: ["#820041", "#BF0060", "#F00078"]
        }
    });
}







