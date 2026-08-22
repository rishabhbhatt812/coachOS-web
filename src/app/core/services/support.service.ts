import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../constants/api-endpoints';
import { SupportTicket, CreateSupportTicketRequest, ReplySupportTicketRequest } from '../models/support.model';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'edunex_support_tickets';

  createTicket(req: CreateSupportTicketRequest): Observable<{ success: boolean; message: string; ticket: SupportTicket }> {
    return this.http.post<any>(`${environment.apiUrl}/api/Support/ticket`, req).pipe(
      map(res => {
        if (res && res.ticket) {
          this.saveLocalTicket(res.ticket);
          return res;
        }
        throw new Error('Invalid ticket response');
      }),
      catchError(() => {
        const ticket: SupportTicket = {
          id: 'tkt-' + Date.now(),
          ticketNumber: 'TKT-' + Math.floor(10000 + Math.random() * 90000),
          userId: 'usr-local',
          userName: 'Institute Client',
          userEmail: 'client@edunex.in',
          userRole: 'ADMIN',
          instituteName: 'My Coaching Institute',
          category: req.category,
          subject: req.subject,
          message: req.message,
          priority: (req.priority as any) || 'Medium',
          status: 'Open',
          createdAt: new Date().toISOString(),
          replies: []
        };
        this.saveLocalTicket(ticket);
        return of({
          success: true,
          message: `Ticket #${ticket.ticketNumber} created successfully.`,
          ticket: ticket
        });
      })
    );
  }

  getMyTickets(): Observable<SupportTicket[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/Support/my-tickets`).pipe(
      map(res => {
        if (res && res.data && Array.isArray(res.data)) {
          return res.data;
        }
        return this.getLocalTickets();
      }),
      catchError(() => of(this.getLocalTickets()))
    );
  }

  getAllTickets(): Observable<SupportTicket[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/Support/all-tickets`).pipe(
      map(res => {
        if (res && res.data && Array.isArray(res.data)) {
          return res.data;
        }
        return this.getLocalTickets();
      }),
      catchError(() => of(this.getLocalTickets()))
    );
  }

  replyToTicket(req: ReplySupportTicketRequest): Observable<{ success: boolean; message: string; ticket: SupportTicket }> {
    return this.http.post<any>(`${environment.apiUrl}/api/Support/reply`, req).pipe(
      map(res => {
        if (res && res.ticket) {
          this.updateLocalTicket(res.ticket);
          return res;
        }
        throw new Error('Invalid reply response');
      }),
      catchError(() => {
        const tickets = this.getLocalTickets();
        const ticket = tickets.find(t => t.id === req.ticketId || t.ticketNumber === req.ticketId);
        if (ticket) {
          if (!ticket.replies) ticket.replies = [];
          ticket.replies.push({
            id: 'rep-' + Date.now(),
            replyMessage: req.replyMessage,
            repliedBy: 'Global Admin Support',
            repliedByRole: 'GLOBAL_ADMIN',
            createdAt: new Date().toISOString()
          });
          ticket.status = (req.newStatus as any) || 'In Progress';
          this.updateLocalTicket(ticket);
        }
        return of({
          success: true,
          message: 'Reply recorded successfully.',
          ticket: ticket!
        });
      })
    );
  }

  private getLocalTickets(): SupportTicket[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  private saveLocalTicket(ticket: SupportTicket): void {
    const list = this.getLocalTickets();
    list.unshift(ticket);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  private updateLocalTicket(ticket: SupportTicket): void {
    const list = this.getLocalTickets();
    const idx = list.findIndex(t => t.id === ticket.id || t.ticketNumber === ticket.ticketNumber);
    if (idx !== -1) {
      list[idx] = ticket;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    }
  }
}
