import {DatePicker, Divider, Form, type FormInstance, Input, message, Select} from "antd";
import type {Division} from "../../types/divisions.ts";
import type {ContractPosition} from "../../types/contractPositions.ts";
import type {Employee} from "../../types/employee.ts";
import type {Position} from "../../api/ppePositions.api.ts";
import {createEmployee} from "../../api/employees.api.ts";

interface EmployeesForm {
    form: FormInstance,
    onSuccess?: () => void,
    allDivisions: Division[],
    allContractPositions: ContractPosition[],
    allPpePositions: Position[]
}


export const EmployeesForm = ({form, onSuccess, allDivisions, allContractPositions, allPpePositions}: EmployeesForm) => {
   const handleSubmit = async (values: Employee) => {
       try {
          await createEmployee(values);
           message.success('Сотрудник добавлен')
           onSuccess?.()
       } catch (error) {
           message.error(error instanceof Error ? error.message : 'Не удалось добавить сотрудника');
       }
   }

   return (
       <Form form={form} onFinish={handleSubmit}>
           <Form.Item  name='fullName' label='ФИО' rules={[{required: true, message: 'Введите ФИО сотрудника'}]}>
               <Input placeholder='Заполните ФИО'/>
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
           <Form.Item  name='personnelNumber' label='Табельный номер:' rules={[{required: true, message: 'Заполните табельный номер'}]}>
               <Input placeholder='Заполните табельный номер'/>
           </Form.Item>
           <Form.Item name='date_of_employment' label='Дата приема на работу' rules={[{required: true, message: 'Заполните дату приема на работу'}]}>
               <DatePicker
                   className="w-full"
                   placeholder="Выберите дату"
                   format="DD.MM.YYYY"
               />
           </Form.Item>
           <Divider/>
           <Form.Item name='positionRelation' label='Должность по СИЗ' rules={[{required: false}]}>
               <Select
                    placeholder='Выберите должность по СИЗ'
                    options={allPpePositions.map((item) => ({
                        label: item.name,
                        value: item.id
                    }))}
               />
           </Form.Item>
           <Form.Item name='shoeSize' label='Размер обуви:' rules={[{required: false}]}>
               <Input/>
           </Form.Item>
           <Form.Item name='clothingSize' label='Размер одежды:' rules={[{required: false}]}>
               <Input/>
           </Form.Item>
           <Form.Item name='height' label='Рост:' rules={[{required: false}]}>
               <Input/>
           </Form.Item>
           <Form.Item name='comment' label='Комментарий:' rules={[{required: false}]}>
               <Input.TextArea placeholder='Необязательное поле'/>
           </Form.Item>
       </Form>
   )
}