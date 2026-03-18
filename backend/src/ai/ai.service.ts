import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenAIProvider, AnthropicProvider, GoogleProvider, AiProvider } from './providers';

export interface AiConfig {
  provider: string;
  model: string;
  apiKey: string;
}

@Injectable()
export class AiService {
  private createProvider(config: AiConfig): AiProvider {
    const { provider, apiKey, model } = config;

    if (!apiKey) {
      throw new BadRequestException(`API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.`);
    }

    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(apiKey, model);
      case 'anthropic':
        return new AnthropicProvider(apiKey, model);
      case 'google':
        return new GoogleProvider(apiKey, model);
      default:
        throw new BadRequestException(`지원하지 않는 AI 제공자입니다: ${provider}`);
    }
  }

  async generateMarketResearch(config: AiConfig, ideaData: any): Promise<string> {
    const provider = this.createProvider(config);

    const systemPrompt = `당신은 시장 조사 전문가입니다. 주어진 아이디어에 대해 경쟁사 분석, 시장 트렌드, 차별화 포인트를 한국어로 상세히 분석해주세요.`;

    const prompt = `
다음 아이디어에 대해 시장 조사를 수행해주세요:

아이디어: ${ideaData.idea}
타겟 사용자: ${ideaData.targetUser || '명시되지 않음'}
해결하려는 문제: ${ideaData.problem || '명시되지 않음'}

다음 형식으로 작성해주세요:

## 경쟁사 분석
(주요 경쟁사 3-5개와 각각의 강점/약점)

## 시장 트렌드
(현재 시장 동향과 기회)

## 차별화 포인트
(이 아이디어만의 독특한 가치 제안)

## 시장 진입 전략
(초기 진입 방법과 성장 전략)
`;

    return provider.generate(prompt, systemPrompt);
  }

  async generatePersonas(config: AiConfig, ideaData: any, count: number = 50): Promise<any[]> {
    const provider = this.createProvider(config);

    const systemPrompt = `당신은 고객 인사이트 전문가입니다. 다양한 배경과 태도(긍정적, 부정적, 무관심)를 가진 가상의 페르소나를 생성해주세요. 결과는 JSON 배열 형식으로만 반환해주세요.`;

    const prompt = `
다음 제품/서비스에 대해 ${count}명의 다양한 페르소나를 생성해주세요:

아이디어: ${ideaData.idea}
타겟 사용자: ${ideaData.targetUser || '일반 사용자'}

각 페르소나는 다음 정보를 포함해야 합니다:
- id: "P01", "P02" 형식
- name: 이름
- age: 나이
- occupation: 직업
- attitude: "positive", "negative", "neutral" 중 하나
- painPoints: 불편한 점 (배열)
- goals: 목표 (배열)
- currentSolution: 현재 사용 중인 해결책

JSON 배열로만 응답해주세요. 추가 설명 없이 JSON만 반환하세요.
`;

    const response = await provider.generate(prompt, systemPrompt);

    // JSON 추출
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new BadRequestException('페르소나 생성에 실패했습니다.');
  }

  async generateICP(config: AiConfig, personas: any[], surveyResults: any): Promise<string> {
    const provider = this.createProvider(config);

    const systemPrompt = `당신은 ICP(Ideal Customer Profile) 분석 전문가입니다. 페르소나와 서베이 결과를 바탕으로 이상적인 고객 프로필을 도출해주세요.`;

    const prompt = `
다음 데이터를 바탕으로 ICP를 도출해주세요:

페르소나 수: ${personas.length}명
서베이 결과 요약: ${JSON.stringify(surveyResults)}

다음 형식으로 작성해주세요:

## 비즈니스 판단
(Pain/Gain 점수, 시장 가능성 평가)

## Primary Persona (ICP ≥7)
(핵심 타겟 그룹 분석)

## Coverage Persona (ICP 4-6)
(2차 타겟 그룹 분석)

## 공략 메시지
(각 세그먼트별 마케팅 메시지)

## 획득 채널
(효과적인 마케팅 채널 제안)
`;

    return provider.generate(prompt, systemPrompt);
  }

  async generateFeatures(config: AiConfig, icpData: string): Promise<string> {
    const provider = this.createProvider(config);

    const systemPrompt = `당신은 제품 기획 전문가입니다. ICP를 바탕으로 핵심 기능을 추천해주세요.`;

    const prompt = `
다음 ICP를 바탕으로 MVP에 포함할 핵심 기능 5-7개를 추천해주세요:

${icpData}

각 기능은 다음 형식으로 작성해주세요:
- 기능명
- 설명
- 난이도 (하/중/상)
- ICP와의 연관성
`;

    return provider.generate(prompt, systemPrompt);
  }

  async generatePRD(config: AiConfig, features: string[], icpData: string): Promise<string> {
    const provider = this.createProvider(config);

    const systemPrompt = `당신은 PRD(Product Requirements Document) 작성 전문가입니다. 선택된 기능을 바탕으로 상세한 요구사항 문서를 작성해주세요.`;

    const prompt = `
다음 정보를 바탕으로 PRD를 작성해주세요:

선택된 기능:
${features.join('\n')}

ICP:
${icpData}

다음 항목을 포함해주세요:
## 제품 개요
## 핵심 기능 상세
## 사용자 스토리
## 기술 요구사항
## 성공 지표
## Out of Scope (MVP 이후 고려사항)
`;

    return provider.generate(prompt, systemPrompt);
  }

  async generateMarketing(config: AiConfig, prdContent: string, icpData: string): Promise<string> {
    const provider = this.createProvider(config);

    const systemPrompt = `당신은 Go-to-Market 전략 전문가입니다. PRD와 ICP를 바탕으로 마케팅 전략을 수립해주세요.`;

    const prompt = `
다음 정보를 바탕으로 GTM 전략을 수립해주세요:

PRD: ${prdContent}
ICP: ${icpData}

다음 항목을 포함해주세요:
## 포지셔닝
## 핵심 메시지
## 채널 전략
## 초기 사용자 확보 방안
## A/B 테스트 계획
## 실행 체크리스트
`;

    return provider.generate(prompt, systemPrompt);
  }

  async generatePremortem(config: AiConfig, projectData: any): Promise<string> {
    const provider = this.createProvider(config);

    const systemPrompt = `당신은 리스크 분석 전문가입니다. 프로젝트의 잠재적 실패 요인을 사전에 분석해주세요.`;

    const prompt = `
다음 프로젝트에 대해 사전 부검(Pre-mortem) 분석을 수행해주세요:

프로젝트 정보: ${JSON.stringify(projectData)}

다음 항목을 포함해주세요:
## 우선순위 요약
(가정, 임팩트, 불확실성, 우선순위)

## 핵심 가정 및 검증 방법
(각 가정별로 "만약 틀리다면" 시나리오와 1주일 내 검증 방법)

## 성공 기준 & 위험 신호
`;

    return provider.generate(prompt, systemPrompt);
  }

  async generateKickoff(config: AiConfig, allData: any): Promise<string> {
    const provider = this.createProvider(config);

    const systemPrompt = `당신은 프로젝트 매니저입니다. 모든 단계의 결과를 종합하여 킥오프 준비 문서를 작성해주세요.`;

    const prompt = `
다음 모든 정보를 바탕으로 킥오프 준비 문서를 작성해주세요:

${JSON.stringify(allData)}

다음 항목을 포함해주세요:
## 파이프라인 요약
## 킥오프 전 결정 사항
## 핵심 가정 체크
## PRD 핵심 포인트
## 다음 단계
`;

    return provider.generate(prompt, systemPrompt);
  }
}
