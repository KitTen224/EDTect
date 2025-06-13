import { Routes, Route } from 'react-router-dom';
import SuggestionTest from './page/suggestionTest';

export default function App() {
  return(
    <Routes>
      <Route path="/test" element={<SuggestionTest/>}/>
    </Routes>
  )
}