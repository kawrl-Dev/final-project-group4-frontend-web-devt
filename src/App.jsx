import { Link } from "react-router";

export default function App() {
  return (
    <>
      <h1 className="text-green-600 text-3xl text-center">placeholder here</h1>
      <div className="flex justify-center items-center h-screen">
        <Link to="/leaderboard" className="block w-md rounded border border-green-700 px-4 py-2.5 text-center hover:bg-green-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400">Leaderboard</Link>
      </div>
    </>
  );
}