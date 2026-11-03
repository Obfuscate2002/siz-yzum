
export interface Employee {
    id: string;
    fullName: string;
    position: string;
    unit: string;
    personnelNumber: string;
    comment: string;

    departmentRef: string;
    positionRelation: string;
    contractPosition: string;

    height: number;
    clothingSize: string;
    shoeSize: string;
    isActive: boolean;

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