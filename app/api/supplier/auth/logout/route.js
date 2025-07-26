import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Delete the supplier session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    response.cookies.delete('supplier-session');
    
    return response;
  } catch (error) {
    console.error('Supplier logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
