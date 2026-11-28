import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    createWarehouseCounterpartie,
    deleteWarehouseCounterpartie,
    getWarehouseCounterparties, updateWarehouseCounterpartie
} from "../api/warehouseCounterparties.api.ts";


export const WarehouseCounterpartiesKey = ['warehouse_counterparties']

export const useWarehouseCounterparties = () => {
    return useQuery({
        queryFn: getWarehouseCounterparties,
        queryKey: WarehouseCounterpartiesKey,
    })
}

export const useCreateWarehouseCounterparty  = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createWarehouseCounterpartie,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: WarehouseCounterpartiesKey,
            })
        }
    })
}

export const useDeleteWarehouseCounterpartie = () => {

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:deleteWarehouseCounterpartie,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: WarehouseCounterpartiesKey,
            })
        }
    })


}

export const useUpdateWarehouseCounterpartie = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateWarehouseCounterpartie,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: WarehouseCounterpartiesKey,
            })
        }
    })



}