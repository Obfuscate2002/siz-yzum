import {Form, type FormInstance, Input, message, Select} from "antd";
import {pb} from "../../pocketbase/pocketbase.ts";
import type {Division} from "../../types/divisions.ts";
import type {ContractPosition} from "../../types/contractPositions.ts";

interface EmployeesForm {
    form: FormInstance,
    onSuccess?: () => void,
    allDivisions: Division[],
    allContractPositions: ContractPosition[],
}

type DataProps = {
    fullName: string,
    position: string,
    unit: string,
    createdAt: string,
    personnelNumber: string,
}

export const EmployeesForm = ({form, onSuccess, allDivisions, allContractPositions}: EmployeesForm) => {
   const handleSubmit = async (values: DataProps) => {
       try {
           await pb.collection('employees').create({
               fullName: values.fullName,
               position: values.position,
               unit: values.unit,
               personnelNumber: values.personnelNumber,
           })
           message.success("Сотрудник добавлен")
           onSuccess?.()
       } catch (error) {
           message.error(error instanceof Error ? error.message : 'Не удалось добавить сотрудника');
       }
   }

   return (
       <Form form={form} onFinish={handleSubmit}>
           <Form.Item name='fullName' label='ФИО' rules={[{required: true, message: 'Введите ФИО сотрудника'}]}>
               <Input/>
           </Form.Item>
           <Form.Item name='contractPosition' label='Должность по трудовому договору' rules={[{required: true, message: 'Заполните поле'}]}>
               <Select
                    placeholder='Выберите должность'
                    options={allContractPositions.map((item) => ({
                        label: item.name,
                        value: item.id
                    }))}
               />
           </Form.Item>
           <Form.Item name='division' label='Подразделение' rules={[{required: true, message: 'Заполните поле'}]}>
               <Select
                   placeholder='Выберите подразделение'
                   options={allDivisions.map((item) => ({
                       label: item.name,
                       value: item.id,
                   }))}

               />
           </Form.Item>
           <Form.Item name='personnelNumber' label='Табельный номер:' rules={[{required: true, message: 'Заполните табельный номер'}]}>
               <Input/>
           </Form.Item>
           <Form.Item name='comment' label='Комментарий:' rules={[{required: false}]}>
               <Input.TextArea/>
           </Form.Item>
       </Form>
   )
}