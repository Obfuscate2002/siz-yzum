import {Form, type FormInstance, Input, message} from "antd";
import {pb} from "../../pocketbase/pocketbase.ts";

interface Props {
    form: FormInstance,
    onSuccess?: () => void,
}

type DataProps = {
    fullName: string,
    position: string,
    unit: string,
    createdAt: string,
    personnelNumber: string,
}

export const EmployeesForm = ({form, onSuccess}: Props) => {
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
           <Form.Item name='position' label='Должность' rules={[{required: false}]}>
               <Input/>
           </Form.Item>
           <Form.Item name='unit' label='Подразделение' rules={[{required: false}]}>
               <Input/>
           </Form.Item>
           <Form.Item initialValue='11556-123' name='personnelNumber' label='Таб №.' rules={[{required: false}]}>
               <Input/>
           </Form.Item>
       </Form>
   )
}