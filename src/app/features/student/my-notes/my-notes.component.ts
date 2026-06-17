import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StudentFacade } from '../../../core/facades/student.facade';

import { environment } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-my-notes',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './my-notes.component.html',
  styleUrl: './my-notes.component.scss'
})
export class MyNotesComponent implements OnInit {
  private studentFacade = inject(StudentFacade);

  notes$ = this.studentFacade.notes$;
  isLoading$ = this.studentFacade.isLoading$;

  ngOnInit() {
    this.studentFacade.loadNotes();
  }

  getFileIcon(fileType: string): string {
    const type = fileType ? fileType.toLowerCase() : '';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('doc') || type.includes('docx')) return 'description';
    if (type.includes('xls') || type.includes('xlsx')) return 'table_chart';
    if (type.includes('png') || type.includes('jpg') || type.includes('jpeg') || type.includes('gif')) return 'image';
    return 'insert_drive_file';
  }

  downloadFile(filePath: string) {
    if (!filePath) return;
    let url = filePath;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `${environment.apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    window.open(url, '_blank');
  }
}
