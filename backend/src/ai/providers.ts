import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AiProvider {
  generate(prompt: string, systemPrompt?: string): Promise<string>;
}

@Injectable()
export class OpenAIProvider implements AiProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: any[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  }
}

@Injectable()
export class AnthropicProvider implements AiProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    
    return '';
  }
}

@Injectable()
export class GoogleProvider implements AiProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.0-flash-exp') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    
    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\n${prompt}` 
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }
}
