import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './file-upload.html',
  styleUrls: ['./file-upload.scss']
})
export class FileUploadComponent {
  @Input() allowedTypes: string[] = ['.pdf', '.docx', '.jpg', '.png'];
  @Input() maxSizeBytes: number = 10 * 1024 * 1024; // Default 10MB
  @Output() fileSelected = new EventEmitter<File | null>();

  selectedFile: File | null = null;
  errorMessage: string | null = null;
  isDragging = false;
  uploadProgress = 0; // For mock progress display if needed

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    this.errorMessage = null;

    // Validate size
    if (file.size > this.maxSizeBytes) {
      this.errorMessage = `File is too large. Maximum size is ${this.maxSizeBytes / (1024 * 1024)}MB.`;
      return;
    }

    // Validate extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (ext && !this.allowedTypes.includes(ext)) {
      this.errorMessage = `Invalid file type. Allowed types: ${this.allowedTypes.join(', ')}`;
      return;
    }

    this.selectedFile = file;
    this.fileSelected.emit(this.selectedFile);
  }

  removeFile() {
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.errorMessage = null;
    this.fileSelected.emit(null);
  }
}
