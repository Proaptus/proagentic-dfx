/**
 * Test Requirements Panel for Compliance Screen
 * REQ-084 to REQ-089: Complete compliance verification system
 */

'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, Beaker, Download } from 'lucide-react';
import type { TestPlan } from './types';

interface TestRequirementsPanelProps {
  testPlan: TestPlan;
}

export function TestRequirementsPanel({ testPlan }: TestRequirementsPanelProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Beaker className="text-blue-600" size={24} />
                Qualification Test Plan
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2 max-w-2xl">
                Comprehensive testing protocol to verify design compliance with applicable standards.
                All tests must be completed before certification.
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium"
              aria-label="Export test plan"
            >
              <Download size={18} aria-hidden="true" />
              Export Test Plan
            </button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Test Name
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Articles Required
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Duration
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Test Parameters
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Standard Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {testPlan.tests.map((test) => (
                <tr
                  key={test.test}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    {test.test}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                      {test.articles}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-700 font-medium">
                    {test.duration}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {test.parameters}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1.5 rounded-md text-xs font-bold border border-green-200">
                      ISO 11119-3
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Test Articles</div>
            <div className="text-3xl font-bold text-blue-600">
              {testPlan.total_articles}
            </div>
            <div className="text-xs text-gray-500 mt-1">units required</div>
          </div>
          <div className="text-center border-x border-blue-300">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Duration</div>
            <div className="text-3xl font-bold text-indigo-600">
              {testPlan.total_duration}
            </div>
            <div className="text-xs text-gray-500 mt-1">estimated time</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">Estimated Cost</div>
            <div className="text-3xl font-bold text-purple-600">
              {testPlan.estimated_cost}
            </div>
            <div className="text-xs text-gray-500 mt-1">budget estimate</div>
          </div>
        </div>
      </Card>

      {/* Lab Recommendations */}
      {testPlan.recommended_labs && testPlan.recommended_labs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="text-green-600" size={24} />
              Recommended Test Laboratories
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Certified laboratories with expertise in hydrogen pressure vessel testing
            </p>
          </CardHeader>

          <div className="space-y-4">
            {testPlan.recommended_labs.map((lab) => (
              <div
                key={lab.name}
                className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-1">
                        <Beaker className="text-blue-600" size={20} aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{lab.name}</h4>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <span aria-label="Location">📍</span>
                          {lab.location}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                            <CheckCircle className="text-green-600" size={14} aria-hidden="true" />
                            <span className="text-xs font-semibold text-green-800">
                              {lab.accreditation}
                            </span>
                          </div>
                          <div className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                            <span className="text-xs font-semibold text-blue-800">
                              Lead Time: {lab.leadTime}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-3 italic bg-blue-50 px-3 py-2 rounded-lg border-l-4 border-blue-400">
                          {lab.specialization}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap">
                    Contact Lab
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
