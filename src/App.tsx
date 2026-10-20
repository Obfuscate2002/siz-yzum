import './App.css'
import {Route, Routes} from "react-router";
import AppLayout from "./components/layout/AppLayout.tsx";
import {PageEmployees} from "./pages/PageEmployees.tsx";
import {PageNormsCatalog} from "./pages/PageNormsCatalog.tsx";
import { PagePpes } from './pages/PagePpes.tsx';
import {PageDashboard} from "./pages/PageDashboard.tsx";
import {PageIssuanceNorms} from "./pages/PageIssuanceNorms.tsx";
import { PageSettings } from './pages/PageSettings.tsx';
import {PagePpeIssuanceStandards} from "./pages/PagePpeIssuanceStandards.tsx";


function App() {

  return (
    <>
        <Routes>
            <Route path="/" element={<AppLayout />} >
                <Route path={'dashboard'} element={<PageDashboard/>}/>
                <Route path={'employees'} element={<PageEmployees/>}/>
                <Route path={'norms_catalog'} element={<PageNormsCatalog/>}/>
                <Route path={'issuance_norms'} element={<PageIssuanceNorms/>}/>
                <Route path={'ppe'} element={<PagePpes/>}/>
                <Route path={'ppeIssuanceStandards'} element={<PagePpeIssuanceStandards/>}/>
                <Route path={'settings'} element={<PageSettings/>}/>
            </Route>
        </Routes>

    </>
  )
}

export default App
