import { Link } from "react-router-dom";

export default function TopMenu() {
  return (
    <nav className="bg-zinc-900 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-white font-bold text-xl">AI Agent Directory</Link>
        <div className="space-x-4">
          <Link to="/" className="text-white hover:text-gray-300">Home</Link>
          <Link to="/about" className="text-white hover:text-gray-300">About</Link>
        </div>
      </div>
    </nav>
  );
}
