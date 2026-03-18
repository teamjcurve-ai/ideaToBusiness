import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(userId: string, data: { title: string; description?: string }) {
    // 프로젝트 생성 및 8단계 초기화
    const project = await this.prisma.project.create({
      data: {
        ...data,
        userId,
        steps: {
          create: [
            { stepNumber: 1, name: '입력', status: 'PENDING' },
            { stepNumber: 2, name: '시장 리서치', status: 'PENDING' },
            { stepNumber: 3, name: '고객 발견', status: 'PENDING' },
            { stepNumber: 4, name: '핵심 기능 선정', status: 'PENDING' },
            { stepNumber: 5, name: 'PRD 작성', status: 'PENDING' },
            { stepNumber: 6, name: '마케팅 전략', status: 'PENDING' },
            { stepNumber: 7, name: '사전 부검', status: 'PENDING' },
            { stepNumber: 8, name: '킥오프 준비', status: 'PENDING' },
          ],
        },
      },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    return project;
  }

  async getProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return project;
  }

  async updateProject(projectId: string, userId: string, data: { title?: string; description?: string; currentStep?: number }) {
    const project = await this.getProject(projectId, userId);

    return this.prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });
  }

  async deleteProject(projectId: string, userId: string) {
    await this.getProject(projectId, userId);

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { message: '프로젝트가 삭제되었습니다.' };
  }

  async getStep(projectId: string, stepNumber: number, userId: string) {
    await this.getProject(projectId, userId);

    const step = await this.prisma.step.findUnique({
      where: {
        projectId_stepNumber: {
          projectId,
          stepNumber,
        },
      },
    });

    if (!step) {
      throw new NotFoundException('단계를 찾을 수 없습니다.');
    }

    return step;
  }

  async updateStep(projectId: string, stepNumber: number, userId: string, data: any) {
    await this.getProject(projectId, userId);

    const step = await this.prisma.step.update({
      where: {
        projectId_stepNumber: {
          projectId,
          stepNumber,
        },
      },
      data,
    });

    return step;
  }
}
