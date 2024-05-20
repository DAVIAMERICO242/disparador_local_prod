import WooCommerceAPI from "@woocommerce/woocommerce-rest-api";
console.log('oi');
import { WoocSchema } from "../schemas";

export async function getWoocAllCustomersData(site: string,
    consumerKey:string,
    consumerSecret:string,
    start_date:string,
    end_date:string,
    order_status:string){

    var orders: WoocSchema[] = [];
    for(let i=1;i<=100;i++){
        try{
            console.log(orders);
            console.log(i);

            var page_order  = await getWoocOrderByPage(i,
                site,
                consumerKey,
                consumerSecret,
                start_date,
                end_date,
                order_status);

            if(!(page_order.length)){
                break;
            }
            page_order.forEach((order: any,index: any)=>{
                orders.push(order);
            })
        }
        catch{
            return false
        }
    }
    console.log('Orders antes do retorno');
    console.log(orders)
    return orders;
}

function getWoocOrderByPage(page: number,
    site: string,
    consumerKey: string,
    consumerSecret: string,
    start_date: string,
    end_date: string,
    order_status: string):Promise<WoocSchema[]> {

    return new Promise((resolve, reject) => {
        console.log('numero de paginas')
        console.log(page)
        if (!page) {
            reject("Page parameter is missing");
            return;
        }
        
        const page_orders: WoocSchema[] = [];
        
        const WooCommerce = new WooCommerceAPI({
            url: site,
            consumerKey: consumerKey,
            consumerSecret: consumerSecret,
            version: 'wc/v3'
        });
        
        WooCommerce.get("orders", {
            'per_page': 100,
            'page': page,
            'before': end_date + "T00:00:00",
            'after': start_date + "T00:00:00",
            'status':order_status
        })
        .then((response: { data: any[]; }) => {
            response.data.forEach((order: { date_created: string ; number: any; status: any; billing: { first_name: string; last_name: string; phone: any; }; }, index: any) => {
                var splittedDate = (order.date_created?.slice(0, 10))?.split("-");
                var formattedDate = splittedDate?(`${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`):'';
                page_orders.push({
                    'order_number': order.number,
                    'order_date': formattedDate,
                    'order_status': order.status,
                    'nome': order.billing?.first_name + ' ' + order.billing?.last_name,
                    'phone': order.billing?.phone
                });
            });
            resolve(page_orders);
        }).catch((error: any) => {
            console.log(error)
            reject([]); // Propagate the error
        });
    });
}





  