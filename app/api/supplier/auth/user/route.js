import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supplierSession = cookieStore.get('supplier-session');
    
    if (!supplierSession) {
      return NextResponse.json(
        { success: false, message: 'No active session' },
        { status: 401 }
      );
    }

    const supplier = JSON.parse(supplierSession.value);
    
    return NextResponse.json({
      success: true,
      supplier: supplier
    });

  } catch (error) {
    console.error('Supplier auth check error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
