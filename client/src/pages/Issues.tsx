import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { IssueMap } from '../components/IssueMap';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  municipality: string;
  upvoteCount: number;
  location: { lat: number; lng: number };
}

export function Issues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/issues')
      .then((res) => setIssues(res.data.issues))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-8 text-slate-600">Loading issues...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Reported Issues</h1>
      <IssueMap issues={issues} />
      {issues.length === 0 && <p className="text-slate-500">No issues reported yet.</p>}

      {issues.map((issue) => (
        <div key={issue._id} className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex justify-between items-start">
            <h2 className="font-medium text-slate-800">{issue.title}</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
              {issue.status}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
          <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
            <span>
              {issue.municipality} · {issue.category}
            </span>
            <span>👍 {issue.upvoteCount}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
