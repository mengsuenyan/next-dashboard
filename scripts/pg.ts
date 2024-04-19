import { customers, invoices, revenue, users } from "../app/lib/placeholder-data";
import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import * as bcrypt from "bcrypt";

const pool = new Pool({
    max: 10,
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

async function seedLog(f: string, query: Promise<QueryResult<any> | QueryResult<any>[]>) {
    try {
        const res = await query;
        if (res instanceof Array) {
            console.log(`${f} success: ${res.length > 0 ? res[0].command : ""}`);
        } else {
            console.log(`${f} success: ${res.command}`);
        }
    } catch (e: any) {
        console.log(e);
    }
}

async function seedUsers(client: PoolClient) {
    await seedLog(seedUsers.name, client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'));
    await seedLog(seedUsers.name, client.query(`CREATE TABLE IF NOT EXISTS users(
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )`));

    await seedLog(seedUsers.name, Promise.all(
        users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return client.query(`
                    INSERT INTO users (id, name, email, password)
                    VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING
                `, [user.id, user.name, user.email, hashedPassword]);
        }),
    ));
}

async function seedInvoices(c: PoolClient) {
    await seedLog(seedInvoices.name, c.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'));
    await seedLog(seedInvoices.name, c.query(`CREATE TABLE IF NOT EXISTS invoices (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            customer_id UUID NOT NULL,
            amount INT NOT NULL,
            status VARCHAR(255) NOT NULL,
            date DATE NOT NULL
        )`));
    await seedLog(seedInvoices.name, Promise.all(
        invoices.map((invoice) => c.query(`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO NOTHING
        `, [invoice.customer_id, invoice.amount, invoice.status, invoice.date]))
    ));
}

async function seedCustomers(c: PoolClient) {
    await seedLog(seedCustomers.name, c.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`));
    await seedLog(seedCustomers.name, c.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      )
    `));
    await seedLog(seedCustomers.name, Promise.all(
        customers.map((customer) => {
            return c.query(`
                INSERT INTO customers (id, name, email, image_url)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
            `, [customer.id, customer.name, customer.email, customer.image_url])
        })
    ));
}

async function seedRevenue(c: PoolClient) {
    await seedLog(seedRevenue.name, c.query(`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL)
    `));

    await seedLog(seedRevenue.name, Promise.all(
        revenue.map((rev) => c.query(`
            INSERT INTO revenue (month, revenue)
            VALUES ($1, $2)
            ON CONFLICT (month) DO NOTHING
        `, [rev.month, rev.revenue]))
    ))
}

async function seedTest(client: PoolClient) {
    await seedLog(seedTest.name, client.query(`select * from pg_tables`));
}


async function main(params: Pool) {
    const client = await params.connect();
    try {
        // await seedTest(client);
        await seedUsers(client);
        await seedCustomers(client);
        await seedInvoices(client);
        await seedRevenue(client);
    } catch (e) {
        throw e;
    } finally {
        client.release();
        await params.end();
    }
}


main(pool).catch((e) => {
    console.error(
        'An error occurred while attempting to seed the database:',
        e,
    );
});
