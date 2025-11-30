import React from 'react';
import ToolIcon from './icons/ToolIcon';

interface PlaceholderToolProps {
  toolName: string;
}

const PlaceholderTool: React.FC<PlaceholderToolProps> = ({ toolName }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full min-h-[calc(100vh-300px)] bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 border-2 border-dashed border-slate-300 dark:border-slate-700">
      <ToolIcon className="h-16 w-16 text-slate-400 dark:text-slate-500" />
      <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
        {toolName}
      </h2>
      <p className="mt-2 text-md text-slate-500 dark:text-slate-400">
        This is a placeholder for your custom tool.
      </p>
      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
        You can now build out the functionality for this tool.
      </p>
    </div>
  );
};

export default PlaceholderTool;
