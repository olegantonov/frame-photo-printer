import { NextRequest, NextResponse } from 'next/server';
import printer from 'node-printer';

export async function GET() {
  try {
    const printers = printer.getPrinters();

    const printerList = printers.map(p => ({
      name: p.name,
      status: 'idle',
      isDefault: p.default || false,
    }));

    return NextResponse.json(printerList, { status: 200 });
  } catch (error) {
    console.error('Error fetching printers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch printers' },
      { status: 500 }
    );
  }
}
