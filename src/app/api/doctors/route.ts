import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Increase cache time to 1 day for better performance
export const revalidate = 86400; // Revalidate every day instead of every hour

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const specialty = searchParams.get('specialty');
  const location = searchParams.get('location');
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');
  
  const offset = (page - 1) * limit;
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Use the secure function with proper error handling
    const { data: doctors, error: fetchError } = await supabase
      .rpc('get_filtered_doctors', {
        specialty_filter: specialty || null,
        location_filter: location || null,
        limit_val: limit,
        offset_val: offset
      });
    
    if (fetchError) {
      console.error('Error fetching doctors:', fetchError);
      throw new Error(fetchError.message);
    }
    
    // Get total count for pagination with a single count query
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'doctor')
      .eq('is_active', true)
      .conditionalFilter('specialty', specialty, specialty !== null)
      .conditionalFilter('location', location, location !== null, 'ilike', `%${location}%`);
    
    if (countError) {
      console.error('Error getting doctor count:', countError);
      throw new Error(countError.message);
    }
    
    // Set cache headers for better client-side caching
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    
    return NextResponse.json({
      doctors: doctors || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    }, { 
      headers,
      status: 200 
    });
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

// Add a helper extension method for Supabase queries
declare global {
  interface Object {
    conditionalFilter(column: string, value: any, condition: boolean, operator?: string, operand?: any): any;
  }
}

// Initialize the extension if it doesn't exist
if (!Object.prototype.hasOwnProperty('conditionalFilter')) {
  Object.defineProperty(Object.prototype, 'conditionalFilter', {
    value: function(column: string, value: any, condition: boolean, operator = 'eq', operand?: any) {
      if (!condition) return this;
      
      if (operator === 'eq') {
        return this.eq(column, value);
      } else if (operator === 'ilike') {
        return this.ilike(column, operand || `%${value}%`);
      }
      
      return this;
    },
    enumerable: false
  });
} 