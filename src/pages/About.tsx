export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">About the AI Agent Directory</h1>
      
      <div className="bg-zinc-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">What is this directory?</h2>
        <p className="text-gray-300 mb-4">
          The AI Agent Directory is the #1 open source resource for discovering and integrating AI agents 
          and MCP (Model Context Protocol) servers into your coding projects. Our platform makes it easy to 
          find, learn about, and implement the latest AI agent technologies.
        </p>
        <p className="text-gray-300">
          All agents listed in this directory are open source, allowing you to freely access, modify, and 
          integrate them into your own projects.
        </p>
      </div>
      
      <div className="bg-zinc-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">How to use this directory</h2>
        <ol className="list-decimal list-inside text-gray-300 space-y-2">
          <li>Browse the directory to find agents that interest you</li>
          <li>Use the search and filter features to narrow down your options</li>
          <li>Click on an agent to view more details</li>
          <li>Use the integration buttons to open the agent in your preferred application</li>
          <li>Contribute by adding your own projects to the directory</li>
        </ol>
      </div>
      
      <div className="bg-zinc-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-white">About the project</h2>
        <p className="text-gray-300 mb-4">
          This directory is maintained as an open source project. It aims to bring together the best AI agent 
          technologies to foster innovation and collaboration in the AI community.
        </p>
        <p className="text-gray-300">
          If you'd like to contribute to this project or have suggestions for improvement, please visit our 
          GitHub repository.
        </p>
      </div>
    </div>
  );
}
