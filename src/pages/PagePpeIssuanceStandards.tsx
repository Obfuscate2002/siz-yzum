import {PositionsTable} from "../components/positions/PositionsTable.tsx";

import { pb } from "../pocketbase/pocketbase.ts";
import ImportPpeStandardsButton from "../components/positions/ImportPpeIssuanceStandard.tsx";


export const PagePpeIssuanceStandards = () => {

    return (
        <>
            {/*<PpeIssuanceStandardsTable/>*/}
            <ImportPpeStandardsButton pb={pb}/>

            <PositionsTable />
        </>
    )
}