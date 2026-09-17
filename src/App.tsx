import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import WeeklyPlanner from './pages/WeeklyPlanner'
import LogSession from './pages/LogSession'
import RaceSetup from './pages/RaceSetup'
import Settings from './pages/Settings'
import TrainingBlock from './pages/TrainingBlock'
import WorkoutLibrary from './pages/WorkoutLibrary'
import CompletedSession from './pages/CompletedSession'
import ConflictDetail from './pages/ConflictDetail'
import Prioritize from './pages/Prioritize'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<WeeklyPlanner />} />
        <Route path="log" element={<LogSession />} />
        <Route path="log/template" element={<LogSession templateMode />} />
        <Route path="race-setup" element={<RaceSetup />} />
        <Route path="settings" element={<Settings />} />
        <Route path="training-block" element={<TrainingBlock />} />
        <Route path="workout-library" element={<WorkoutLibrary />} />
        <Route path="session" element={<CompletedSession />} />
        <Route path="conflict" element={<ConflictDetail />} />
        <Route path="prioritize" element={<Prioritize />} />
      </Route>
    </Routes>
  )
}

export default App
