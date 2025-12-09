import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/designs - List all available designs
export async function GET() {
  try {
    const designsDir = path.join(process.cwd(), 'data', 'static', 'designs');
    
    if (!fs.existsSync(designsDir)) {
      return NextResponse.json({ designs: [] });
    }

    const files = fs.readdirSync(designsDir).filter(f => f.endsWith('.json'));
    
    const designs = files.map(file => {
      const dataPath = path.join(designsDir, file);
      const designData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      
      return {
        id: designData.id,
        trade_off_category: designData.trade_off_category,
        weight_kg: designData.summary?.weight_kg,
        cost_eur: designData.summary?.cost_eur,
        burst_pressure_bar: designData.summary?.burst_pressure_bar,
        p_failure: designData.reliability?.p_failure ?? designData.summary?.p_failure,
      };
    });

    return NextResponse.json({ designs });
  } catch (error) {
    console.error('Error listing designs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
