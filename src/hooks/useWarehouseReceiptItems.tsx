import {useQuery} from "@tanstack/react-query";
import { getWarehouseReceiptItems } from "../api/warehouseReceiptItems.api";

export const warehouseReceiptItemsKey = ['warehouseReceiptItems']

export const useWarehouseReceiptItems = () => {
    return useQuery({
        queryKey: warehouseReceiptItemsKey,
        queryFn: getWarehouseReceiptItems
    })
}