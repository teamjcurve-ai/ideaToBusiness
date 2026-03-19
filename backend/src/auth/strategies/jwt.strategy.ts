import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

function buildJwtOptions(configService: ConfigService): StrategyOptionsWithoutRequest {
  const publicKey = configService.get('SUPABASE_JWT_PUBLIC_KEY');

  if (publicKey) {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey.replace(/\\n/g, '\n'),
      algorithms: ['ES256'],
    } as StrategyOptionsWithoutRequest;
  }

  const jwtSecret = configService.get('SUPABASE_JWT_SECRET');
  if (!jwtSecret) {
    throw new Error('SUPABASE_JWT_PUBLIC_KEY 또는 SUPABASE_JWT_SECRET 환경변수가 설정되지 않았습니다.');
  }

  return {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: jwtSecret,
    algorithms: ['HS256'],
  } as StrategyOptionsWithoutRequest;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super(buildJwtOptions(configService));
  }

  async validate(payload: any) {
    const supabaseId = payload.sub;
    const email = payload.email;

    if (!supabaseId || !email) {
      this.logger.warn('Missing supabaseId or email in token payload');
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }

    try {
      const user = await this.authService.findOrCreateUser(
        supabaseId,
        email,
        payload.user_metadata?.full_name || payload.user_metadata?.name,
      );

      if (!user) {
        this.logger.warn('findOrCreateUser returned null');
        throw new UnauthorizedException('인증되지 않은 사용자입니다.');
      }

      return user;
    } catch (error) {
      this.logger.error('Error in validate:', error);
      throw new UnauthorizedException('인증 처리 중 오류가 발생했습니다.');
    }
  }
}
