import {Form, type FormInstance, Input, message} from "antd";
import {addDoc, collection} from "firebase/firestore"
import {db} from "../../firebase/config.ts";

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
       console.log('Данные из формы:', values);
       try {
          const data = await addDoc(collection(db, 'employees'), {
               fullName: values.fullName,
               position: values.position,
               unit: values.unit,
               createdAt: new Date().toISOString(),
               personnelNumber: values.personnelNumber,
           })
           message.success("Сотрудник добавлен")
           console.log(data.id)

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