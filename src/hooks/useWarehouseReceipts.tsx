import {useQuery} from "@tanstack/react-query";
import {getWarehouseReceipts} from "../api/warehouseReceipts.api.ts";

export const warehouseReceiptsKey = ['warehouseReceipts'];

export const useWarehouseReceipts = () => {
    return useQuery({
        queryKey: warehouseReceiptsKey,
        queryFn: getWarehouseReceipts,
    })
}