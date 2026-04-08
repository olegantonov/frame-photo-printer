import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '@/lib/prisma';

const execAsync = promisify(exec);

interface HotspotStatus {
  enabled: boolean;
  ssid: string;
  password: string;
  ip?: string;
  interface?: string;
  clients?: number;
}

async function getWirelessInterface(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('nmcli device status | grep wifi | head -1 | awk \'{print $1}\'');
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

async function getHotspotStatus(): Promise<HotspotStatus> {
  const config = await prisma.systemConfig.findUnique({
    where: { id: 'system' }
  });

  const status: HotspotStatus = {
    enabled: false,
    ssid: config?.hotspot_ssid || 'FramePhotoPrinter',
    password: config?.hotspot_password || 'foto1234',
  };

  try {
    // Check if hotspot is active
    const { stdout: connStatus } = await execAsync('nmcli -t -f NAME,TYPE connection show --active 2>/dev/null || echo ""');
    const isHotspotActive = connStatus.includes('Hotspot') || connStatus.includes('hotspot');
    
    if (isHotspotActive) {
      status.enabled = true;
      
      // Get interface
      const iface = await getWirelessInterface();
      if (iface) {
        status.interface = iface;
        
        // Get IP address
        try {
          const { stdout: ipOut } = await execAsync(`ip addr show ${iface} | grep 'inet ' | awk '{print $2}' | cut -d/ -f1`);
          status.ip = ipOut.trim() || '10.42.0.1';
        } catch {
          status.ip = '10.42.0.1';
        }
        
        // Get connected clients
        try {
          const { stdout: clientsOut } = await execAsync(`arp -i ${iface} | grep -v Address | wc -l`);
          status.clients = parseInt(clientsOut.trim()) || 0;
        } catch {
          status.clients = 0;
        }
      }
    }
  } catch (error) {
    console.error('Error checking hotspot status:', error);
  }

  return status;
}

async function startHotspot(ssid: string, password: string): Promise<{ success: boolean; message: string; ip?: string }> {
  try {
    const iface = await getWirelessInterface();
    if (!iface) {
      return { success: false, message: 'Nenhuma interface Wi-Fi encontrada' };
    }

    // Stop any existing hotspot
    await execAsync('nmcli connection down Hotspot 2>/dev/null || true');
    await execAsync('nmcli connection delete Hotspot 2>/dev/null || true');

    // Create and start hotspot
    const cmd = `nmcli device wifi hotspot ifname ${iface} ssid "${ssid}" password "${password}"`;
    await execAsync(cmd);

    // Wait for hotspot to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the IP address
    let ip = '10.42.0.1';
    try {
      const { stdout: ipOut } = await execAsync(`ip addr show ${iface} | grep 'inet ' | awk '{print $2}' | cut -d/ -f1`);
      if (ipOut.trim()) ip = ipOut.trim();
    } catch {
      // Use default IP
    }

    // Update config
    await prisma.systemConfig.upsert({
      where: { id: 'system' },
      update: { hotspot_enabled: true, hotspot_ssid: ssid, hotspot_password: password },
      create: { id: 'system', hotspot_enabled: true, hotspot_ssid: ssid, hotspot_password: password }
    });

    return { 
      success: true, 
      message: `Hotspot "${ssid}" iniciado com sucesso!`,
      ip 
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, message: `Falha ao iniciar hotspot: ${msg}` };
  }
}

async function stopHotspot(): Promise<{ success: boolean; message: string }> {
  try {
    await execAsync('nmcli connection down Hotspot 2>/dev/null || true');
    
    // Update config
    await prisma.systemConfig.upsert({
      where: { id: 'system' },
      update: { hotspot_enabled: false },
      create: { id: 'system', hotspot_enabled: false }
    });

    return { success: true, message: 'Hotspot desativado' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, message: `Falha ao parar hotspot: ${msg}` };
  }
}

export async function GET() {
  try {
    const status = await getHotspotStatus();
    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error('Hotspot status error:', error);
    return NextResponse.json(
      { error: 'Failed to get hotspot status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ssid, password } = body;

    if (action === 'start') {
      const result = await startHotspot(
        ssid || 'FramePhotoPrinter',
        password || 'foto1234'
      );
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    } else if (action === 'stop') {
      const result = await stopHotspot();
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Hotspot action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform hotspot action' },
      { status: 500 }
    );
  }
}
