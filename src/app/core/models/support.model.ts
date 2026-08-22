export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  instituteName: string;
  category: string;
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  replies?: SupportTicketReply[];
}

export interface SupportTicketReply {
  id: string;
  replyMessage: string;
  repliedBy: string;
  repliedByRole: string;
  createdAt: string;
}

export interface CreateSupportTicketRequest {
  category: string;
  subject: string;
  message: string;
  priority?: string;
}

export interface ReplySupportTicketRequest {
  ticketId: string;
  replyMessage: string;
  newStatus?: string;
}
