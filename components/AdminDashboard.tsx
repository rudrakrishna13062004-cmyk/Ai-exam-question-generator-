import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { ref, query, limitToLast, onValue, orderByChild } from 'firebase/database';
import { ActivityLog } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

const AdminDashboard: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const globalActivityRef = query(ref(db, 'global_activity'), limitToLast(50));
        
        const unsubscribe = onValue(globalActivityRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const logList: ActivityLog[] = Object.values(data);
                // Sort by timestamp descending
                logList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setLogs(logList);
            } else {
                setLogs([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
                        <p className="text-slate-500 dark:text-slate-400">Real-time platform activity monitoring</p>
                    </div>
                    <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 px-4 py-2 rounded-full text-sm font-medium">
                        Status: Live
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                        <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Total Activities Recorded</h3>
                        <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mt-1">{logs.length}</p>
                    </div>
                    {/* Placeholder stats */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">System Status</h3>
                        <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">Healthy</p>
                    </div>
                     <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30">
                        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Active Database</h3>
                        <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">Connected</p>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Global Activity</h3>
                
                {loading ? (
                    <div className="flex justify-center py-12">
                        <SpinnerIcon className="h-8 w-8 text-sky-500"/>
                    </div>
                ) : logs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Time</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">User</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Action</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(log.timestamp).toLocaleTimeString()} <span className="text-xs">{new Date(log.timestamp).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{log.userEmail?.split('@')[0] || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{log.userEmail || 'Unknown'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                (log.action || '').includes('GENERATE')
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                            }`}>
                                                {(log.action || 'Unknown').replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                                            {log.details || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        No activity recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;