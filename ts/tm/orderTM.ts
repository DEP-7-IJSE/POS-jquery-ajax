export class OrderTM{
    public constructor(
        public code:string, 
        public description:string, 
        public qty:number,
        public unitPrice:number,
        public total:number){}
}
