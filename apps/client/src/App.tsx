import { useEffect, useState } from 'react';
import ChessGame from './components/ChessGame';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [data, setData] = useState<{ message: string } | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col items-center justify-between p-4 overflow-hidden">
      <h1 className="text-3xl font-bold text-blue-600 shrink-0">AIChessApp</h1>

      {/* Board container takes remaining space */}
      <div className="flex-1 flex items-center justify-center w-full min-h-0 py-4">
        <ChessGame />
      </div>

      <div className="bg-white p-2 px-4 rounded-lg shadow shrink-0">
        <p className="text-sm text-gray-500">
          Backend Status: <span className="font-semibold text-gray-700">{data ? data.message : 'Connecting...'}</span>
        </p>
      </div>
    </div>
  );
}

export default App;
