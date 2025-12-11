'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { FlaskConical, DollarSign, Clock, Package } from 'lucide-react';

export interface TestType {
  id: string;
  name: string;
  standard: string;
  articles: number;
  cycles?: number;
  pressure_range?: string;
  temp_range?: string;
  duration_days: number;
  cost_eur: number;
  critical: boolean;
}

interface TestPlanPanelProps {
  testPlan?: TestType[];
}

export function TestPlanPanel({ testPlan = [] }: TestPlanPanelProps) {
  const totalArticles = testPlan.reduce((sum, test) => sum + test.articles, 0);
  const totalCost = testPlan.reduce((sum, test) => sum + test.cost_eur, 0);
  const maxDuration = testPlan.length > 0 ? Math.max(...testPlan.map((t) => t.duration_days)) : 0;
  const criticalTests = testPlan.filter((t) => t.critical).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical size={20} className="text-purple-600" />
          Certification Test Plan
        </CardTitle>
      </CardHeader>
      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <FlaskConical size={18} />
              <span className="text-sm font-medium">Total Tests</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{testPlan.length}</div>
            <div className="text-xs text-purple-700 mt-1">{criticalTests} critical</div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Package size={18} />
              <span className="text-sm font-medium">Test Articles</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{totalArticles}</div>
            <div className="text-xs text-blue-700 mt-1">Tanks required</div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Clock size={18} />
              <span className="text-sm font-medium">Timeline</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{maxDuration}</div>
            <div className="text-xs text-green-700 mt-1">Days (longest test)</div>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <DollarSign size={18} />
              <span className="text-sm font-medium">Estimated Cost</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              €{(totalCost / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-orange-700 mt-1">Testing only</div>
          </div>
        </div>

        {/* Test Plan Table */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Detailed Test Requirements</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Test Type</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Standard</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">Articles</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Parameters</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Duration</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Cost (€)</th>
                </tr>
              </thead>
              <tbody>
                {testPlan.map((test) => (
                  <tr
                    key={test.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      test.critical ? 'bg-orange-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={test.critical ? 'font-medium' : ''}>{test.name}</span>
                        {test.critical && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{test.standard}</td>
                    <td className="px-4 py-3 text-center font-medium">{test.articles}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="space-y-0.5 text-gray-600">
                        {test.pressure_range && <div>P: {test.pressure_range}</div>}
                        {test.temp_range && <div>T: {test.temp_range}</div>}
                        {test.cycles && <div>Cycles: {test.cycles.toLocaleString()}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {test.duration_days} days
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      €{test.cost_eur.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-medium">
                  <td colSpan={2} className="px-4 py-3 text-gray-900">
                    Total
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">{totalArticles}</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    ~{maxDuration} days
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    €{totalCost.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>
              Accelerated stress rupture test (1000 days) can run in parallel with certification
              activities
            </li>
            <li>
              Test articles should be manufactured from same production batch for consistency
            </li>
            <li>
              Costs include testing only - add €{((totalArticles * 3500) / 1000).toFixed(0)}k for
              test article manufacturing
            </li>
            <li>Timeline assumes sequential testing - some tests can be parallelized</li>
            <li>Ballistic impact test may be waived depending on application risk assessment</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
