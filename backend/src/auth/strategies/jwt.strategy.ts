import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const supabaseUrl = configService.get('SUPABASE_URL') || 'https://nsvlglfraqtqohojussj.supabase.co';
    const jwtSecret = configService.get('SUPABASE_JWT_SECRET');

    console.log('[JWT Strategy] SUPABASE_URL:', supabaseUrl);
    console.log('[JWT Strategy] JWT_SECRET exists:', !!jwtSecret);

    if (jwtSecret) {
      // Use JWT secret directly (HS256) - more reliable than JWKS
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: jwtSecret,
        algorithms: ['HS256'],
      });
    } else {
      // Fallback to JWKS (ES256)
      const { passportJwtSecret } = require('jwks-rsa');
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKeyProvider: passportJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 10,
          jwksUri: `${supabaseUrl}/auth/v1/jwks`,
        }),
        algorithms: ['ES256'],
      });
    }
  }

  async validate(payload: any) {
    const supabaseId = payload.sub;
    const email = payload.email;

    console.log('[JWT] Validating token for:', { supabaseId, email });

    if (!supabaseId || !email) {
      console.error('[JWT] Missing supabaseId or email in token payload');
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }

    try {
      const user = await this.authService.findOrCreateUser(
        supabaseId,
        email,
        payload.user_metadata?.full_name || payload.user_metadata?.name,
      );

      if (!user) {
        console.error('[JWT] findOrCreateUser returned null');
        throw new UnauthorizedException('인증되지 않은 사용자입니다.');
      }

      console.log('[JWT] User authenticated:', user.id);
      return user;
    } catch (error) {
      console.error('[JWT] Error in validate:', error);
      throw new UnauthorizedException('인증 처리 중 오류가 발생했습니다.');
    }
  }
}
