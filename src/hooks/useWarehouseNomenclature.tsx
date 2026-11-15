import { useQuery } from "@tanstack/react-query";
import { getWarehouseNomenclature } from "../api/warehouseNomenclature.api";

export const warehouseNomenclatureKey = ["warehouseNomenclature"];

export const useWarehouseNomenclature = () => {
    return useQuery({
        queryKey: warehouseNomenclatureKey,
        queryFn: getWarehouseNomenclature,
    });
};