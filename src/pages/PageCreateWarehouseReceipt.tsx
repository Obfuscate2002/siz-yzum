
import { useState } from "react";
import {Button, Divider, Form, message, Typography} from "antd";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import {
    WarehouseReceiptDetailsForm,
    type WarehouseReceiptDetailsValues,
} from "../components/warehouseReceipt/WarehouseReceiptDetailsForm";

import {
    WarehouseReceiptItemsTable,
    type ReceiptItem,
} from "../components/warehouseReceipt/WarehouseReceiptItemsTable";

import { createWarehouseReceipt } from "../api/warehouseReceipts.api";
import { warehouseReceiptsKey } from "../hooks/useWarehouseReceipts";
import {FileAddTwoTone} from "@ant-design/icons";
import {warehouseReceiptItemsKey} from "../hooks/useWarehouseReceiptItems.tsx";

export const PageCreateWarehouseReceipt = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [form] = Form.useForm<WarehouseReceiptDetailsValues>();

    const [items, setItems] = useState<ReceiptItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        try {
            // Проверяем реквизиты накладной
            const values = await form.validateFields();

            // Проверяем наличие товаров
            if (items.length === 0) {
                message.warning("Добавьте хотя бы одну товарную позицию");
                return;
            }

            // Проверяем заполнение товарных строк
            const hasEmptyItems = items.some(
                item =>
                    !item.name.trim() ||
                    !item.code.trim() ||
                    !item.unit.trim()
            );

            if (hasEmptyItems) {
                message.warning(
                    "Заполните наименование, код и единицу измерения товаров"
                );
                return;
            }

            // Проверяем количество
            const hasInvalidQuantity = items.some(
                item => item.quantity <= 0
            );

            if (hasInvalidQuantity) {
                message.warning("Количество товара должно быть больше нуля");
                return;
            }

            setIsSaving(true);

            // Сохраняем накладную и её товары
            await createWarehouseReceipt(values, items);

            // Обновляем кэш списка накладных
            await queryClient.invalidateQueries({
                queryKey: warehouseReceiptsKey,
            });

            await queryClient.invalidateQueries({
                queryKey: warehouseReceiptItemsKey,
            })

            message.success("Приходная накладная успешно создана");

            navigate("/warehouse/goodsReceiptNotes/");

        } catch (error) {
            console.error("Ошибка сохранения накладной:", error);

            message.error(
                error instanceof Error
                    ? error.message
                    : "Не удалось сохранить приходную накладную"
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <Typography.Title level={1}><FileAddTwoTone /> Добавление приходной накладной</Typography.Title>
            <WarehouseReceiptDetailsForm form={form} />
            <WarehouseReceiptItemsTable
                dataSource={items}
                onChange={setItems}
            />
            <Divider/>

            <div className="flex justify-end gap-3">
                <Button
                    disabled={isSaving}
                    onClick={() => navigate("/warehouse/goodsReceiptNotes/")}
                >
                    Отмена
                </Button>

                <Button
                    type="primary"
                    loading={isSaving}
                    onClick={handleSave}
                >
                    Сохранить и добавить
                </Button>
            </div>

        </div>
    );
};
