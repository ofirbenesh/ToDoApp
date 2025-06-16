import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddTaskDialogComponent } from '../add-task-dialog/add-task-dialog.component';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  imports: [
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatDialogModule
  ]
})

export class TaskListComponent implements OnInit {
  displayedColumns: string[] = ['title', 'completed', 'actions'];
  tasks: Task[] = [];
  userId = 'user_' + Math.random().toString(36).slice(2, 6);

  constructor(private taskService: TaskService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.taskService.tasks$.subscribe(tasks => this.tasks = tasks);
    this.taskService.fetchTasks();
  }

  openAddDialog(): void {
  const dialogRef = this.dialog.open(AddTaskDialogComponent);

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.taskService.addTask(result).subscribe();
    }
  }
);  
  }
  toggleCompleted(task: Task): void {
    const updated = { completed: !task.completed };
    this.taskService.updateTask(task._id, updated).subscribe();
  } 


  editTask(task: Task): void {
    // First, start the edit (lock the task)
    this.taskService.startEdit(task._id, this.userId).subscribe({
      next: () => {
        // Open the edit dialog
        const dialogRef = this.dialog.open(EditTaskDialogComponent, {
          data: task
        });
    
        dialogRef.afterClosed().subscribe(result => {
          // Always end the edit (unlock the task) when dialog closes
          this.taskService.endEdit(task._id).subscribe();
    
          // If there's a result and it's different from the original title, update the task
          if (result && result !== task.title) {
            this.taskService.updateTask(task._id, { title: result }).subscribe({
              next: (updatedTask) => {
              },
              error: (error) => {
                console.error('Error updating task:', error);
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Error starting edit:', error);
        // Handle the case where the task is already being edited
        if (error.status === 409) {
          alert('This task is currently being edited by another user. Please try again later.');
        }
      }
    });
  }
  
  

  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.deleteTask(task._id).subscribe();
    }
  }  
  
}


