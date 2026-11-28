import './PageWarehouseСounterparties.scss'
import {Button, Divider, Drawer, Form, Input, message, Modal, Table, Typography} from "antd";
import {IdcardTwoTone} from "@ant-design/icons";
import {
    useCreateWarehouseCounterparty, useDeleteWarehouseCounterpartie, useUpdateWarehouseCounterpartie,
    useWarehouseCounterparties
} from "../../hooks/useWarehouseСounterparties.tsx";
import {useState} from "react";
import type {WarehouseСounterpartie} from "../../types/WarehouseСounterpartie.ts";
import dayjs from "dayjs";
import Text from "antd/es/typography/Text";
import type {CreateWarehouseCounterparties} from "../../api/warehouseCounterparties.api.ts";

export const PageWarehouseСounterparties = () => {

    const [isOpenModal, setIsOpenModal] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const [selectedWarehouseCounterpartieId, setSelectedWarehouseCounterpartiesId] = useState<string | null>(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const {
        data: dataWarehouseCounterparties = [],
        isError,
        error,
        isPending
    } = useWarehouseCounterparties()

    const createMutation = useCreateWarehouseCounterparty()

    const deleteMutation = useDeleteWarehouseCounterpartie()

    const updateMutation = useUpdateWarehouseCounterpartie()

    const handleIsOpenModal = () => {
        setIsOpenModal(true);
    }

    const handleCancelModal = () => {
        setIsOpenModal(false);
        createForm.resetFields();
    }

    const handleCloseDrawer = () => {
        setSelectedWarehouseCounterpartiesId(null);
        setIsEditing(false);
    }

    const handleAddWarhouseCounterpartie = async () => {
        try {
            const values: CreateWarehouseCounterparties = await createForm.validateFields()
            await createMutation.mutateAsync(values)
            message.success(`Контрагент ${values.name} создан`)
            createForm.resetFields();
            setIsOpenModal(false);
        } catch (error) {
            message.error("Ошибка создания контрагента")
        }
    }

    const handleDeleteWarehouseCounterpartie = async () => {
        if(!selectedWarehouseCounterpartie) return;
        try {
            await deleteMutation.mutateAsync(selectedWarehouseCounterpartie?.id);
            message.success(`Контрагент удалён`);
            setIsDeleteModalOpen(false);
            handleCloseDrawer();
        } catch (error) {
            message.error("Ошибка удаления контрагента")
        }
    }

    const handleStartEditing = () => {
        if(!selectedWarehouseCounterpartie) return;

        editForm.setFieldsValue({
            name: selectedWarehouseCounterpartie?.name,
            inn: selectedWarehouseCounterpartie?.inn,
            kpp: selectedWarehouseCounterpartie?.kpp,
        })
        setIsEditing(true);
    }

    const handleSave = async (values: WarehouseСounterpartie) => {
        console.log(values)
        if(!selectedWarehouseCounterpartie) return;
        try {
            await updateMutation.mutateAsync({
                id: selectedWarehouseCounterpartie?.id,
                name: values.name,
                kpp: values.kpp,
                inn: values.inn,
            })
            message.success(`Контрагент ${values.name} обновлен`)
            setIsEditing(false);
        } catch (error) {
            message.error("Ошибка сохранения данных")
        }

    }

    const columns = [
        {
            title: 'Наименование',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'ИНН',
            dataIndex: 'inn',
            key: 'inn',
        },
        {
            title: 'КПП',
            dataIndex: 'kpp',
            key: 'kpp',
        },
    ];

    const selectedWarehouseCounterpartie = dataWarehouseCounterparties.find(item => item.id === selectedWarehouseCounterpartieId);

    if(isPending) return <div>Загрузка...</div>

    if(isError) return <div>Ошибка загрузки: {error.message}</div>

    return (
        <div className={'flex flex-col'}>
            <div className={'flex flex-row justify-between items-center pr-3'}>
                <Typography.Title level={1}><IdcardTwoTone /> Справочник контрагентов</Typography.Title>
                <Button color={'blue'} variant={'solid'} onClick={handleIsOpenModal}>Добавить контрагента</Button>
            </div>

            <Modal
                open={isOpenModal}
                cancelText={'Отмена'}
                onCancel={handleCancelModal}
                okText="Добавить контрагента"
                onOk={handleAddWarhouseCounterpartie}
                title={"Добавление контрагента"}
                confirmLoading={createMutation.isPending}
            >
             <Form form={createForm}>
                 <Form.Item name={'name'} label="Наименование" rules={[{ required: true, message: 'Заполните наименование' }]} >
                     <Input placeholder={'Наименование'}/>
                 </Form.Item>
                 <Form.Item name={'inn'} label="ИНН" rules={[{ required: true, message: 'Заполните ИНН' }]}>
                     <Input placeholder={'ИНН'}/>
                 </Form.Item>
                 <Form.Item name={'kpp'} label="КПП" rules={[{ required: true, message: 'Заполните КПП' }]}>
                     <Input placeholder={'КПП'}/>
                 </Form.Item>
             </Form>
            </Modal>

            <Drawer
                open={selectedWarehouseCounterpartieId !== null}
                onClose={() => handleCloseDrawer()}
                title={`Карточка ${selectedWarehouseCounterpartie?.name}`}
                width={800}
            >
                <div className={'flex flex-col gap-3 text-xl'}>
                    <div className={'flex justify-between items-center'}>
                        <span className={'text-4xl'}><strong>Общая информация</strong></span>
                        <Text type={'secondary'} className={'text-lg'}>Дата изменения: {dayjs(selectedWarehouseCounterpartie?.updated).format('DD.MM.YYYY HH:mm:ss')}</Text>
                    </div>

                    <Divider />
                    {isEditing === true ? (
                        <div>
                            <Form form={editForm} className={'counterparty-form'} onFinish={handleSave}>
                                <Form.Item name={'name'} label={'Наименование:'} >
                                    <Input placeholder={'Наименование'} size={'large'}/>
                                </Form.Item>
                                <Form.Item name={'inn'} label={'ИНН:'}>
                                    <Input placeholder={'ИНН'} size={'large'}/>
                                </Form.Item>
                                <Form.Item name={'kpp'} label={'КПП:'}>
                                    <Input placeholder={'КПП'} size={'large'}/>
                                </Form.Item>
                                <Divider />
                                <div className={'flex flex-row gap-3 justify-end'}>
                                    <Button htmlType={'submit'} color={'blue'} variant={'outlined'} >Сохранить</Button>
                                    <Button onClick={() => setIsEditing(false)} color={'red'} variant={'outlined'}>Отмена</Button>
                                </div>
                            </Form>
                        </div>
                    ) : (
                        <div className={'flex flex-col gap-4 '}>
                            <span><strong>Наименование:</strong> {selectedWarehouseCounterpartie?.name}</span>
                            <span><strong>ИНН:</strong> {selectedWarehouseCounterpartie?.inn}</span>
                            <span><strong>КПП:</strong> {selectedWarehouseCounterpartie?.kpp}</span>
                            <div className={'flex flex-row gap-3 justify-end'}>
                                <Button onClick={handleStartEditing} color={'blue'} variant={'outlined'} >Редактировать контрагента</Button>
                                <Button onClick={() => setIsDeleteModalOpen(true)} color={'red'} variant={'outlined'}>Удалить контрагента</Button>
                            </div>
                        </div>

                    )}
                        <Modal
                            title="Удалить контрагента из базы?"
                            okText="Удалить"
                            okButtonProps={{danger: true}}
                            onOk={handleDeleteWarehouseCounterpartie}
                            cancelText="Отмена"
                            onCancel={() => setIsDeleteModalOpen(false)}
                            open={isDeleteModalOpen}
                            confirmLoading={deleteMutation.isPending}
                        >
                            {selectedWarehouseCounterpartie?.name}
                        </Modal>
                    </div>

            </Drawer>

            <Table
                rowKey={'id'}
                columns={columns}
                dataSource={dataWarehouseCounterparties}
                onRow={(record: WarehouseСounterpartie) => ({
                    onClick: () => setSelectedWarehouseCounterpartiesId(record.id),
                    style: {cursor: 'pointer'}
                })}
            />
        </div>
    )
}