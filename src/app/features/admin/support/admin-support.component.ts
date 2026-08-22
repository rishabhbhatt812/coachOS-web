import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupportService } from '../../../core/services/support.service';
import { SupportTicket } from '../../../core/models/support.model';
import { AuthFacade } from '../../../core/facades/auth.facade';

@Component({
  selector: 'app-admin-support',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-support.component.html',
  styleUrls: ['./admin-support.component.scss']
})
export class AdminSupportComponent implements OnInit {
  private supportService = inject(SupportService);
  private authFacade = inject(AuthFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  currentUser$ = this.authFacade.currentUser$;
  isGlobalAdmin = false;

  tickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  selectedTicket: SupportTicket | null = null;
  isLoading = false;

  activeFilter: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' = 'ALL';
  searchQuery = '';

  // New Ticket Modal
  showNewTicketModal = false;
  newTicketForm!: FormGroup;
  isSubmittingTicket = false;

  // Reply Form
  replyMessage = '';
  replyStatus = 'Resolved';
  isSendingReply = false;

  categories = [
    'General Inquiry',
    'Technical Bug / Error',
    'Billing & Subscriptions',
    'Feature Request & Suggestion',
    'Student Portal Issue',
    'Attendance & Exam Modules'
  ];

  priorities = ['Low', 'Medium', 'High', 'Critical'];

  ngOnInit(): void {
    this.authFacade.currentUser$.subscribe(u => {
      const role = u?.role?.toUpperCase();
      this.isGlobalAdmin = role === 'GLOBAL_ADMIN' || role === 'SUPER_ADMIN';
      this.loadTickets();
    });

    this.initNewTicketForm();
  }

  initNewTicketForm(): void {
    this.newTicketForm = this.fb.group({
      category: ['General Inquiry', Validators.required],
      priority: ['Medium', Validators.required],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadTickets(): void {
    this.isLoading = true;
    const req = this.isGlobalAdmin 
      ? this.supportService.getAllTickets() 
      : this.supportService.getMyTickets();

    req.subscribe({
      next: (data) => {
        this.tickets = data;
        this.applyFilter();
        if (this.selectedTicket) {
          this.selectedTicket = this.tickets.find(t => t.id === this.selectedTicket?.id) || null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  setFilter(filter: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let list = [...this.tickets];

    if (this.activeFilter === 'OPEN') {
      list = list.filter(t => t.status === 'Open');
    } else if (this.activeFilter === 'IN_PROGRESS') {
      list = list.filter(t => t.status === 'In Progress');
    } else if (this.activeFilter === 'RESOLVED') {
      list = list.filter(t => t.status === 'Resolved' || t.status === 'Closed');
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t => 
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.instituteName.toLowerCase().includes(q)
      );
    }

    this.filteredTickets = list;
  }

  selectTicket(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.replyMessage = '';
    this.replyStatus = ticket.status === 'Open' ? 'In Progress' : 'Resolved';
  }

  openNewTicketModal(): void {
    this.newTicketForm.reset({
      category: 'General Inquiry',
      priority: 'Medium'
    });
    this.showNewTicketModal = true;
  }

  closeNewTicketModal(): void {
    this.showNewTicketModal = false;
  }

  submitNewTicket(): void {
    if (this.newTicketForm.invalid) {
      this.newTicketForm.markAllAsTouched();
      return;
    }

    this.isSubmittingTicket = true;
    this.supportService.createTicket(this.newTicketForm.value).subscribe({
      next: (res) => {
        this.isSubmittingTicket = false;
        this.closeNewTicketModal();
        this.snackBar.open(`✓ Support Ticket #${res.ticket.ticketNumber} created! Email alert dispatched.`, 'Dismiss', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        this.loadTickets();
        this.selectTicket(res.ticket);
      },
      error: () => {
        this.isSubmittingTicket = false;
        this.snackBar.open('Failed to create ticket. Please retry.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  sendReply(): void {
    if (!this.replyMessage.trim() || !this.selectedTicket) {
      return;
    }

    this.isSendingReply = true;
    this.supportService.replyToTicket({
      ticketId: this.selectedTicket.id,
      replyMessage: this.replyMessage.trim(),
      newStatus: this.replyStatus
    }).subscribe({
      next: (res) => {
        this.isSendingReply = false;
        this.replyMessage = '';
        this.snackBar.open('✓ Reply sent and notification email dispatched to client.', 'Dismiss', {
          duration: 3500,
          panelClass: ['success-snackbar']
        });
        this.loadTickets();
      },
      error: () => {
        this.isSendingReply = false;
        this.snackBar.open('Failed to send reply. Please retry.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
