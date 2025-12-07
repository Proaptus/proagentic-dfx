'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getDesignCompliance, getDesignTestPlan } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DesignCompliance {
  design_id: string;
  overall_status: 'pass' | 'fail';
  standards: Array<{
    standard_id: string;
    standard_name: string;
    status: 'pass' | 'fail';
    clauses: Array<{
      clause: string;
      description: string;
      status: 'pass' | 'fail' | 'warning';
      actual_value: string;
      required_value: string;
    }>;
  }>;
}

interface TestPlan {
  design_id: string;
  tests: Array<{
    test: string;
    articles: number;
    duration: string;
    parameters: string;
  }>;
  total_articles: string;
  total_duration: string;
  estimated_cost: string;
}

export function ComplianceScreen() {
  const { currentDesign, setCurrentDesign } = useAppStore();

  const [compliance, setCompliance] = useState<DesignCompliance | null>(null);
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [loading, setLoading] = useState(false);

  // Default to design C if none selected
  useEffect(() => {
    if (!currentDesign) {
      setCurrentDesign('C');
    }
  }, [currentDesign, setCurrentDesign]);

  useEffect(() => {
    if (!currentDesign) return;

    setLoading(true);
    Promise.all([
      getDesignCompliance(currentDesign),
      getDesignTestPlan(currentDesign),
    ])
      .then(([comp, test]) => {
        setCompliance(comp as DesignCompliance);
        setTestPlan(test as TestPlan);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentDesign]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Loading compliance data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Standards Compliance</h2>
          <p className="text-gray-600 mt-1">
            Design {currentDesign} compliance with hydrogen tank standards
          </p>
        </div>
        {compliance && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              compliance.overall_status === 'pass'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {compliance.overall_status === 'pass' ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
            <span className="font-medium">Overall: {compliance.overall_status.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Standards */}
      {compliance && (
        <div className="space-y-4">
          {compliance.standards.map((standard) => (
            <Card key={standard.standard_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{standard.standard_id.replace(/_/g, ' ')}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{standard.standard_name}</p>
                  </div>
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      standard.status === 'pass'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {standard.status === 'pass' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {standard.status.toUpperCase()}
                  </span>
                </div>
              </CardHeader>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-700">Clause</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Requirement</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700">Required</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700">Actual</th>
                    <th className="text-center py-2 pl-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {standard.clauses.map((clause) => (
                    <tr key={clause.clause} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-mono text-gray-600">{clause.clause}</td>
                      <td className="py-2 px-4 text-gray-700">{clause.description}</td>
                      <td className="py-2 px-4 text-center text-gray-600">{clause.required_value}</td>
                      <td className="py-2 px-4 text-center font-medium">{clause.actual_value}</td>
                      <td className="py-2 pl-4 text-center">
                        {clause.status === 'pass' ? (
                          <CheckCircle className="inline text-green-500" size={18} />
                        ) : clause.status === 'warning' ? (
                          <AlertTriangle className="inline text-yellow-500" size={18} />
                        ) : (
                          <XCircle className="inline text-red-500" size={18} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}
        </div>
      )}

      {/* Test Plan */}
      {testPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Qualification Test Plan</CardTitle>
          </CardHeader>

          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-medium text-gray-700">Test</th>
                <th className="text-center py-2 px-4 font-medium text-gray-700">Articles</th>
                <th className="text-center py-2 px-4 font-medium text-gray-700">Duration</th>
                <th className="text-left py-2 pl-4 font-medium text-gray-700">Parameters</th>
              </tr>
            </thead>
            <tbody>
              {testPlan.tests.map((test) => (
                <tr key={test.test} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium text-gray-900">{test.test}</td>
                  <td className="py-2 px-4 text-center">{test.articles}</td>
                  <td className="py-2 px-4 text-center">{test.duration}</td>
                  <td className="py-2 pl-4 text-gray-600">{test.parameters}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-500">Total Articles</div>
              <div className="text-lg font-semibold">{testPlan.total_articles}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Duration</div>
              <div className="text-lg font-semibold">{testPlan.total_duration}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Estimated Cost</div>
              <div className="text-lg font-semibold">{testPlan.estimated_cost}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
