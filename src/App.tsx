import './App.css'
import {Route, Routes} from "react-router";
import AppLayout from "./components/layout/AppLayout.tsx";
import {PageEmployees} from "./pages/PageEmployees.tsx";
import {PagePpeItems} from "./pages/PagePpeItems.tsx";
import { PageNorms } from './pages/PageNorms.tsx';
import {PageDashboard} from "./pages/PageDashboard.tsx";


function App() {

  return (
    <>
        <Routes>
            <Route path="/" element={<AppLayout />} >
                <Route path={'dashboard'} element={<PageDashboard/>}/>
                <Route path={'employees'} element={<PageEmployees/>}/>
                <Route path={'ppe'} element={<PagePpeItems/>}/>
                <Route path={'norms'} element={<PageNorms/>}/>
            </Route>
        </Routes>

    </>
  )
}

export default App
