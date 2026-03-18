import { create } from 'zustand';

interface Project {
  id: string;
  title: string;
  description?: string;
  currentStep: number;
  steps: Step[];
  createdAt: string;
  updatedAt: string;
}

interface Step {
  id: string;
  stepNumber: number;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  data?: any;
  content?: string;
  feedback?: string;
}

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  updateProject: (project: Project) => void;
  updateStep: (projectId: string, stepNumber: number, data: Partial<Step>) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  
  setProjects: (projects) => set({ projects }),
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  updateProject: (project) => {
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
      currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
    }));
  },
  
  updateStep: (projectId, stepNumber, data) => {
    set((state) => {
      const project = state.currentProject;
      if (!project || project.id !== projectId) return state;
      
      const updatedSteps = project.steps.map((step) =>
        step.stepNumber === stepNumber ? { ...step, ...data } : step
      );
      
      const updatedProject = { ...project, steps: updatedSteps };
      
      return {
        currentProject: updatedProject,
        projects: state.projects.map((p) => (p.id === projectId ? updatedProject : p)),
      };
    });
  },
}));
