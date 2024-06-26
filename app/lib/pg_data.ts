import { Pool, QueryResult } from "pg";
import { CustomerField, CustomersTableType, Invoice, InvoiceForm, InvoicesTable, LatestInvoice, Revenue, User } from "./definitions";
import { formatCurrency } from "./utils";

const pool = new Pool({
    max: 100,
    min: 0,
    idleTimeoutMillis: 10000,
    allowExitOnIdle: true,
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
});

export async function getDBClient() {
    const client = pool.connect();

    return client;
}

export async function fetchRevenue() {
    const client = await getDBClient();
    try {
        // for test stream
        // console.log('Fetching revenue data...');
        // await new Promise((resolve) => setTimeout(resolve, 3000));
        const data: QueryResult<Revenue> = await client.query(`SELECT * FROM revenue`);
        // console.log('Data fetch completed after 3 seconds.');
        return data.rows;
    } catch (e) {
        console.error('DB err: ', e);
        throw new Error('Failed to fetch revenue data.');
    } finally {
        client.release();
    }
}

export async function fetchLatestInvoices() {
    const c = await getDBClient();
    try {
        const data: QueryResult<Omit<LatestInvoice, "amount"> & { amount: number }> = await c.query(`
            SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
            FROM invoices
            JOIN customers ON invoices.customer_id = customers.id
            ORDER BY invoices.date DESC
            LIMIT 5`);

        const latestInvoices = data.rows.map((x) => ({
            ...x,
            amount: formatCurrency(x.amount),
        }));

        return latestInvoices;
    } catch (e) {
        console.error('DB err: ', e);
        throw new Error('Failed to fetch the latest invoies');
    } finally {
        c.release();
    }
}

export async function fetchCardData() {
    const c = await getDBClient();
    try {
        const invoiceCountPromise = c.query(`SELECT COUNT(*) FROM invoices`);
        const customerCountPromise = c.query(`SELECT COUNT(*) FROM customers`);
        const invoiceStatusPromise = c.query(`SELECT
            SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
            SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
            FROM invoices`);

        const data = await Promise.all([
            invoiceCountPromise,
            customerCountPromise,
            invoiceStatusPromise,
        ]);

        const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
        const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
        const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
        const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

        return {
            numberOfCustomers,
            numberOfInvoices,
            totalPaidInvoices,
            totalPendingInvoices,
        };
    } catch (e) {
        console.error('DB err: ', e);
        throw new Error('Failed to fetch the card data');
    } finally {
        c.release();
    }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(query: string, currentPage: number) {
    const c = await getDBClient();
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    query = `%${query}%`;
    try {
        const invoices = await c.query<InvoicesTable>(`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE $1 OR
        customers.email ILIKE $2 OR
        invoices.amount::text ILIKE $3 OR
        invoices.date::text ILIKE $4 OR
        invoices.status ILIKE $5
      ORDER BY invoices.date DESC
      LIMIT $6 OFFSET $7
    `, [query, query, query, query, query, ITEMS_PER_PAGE, offset]);

        return invoices.rows;
    } catch (e) {
        console.error('DB err: ', e);
        throw new Error('Failed to fetch the filtered invoices');
    } finally {
        c.release();
    }
}
export async function fetchInvoicesPages(query: string) {
    const c = await getDBClient();
    query = `%${query}%`;
    try {
        const count = await c.query(`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE $1 OR
      customers.email ILIKE $2 OR
      invoices.amount::text ILIKE $3 OR
      invoices.date::text ILIKE $4 OR
      invoices.status ILIKE $5
  `, [query, query, query, query, query]);

        const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
        return totalPages;
    } catch (e) {
        console.error('DB err: ', e);
        throw new Error('Failed to fetch the invoices pages');
    } finally {
        c.release();
    }
}
export async function fetchInvoiceById(id: string) {
    const c = await getDBClient();
    try {
        const data = await c.query<InvoiceForm>(`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = $1;
    `, [id]);

        const invoice = data.rows.map((invoice) => ({
            ...invoice,
            // Convert amount from cents to dollars
            amount: invoice.amount / 100,
        }));

        return invoice[0];
    } catch (e) {
        console.error('DB err: ', e);
        throw new Error('Failed to fetch the invoice by id');
    } finally {
        c.release();
    }
}
export async function fetchCustomers() {
    const c = await getDBClient();
    try {
        const data = await c.query<CustomerField>(`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `);

        const customers = data.rows;
        return customers;
    } catch (e) {
        console.error('DB err: ', e);
        throw new Error('Failed to fetch all customers');
    } finally {
        c.release();
    }
}

export async function fetchCustomersPages(query: string) {
    const c = await getDBClient();
    query = `%${query}%`;

    try {
        const count = await c.query(`
        SELECT COUNT(*) FROM (SELECT COUNT(*) FROM customers 
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE customers.name ILIKE $1 OR customers.email ILIKE $2
		GROUP BY customers.id, customers.name, customers.email, customers.image_url)
        `, [query, query]);

        const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
        return totalPages;
    } catch (e) {
        console.error('DB err: ', e);
        throw new Error('Failed to fetch the customers pages.');
    } finally {
        c.release();
    }
}

export async function fetchFilteredCustomers(query: string, currentPage: number) {
    const c = await getDBClient();
    query = `%${query}%`;
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
        const data = await c.query<CustomersTableType>(`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE $1 OR
        customers.email ILIKE $2
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
        LIMIT $3 OFFSET $4
	  `, [query, query, ITEMS_PER_PAGE, offset]);

        const customers = data.rows.map((customer) => ({
            ...customer,
            total_pending: formatCurrency(customer.total_pending),
            total_paid: formatCurrency(customer.total_paid),
        }));

        return customers;
    } catch (e) {
        console.error('DB err: ', e);
        throw new Error('Failed to fetch all filtered customers');
    } finally {
        c.release();
    }
}

export async function getUser(email: string) {
    const c = await getDBClient();
    try {
        const user = await c.query<User>(`SELECT * FROM users WHERE email=$1`, [email]);
        return user.rows[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    } finally {
        c.release();
    }
}

export async function insertInvoices(invoices: Omit<Invoice, 'id'>[]) {
    if (!invoices || invoices.length === 0) {
        return;
    }

    const c = await getDBClient();

    try {
        let s = invoices.reduce<{s: string, v: any[]}>((pre, invoice, idx, arr) => {
            idx = idx * 4;
            let s;
            if (arr.length - 1 == idx) {
                s = `${pre.s} ($${idx+1},$${idx+2},$${idx+3},$${idx+4});`
            } else {
                s = `${pre.s} ($${idx+1},$${idx+2},$${idx+3},$${idx+4}),`
            }
            pre.v.push(invoice.customer_id, invoice.amount, invoice.status, invoice.date);
            return {s, v: pre.v};
        }, {s: `INSERT INTO invoices (customer_id, amount, status, date) VALUES `, v: []});
        let res = await c.query(s.s, s.v);

        console.log(`insertInvoices success: insert ${res.rowCount} items in into the table of invoices`);
    } catch (error) {
        console.error('Failed to insert data: ', error);
        throw new Error('Failed to insert data to the table of invoice');
    } finally {
        c.release();
    }
}

export async function updateInvoice(invoice: Omit<Invoice, 'date'>) {
    const c = await getDBClient();

    try {
        let res = await c.query('UPDATE invoices SET customer_id = $1, amount = $2, status = $3 WHERE id = $4', 
            [invoice.customer_id, invoice.amount, invoice.status, invoice.id]
        );

        console.log(`updateInvoice sucess: ${res.command}`);
    } catch (e) {
        console.error('Failed to update data: ', e);
        throw new Error("Failed to update the data of the invoice table");
    } finally {
        c.release();
    }
}

export async function deleteInvoice(id: string) {
    const c = await getDBClient();

    try {
        let res = await c.query('DELETE FROM invoices WHERE id = $1', [id]);

        console.log(`deleteInvoice sucess: ${res.command}`);
    } catch (e) {
        console.error('Failed to delete data: ', e);
        throw new Error("Failed to delete the data of the invoice table");
    } finally {
        c.release();
    }
}