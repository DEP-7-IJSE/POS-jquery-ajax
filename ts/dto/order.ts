export class Order{
    public constructor(
        public orderId:string,
        public orderDate: string,
        public customerId: string,
        public orderDetails: OrderDetails[]
    ){}
}

export class OrderDetails{
    public constructor(
        public itemCode:string,
        public unitPrice: number,
        public qty: number
    ){}
}
