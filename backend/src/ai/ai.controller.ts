import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService, AiConfig } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

function extractAiConfig(data: any): AiConfig {
  return {
    provider: data.provider,
    model: data.model,
    apiKey: data.apiKey,
  };
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('market-research')
  async generateMarketResearch(@Body() data: any) {
    const config = extractAiConfig(data);
    const result = await this.aiService.generateMarketResearch(config, data);
    return { content: result };
  }

  @Post('personas')
  async generatePersonas(@Body() data: any) {
    const config = extractAiConfig(data);
    const personas = await this.aiService.generatePersonas(config, data, data.count || 50);
    return { personas };
  }

  @Post('icp')
  async generateICP(@Body() data: { personas: any[]; surveyResults: any; provider: string; model: string; apiKey: string }) {
    const config = extractAiConfig(data);
    const result = await this.aiService.generateICP(config, data.personas, data.surveyResults);
    return { content: result };
  }

  @Post('features')
  async generateFeatures(@Body() data: { icpData: string; provider: string; model: string; apiKey: string }) {
    const config = extractAiConfig(data);
    const result = await this.aiService.generateFeatures(config, data.icpData);
    return { content: result };
  }

  @Post('prd')
  async generatePRD(@Body() data: { features: string[]; icpData: string; provider: string; model: string; apiKey: string }) {
    const config = extractAiConfig(data);
    const result = await this.aiService.generatePRD(config, data.features, data.icpData);
    return { content: result };
  }

  @Post('marketing')
  async generateMarketing(@Body() data: { prdContent: string; icpData: string; provider: string; model: string; apiKey: string }) {
    const config = extractAiConfig(data);
    const result = await this.aiService.generateMarketing(config, data.prdContent, data.icpData);
    return { content: result };
  }

  @Post('premortem')
  async generatePremortem(@Body() data: any) {
    const config = extractAiConfig(data);
    const result = await this.aiService.generatePremortem(config, data);
    return { content: result };
  }

  @Post('kickoff')
  async generateKickoff(@Body() data: any) {
    const config = extractAiConfig(data);
    const result = await this.aiService.generateKickoff(config, data);
    return { content: result };
  }
}
