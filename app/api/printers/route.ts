import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PrinterInfo {
  name: string;
  status: string;
  isDefault: boolean;
}

async function getLinuxPrinters(): Promise<PrinterInfo[]> {
  try {
    // Get all printers via lpstat
    const { stdout: printerList } = await execAsync('lpstat -a 2>/dev/null || echo ""');
    
    // Get default printer (supports multiple languages)
    let defaultPrinter = '';
    try {
      const { stdout: defaultOut } = await execAsync('lpstat -d 2>/dev/null || echo ""');
      // Match English "system default destination:" or Portuguese "destino padrão do sistema:"
      const match = defaultOut.match(/(?:system default destination|destino padrão do sistema):\s*(.+)/i);
      if (match) defaultPrinter = match[1].trim();
    } catch {
      // No default printer set
    }

    const printers: PrinterInfo[] = [];
    const lines = printerList.trim().split('\n').filter(Boolean);

    for (const line of lines) {
      const parts = line.split(' ');
      const name = parts[0];
      if (name) {
        // Get printer status
        let status = 'idle';
        try {
          const { stdout: statusOut } = await execAsync(`lpstat -p "${name}" 2>/dev/null || echo ""`);
          if (statusOut.includes('disabled') || statusOut.includes('desativada')) status = 'disabled';
          else if (statusOut.includes('printing') || statusOut.includes('imprimindo')) status = 'printing';
          else if (statusOut.includes('idle') || statusOut.includes('ociosa') || statusOut.includes('habilitada')) status = 'idle';
          else if (statusOut.includes('idle')) status = 'idle';
        } catch {
          status = 'unknown';
        }

        printers.push({
          name,
          status,
          isDefault: name === defaultPrinter,
        });
      }
    }

    return printers;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const printers = await getLinuxPrinters();

    // If no printers found, return a placeholder
    if (printers.length === 0) {
      return NextResponse.json([
        {
          name: 'Nenhuma impressora (CUPS)',
          status: 'offline',
          isDefault: false,
        },
      ], { status: 200 });
    }

    // Sort: default printer first
    printers.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    return NextResponse.json(printers, { status: 200 });
  } catch (error) {
    console.error('Error fetching printers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch printers' },
      { status: 500 }
    );
  }
}
