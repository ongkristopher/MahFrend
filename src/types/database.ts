export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface LendingConfiguration {
  id: string;
  lender_id: string;
  total_loanable_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Borrower {
  id: string;
  lender_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface LoanEntry {
  id: string;
  lender_id: string;
  borrower_id: string;
  principal_amount: number;
  interest_rate: number;
  duration_months: number | null;
  total_amount: number;
  amount_paid: number;
  status: 'active' | 'paid' | 'overdue' | 'defaulted';
  due_date: string;
  created_at: string;
  updated_at: string;
  // Joined
  borrower?: Borrower;
}

export interface Payment {
  id: string;
  loan_id: string;
  lender_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
  // Joined
  loan?: LoanEntry;
}

export interface PaymentSchedule {
  id: string;
  loan_id: string;
  lender_id: string;
  borrower_id: string;
  due_date: string;
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
  // Joined
  loan?: LoanEntry;
  borrower?: Borrower;
}

export interface DashboardStats {
  active_borrowers: number;
  total_lent: number;
  available_to_lend: number;
  profit_or_loss: number;
}

export interface CalendarEvent {
  id: string;
  date: string;
  amount: number;
  borrower_name: string;
  loan_id: string;
  status: 'on-time' | 'approaching' | 'overdue';
}
