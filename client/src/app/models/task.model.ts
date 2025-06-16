export interface Task {
    _id: string;
    title: string;
    completed: boolean;
    editingBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }
  