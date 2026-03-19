import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

function buildJwtOptions(configService: ConfigService): StrategyOptionsWithoutRequest {
  const publicKey = configService.get('SUPABASE_JWT_PUBLIC_KEY');

  if (publicKey) {
    console.log('[JWT Strategy] Using ES256 public key');
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey.replace(/\\n/g, '\n'),
      algorithms: ['ES256'],
    } as StrategyOptionsWithoutRequest;
  }

  const jwtSecret = configService.get('SUPABASE_JWT_SECRET');
  console.log('[JWT Strategy] Using HS256 legacy secret, exists:', !!jwtSecret);
  return {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: jwtSecret || 'fallback-secret',
    algorithms: ['HS256'],
  } as StrategyOptionsWithoutRequest;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super(buildJwtOptions(configService));
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
