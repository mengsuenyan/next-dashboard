'use server';
import {z} from 'zod';
import { insertInvoices, updateInvoice as dbUpdateInvoice, deleteInvoice as dbDeleteInvoice } from '@/app/lib/data';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';


const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true});

const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function createInvoice(formData: FormData) {
    try {
        const {customerId, amount, status} = CreateInvoice.parse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });

        const amountInCents = amount * 100;
        const date = new Date().toISOString().split('T')[0];

        await insertInvoices([{customer_id: customerId, amount: amountInCents, status, date}]);
    } catch {
        notFound();
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });
     
    const amountInCents = amount * 100;

    await dbUpdateInvoice({id, customer_id: customerId, amount: amountInCents, status});
     
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    await dbDeleteInvoice(id);
    revalidatePath('/dashboard/invoices');
}