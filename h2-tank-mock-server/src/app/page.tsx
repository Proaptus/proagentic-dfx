"use client";

import { useState } from "react";
import {
  Save,
  Settings,
  Play,
  RotateCcw,
  Activity,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data for initial render
const MOCK_STRESS_DATA = Array.from({ length: 20 }, (_, i) => ({
  position: i,
  hoop: 400 + Math.random() * 50,
  axial: 200 + Math.random() * 25,
}));

// -- Components --

function Button({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "secondary" | "ghost" | "destructive",
  size?: "sm" | "md" | "icon"
}) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  };
  
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 py-2 text-sm",
    icon: "h-9 w-9",
  };

  return (
    <button 
      className={cn(base, variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      {children}
    </div>
  );
}

function PanelHeader({ title, icon: Icon }: { title: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

export default function CADPage() {
  const [pressure, setPressure] = useState("700");
  const [radius, setRadius] = useState("0.25");
  const [thickness, setThickness] = useState("0.025");
  const [activeTab, setActiveTab] = useState<"stress" | "failure" | "reliability">("stress");

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
      {/* Top Bar */}
      <header className="flex h-12 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span>ProAgentic DFX</span>
            <span className="text-muted-foreground font-normal">/ H2 Tank Designer</span>
          </div>
          
          <nav className="flex items-center gap-1 ml-4 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm">File</Button>
            <Button variant="ghost" size="sm">Edit</Button>
            <Button variant="ghost" size="sm">View</Button>
            <Button variant="ghost" size="sm">Analysis</Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="secondary" size="sm" className="gap-2">
             <Save className="h-4 w-4" />
             Save Design
           </Button>
           <Button size="sm" className="gap-2">
             <Play className="h-4 w-4" />
             Run Simulation
           </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Controls */}
        <aside className="w-80 border-r border-border bg-card flex flex-col z-10">
          <PanelHeader title="Design Parameters" icon={Layers} />
          <div className="p-4 space-y-6 overflow-y-auto">
            
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Geometry</h4>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="radius">Radius (m)</Label>
                  <Input 
                    id="radius" 
                    value={radius} 
                    onChange={(e) => setRadius(e.target.value)} 
                    type="number" 
                    step="0.01" 
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="length">Cylinder Length (m)</Label>
                  <Input id="length" defaultValue="1.2" type="number" step="0.1" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="thickness">Wait Thickness (m)</Label>
                  <Input 
                    id="thickness" 
                    value={thickness} 
                    onChange={(e) => setThickness(e.target.value)} 
                    type="number" 
                    step="0.001" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Operating Conditions</h4>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="pressure">Service Pressure (bar)</Label>
                  <Input 
                    id="pressure" 
                    value={pressure} 
                    onChange={(e) => setPressure(e.target.value)} 
                    type="number" 
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="temp">Temperature (K)</Label>
                  <Input id="temp" defaultValue="293" type="number" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Materials</h4>
              <div className="grid gap-1.5">
                  <Label>Composite Type</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option>Carbon Fiber T700 / Epoxy</option>
                    <option>Carbon Fiber T1000 / Epoxy</option>
                    <option>Glass Fiber / Epoxy</option>
                  </select>
              </div>
            </div>

          </div>
        </aside>

        {/* Center: Canvas / Visualization */}
        <main className="flex-1 bg-muted/10 relative flex flex-col">
          {/* Canvas Toolbar */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="flex gap-1 bg-card border border-border p-1 rounded-md shadow-sm">
                <Button variant="ghost" size="icon" title="Reset View"><RotateCcw className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" title="View Settings"><Settings className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]">
             {/* Scalable Vector Graphic of the Tank */}
             <div className="relative w-[600px] h-[300px] border border-dashed border-primary/20 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 600 300" className="overflow-visible">
                  {/* Simple Tank Representation */}
                  <defs>
                    <linearGradient id="tankGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Cylinder Body */}
                  <rect x="150" y="50" width="300" height="200" fill="url(#tankGradient)" stroke="var(--primary)" strokeWidth="2" />
                  
                  {/* Left Dome */}
                  <path d="M 150 50 C 50 50 50 250 150 250" fill="url(#tankGradient)" stroke="var(--primary)" strokeWidth="2" />
                  
                  {/* Right Dome */}
                  <path d="M 450 50 C 550 50 550 250 450 250" fill="url(#tankGradient)" stroke="var(--primary)" strokeWidth="2" />

                  {/* Winding Lines (Decoration) */}
                  <path d="M 100 100 L 500 200" stroke="var(--muted-foreground)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                  <path d="M 100 200 L 500 100" stroke="var(--muted-foreground)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                </svg>
                
                <div className="absolute top-2 right-2 text-xs font-mono text-muted-foreground">
                  View: Cross-Section (XY Plane)
                </div>
             </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="h-6 bg-card border-t border-border flex items-center px-4 text-xs text-muted-foreground gap-4">
             <span>Ready</span>
             <span className="h-3 w-px bg-border"></span>
             <span>X: 0.00m Y: 0.00m</span>
             <span className="ml-auto">Solver: Validated First Principles</span>
          </div>
        </main>

        {/* Right Sidebar: Analysis Results */}
        <aside className="w-96 border-l border-border bg-card flex flex-col z-10">
          {/* Analysis Tabs */}
          <div className="flex border-b border-border">
            <button 
              onClick={() => setActiveTab("stress")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "stress" 
                  ? "border-primary text-foreground bg-muted/50" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Stress
            </button>
            <button 
              onClick={() => setActiveTab("failure")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "failure" 
                  ? "border-primary text-foreground bg-muted/50" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Failure
            </button>
            <button 
              onClick={() => setActiveTab("reliability")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "reliability" 
                  ? "border-primary text-foreground bg-muted/50" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Reliability
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {activeTab === "stress" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <Card className="p-3">
                     <div className="text-xs text-muted-foreground mb-1">Max Hoop Stress</div>
                     <div className="text-xl font-bold font-mono">504 <span className="text-xs font-sans font-normal text-muted-foreground">MPa</span></div>
                   </Card>
                   <Card className="p-3">
                     <div className="text-xs text-muted-foreground mb-1">Max Axial Stress</div>
                     <div className="text-xl font-bold font-mono">252 <span className="text-xs font-sans font-normal text-muted-foreground">MPa</span></div>
                   </Card>
                </div>

                <div className="h-64 w-full">
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    Stress Distribution (Along Length)
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_STRESS_DATA}>
                      <defs>
                        <linearGradient id="colorHoop" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="position" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="hoop" stroke="var(--primary)" fillOpacity={1} fill="url(#colorHoop)" strokeWidth={2} />
                      <Area type="monotone" dataKey="axial" stroke="var(--muted-foreground)" fillOpacity={0} strokeDasharray="4 4" strokeWidth={1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-sm text-blue-500 flex items-start gap-2">
                  <Activity className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold block">Optimal Ratio Verified</span>
                    Hoop stress is exactly 2.0x Axial stress, confirming thin-wall pressure vessel theory.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "failure" && (
               <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-green-500">Design Safe</div>
                        <div className="text-xs text-muted-foreground">Tsai-Wu Index &lt; 1.0</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-green-500">0.72</div>
                 </div>

                 <div className="space-y-3">
                   <h4 className="text-xs font-semibold uppercase text-muted-foreground">Failure Indices</h4>
                   
                   <div className="space-y-1">
                     <div className="flex justify-between text-xs">
                       <span>Tsai-Wu (Global)</span>
                       <span>0.72 / 1.0</span>
                     </div>
                     <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[72%]" />
                     </div>
                   </div>
                   
                   <div className="space-y-1">
                     <div className="flex justify-between text-xs">
                       <span>Hashin (Fiber Tension)</span>
                       <span>0.65 / 1.0</span>
                     </div>
                     <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[65%]" />
                     </div>
                   </div>

                   <div className="space-y-1">
                     <div className="flex justify-between text-xs">
                       <span>Hashin (Matrix Cracking)</span>
                       <span>0.45 / 1.0</span>
                     </div>
                     <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[45%]" />
                     </div>
                   </div>
                 </div>
               </div>
            )}

             {activeTab === "reliability" && (
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <Card className="p-3">
                     <div className="text-xs text-muted-foreground mb-1">Pass Probability</div>
                     <div className="text-xl font-bold font-mono text-green-500">99.998%</div>
                   </Card>
                   <Card className="p-3">
                     <div className="text-xs text-muted-foreground mb-1">Reliability Index (β)</div>
                     <div className="text-xl font-bold font-mono">4.12</div>
                   </Card>
                </div>
                
                <div className="h-48 w-full border border-dashed border-border rounded flex items-center justify-center text-muted-foreground text-xs">
                  Moment Carlo Distribution Plot
                </div>

                <div className="text-xs text-muted-foreground">
                  Based on 100,000 Monte Carlo simulations considering material property variance (COV 5%) and load variance (COV 10%).
                </div>
              </div>
            )}

          </div>
        </aside>
      </div>
    </div>
  );
}
