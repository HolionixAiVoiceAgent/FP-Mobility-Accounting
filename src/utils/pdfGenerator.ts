import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface CompanySettings {
  company_name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  vat_rate?: number;
  currency?: string;
  logo_url?: string;
  bank_account?: string;
}

interface Vehicle {
  make: string;
  model: string;
  year: number;
  vin: string;
  mileage?: number;
  color?: string;
  expected_sale_price?: number;
}

interface QuotationData {
  vehicle: {
    make: string;
    model: string;
    year: number;
    vin: string;
    mileage?: number;
    color?: string;
  };
  quotedPrice: number;
  validityDays: number;
  notes?: string;
  includeVat: boolean;
}

interface Sale {
  sale_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vin: string;
  sale_price: number;
  sale_date: string;
  customer_id: string;
  payment_status: string;
  payment_method?: string;
}

const fetchCompanySettings = async (): Promise<CompanySettings> => {
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) throw error;
  
  return {
    company_name: data?.company_name || 'FP Mobility GmbH',
    address: data?.address,
    phone: data?.phone,
    email: data?.email,
    tax_id: data?.tax_id,
    vat_rate: data?.vat_rate || 19,
    currency: data?.currency || 'EUR',
    logo_url: data?.logo_url
  };
};

export const generateQuotationPDF = async (quotationData: QuotationData) => {
  const settings = await fetchCompanySettings();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  let yPos = 20;

  // Add logo if available
  if (settings.logo_url) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = settings.logo_url;
      await new Promise((resolve) => { img.onload = resolve; });
      doc.addImage(img, 'PNG', 20, yPos, 50, 20);
      yPos = 45;
    } catch (e) {
      console.error('Failed to load logo', e);
    }
  }
  
  // Company Header
  doc.setFontSize(20);
  doc.text(settings.company_name, settings.logo_url ? 80 : 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  if (settings.address) {
    doc.text(settings.address, settings.logo_url ? 80 : 20, yPos);
    yPos += 5;
  }
  if (settings.phone) {
    doc.text(`Tel: ${settings.phone}`, settings.logo_url ? 80 : 20, yPos);
    yPos += 5;
  }
  if (settings.email) {
    doc.text(`Email: ${settings.email}`, settings.logo_url ? 80 : 20, yPos);
    yPos += 5;
  }
  
  // Title
  yPos += 10;
  doc.setFontSize(18);
  doc.text('VEHICLE QUOTATION', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
  doc.text(`Valid for: ${quotationData.validityDays} days`, 120, yPos);
  
  // Vehicle Details
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Vehicle Details:', 20, yPos);
  doc.setFont(undefined, 'normal');
  
  yPos += 10;
  doc.setFontSize(10);
  doc.text(`Make: ${quotationData.vehicle.make}`, 20, yPos);
  doc.text(`Model: ${quotationData.vehicle.model}`, 100, yPos);
  yPos += 7;
  doc.text(`Year: ${quotationData.vehicle.year}`, 20, yPos);
  doc.text(`VIN: ${quotationData.vehicle.vin}`, 100, yPos);
  yPos += 7;
  if (quotationData.vehicle.mileage) {
    doc.text(`Mileage: ${quotationData.vehicle.mileage.toLocaleString()} km`, 20, yPos);
    yPos += 7;
  }
  if (quotationData.vehicle.color) {
    doc.text(`Color: ${quotationData.vehicle.color}`, 20, yPos);
    yPos += 7;
  }
  
  // Price Details
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Price Details:', 20, yPos);
  doc.setFont(undefined, 'normal');
  
  yPos += 10;
  doc.setFontSize(10);
  const currency = settings.currency || 'EUR';
  const price = quotationData.quotedPrice;
  
  if (quotationData.includeVat) {
    const vatRate = settings.vat_rate || 19;
    const vat = (price * vatRate) / 100;
    const totalPrice = price + vat;
    
    doc.text(`Net Price: ${price.toLocaleString()} ${currency}`, 20, yPos);
    yPos += 7;
    doc.text(`VAT (${vatRate}%): ${vat.toFixed(2)} ${currency}`, 20, yPos);
    yPos += 7;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Price: ${totalPrice.toLocaleString()} ${currency}`, 20, yPos);
    doc.setFont(undefined, 'normal');
  } else {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Price: ${price.toLocaleString()} ${currency}`, 20, yPos);
    doc.setFont(undefined, 'normal');
  }
  
  // Notes
  if (quotationData.notes) {
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Special Terms:', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 7;
    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(quotationData.notes, pageWidth - 40);
    doc.text(splitNotes, 20, yPos);
  }
  
  // Bank Information
  if (settings.bank_account) {
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Details:', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 7;
    doc.setFontSize(10);
    doc.text(`Bank Account: ${settings.bank_account}`, 20, yPos);
    yPos += 5;
    doc.text(`Beneficiary: ${settings.company_name}`, 20, yPos);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.text(`This quotation is valid for ${quotationData.validityDays} days from the date of issue.`, pageWidth / 2, 270, { align: 'center' });
  if (settings.tax_id) {
    doc.text(`Tax ID: ${settings.tax_id}`, pageWidth / 2, 280, { align: 'center' });
  }
  
  doc.save(`quotation-${quotationData.vehicle.vin}-${Date.now()}.pdf`);
};

export const generateInvoicePDF = async (sale: Sale, customer: any) => {
  const settings = await fetchCompanySettings();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  let yPos = 20;

  // Add logo if available
  if (settings.logo_url) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = settings.logo_url;
      await new Promise((resolve) => { img.onload = resolve; });
      doc.addImage(img, 'PNG', 20, yPos, 50, 20);
      yPos = 45;
    } catch (e) {
      console.error('Failed to load logo', e);
    }
  }
  
  // Company Header
  doc.setFontSize(20);
  doc.text(settings.company_name || 'FP Mobility GmbH', settings.logo_url ? 80 : 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  if (settings.address) {
    doc.text(settings.address, settings.logo_url ? 80 : 20, yPos);
    yPos += 5;
  }
  if (settings.phone) {
    doc.text(`Tel: ${settings.phone}`, settings.logo_url ? 80 : 20, yPos);
    yPos += 5;
  }
  if (settings.email) {
    doc.text(`Email: ${settings.email}`, settings.logo_url ? 80 : 20, yPos);
    yPos += 5;
  }
  
  // Invoice Title
  doc.setFontSize(16);
  doc.text('INVOICE', pageWidth / 2, yPos + 10, { align: 'center' });
  
  yPos += 20;
  doc.setFontSize(10);
  doc.text(`Invoice #: ${sale.sale_id}`, 20, yPos);
  doc.text(`Date: ${new Date(sale.sale_date).toLocaleDateString()}`, 120, yPos);
  
  // Customer Details
  yPos += 15;
  doc.setFontSize(12);
  doc.text('Bill To:', 20, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.text(customer.name || 'Customer', 20, yPos);
  yPos += 5;
  if (customer.address) {
    doc.text(customer.address, 20, yPos);
    yPos += 5;
  }
  if (customer.email) {
    doc.text(customer.email, 20, yPos);
    yPos += 5;
  }
  
  // Vehicle Details
  yPos += 10;
  doc.setFontSize(12);
  doc.text('Vehicle Details:', 20, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.text(`${sale.vehicle_year} ${sale.vehicle_make} ${sale.vehicle_model}`, 20, yPos);
  yPos += 5;
  doc.text(`VIN: ${sale.vin}`, 20, yPos);
  
  // Price breakdown
  yPos += 15;
  const currency = settings.currency || 'EUR';
  const vatRate = settings.vat_rate || 19;
  const netPrice = sale.sale_price / (1 + vatRate / 100);
  const vat = sale.sale_price - netPrice;
  
  doc.text(`Net Price: ${netPrice.toFixed(2)} ${currency}`, 20, yPos);
  yPos += 7;
  doc.text(`VAT (${vatRate}%): ${vat.toFixed(2)} ${currency}`, 20, yPos);
  yPos += 7;
  doc.setFontSize(12);
  doc.text(`Total Amount: ${sale.sale_price.toLocaleString()} ${currency}`, 20, yPos);
  
  // Payment info
  yPos += 15;
  doc.setFontSize(10);
  doc.text(`Payment Status: ${sale.payment_status.toUpperCase()}`, 20, yPos);
  if (sale.payment_method) {
    yPos += 5;
    doc.text(`Payment Method: ${sale.payment_method}`, 20, yPos);
  }
  
  // Bank Information
  if (settings.bank_account) {
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Details:', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 7;
    doc.setFontSize(10);
    doc.text(`Bank Account: ${settings.bank_account}`, 20, yPos);
    yPos += 5;
    doc.text(`Beneficiary: ${settings.company_name}`, 20, yPos);
  }
  
  // Footer
  doc.setFontSize(8);
  if (settings.tax_id) {
    doc.text(`Tax ID: ${settings.tax_id}`, pageWidth / 2, 270, { align: 'center' });
  }
  doc.text('Thank you for your business!', pageWidth / 2, 280, { align: 'center' });
  
  doc.save(`invoice-${sale.sale_id}.pdf`);
};
