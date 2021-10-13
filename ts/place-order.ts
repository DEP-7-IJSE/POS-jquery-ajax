import $ from 'jquery';
import { OrderTM } from "./tm/orderTM";
import { Customer } from "./dto/customer";
import { Item } from "./dto/item";
import { Order, OrderDetails } from "./dto/order";
import { Pagination } from './dto/pagination';

const BASE_API = 'http://localhost:8080/pos';
const ORDERS_SERVICE_API = `${BASE_API}/orders`;
const CUSTOMER_SERVICE_API = `${BASE_API}/customers`;
const ITEM_SERVICE_API = `${BASE_API}/items`;
const PAGE_SIZE = 6;
const PAGINATION = new Pagination($('.pagination'), PAGE_SIZE, 0, loadAllOrders);

let orders: Array<OrderTM> = [];
let customers: Array<Customer> = [];
let items: Array<Item> = [];
let totalOrders = 0;
let newOrderId = '';

loadAllCustomers();
loadAllItems();
generateOrderId()

$(window).ready(()=>{
    $('#cmb-customer-ids, #cmb-item-codes').val('');    //TODO:
});

function generateOrderId():void{
    
    $.get(ORDERS_SERVICE_API, {page: PAGINATION.selectedPage, size: PAGE_SIZE}).then((data, statusText, xhr)=>{
        newOrderId = xhr.getResponseHeader('X-Total-Count').split('/')[1];
        $('#order-id h1').text(newOrderId);
    }).catch((err)=>{
        alert("Failed to fetch orderId");
        console.error(err);
        
    });
}

function loadAllCustomers():void{
    $.get(CUSTOMER_SERVICE_API).then((data)=>{
        customers = data;

        $('#cmb-customer-ids option').remove();

        customers.forEach((c) => {
            const rowHtml = `<option>${c.id}</option>` ;


            $('#cmb-customer-ids').append(rowHtml);
        });
    }).catch((err)=>{
        alert("Failed to fetch customers, try again...!");
        console.error(err);
    });
}

$('#cmb-customer-ids').on('change',function(){
    for (const customer of customers) {
        if(customer.id === $(this).val()){
            $('#txt-customer-name').val(customer.name);
            break;
        }
    }
});

function loadAllItems():void{
    $.get(ITEM_SERVICE_API).then((data)=>{
        items = data;

        $('#cmb-item-codes option').remove();

        items.forEach((c) => {
            const rowHtml = `<option>${c.code}</option>` ;


            $('#cmb-item-codes').append(rowHtml);
        });
    }).catch((err)=>{
        alert("Failed to fetch items, try again...!");
        console.error(err);
    });
}

$('#cmb-item-codes').on('change',function(){
    for (const item of items) {
        if(item.code === $(this).val()){
            $('#txt-item-desc').val(item.description);
            $('#txt-price').val(item.unitPrice);
            $('#txt-qty-hand').val(item.qtyOnHand);
            break;
        }
    }
});

function loadAllOrders(): void {
    $('#tbl-orders tbody tr').remove();

    const start = (PAGINATION.selectedPage == 1) ? 0 : 1 + ((PAGINATION.selectedPage - 1) * PAGE_SIZE);
    const end = PAGINATION.selectedPage === 1 ? orders.length + start : orders.length === start ? start + 1 :(orders.length - start) + start;
    
    console.log(start, end);
    //orders.length * selectedPage: start + PAGE_SIZE
    
    for (let index = start; index < end; index++) {
        
        const rowHtml = `<tr>
         <td>${orders[index].code}</td>
         <td>${orders[index].description}</td>
         <td>${orders[index].qty}</td>
         <td>${orders[index].unitPrice}</td>
         <td>${orders[index].total}</td>
         <td><i class="fas fa-trash trash"></i></td>
         </tr>` ;


        $('#tbl-orders tbody').append(rowHtml);
        
    }
    PAGINATION.reInitialize(totalOrders,PAGINATION.selectedPage);
}

$('#btn-save').on('click', (eventData) => {
    eventData.preventDefault();

    const cmbCode = $('#cmb-item-codes');
    const txtDesc = $('#txt-item-desc');
    const txtPrice = $('#txt-price');
    const txtQty = $('#txt-qty');
    const txtQtyHand = $('#txt-qty-hand');

    let code = (cmbCode.val() as string).trim();
    let description = (txtDesc.val() as string).trim();
    let price = (txtPrice.val() as string).trim();
    let qty = (txtQty.val() as string).trim();
    let qtyHand = (txtQtyHand.val() as string).trim();

    let validated = true;
    $('#txt-qty').removeClass('is-invalid');


    if (!/^\d+$/.test(qty) || qtyHand < qty) {
        txtQty.addClass('is-invalid');
        txtQty.trigger('select');
        validated = false;
    }

    if (!validated) return;

    if ($('#tbl-orders tbody tr').hasClass('selected')) {
        
        $("#tbl-orders tbody tr.selected").find("td:nth-child(2)").text($("#txt-description").val() as string);
        $("#tbl-orders tbody tr.selected").find("td:nth-child(3)").text($("#txt-qty").val() as string);
        $("#tbl-orders tbody tr.selected").find("td:nth-child(4)").text($("#txt-price").val() as string);
        return;
    }

    saveOrder(new OrderTM(code, description, +qty, +price, (+qty*+price)));

    let total =0; /* TODO: exists order table update, count qty with table */
    for (const order of orders) {
        total +=order.total;
    }
    
    $('#order-total').text(total);
});

function saveOrder(order: OrderTM): void {
    totalOrders++;
    PAGINATION.pageCount = Math.ceil(totalOrders / PAGE_SIZE);

    orders.push(order);
    PAGINATION.navigateToPage(PAGINATION.pageCount);
    $('#cmb-item-codes, #txt-item-desc, #txt-price, #txt-qty-hand, #txt-qty').val('');
    $('#cmb-item-codes').trigger('focus');
}

let date = new Date();
let dd = String(date.getDate()).padStart(2, '0');
let mm = String(date.getMonth() + 1).padStart(2, '0');;
let yyyy = date.getFullYear();

const today = yyyy + '-' + mm + '-' + dd;

$('#btn-place').on('click',()=>{
    const orderId = $('#order-id h1').text();
    const cusId = $('#cmb-customer-ids').val();
    
    let orderDetails:Array<OrderDetails>=[];
    for (const order of orders) {
        console.log(new OrderDetails(order.code + '',+order.unitPrice,+order.qty));
        
        orderDetails.push(new OrderDetails(order.code + '',+order.unitPrice,+order.qty));   
    }
    
    placeOrder(new Order(orderId, today, cusId +'', orderDetails));
    
});

function placeOrder(order:Order):void{
    $.ajax(ORDERS_SERVICE_API,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(order)
    }).then(()=>{
        alert("Order Placed");
        loadAllItems();
        generateOrderId();

    }).catch((err)=>{
        alert('Failed placing');
        console.error(err);
        
    })
}

$('#tbl-orders tbody').on('click', 'tr', function () {

    const code = $(this).find("td:first-child").text();
    const desc = $(this).find("td:nth-child(2)").text();
    const qty = $(this).find("td:nth-child(3)").text();
    const price = $(this).find("td:nth-child(4)").text();

    $('#cmb-item-codes').val(code);
    $('#txt-item-desc').val(desc);
    $('#txt-price').val(price);
    $('#txt-qty').val(qty);

    for (const item of items) {
        if(item.code == code){
            $('#txt-qty-hand').val(item.qtyOnHand);
            break;
        }
    }

    $("#tbl-orders tbody tr").removeClass('selected');
    $(this).addClass('selected');

});

$('#tbl-orders tbody').on('click', '.trash', function (eventData) {
    if (confirm('Are you sure to delete?')) {
        deleteOrder(($(eventData.target).parents("tr").find('td:first-child')).text());
    }
});

function deleteOrder(code: string): void {
    let index=-1;
    for (const order of orders) {
        index++;
        if(code == order.code){          
            orders.splice(index,1);
        }
    }
    console.log(orders);
    
    totalOrders--;
    PAGINATION.pageCount = Math.ceil(totalOrders / PAGE_SIZE);
                
    PAGINATION.navigateToPage(PAGINATION.pageCount);

}

$('#btn-clear').on('click', () => {
    $("#tbl-items tbody tr.selected").removeClass('selected');
    $("#txt-code").removeAttr('disabled').trigger('focus');
});