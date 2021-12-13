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
const chartArea = document.querySelector(".chartArea");


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

            // 執行 圖表(前三名+其他)
            if(orderData.length === 0){
                chartArea.textContent = "目前沒有訂單！"
            } else{
                c3AllItemsFilter();
            }
            
        })
        .catch((error) => {
            console.log(error);
            alert(error.response.data.message);
        })
}

// 渲染 訂單列表
function renderOrderList(orderData) {
    let str = "";
    orderData.forEach((item) => {
        // console.log(item);
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
function discardAllBtnClick() {
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

// 圖表資料彙整 (全品項營收比重)
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
    let finalData = [];
    let otherData = ["其他", 0]
    c3DataSort.forEach((item, index, arr) => {
        if (index < 3) {
            finalData.push(item);
        } else {
            otherData[1] += item[1];

            // 到最後一筆將 otherData 加到 finalData 裡
            if (index === arr.length - 1) {
                finalData.push(otherData);
            }
        }
    })
    // console.log(finalData);

    // C3.js
    let chart = c3.generate({
        bindto: '#chart',
        data: {
            type: "pie",
            columns: finalData,
        },
        color: {
            pattern: ["#484891", "#7373B9", "#9393FF", "#B9B9FF"]
        }
    });    
}







