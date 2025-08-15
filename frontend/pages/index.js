import Link from 'next/link';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-8 px-6">
      <h1 className="text-4xl font-bold text-center text-indigo-600 mb-6">Welcome to SmartTodo!</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">SmartTodo is an AI-powered task management system that helps you prioritize tasks.</h2>
        
        <p className="text-lg text-gray-600 mb-6">
          With SmartTodo, you can easily manage your tasks and stay organized with AI-powered suggestions.
        </p>
        
        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/tasks">
                <span className="text-lg text-indigo-500 hover:underline">Tasks</span>
              </Link>
            </li>
            <li>
              <Link href="/context-input">
                <span className="text-lg text-indigo-500 hover:underline">Context Input</span>
              </Link>
            </li>
            <li>
              <Link href="/context-history">
                <span className="text-lg text-indigo-500 hover:underline">Context History</span>
              </Link>
            </li>
          </ul>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">© 2025 SmartTodo. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Home;
