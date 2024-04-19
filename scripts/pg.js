"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDBClient = void 0;
var placeholder_data_1 = require("../app/lib/placeholder-data");
var pg_1 = require("pg");
var bcrypt = require("bcrypt");
var pool = new pg_1.Pool({
    max: 10,
    min: 0,
    idleTimeoutMillis: 10000,
    allowExitOnIdle: true,
});
// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', function (err, client) {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
function getDBClient() {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            client = pool.connect();
            return [2 /*return*/, client];
        });
    });
}
exports.getDBClient = getDBClient;
function seedLog(f, query) {
    return __awaiter(this, void 0, void 0, function () {
        var res, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, query];
                case 1:
                    res = _a.sent();
                    if (res instanceof Array) {
                        console.log("".concat(f, " success: ").concat(res.length > 0 ? res[0].command : ""));
                    }
                    else {
                        console.log("".concat(f, " success: ").concat(res.command));
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function seedUsers(client) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, seedLog(seedUsers.name, client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, seedLog(seedUsers.name, client.query("CREATE TABLE IF NOT EXISTS users(\n            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n            name VARCHAR(255) NOT NULL,\n            email TEXT NOT NULL UNIQUE,\n            password TEXT NOT NULL\n        )"))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, seedLog(seedUsers.name, Promise.all(placeholder_data_1.users.map(function (user) { return __awaiter(_this, void 0, void 0, function () {
                            var hashedPassword;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, bcrypt.hash(user.password, 10)];
                                    case 1:
                                        hashedPassword = _a.sent();
                                        return [2 /*return*/, client.query("\n                    INSERT INTO users (id, name, email, password)\n                    VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING\n                ", [user.id, user.name, user.email, hashedPassword])];
                                }
                            });
                        }); })))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function seedInvoices(c) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, seedLog(seedInvoices.name, c.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, seedLog(seedInvoices.name, c.query("CREATE TABLE IF NOT EXISTS invoices (\n            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n            customer_id UUID NOT NULL,\n            amount INT NOT NULL,\n            status VARCHAR(255) NOT NULL,\n            date DATE NOT NULL\n        )"))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, seedLog(seedInvoices.name, Promise.all(placeholder_data_1.invoices.map(function (invoice) { return c.query("\n            INSERT INTO invoices (customer_id, amount, status, date)\n            VALUES ($1, $2, $3, $4)\n            ON CONFLICT (id) DO NOTHING\n        ", [invoice.customer_id, invoice.amount, invoice.status, invoice.date]); })))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function seedCustomers(c) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, seedLog(seedCustomers.name, c.query("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, seedLog(seedCustomers.name, c.query("\n      CREATE TABLE IF NOT EXISTS customers (\n        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n        name VARCHAR(255) NOT NULL,\n        email VARCHAR(255) NOT NULL,\n        image_url VARCHAR(255) NOT NULL\n      )\n    "))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, seedLog(seedCustomers.name, Promise.all(placeholder_data_1.customers.map(function (customer) {
                            return c.query("\n                INSERT INTO customers (id, name, email, image_url)\n                VALUES ($1, $2, $3, $4)\n                ON CONFLICT (id) DO NOTHING\n            ", [customer.id, customer.name, customer.email, customer.image_url]);
                        })))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function seedRevenue(c) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, seedLog(seedRevenue.name, c.query("\n      CREATE TABLE IF NOT EXISTS revenue (\n        month VARCHAR(4) NOT NULL UNIQUE,\n        revenue INT NOT NULL)\n    "))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, seedLog(seedRevenue.name, Promise.all(placeholder_data_1.revenue.map(function (rev) { return c.query("\n            INSERT INTO revenue (month, revenue)\n            VALUES ($1, $2)\n            ON CONFLICT (month) DO NOTHING\n        ", [rev.month, rev.revenue]); })))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function seedTest(client) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, seedLog(seedTest.name, client.query("select * from pg_tables"))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var client, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDBClient()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, 8, 9]);
                    // await seedTest(client);
                    return [4 /*yield*/, seedUsers(client)];
                case 3:
                    // await seedTest(client);
                    _a.sent();
                    return [4 /*yield*/, seedCustomers(client)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, seedInvoices(client)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, seedRevenue(client)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7:
                    e_2 = _a.sent();
                    throw e_2;
                case 8:
                    client.release();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (e) {
    console.error('An error occurred while attempting to seed the database:', e);
});
