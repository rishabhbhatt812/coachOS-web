import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
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
export class AdminSupportComponent implements OnInit, OnDestroy {
  private supportService = inject(SupportService);
  private authFacade = inject(AuthFacade);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

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

  private authSub?: Subscription;

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
    this.initNewTicketForm();

    this.authSub = this.authFacade.currentUser$.subscribe(u => {
      const role = (u?.rawRole || u?.role || '').toUpperCase();
      const nextIsGlobal = role.includes('SUPER') || role.includes('GLOBAL') || role.includes('ADMIN');
      const roleChanged = this.isGlobalAdmin !== nextIsGlobal;
      this.isGlobalAdmin = nextIsGlobal;

      if (this.tickets.length === 0 || roleChanged) {
        this.loadTickets(this.tickets.length === 0);
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  trackByTicketId(index: number, item: SupportTicket): string {
    return item.id || item.ticketNumber || index.toString();
  }

  initNewTicketForm(): void {
    this.newTicketForm = this.fb.group({
      category: ['General Inquiry', Validators.required],
      priority: ['Medium', Validators.required],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadTickets(showLoader: boolean = true): void {
    if (showLoader && this.tickets.length === 0) {
      this.isLoading = true;
    }

    const req = this.isGlobalAdmin 
      ? this.supportService.getAllTickets() 
      : this.supportService.getMyTickets();

    req.subscribe({
      next: (data) => {
        this.tickets = Array.isArray(data) ? data : [];
        this.applyFilter();
        if (this.selectedTicket) {
          this.selectedTicket = this.tickets.find(t => t.id === this.selectedTicket?.id || t.ticketNumber === this.selectedTicket?.ticketNumber) || this.tickets[0] || null;
        } else if (this.filteredTickets.length > 0) {
          this.selectTicket(this.filteredTickets[0]);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setFilter(filter: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'): void {
    this.activeFilter = filter;
    this.applyFilter();
    if (this.filteredTickets.length > 0 && (!this.selectedTicket || !this.filteredTickets.some(t => t.id === this.selectedTicket?.id))) {
      this.selectTicket(this.filteredTickets[0]);
    }
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
        t.ticketNumber?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.userName?.toLowerCase().includes(q) ||
        t.instituteName?.toLowerCase().includes(q)
      );
    }

    this.filteredTickets = list;
    this.cdr.detectChanges();
  }

  selectTicket(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.replyMessage = '';
    this.replyStatus = ticket.status === 'Open' ? 'In Progress' : 'Resolved';

    // If ticket has unread reply, mark as read
    if (ticket.hasUnreadReply) {
      ticket.hasUnreadReply = false;
      ticket.unreadRepliesCount = 0;
      this.supportService.markTicketAsRead(ticket.id).subscribe();
    }
    this.cdr.detectChanges();
  }

  openNewTicketModal(): void {
    this.newTicketForm.reset({
      category: 'General Inquiry',
      priority: 'Medium'
    });
    this.showNewTicketModal = true;
    this.cdr.detectChanges();
  }

  closeNewTicketModal(): void {
    this.showNewTicketModal = false;
    this.cdr.detectChanges();
  }

  submitNewTicket(): void {
    if (this.newTicketForm.invalid) {
      this.newTicketForm.markAllAsTouched();
      return;
    }

    this.isSubmittingTicket = true;
    this.cdr.detectChanges();

    this.supportService.createTicket(this.newTicketForm.value).subscribe({
      next: (res) => {
        this.isSubmittingTicket = false;
        this.closeNewTicketModal();
        this.snackBar.open(`✓ Support Ticket #${res.ticket.ticketNumber} created! Email confirmation dispatched.`, 'Dismiss', {
          duration: 4500,
          panelClass: ['success-snackbar']
        });
        this.loadTickets(false);
        this.selectTicket(res.ticket);
      },
      error: () => {
        this.isSubmittingTicket = false;
        this.snackBar.open('Failed to create ticket. Please retry.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  sendReply(): void {
    if (!this.replyMessage.trim() || !this.selectedTicket) {
      return;
    }

    this.isSendingReply = true;
    this.cdr.detectChanges();

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
        this.loadTickets(false);
      },
      error: () => {
        this.isSendingReply = false;
        this.snackBar.open('Failed to send reply. Please retry.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  closeSelectedTicket(): void {
    if (!this.selectedTicket) return;
    const ticketNum = this.selectedTicket.ticketNumber;
    this.supportService.closeTicket(this.selectedTicket.id).subscribe({
      next: () => {
        if (this.selectedTicket) {
          this.selectedTicket.status = 'Closed';
        }
        this.snackBar.open(`✓ Ticket #${ticketNum} marked as Closed.`, 'Dismiss', { duration: 3000 });
        this.loadTickets(false);
      }
    });
  }

  markSelectedAsResolved(): void {
    if (!this.selectedTicket) return;
    const ticketNum = this.selectedTicket.ticketNumber;
    this.supportService.updateTicketStatus(this.selectedTicket.id, 'Resolved').subscribe({
      next: () => {
        if (this.selectedTicket) {
          this.selectedTicket.status = 'Resolved';
        }
        this.snackBar.open(`✓ Ticket #${ticketNum} marked as Resolved.`, 'Dismiss', { duration: 3000 });
        this.loadTickets(false);
      }
    });
  }

  reopenSelectedTicket(): void {
    if (!this.selectedTicket) return;
    const ticketNum = this.selectedTicket.ticketNumber;
    this.supportService.reopenTicket(this.selectedTicket.id).subscribe({
      next: () => {
        if (this.selectedTicket) {
          this.selectedTicket.status = 'Open';
        }
        this.snackBar.open(`✓ Ticket #${ticketNum} reopened.`, 'Dismiss', { duration: 3000 });
        this.loadTickets(false);
      }
    });
  }
}
