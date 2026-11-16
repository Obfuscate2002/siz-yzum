import {Drawer} from "antd";

import type {WarehouseReceipt} from "../../types/WarehouseReceipt.ts";
import {WarehouseReceiptDetails} from "./ WarehouseReceiptDetails.tsx";
import type {WarehouseReceiptItem} from "../../types/WarehouseReceiptItem.ts";


interface WarehouseReceiptDrawerProps {
    receipt: WarehouseReceipt | null;
    onClose: () => void;
    open: boolean;
    items?: WarehouseReceiptItem[];
    loading: boolean;
}

export const WarehouseReceiptDrawer = ({receipt, onClose, open, items, loading}: WarehouseReceiptDrawerProps) => {

    return (
        <Drawer
            title="Приходная накладная"
            open={open}
            onClose={onClose}
            width="85%"
            placement="right"
            destroyOnHidden
        >
            {receipt && (<WarehouseReceiptDetails
                receipt={receipt}
                items={items}
                loading={loading}
            />)}
        </Drawer>
    )
}