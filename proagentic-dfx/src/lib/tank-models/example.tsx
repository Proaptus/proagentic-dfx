'use client';

/**
 * Tank Models Library - Usage Examples
 *
 * Demonstrates various use cases for the 3D tank modeling library.
 */

import { useState } from 'react';
import {
  TankModel3D,
  TankType,
  DomeProfileType,
  BossType,
  getTankTypeSpec,
  calculateTankMass,
  generateIsotensoidProfile,
  type TankModel3DProps,
} from './index';

/**
 * Example 1: Basic Type IV Tank with Standard Configuration
 */
export function BasicTankExample() {
  return (
    <div className="w-full h-[600px]">
      <TankModel3D
        tankType={TankType.TYPE_IV}
        domeProfile={DomeProfileType.ISOTENSOID}
        cylinderRadius={200}
        cylinderLength={800}
        bossConfig={{
          type: BossType.STANDARD_CYLINDRICAL,
          innerDiameter: 20,
          outerDiameter: 40,
          length: 60,
        }}
        autoRotate={true}
      />
    </div>
  );
}

/**
 * Example 2: Interactive Tank Type Comparison
 */
export function TankTypeComparison() {
  const [selectedType, setSelectedType] = useState<TankType>(TankType.TYPE_IV);
  const [showCrossSection, setShowCrossSection] = useState(false);

  const cylinderRadius = 200;
  const cylinderLength = 800;
  const domeDepth = cylinderRadius * 0.6;

  const spec = getTankTypeSpec(selectedType);
  const mass = calculateTankMass(selectedType, cylinderRadius, cylinderLength, domeDepth);

  return (
    <div className="flex gap-6">
      {/* Controls */}
      <div className="w-64 space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Tank Type</h3>
          {Object.values(TankType).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`block w-full text-left px-3 py-2 mb-1 rounded ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {getTankTypeSpec(type).name}
            </button>
          ))}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Options</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCrossSection}
              onChange={(e) => setShowCrossSection(e.target.checked)}
            />
            <span>Show Cross-Section</span>
          </label>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-2">Specifications</h4>
          <div className="text-sm space-y-1">
            <div>Mass: {mass.toFixed(2)} kg</div>
            <div>
              Pressure: {spec.typicalPressure.min}-{spec.typicalPressure.max} bar
            </div>
            <div>Weight Ratio: {spec.weightRatio.toFixed(2)}×</div>
            <div>Cost Ratio: {spec.costRatio.toFixed(2)}×</div>
            <div>Layers: {spec.materialLayers.length}</div>
          </div>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 h-[600px]">
        <TankModel3D
          tankType={selectedType}
          domeProfile={DomeProfileType.ISOTENSOID}
          cylinderRadius={cylinderRadius}
          cylinderLength={cylinderLength}
          showCrossSection={showCrossSection}
          layerOpacity={0.85}
        />
      </div>
    </div>
  );
}

/**
 * Example 3: Dome Profile Comparison
 */
export function DomeProfileComparison() {
  const [selectedProfile, setSelectedProfile] = useState<DomeProfileType>(
    DomeProfileType.ISOTENSOID
  );

  const profiles = [
    { type: DomeProfileType.HEMISPHERICAL, name: 'Hemispherical', desc: 'Perfect half-sphere' },
    { type: DomeProfileType.ISOTENSOID, name: 'Isotensoid', desc: 'Optimal for winding' },
    { type: DomeProfileType.ELLIPTICAL, name: 'Elliptical', desc: 'Adjustable aspect ratio' },
    { type: DomeProfileType.TORISPHERICAL, name: 'Torispherical', desc: 'ASME standard' },
    { type: DomeProfileType.GEODESIC, name: 'Geodesic', desc: 'Research/experimental' },
  ];

  const cylinderRadius = 200;
  const profile = generateIsotensoidProfile({
    cylinderRadius,
    bossRadius: 15,
    windingAngle: 54.74,
  });

  return (
    <div className="flex gap-6">
      <div className="w-64 space-y-4">
        <h3 className="font-semibold mb-2">Dome Profile</h3>
        {profiles.map((p) => (
          <button
            key={p.type}
            onClick={() => setSelectedProfile(p.type)}
            className={`block w-full text-left px-3 py-2 mb-1 rounded ${
              selectedProfile === p.type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="font-medium">{p.name}</div>
            <div className="text-xs opacity-75">{p.desc}</div>
          </button>
        ))}

        <div className="bg-gray-50 p-3 rounded text-sm">
          <h4 className="font-medium mb-2">Profile Data</h4>
          <div>Depth: {profile.depth.toFixed(1)} mm</div>
          <div>Volume: {(profile.volume / 1e6).toFixed(2)} L</div>
          <div>Surface Area: {(profile.surfaceArea / 1e3).toFixed(2)} cm²</div>
        </div>
      </div>

      <div className="flex-1 h-[600px]">
        <TankModel3D
          tankType={TankType.TYPE_IV}
          domeProfile={selectedProfile}
          cylinderRadius={cylinderRadius}
          cylinderLength={800}
          autoRotate={true}
        />
      </div>
    </div>
  );
}

/**
 * Example 4: Boss Configuration
 */
export function BossConfigExample() {
  const [bossType, setBossType] = useState<BossType>(BossType.STANDARD_CYLINDRICAL);

  const bossConfigs = {
    [BossType.STANDARD_CYLINDRICAL]: {
      type: BossType.STANDARD_CYLINDRICAL,
      innerDiameter: 20,
      outerDiameter: 40,
      length: 60,
      name: 'Standard Cylindrical',
      desc: 'Simple boss for valve connection',
    },
    [BossType.INTEGRATED]: {
      type: BossType.INTEGRATED,
      innerDiameter: 20,
      outerDiameter: 40,
      length: 60,
      name: 'Integrated',
      desc: 'Integral part of liner',
    },
    [BossType.FLANGED]: {
      type: BossType.FLANGED,
      innerDiameter: 25,
      outerDiameter: 50,
      length: 70,
      name: 'Flanged',
      desc: 'Bolted flange connection',
    },
    [BossType.MULTI_PORT]: {
      type: BossType.MULTI_PORT,
      innerDiameter: 20,
      outerDiameter: 40,
      length: 80,
      name: 'Multi-Port',
      desc: 'Multiple offset ports',
    },
  };

  return (
    <div className="flex gap-6">
      <div className="w-64">
        <h3 className="font-semibold mb-2">Boss Type</h3>
        {Object.entries(bossConfigs).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setBossType(key as BossType)}
            className={`block w-full text-left px-3 py-2 mb-1 rounded ${
              bossType === key ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="font-medium">{config.name}</div>
            <div className="text-xs opacity-75">{config.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 h-[600px]">
        <TankModel3D
          tankType={TankType.TYPE_IV}
          domeProfile={DomeProfileType.ISOTENSOID}
          cylinderRadius={200}
          cylinderLength={800}
          bossConfig={bossConfigs[bossType]}
        />
      </div>
    </div>
  );
}

/**
 * Example 5: All Tank Types in Grid
 */
export function AllTankTypesGrid() {
  const tankTypes = [
    TankType.TYPE_I,
    TankType.TYPE_II,
    TankType.TYPE_III,
    TankType.TYPE_IV,
    TankType.TYPE_V,
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {tankTypes.map((type) => {
        const spec = getTankTypeSpec(type);
        return (
          <div key={type} className="border rounded-lg overflow-hidden">
            <div className="h-64">
              <TankModel3D
                tankType={type}
                domeProfile={DomeProfileType.ISOTENSOID}
                cylinderRadius={150}
                cylinderLength={600}
                autoRotate={true}
                layerOpacity={0.9}
              />
            </div>
            <div className="p-4 bg-gray-50">
              <h4 className="font-medium">{spec.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{spec.description}</p>
              <div className="mt-2 text-xs space-y-0.5">
                <div>Pressure: {spec.typicalPressure.max} bar</div>
                <div>Weight: {spec.weightRatio.toFixed(1)}× Type IV</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Example 6: Interactive Parameter Adjustment
 */
export function InteractiveParametersExample() {
  const [cylinderRadius, setCylinderRadius] = useState(200);
  const [cylinderLength, setCylinderLength] = useState(800);
  const [layerOpacity, setLayerOpacity] = useState(0.85);

  const volume = Math.PI * Math.pow(cylinderRadius, 2) * cylinderLength;
  const mass = calculateTankMass(TankType.TYPE_IV, cylinderRadius, cylinderLength, cylinderRadius * 0.6);

  return (
    <div className="flex gap-6">
      <div className="w-64 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Cylinder Radius: {cylinderRadius} mm
          </label>
          <input
            type="range"
            min="100"
            max="300"
            value={cylinderRadius}
            onChange={(e) => setCylinderRadius(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Cylinder Length: {cylinderLength} mm
          </label>
          <input
            type="range"
            min="400"
            max="1200"
            value={cylinderLength}
            onChange={(e) => setCylinderLength(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Layer Opacity: {(layerOpacity * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={layerOpacity * 100}
            onChange={(e) => setLayerOpacity(Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        <div className="bg-blue-50 p-3 rounded text-sm">
          <h4 className="font-medium mb-2">Calculated Values</h4>
          <div>Volume: {(volume / 1e6).toFixed(2)} L</div>
          <div>Mass: {mass.toFixed(2)} kg</div>
          <div>Gravimetric: {((volume / 1e6 * 0.0899) / mass * 100).toFixed(2)}%</div>
        </div>
      </div>

      <div className="flex-1 h-[600px]">
        <TankModel3D
          tankType={TankType.TYPE_IV}
          domeProfile={DomeProfileType.ISOTENSOID}
          cylinderRadius={cylinderRadius}
          cylinderLength={cylinderLength}
          layerOpacity={layerOpacity}
        />
      </div>
    </div>
  );
}
