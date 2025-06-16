import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { tap } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  private apiUrl = '/api/tasks';
  private socket!: Socket;

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined') {
      this.socket = io('http://localhost:4200', {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true
      });

      this.socket.on('connect', () => {
        this.socket.emit('client_ready', { message: 'Client is ready for events' });
      });

      this.socket.on('task_created', (task: Task) => {
        const currentTasks = this.tasksSubject.value;
        if (!currentTasks.find(t => t._id === task._id)) {
          this.tasksSubject.next([...currentTasks, task]);
        }
      });

      this.socket.on('task_updated', (updated: Task) => {
        const currentTasks = this.tasksSubject.value;
        const updatedList = currentTasks.map(t =>
          t._id === updated._id ? updated : t
        );
        this.tasksSubject.next(updatedList);
      });

      this.socket.on('task_deleted', (id: string) => {
        const filtered = this.tasksSubject.value.filter(t => t._id !== id);
        this.tasksSubject.next(filtered);
      });

      this.socket.on('task_locked', (locked: Task) => {
        const updated = this.tasksSubject.value.map(t =>
          t._id === locked._id ? locked : t
        );
        this.tasksSubject.next(updated);
      });

      this.socket.on('task_unlocked', (unlocked: Task) => {
        const updated = this.tasksSubject.value.map(t =>
          t._id === unlocked._id ? unlocked : t
        );
        this.tasksSubject.next(updated);
      });
    }
  }

  fetchTasks(): void {
    this.http.get<Task[]>(this.apiUrl).subscribe(tasks => this.tasksSubject.next(tasks));
  }

  addTask(title: string): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, { title }).pipe(
      tap(task => {
      })
    );
  }

  updateTask(id: string, data: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, data).pipe(
      tap(updated => {
      })
    );
  }  
  
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
      })
    );
  }

  startEdit(taskId: string, userId: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${taskId}/start-edit`, { userId });
  }

  endEdit(taskId: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${taskId}/end-edit`, {});
  }
}
