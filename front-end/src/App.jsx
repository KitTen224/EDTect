import { Routes, Route } from 'react-router-dom';
import Sample from "./page/sample";

export default function App() {
  return(
    <Routes>
      <Route path="/sample" element={<Sample/>}/>
    </Routes>
  )
}