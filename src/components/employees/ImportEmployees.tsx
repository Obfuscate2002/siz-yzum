import { useState } from 'react';
import { Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { pb } from '../../pocketbase/pocketbase.ts';

export const ImportEmployees = ({ onSuccess }: { onSuccess?: () => void }) => {
    const [loading, setLoading] = useState(false);

    const handleFile = (file: File) => {
        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                // 1. Читаем CSV/Excel
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);

                if (rows.length === 0) {
                    message.warning('Файл пуст');
                    return;
                }

                // 2. Импортируем
                let success = 0;
                let errors = 0;

                for (const row of rows as any[]) {
                    try {
                        await pb.collection('employees').create({
                            fullName: row['fullName'] || '',
                            unit: row['unit'] || '',
                            personnelNumber: String(row['personnelNumber'] || ''),
                            position: row['position'] || '',
                            comment: row['comment'] || '',
                        });
                        success++;
                    } catch (err) {
                        errors++;
                        console.error('Ошибка в строке:', row, err);
                    }
                }

                message.success(
                    `Импортировано: ${success}` +
                    (errors > 0 ? `, ошибок: ${errors}` : '')
                );
                onSuccess?.();




            } catch (err) {
                console.error(err);
                message.error('Ошибка чтения файла');
            } finally {
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(file);
        return false;
    };

    return (
        <Upload
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={handleFile}
        >
            <Button icon={<UploadOutlined />} loading={loading}>
                Импорт из Excel
            </Button>
        </Upload>
    );
};