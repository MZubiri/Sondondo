export interface CreatePreferenceRequest {
  title: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
  bookingReference?: string;
  isDepositOnly?: boolean;
  paymentCategory?: 'Tour' | 'HotelRoom' | 'Combo';
  tourId?: number;
  roomId?: number;
}

export interface CreatePreferenceResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  publicKey: string;
  mode: 'live' | 'sandbox' | 'simulation';
  externalReference?: string;
}

export interface ProcessPaymentRequest {
  token: string;
  issuerId?: string;
  paymentMethodId: string;
  transactionAmount: number;
  installments: number;
  description: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
}

export interface ProcessPaymentResponse {
  id: number;
  status: string;
  statusDetail: string;
  dateApproved?: string;
  transactionAmount: number;
}
