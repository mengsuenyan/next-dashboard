import { Invoice } from './definitions';
import * as local_pg from './pg_data';
import * as vercel_pg from './vercel_data';

function is_local_pg() {
    if (typeof process === "object" && typeof require === 'function') {
        return process.env.USE_LOCAL_PG === 'true';
    } else {
        return false;
    }
}

export async function fetchRevenue() {
    if (is_local_pg()) {
        return local_pg.fetchRevenue();
    } else {
        return vercel_pg.fetchRevenue();
    }
}

export async function fetchLatestInvoices() {
    if (is_local_pg()) {
        return local_pg.fetchLatestInvoices();
    } else {
        return vercel_pg.fetchLatestInvoices();
    }
}

export async function fetchCardData() {
    if (is_local_pg()) {
        return local_pg.fetchCardData();
    } else {
        return vercel_pg.fetchCardData();
    }
}

export async function fetchFilteredInvoices(query: string, currentPage: number) {
    if (is_local_pg()) {
        return local_pg.fetchFilteredInvoices(query, currentPage);
    } else {
        return vercel_pg.fetchFilteredInvoices(query, currentPage);
    }
}

export async function fetchInvoicesPages(query: string) {
    if (is_local_pg()) {
        return local_pg.fetchInvoicesPages(query);
    } else {
        return vercel_pg.fetchInvoicesPages(query);
    }
}

export async function fetchInvoiceById(id: string) {
    if (is_local_pg()) {
        return local_pg.fetchInvoiceById(id);
    } else {
        return vercel_pg.fetchInvoiceById(id);
    }
}

export async function fetchCustomers() {
    if (is_local_pg()) {
        return local_pg.fetchCustomers();
    } else {
        return vercel_pg.fetchCustomers();
    }
}

export async function fetchFilteredCustomers(query: string) {
    if (is_local_pg()) {
        return local_pg.fetchFilteredCustomers(query);
    } else {
        return vercel_pg.fetchFilteredCustomers(query);
    }
}

export async function getUser(email: string) {
    if (is_local_pg()) {
        return local_pg.getUser(email);
    } else {
        return vercel_pg.getUser(email);
    }
}

export async function insertInvoices(invoices: Omit<Invoice, 'id'>[]) {
    if (is_local_pg()) {
        return local_pg.insertInvoices(invoices);
    } else {
        return vercel_pg.insertInvoices(invoices);
    }
}

export async function updateInvoice(invoice: Omit<Invoice, 'date'>) {
    if (is_local_pg()) {
        return local_pg.updateInvoice(invoice);
    } else {
        return vercel_pg.updateInvoice(invoice);
    }
}

export async function deleteInvoice(id: string) {
    if (is_local_pg()) {
        return local_pg.deleteInvoice(id);
    } else {
        return vercel_pg.deleteInvoice(id);
    }
}