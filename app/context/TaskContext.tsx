'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  Project,
  Label,
  TaskFilter,
  TaskSort,
  TaskStatus,
  Priority,
  ViewMode,
  Subtask,
  Comment,
} from '../types';

// Sample data for demonstration
const createSampleData = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const labels: Label[] = [
    { id: 'label-1', name: 'Bug', color: '#ef4444', description: 'Bug fixes and issues' },
    { id: 'label-2', name: 'Feature', color: '#10b981', description: 'New features' },
    { id: 'label-3', name: 'Enhancement', color: '#3b82f6', description: 'Improvements' },
    { id: 'label-4', name: 'Documentation', color: '#8b5cf6', description: 'Docs updates' },
    { id: 'label-5', name: 'Urgent', color: '#f59e0b', description: 'Needs immediate attention' },
    { id: 'label-6', name: 'Research', color: '#ec4899', description: 'Research tasks' },
  ];

  const projects: Project[] = [
    {
      id: 'inbox',
      name: 'Inbox',
      description: 'Unorganized tasks',
      color: '#6366f1',
      icon: 'inbox',
      ownerId: 'user-1',
      memberIds: [],
      isArchived: false,
      isFavorite: false,
      defaultView: 'list',
      createdAt: now,
      updatedAt: now,
      position: 0,
      settings: {
        defaultPriority: 'medium',
        allowSubtasks: true,
        allowTimeTracking: true,
        allowRecurrence: true,
        showCompletedTasks: true,
      },
    },
    {
      id: 'project-1',
      name: 'Whisperr Ecosystem',
      description: 'Main development project for all Whisperr apps',
      color: '#10b981',
      icon: 'rocket',
      ownerId: 'user-1',
      memberIds: ['user-2', 'user-3'],
      isArchived: false,
      isFavorite: true,
      defaultView: 'board',
      createdAt: now,
      updatedAt: now,
      position: 1,
      settings: {
        defaultPriority: 'medium',
        allowSubtasks: true,
        allowTimeTracking: true,
        allowRecurrence: true,
        showCompletedTasks: true,
      },
    },
    {
      id: 'project-2',
      name: 'Personal',
      description: 'Personal tasks and goals',
      color: '#ec4899',
      icon: 'person',
      ownerId: 'user-1',
      memberIds: [],
      isArchived: false,
      isFavorite: false,
      defaultView: 'list',
      createdAt: now,
      updatedAt: now,
      position: 2,
      settings: {
        defaultPriority: 'low',
        allowSubtasks: true,
        allowTimeTracking: false,
        allowRecurrence: true,
        showCompletedTasks: false,
      },
    },
    {
      id: 'project-3',
      name: 'Learning',
      description: 'Courses, tutorials, and skill development',
      color: '#f59e0b',
      icon: 'school',
      ownerId: 'user-1',
      memberIds: [],
      isArchived: false,
      isFavorite: true,
      defaultView: 'timeline',
      createdAt: now,
      updatedAt: now,
      position: 3,
      settings: {
        defaultPriority: 'medium',
        allowSubtasks: true,
        allowTimeTracking: true,
        allowRecurrence: false,
        showCompletedTasks: true,
      },
    },
  ];

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Design WhisperrTask dashboard',
      description: 'Create the main dashboard layout with widgets for task overview, upcoming deadlines, and productivity stats.',
      status: 'in-progress',
      priority: 'high',
      projectId: 'project-1',
      labels: ['label-2', 'label-3'],
      subtasks: [
        { id: 'st-1', title: 'Create wireframes', completed: true, createdAt: now },
        { id: 'st-2', title: 'Design component library', completed: true, createdAt: now },
        { id: 'st-3', title: 'Implement responsive layout', completed: false, createdAt: now },
        { id: 'st-4', title: 'Add dark mode support', completed: false, createdAt: now },
      ],
      comments: [
        {
          id: 'comment-1',
          content: 'Looking great so far! The color scheme is perfect.',
          authorId: 'user-2',
          authorName: 'Sarah Chen',
          createdAt: yesterday,
        },
      ],
      attachments: [],
      reminders: [],
      timeEntries: [],
      assigneeIds: ['user-1'],
      creatorId: 'user-1',
      dueDate: nextWeek,
      startDate: now,
      estimatedTime: 480,
      createdAt: now,
      updatedAt: now,
      position: 0,
      isArchived: false,
    },
    {
      id: 'task-2',
      title: 'Implement task filtering and sorting',
      description: 'Add ability to filter tasks by status, priority, labels, and due date. Include sorting options.',
      status: 'todo',
      priority: 'high',
      projectId: 'project-1',
      labels: ['label-2'],
      subtasks: [],
      comments: [],
      attachments: [],
      reminders: [],
      timeEntries: [],
      assigneeIds: ['user-1'],
      creatorId: 'user-1',
      dueDate: tomorrow,
      createdAt: now,
      updatedAt: now,
      position: 1,
      isArchived: false,
    },
    {
      id: 'task-3',
      title: 'Fix login authentication bug',
      description: 'Users are getting logged out unexpectedly after 5 minutes. Need to investigate token refresh.',
      status: 'todo',
      priority: 'urgent',
      projectId: 'project-1',
      labels: ['label-1', 'label-5'],
      subtasks: [],
      comments: [],
      attachments: [],
      reminders: [],
      timeEntries: [],
      assigneeIds: ['user-1', 'user-3'],
      creatorId: 'user-2',
      dueDate: now,
      createdAt: yesterday,
      updatedAt: now,
      position: 2,
      isArchived: false,
    },
    {
      id: 'task-4',
      title: 'Write API documentation',
      description: 'Document all REST API endpoints with examples and response schemas.',
      status: 'todo',
      priority: 'medium',
      projectId: 'project-1',
      labels: ['label-4'],
      subtasks: [],
      comments: [],
      attachments: [],
      reminders: [],
      timeEntries: [],
      assigneeIds: ['user-1'],
      creatorId: 'user-1',
      dueDate: nextWeek,
      createdAt: now,
      updatedAt: now,
      position: 3,
      isArchived: false,
    },
    {
      id: 'task-5',
      title: 'Plan weekend hiking trip',
      description: 'Research trails, check weather, pack essentials.',
      status: 'todo',
      priority: 'low',
      projectId: 'project-2',
      labels: [],
      subtasks: [
        { id: 'st-5', title: 'Choose trail', completed: true, createdAt: now },
        { id: 'st-6', title: 'Check weather forecast', completed: false, createdAt: now },
        { id: 'st-7', title: 'Pack gear', completed: false, createdAt: now },
      ],
      comments: [],
      attachments: [],
      reminders: [],
      timeEntries: [],
      assigneeIds: ['user-1'],
      creatorId: 'user-1',
      dueDate: nextWeek,
      createdAt: now,
      updatedAt: now,
      position: 0,
      isArchived: false,
    },
    {
      id: 'task-6',
      title: 'Complete React course',
      description: 'Finish the advanced React patterns course on Udemy.',
      status: 'in-progress',
      priority: 'medium',
      projectId: 'project-3',
      labels: ['label-6'],
      subtasks: [
        { id: 'st-8', title: 'Module 1: Hooks Deep Dive', completed: true, createdAt: now },
        { id: 'st-9', title: 'Module 2: Context API', completed: true, createdAt: now },
        { id: 'st-10', title: 'Module 3: Performance', completed: false, createdAt: now },
        { id: 'st-11', title: 'Module 4: Testing', completed: false, createdAt: now },
      ],
      comments: [],
      attachments: [],
      reminders: [],
      timeEntries: [],
      assigneeIds: ['user-1'],
      creatorId: 'user-1',
      dueDate: nextWeek,
      estimatedTime: 600,
      createdAt: yesterday,
      updatedAt: now,
      position: 0,
      isArchived: false,
    },
    {
      id: 'task-7',
      title: 'Review pull request #42',
      description: 'Review and provide feedback on the new notification system implementation.',
      status: 'blocked',
      priority: 'medium',
      projectId: 'project-1',
      labels: ['label-3'],
      subtasks: [],
      comments: [
        {
          id: 'comment-2',
          content: 'Waiting for the author to address the previous comments.',
          authorId: 'user-1',
          authorName: 'You',
          createdAt: now,
        },
      ],
      attachments: [],
      reminders: [],
      timeEntries: [],
      assigneeIds: ['user-1'],
      creatorId: 'user-2',
      createdAt: yesterday,
      updatedAt: now,
      position: 4,
      isArchived: false,
    },
    {
      id: 'task-8',
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment.',
      status: 'done',
      priority: 'high',
      projectId: 'project-1',
      labels: ['label-2'],
      subtasks: [],
      comments: [],
      attachments: [],
      reminders: [],
      timeEntries: [],
      assigneeIds: ['user-1'],
      creatorId: 'user-1',
      completedAt: yesterday,
      createdAt: yesterday,
      updatedAt: yesterday,
      position: 5,
      isArchived: false,
    },
    {
      id: 'task-9',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, vegetables, fruits',
      status: 'todo',
      priority: 'low',
      projectId: 'project-2',
      labels: [],
      subtasks: [],
      comments: [],
      attachments: [],
      reminders: [],
      timeEntries: [],
      assigneeIds: ['user-1'],
      creatorId: 'user-1',
      dueDate: tomorrow,
      createdAt: now,
      updatedAt: now,
      position: 1,
      isArchived: false,
    },
    {
      id: 'task-10',
      title: 'Research TypeScript 5.0 features',
      description: 'Explore new decorators, const type parameters, and other improvements.',
      status: 'todo',
      priority: 'low',
      projectId: 'project-3',
      labels: ['label-6'],
      subtasks: [],
      comments: [],
      attachments: [],
      reminders: [],
      timeEntries: [],
      assigneeIds: ['user-1'],
      creatorId: 'user-1',
      createdAt: now,
      updatedAt: now,
      position: 1,
      isArchived: false,
    },
  ];

  return { tasks, projects, labels };
};

// State
interface TaskState {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  selectedTaskId: string | null;
  selectedProjectId: string | null;
  filter: TaskFilter;
  sort: TaskSort;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  taskDialogOpen: boolean;
  searchQuery: string;
}

const initialState: TaskState = {
  ...createSampleData(),
  selectedTaskId: null,
  selectedProjectId: null,
  filter: {
    showCompleted: true,
    showArchived: false,
  },
  sort: {
    field: 'dueDate',
    direction: 'asc',
  },
  viewMode: 'list',
  isLoading: false,
  error: null,
  sidebarOpen: true,
  taskDialogOpen: false,
  searchQuery: '',
};

// Actions
type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'SELECT_TASK'; payload: string | null }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SELECT_PROJECT'; payload: string | null }
  | { type: 'ADD_LABEL'; payload: Label }
  | { type: 'UPDATE_LABEL'; payload: { id: string; updates: Partial<Label> } }
  | { type: 'DELETE_LABEL'; payload: string }
  | { type: 'SET_FILTER'; payload: TaskFilter }
  | { type: 'SET_SORT'; payload: TaskSort }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_TASK_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_SUBTASK'; payload: { taskId: string; subtask: Subtask } }
  | { type: 'UPDATE_SUBTASK'; payload: { taskId: string; subtaskId: string; updates: Partial<Subtask> } }
  | { type: 'DELETE_SUBTASK'; payload: { taskId: string; subtaskId: string } }
  | { type: 'TOGGLE_SUBTASK'; payload: { taskId: string; subtaskId: string } }
  | { type: 'ADD_COMMENT'; payload: { taskId: string; comment: Comment } }
  | { type: 'REORDER_TASKS'; payload: { taskIds: string[]; projectId?: string } };

// Reducer
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        selectedTaskId: state.selectedTaskId === action.payload ? null : state.selectedTaskId,
      };

    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? {
                ...task,
                status: task.status === 'done' ? 'todo' : 'done',
                completedAt: task.status === 'done' ? undefined : new Date(),
                updatedAt: new Date(),
              }
            : task
        ),
      };

    case 'SELECT_TASK':
      return { ...state, selectedTaskId: action.payload };

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.updates, updatedAt: new Date() }
            : project
        ),
      };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        tasks: state.tasks.map(task =>
          task.projectId === action.payload ? { ...task, projectId: 'inbox' } : task
        ),
        selectedProjectId: state.selectedProjectId === action.payload ? null : state.selectedProjectId,
      };

    case 'SELECT_PROJECT':
      return { ...state, selectedProjectId: action.payload };

    case 'ADD_LABEL':
      return { ...state, labels: [...state.labels, action.payload] };

    case 'UPDATE_LABEL':
      return {
        ...state,
        labels: state.labels.map(label =>
          label.id === action.payload.id ? { ...label, ...action.payload.updates } : label
        ),
      };

    case 'DELETE_LABEL':
      return {
        ...state,
        labels: state.labels.filter(label => label.id !== action.payload),
        tasks: state.tasks.map(task => ({
          ...task,
          labels: task.labels.filter(l => l !== action.payload),
        })),
      };

    case 'SET_FILTER':
      return { ...state, filter: action.payload };

    case 'SET_SORT':
      return { ...state, sort: action.payload };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };

    case 'SET_TASK_DIALOG_OPEN':
      return { ...state, taskDialogOpen: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'ADD_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, subtasks: [...task.subtasks, action.payload.subtask], updatedAt: new Date() }
            : task
        ),
      };

    case 'UPDATE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: task.subtasks.map(st =>
                  st.id === action.payload.subtaskId ? { ...st, ...action.payload.updates } : st
                ),
                updatedAt: new Date(),
              }
            : task
        ),
      };

    case 'DELETE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: task.subtasks.filter(st => st.id !== action.payload.subtaskId),
                updatedAt: new Date(),
              }
            : task
        ),
      };

    case 'TOGGLE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: task.subtasks.map(st =>
                  st.id === action.payload.subtaskId
                    ? { ...st, completed: !st.completed, completedAt: !st.completed ? new Date() : undefined }
                    : st
                ),
                updatedAt: new Date(),
              }
            : task
        ),
      };

    case 'ADD_COMMENT':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, comments: [...task.comments, action.payload.comment], updatedAt: new Date() }
            : task
        ),
      };

    case 'REORDER_TASKS':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          const newPosition = action.payload.taskIds.indexOf(task.id);
          if (newPosition !== -1) {
            return { ...task, position: newPosition };
          }
          return task;
        }),
      };

    default:
      return state;
  }
}

// Context
interface TaskContextType extends TaskState {
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  selectTask: (id: string | null) => void;
  // Subtask actions
  addSubtask: (taskId: string, title: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  // Comment actions
  addComment: (taskId: string, content: string) => void;
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  // Label actions
  addLabel: (label: Omit<Label, 'id'>) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;
  // Filter and sort actions
  setFilter: (filter: TaskFilter) => void;
  setSort: (sort: TaskSort) => void;
  setViewMode: (mode: ViewMode) => void;
  // UI actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTaskDialogOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  // Computed values
  getFilteredTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTaskStats: () => { total: number; completed: number; overdue: number; dueToday: number };
  getSelectedTask: () => Task | null;
  getSelectedProject: () => Project | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

// Provider
interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Task actions
  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
      const newTask: Task = {
        ...task,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        position: state.tasks.length,
      };
      dispatch({ type: 'ADD_TASK', payload: newTask });
    },
    [state.tasks.length]
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const completeTask = useCallback((id: string) => {
    dispatch({ type: 'COMPLETE_TASK', payload: id });
  }, []);

  const selectTask = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_TASK', payload: id });
  }, []);

  // Subtask actions
  const addSubtask = useCallback((taskId: string, title: string) => {
    const subtask: Subtask = {
      id: uuidv4(),
      title,
      completed: false,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_SUBTASK', payload: { taskId, subtask } });
  }, []);

  const updateSubtask = useCallback((taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    dispatch({ type: 'UPDATE_SUBTASK', payload: { taskId, subtaskId, updates } });
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    dispatch({ type: 'DELETE_SUBTASK', payload: { taskId, subtaskId } });
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    dispatch({ type: 'TOGGLE_SUBTASK', payload: { taskId, subtaskId } });
  }, []);

  // Comment actions
  const addComment = useCallback((taskId: string, content: string) => {
    const comment: Comment = {
      id: uuidv4(),
      content,
      authorId: 'user-1',
      authorName: 'You',
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_COMMENT', payload: { taskId, comment } });
  }, []);

  // Project actions
  const addProject = useCallback(
    (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
      const newProject: Project = {
        ...project,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        position: state.projects.length,
      };
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    },
    [state.projects.length]
  );

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } });
  }, []);

  const deleteProject = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
  }, []);

  const selectProject = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_PROJECT', payload: id });
  }, []);

  // Label actions
  const addLabel = useCallback((label: Omit<Label, 'id'>) => {
    const newLabel: Label = {
      ...label,
      id: uuidv4(),
    };
    dispatch({ type: 'ADD_LABEL', payload: newLabel });
  }, []);

  const updateLabel = useCallback((id: string, updates: Partial<Label>) => {
    dispatch({ type: 'UPDATE_LABEL', payload: { id, updates } });
  }, []);

  const deleteLabel = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LABEL', payload: id });
  }, []);

  // Filter and sort
  const setFilter = useCallback((filter: TaskFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const setSort = useCallback((sort: TaskSort) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  // UI
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  }, []);

  const setTaskDialogOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_TASK_DIALOG_OPEN', payload: open });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  // Computed values
  const getFilteredTasks = useCallback(() => {
    let filtered = [...state.tasks];

    // Apply filters
    if (state.filter.status?.length) {
      filtered = filtered.filter(t => state.filter.status!.includes(t.status));
    }
    if (state.filter.priority?.length) {
      filtered = filtered.filter(t => state.filter.priority!.includes(t.priority));
    }
    if (state.filter.projectId !== undefined) {
      filtered = filtered.filter(t => t.projectId === state.filter.projectId);
    }
    if (state.filter.labels?.length) {
      filtered = filtered.filter(t => t.labels.some(l => state.filter.labels!.includes(l)));
    }
    if (!state.filter.showCompleted) {
      filtered = filtered.filter(t => t.status !== 'done');
    }
    if (!state.filter.showArchived) {
      filtered = filtered.filter(t => !t.isArchived);
    }
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const { field, direction } = state.sort;
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (field) {
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          const statusOrder = { todo: 0, 'in-progress': 1, blocked: 2, done: 3, cancelled: 4 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'position':
          comparison = a.position - b.position;
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.tasks, state.filter, state.sort, state.searchQuery]);

  const getTasksByProject = useCallback(
    (projectId: string) => {
      return state.tasks.filter(t => t.projectId === projectId && !t.isArchived);
    },
    [state.tasks]
  );

  const getTaskStats = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeTasks = state.tasks.filter(t => !t.isArchived);
    const completed = activeTasks.filter(t => t.status === 'done').length;
    const overdue = activeTasks.filter(
      t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;
    const dueToday = activeTasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      const due = new Date(t.dueDate);
      return due >= today && due < tomorrow;
    }).length;

    return {
      total: activeTasks.length,
      completed,
      overdue,
      dueToday,
    };
  }, [state.tasks]);

  const getSelectedTask = useCallback(() => {
    return state.tasks.find(t => t.id === state.selectedTaskId) || null;
  }, [state.tasks, state.selectedTaskId]);

  const getSelectedProject = useCallback(() => {
    return state.projects.find(p => p.id === state.selectedProjectId) || null;
  }, [state.projects, state.selectedProjectId]);

  const value: TaskContextType = {
    ...state,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    selectTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    addComment,
    addProject,
    updateProject,
    deleteProject,
    selectProject,
    addLabel,
    updateLabel,
    deleteLabel,
    setFilter,
    setSort,
    setViewMode,
    toggleSidebar,
    setSidebarOpen,
    setTaskDialogOpen,
    setSearchQuery,
    getFilteredTasks,
    getTasksByProject,
    getTaskStats,
    getSelectedTask,
    getSelectedProject,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
