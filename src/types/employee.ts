
export interface Employee {
    id: string;
    fullName: string;
    position: string;
    unit: string;
    personnelNumber: string;
    comment: string;

    division:string;

    departmentRef: string;
    positionRelation: string;
    contractPosition: string;

    height: string;
    clothingSize: string;
    shoeSize: string;
    isActive: boolean;

    date_of_employment: string;

    created: string;
    updated: string;
    expand?: {
        positionRelation?: {
            id: string
            name: string
        },
        contractPosition?: {
            id: string
            name: string
        },
        division?: {
            id: string
            name: string
        }
    }
}