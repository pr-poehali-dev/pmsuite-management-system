import func2url from "../../func2url.json";

const PROJECTS_URL = func2url.projects;
const TASKS_URL = func2url.tasks;
const COMMENTS_URL = func2url.comments;

export interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  lead: string;
  deadline: string;
  priority: string;
  tasks_total: number;
  tasks_done: number;
  created_at?: string;
}

export interface Task {
  id: number;
  title: string;
  project: string;
  assignee: string;
  status: string;
  priority: string;
  due: string;
  created_at?: string;
}

export interface Comment {
  id: number;
  author: string;
  initials: string;
  project: string;
  task: string;
  text: string;
  time: string;
}

// Projects
export const getProjects = (): Promise<Project[]> =>
  fetch(PROJECTS_URL).then(r => r.json());

export const createProject = (data: Partial<Project>): Promise<{ id: number }> =>
  fetch(PROJECTS_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());

export const updateProject = (id: number, data: Partial<Project>): Promise<{ success: boolean }> =>
  fetch(`${PROJECTS_URL}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());

// Tasks
export const getTasks = (): Promise<Task[]> =>
  fetch(TASKS_URL).then(r => r.json());

export const createTask = (data: Partial<Task> & { project_name?: string; due_date?: string }): Promise<{ id: number }> =>
  fetch(TASKS_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());

export const updateTask = (id: number, data: Partial<Task> & { project_name?: string; due_date?: string }): Promise<{ success: boolean }> =>
  fetch(`${TASKS_URL}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());

// Comments
export const getComments = (): Promise<Comment[]> =>
  fetch(COMMENTS_URL).then(r => r.json());

export const createComment = (data: { text: string; author?: string; project?: string; task_name?: string }): Promise<{ id: number }> =>
  fetch(COMMENTS_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
