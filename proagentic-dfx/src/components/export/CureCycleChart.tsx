'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { Thermometer } from 'lucide-react';

interface CureCycleStep {
  time_min: number;
  temperature_c: number;
  pressure_bar?: number;
  hold_duration_min?: number;
}

interface CureCycleChartProps {
  steps?: CureCycleStep[];
  title?: string;
}

export function CureCycleChart({ steps = [], title = 'Cure Cycle Profile' }: CureCycleChartProps) {
  const data = steps.map((step) => ({
    time: step.time_min,
    temperature: step.temperature_c,
    pressure: step.pressure_bar || 0,
  }));

  // Calculate key parameters from steps data
  const peakTemperature = steps.length > 0 ? Math.max(...steps.map(s => s.temperature_c)) : 0;
  const maxPressure = steps.length > 0 ? Math.max(...steps.map(s => s.pressure_bar || 0)) : 0;
  const totalTime = steps.length > 0 ? Math.max(...steps.map(s => s.time_min)) : 0;
  const totalHours = Math.floor(totalTime / 60);
  const totalMinutes = totalTime % 60;

  // Calculate hold periods (steps with hold_duration_min)
  const holdPeriods = steps.filter(s => s.hold_duration_min && s.hold_duration_min > 0);

  // Calculate cooldown rate (if there's a cooling phase)
  const coolingSteps = steps.slice().reverse();
  let cooldownRate = 0;
  if (coolingSteps.length >= 2) {
    const coolStart = coolingSteps.find(s => s.temperature_c === peakTemperature);
    const coolEnd = coolingSteps[coolingSteps.length - 1];
    if (coolStart && coolEnd && coolStart.time_min !== coolEnd.time_min) {
      cooldownRate = (coolStart.temperature_c - coolEnd.temperature_c) / (coolEnd.time_min - coolStart.time_min);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer size={20} className="text-orange-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <div className="p-4 space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              yAxisId="temp"
              label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="pressure"
              orientation="right"
              label={{ value: 'Pressure (bar)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip />
            <Legend />
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#f97316"
              fill="#fed7aa"
              name="Temperature (°C)"
            />
            <Line
              yAxisId="pressure"
              type="monotone"
              dataKey="pressure"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Pressure (bar)"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Key Parameters</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Temperature:</span>
                <span className="font-medium">{peakTemperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Pressure:</span>
                <span className="font-medium">{maxPressure} bar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cycle Time:</span>
                <span className="font-medium">{totalHours}h {totalMinutes.toString().padStart(2, '0')}m</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Hold Periods</h4>
            <div className="space-y-1">
              {holdPeriods.length > 0 ? (
                holdPeriods.map((step, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-600">{step.temperature_c}°C Hold:</span>
                    <span className="font-medium">{step.hold_duration_min} min</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-xs">No hold periods defined</div>
              )}
              {cooldownRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cooldown Rate:</span>
                  <span className="font-medium">{cooldownRate.toFixed(1)}°C/min</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
