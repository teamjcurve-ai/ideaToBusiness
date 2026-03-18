import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const supabaseUrl = configService.get('SUPABASE_URL') || 'https://nsvlglfraqtqohojussj.supabase.co';

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

  async validate(payload: any) {
    const supabaseId = payload.sub;
    const email = payload.email;

    if (!supabaseId || !email) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }

    const user = await this.authService.findOrCreateUser(
      supabaseId,
      email,
      payload.user_metadata?.full_name || payload.user_metadata?.name,
    );

    if (!user) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }

    return user;
  }
}
