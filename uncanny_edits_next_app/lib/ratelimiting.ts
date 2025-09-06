import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@/app/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const redis = Redis.fromEnv()

// Rate limit configuration
const RATE_LIMITS = {
  FREE: {
    signup: { requests: 5, window: '1d' }, // 5 signups per day
    imageGeneration: { requests: 10, window: '1d' }, // 10 images per day
  },
  PAID: {
    signup: { requests: 50, window: '1d' }, // 50 signups per day
    imageGeneration: { requests: 100, window: '1d' }, // 100 images per day
  }
} 

// Default to FREE tier
const DEFAULT_TIER = 'FREE'

export interface RateLimitResult {
  success: boolean
  remaining: number
  limit: number
  resetTime: number
  retryAfter?: number
}

/**
 * Get user tier - checks is_pro status
 */
async function getUserTier(userId: string): Promise<'FREE' | 'PAID'> {
  try {
    const supabase = await createClient()
    
    // Check user's pro status from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single()
    
    // Check if user is pro
    if (profile?.is_pro === true) {
      return 'PAID'
    }
    
    return 'FREE'
  } catch (error) {
    console.error('Error getting user tier:', error)
    return 'FREE'
  }
}

/**
 * Create rate limiter instance for a specific action and tier
 */
function createRateLimiter(action: 'signup' | 'imageGeneration', tier: 'FREE' | 'PAID') {
  const limits = RATE_LIMITS[tier][action]
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limits.requests, limits.window as `${number} ${"ms"|"s"|"m"|"h"|"d"}` | `${number}${"ms"|"s"|"m"|"h"|"d"}`),
    analytics: true,
    prefix: `rate_limit:${action}:${tier}`,
  })
}

/**
 * Check and update rate limit for a user
 */
export async function checkRateLimit(
  userId: string,
  action: 'signup' | 'imageGeneration'
): Promise<RateLimitResult> {
  try {
    const userTier = await getUserTier(userId)
    const rateLimiter = createRateLimiter(action, userTier)
    const limits = RATE_LIMITS[userTier][action]
    
    const result = await rateLimiter.limit(userId)
    
    if (!result.success) {
      return {
        success: false,
        remaining: 0,
        limit: limits.requests,
        resetTime: result.reset,
        retryAfter: result.reset - Math.floor(Date.now() / 1000)
      }
    }

    return {
      success: true,
      remaining: result.remaining,
      limit: limits.requests,
      resetTime: result.reset
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // On error, allow the request but log it
    return {
      success: true,
      remaining: 999,
      limit: 1000,
      resetTime: Math.floor(Date.now() / 1000) + 3600
    }
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString()
  }

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }

  return headers
}

/**
 * Middleware function to check rate limits
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  action: 'signup' | 'imageGeneration'
): Promise<{ success: boolean; response?: NextResponse }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      // For unauthenticated users, skip rate limiting for now
      // You can implement IP-based rate limiting here later
      console.warn('Rate limiting skipped for unauthenticated user')
      return { success: true }
    }
    
    const rateLimitResult = await checkRateLimit(user.id, action)

    if (!rateLimitResult.success) {
      const headers = getRateLimitHeaders(rateLimitResult)
      
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `You have exceeded your rate limit for ${action}. Please try again later or upgrade your plan.`,
            retryAfter: rateLimitResult.retryAfter
          },
          {
            status: 429,
            headers
          }
        )
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Rate limit middleware error:', error)
    // On error, allow the request but log it
    return { success: true }
  }
}

/**
 * Get current rate limit status for a user
 */
export async function getRateLimitStatus(
  userId: string,
  action: 'signup' | 'imageGeneration'
): Promise<{
  tier: string
  limit: number
  remaining: number
  resetTime: number
  used: number
}> {
  try {
    const userTier = await getUserTier(userId)
    const rateLimiter = createRateLimiter(action, userTier)
    const limits = RATE_LIMITS[userTier][action]
    
    const result = await rateLimiter.limit(userId)
    
    return {
      tier: userTier,
      limit: limits.requests,
      remaining: result.remaining,
      resetTime: result.reset,
      used: limits.requests - result.remaining
    }
  } catch (error) {
    console.error('Error getting rate limit status:', error)
    throw error
  }
}