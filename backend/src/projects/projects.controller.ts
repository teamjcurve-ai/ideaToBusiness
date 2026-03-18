import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async createProject(@Request() req, @Body() data: { title: string; description?: string }) {
    return this.projectsService.createProject(req.user.id, data);
  }

  @Get()
  async getProjects(@Request() req) {
    return this.projectsService.getProjects(req.user.id);
  }

  @Get(':id')
  async getProject(@Param('id') id: string, @Request() req) {
    return this.projectsService.getProject(id, req.user.id);
  }

  @Put(':id')
  async updateProject(
    @Param('id') id: string,
    @Request() req,
    @Body() data: { title?: string; description?: string; currentStep?: number },
  ) {
    return this.projectsService.updateProject(id, req.user.id, data);
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Request() req) {
    return this.projectsService.deleteProject(id, req.user.id);
  }

  @Get(':id/steps/:stepNumber')
  async getStep(
    @Param('id') id: string,
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Request() req,
  ) {
    return this.projectsService.getStep(id, stepNumber, req.user.id);
  }

  @Put(':id/steps/:stepNumber')
  async updateStep(
    @Param('id') id: string,
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Request() req,
    @Body() data: any,
  ) {
    return this.projectsService.updateStep(id, stepNumber, req.user.id, data);
  }
}
