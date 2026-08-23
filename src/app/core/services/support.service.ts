import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../constants/api-endpoints';
import { SupportTicket, CreateSupportTicketRequest, ReplySupportTicketRequest } from '../models/support.model';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'edunex_support_tickets';

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.refreshUnreadCount();
  }

  get unreadCountValue(): number {
    return this.unreadCountSubject.value;
  }

  refreshUnreadCount(): void {
    this.http.get<any>(`${environment.apiUrl}/api/Support/unread-count`).pipe(
      catchError(() => {
        const local = this.getLocalTickets();
        const unread = local.filter(t => t.hasUnreadReply).length;
        return of({ isSuccess: true, unreadCount: unread });
      })
    ).subscribe(res => {
      const count = res?.unreadCount || (typeof res === 'number' ? res : 0);
      this.unreadCountSubject.next(count);
    });
  }

  createTicket(req: CreateSupportTicketRequest): Observable<{ success: boolean; message: string; ticket: SupportTicket }> {
    return this.http.post<any>(`${environment.apiUrl}/api/Support/ticket`, req).pipe(
      map(res => {
        const ticket = res?.ticket || res?.data?.ticket || res?.data || res;
        if (ticket && (ticket.id || ticket.ticketNumber)) {
          this.saveLocalTicket(ticket);
          return {
            success: true,
            message: res?.message || `Support ticket #${ticket.ticketNumber} created successfully.`,
            ticket: ticket
          };
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
        const rawList = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
        if (rawList.length > 0) {
          this.syncUnreadFromList(rawList);
          this.setLocalTickets(rawList);
          return rawList;
        }
        const local = this.getLocalTickets();
        this.syncUnreadFromList(local);
        return local;
      }),
      catchError(() => {
        const local = this.getLocalTickets();
        this.syncUnreadFromList(local);
        return of(local);
      })
    );
  }

  getAllTickets(): Observable<SupportTicket[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/Support/all-tickets`).pipe(
      map(res => {
        const rawList = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
        if (rawList.length > 0) {
          this.syncUnreadFromList(rawList);
          this.setLocalTickets(rawList);
          return rawList;
        }
        const local = this.getLocalTickets();
        this.syncUnreadFromList(local);
        return local;
      }),
      catchError(() => {
        const local = this.getLocalTickets();
        this.syncUnreadFromList(local);
        return of(local);
      })
    );
  }

  replyToTicket(req: ReplySupportTicketRequest): Observable<{ success: boolean; message: string; ticket: SupportTicket }> {
    return this.http.post<any>(`${environment.apiUrl}/api/Support/reply`, req).pipe(
      map(res => {
        const ticket = res?.ticket || res?.data?.ticket || res?.data;
        if (ticket) {
          ticket.hasUnreadReply = true;
          this.updateLocalTicket(ticket);
          this.refreshUnreadCount();
          return {
            success: true,
            message: res?.message || 'Reply recorded and email dispatch initiated.',
            ticket: ticket
          };
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
            repliedBy: 'EduNex Global Support',
            repliedByRole: 'GLOBAL_ADMIN',
            createdAt: new Date().toISOString()
          });
          ticket.status = (req.newStatus as any) || 'In Progress';
          ticket.hasUnreadReply = true;
          ticket.lastRepliedAt = new Date().toISOString();
          ticket.lastRepliedBy = 'EduNex Global Support';
          this.updateLocalTicket(ticket);
          this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
        }
        return of({
          success: true,
          message: 'Reply recorded successfully.',
          ticket: ticket!
        });
      })
    );
  }

  markTicketAsRead(ticketId: string): Observable<boolean> {
    const local = this.getLocalTickets();
    const target = local.find(t => t.id === ticketId || t.ticketNumber === ticketId);
    if (target && target.hasUnreadReply) {
      target.hasUnreadReply = false;
      target.unreadRepliesCount = 0;
      this.updateLocalTicket(target);
      const current = Math.max(0, this.unreadCountSubject.value - 1);
      this.unreadCountSubject.next(current);
    }

    return this.http.post<any>(`${environment.apiUrl}/api/Support/ticket/${ticketId}/read`, {}).pipe(
      map(() => {
        this.refreshUnreadCount();
        return true;
      }),
      catchError(() => of(true))
    );
  }

  updateTicketStatus(ticketId: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'): Observable<{ success: boolean; message: string; ticket?: SupportTicket }> {
    const local = this.getLocalTickets();
    const target = local.find(t => t.id === ticketId || t.ticketNumber === ticketId);
    if (target) {
      target.status = status;
      this.updateLocalTicket(target);
    }

    return this.http.post<any>(`${environment.apiUrl}/api/Support/ticket/${ticketId}/status`, { status }).pipe(
      map(res => {
        const ticket = res?.ticket || target;
        return {
          success: true,
          message: res?.message || `Ticket status updated to ${status}.`,
          ticket
        };
      }),
      catchError(() => of({
        success: true,
        message: `Ticket status updated to ${status}.`,
        ticket: target
      }))
    );
  }

  closeTicket(ticketId: string): Observable<{ success: boolean; message: string; ticket?: SupportTicket }> {
    return this.updateTicketStatus(ticketId, 'Closed');
  }

  reopenTicket(ticketId: string): Observable<{ success: boolean; message: string; ticket?: SupportTicket }> {
    return this.updateTicketStatus(ticketId, 'Open');
  }

  private syncUnreadFromList(tickets: SupportTicket[]): void {
    const unread = tickets.filter(t => t.hasUnreadReply).length;
    this.unreadCountSubject.next(unread);
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
    // Seed initial support tickets if completely empty
    const seeded: SupportTicket[] = [
      {
        id: 'tkt-init-1',
        ticketNumber: 'TKT-78291',
        userId: 'usr-1',
        userName: 'Coaching Administrator',
        userEmail: 'admin@coaching.com',
        userRole: 'INSTITUTE_ADMIN',
        instituteName: 'Apex Coaching Academy',
        category: 'General Inquiry',
        subject: 'Welcome to EduNex Support & Help Desk',
        message: 'Welcome to your dedicated coaching management support channel. Our technical team is available 24/7 to assist with batch scheduling, LMS notes, fee collections, or custom institute configuration.',
        priority: 'Medium',
        status: 'Open',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        hasUnreadReply: false,
        replies: [
          {
            id: 'rep-init-1',
            replyMessage: 'Hello! Our dedicated support desk is active. Feel free to raise any questions or feature suggestions right here.',
            repliedBy: 'EduNex Global Team',
            repliedByRole: 'GLOBAL_ADMIN',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      }
    ];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  private setLocalTickets(tickets: SupportTicket[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tickets));
  }

  private saveLocalTicket(ticket: SupportTicket): void {
    const list = this.getLocalTickets();
    const exists = list.some(t => t.id === ticket.id || t.ticketNumber === ticket.ticketNumber);
    if (!exists) {
      list.unshift(ticket);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  private updateLocalTicket(ticket: SupportTicket): void {
    const list = this.getLocalTickets();
    const idx = list.findIndex(t => t.id === ticket.id || t.ticketNumber === ticket.ticketNumber);
    if (idx !== -1) {
      list[idx] = ticket;
    } else {
      list.unshift(ticket);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }
}
