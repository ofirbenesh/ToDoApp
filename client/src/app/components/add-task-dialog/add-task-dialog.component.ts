import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-add-task-dialog',
  templateUrl: './add-task-dialog.component.html',
  styleUrls: ['./add-task-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ]
})
export class AddTaskDialogComponent {
  taskTitle = new FormControl('', [Validators.required]);

  constructor(private dialogRef: MatDialogRef<AddTaskDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: { title?: string }) {
      if (data?.title) {
        this.taskTitle.setValue(data.title);
      }
    }

  createTask() {
    if (this.taskTitle.valid) {
      this.dialogRef.close(this.taskTitle.value);
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
