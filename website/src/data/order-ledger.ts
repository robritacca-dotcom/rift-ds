/**
 * The merchant sales template's and the labs bench's table: a seeded order ledger, the same rows on the server and in
 * the browser, so what the route counts is what the table shows. No JSX, so
 * the API route can import it. The numbers lean on each other on purpose
 * (carriers differ in lateness, categories in margin and returns), so a
 * question asked of the data has a real answer to find.
 */

import type { DataTableColumn, DataTableOption, DataTableRow } from 'rift-ds/components/DataTable/DataTable';

type StatusRole = NonNullable<DataTableOption['status']>;

export const ROW_COUNT = 100_000;
/** The ledger's "today": dates are generated back from here, and the model is told it. */
export const LEDGER_TODAY = '2026-10-30';

const REGIONS: Record<string, string[]> = {
  'North America': ['United States', 'Canada', 'Mexico'],
  Europe: ['Germany', 'France', 'United Kingdom', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Poland'],
  'Asia Pacific': ['Japan', 'Australia', 'Singapore', 'India', 'South Korea', 'Indonesia'],
  'Latin America': ['Brazil', 'Argentina', 'Chile', 'Colombia'],
  'Middle East & Africa': ['United Arab Emirates', 'South Africa', 'Saudi Arabia', 'Nigeria'],
};
const WAREHOUSES = ['Reno', 'Memphis', 'Rotterdam', 'Leipzig', 'Singapore', 'Osaka', 'Sao Paulo', 'Dubai'];
/** Each carrier's chance of a late delivery and its usual days in transit. */
const CARRIERS: Record<string, { late: number; transit: number }> = {
  Northline: { late: 0.06, transit: 3 },
  'Blue Parcel': { late: 0.11, transit: 4 },
  Swiftway: { late: 0.09, transit: 2 },
  Meridian: { late: 0.27, transit: 6 },
  Harbourlink: { late: 0.17, transit: 8 },
  'Atlas Freight': { late: 0.21, transit: 7 },
};
const SERVICES = ['Economy', 'Standard', 'Express', 'Overnight', 'Freight'];
const CHANNELS = ['Web', 'Mobile app', 'Marketplace', 'Field sales', 'Partner', 'Phone'];
const SEGMENTS = ['Enterprise', 'Mid-market', 'Small business', 'Consumer', 'Public sector'];
/** Each category's margin, return rate, price level and products. */
const CATEGORIES: Record<string, { margin: number; returns: number; price: number; products: string[] }> = {
  Electronics: { margin: 0.18, returns: 0.14, price: 420, products: ['Noise-cancelling headset', '4K monitor', 'Docking station', 'Portable SSD', 'Webcam'] },
  Furniture: { margin: 0.31, returns: 0.08, price: 610, products: ['Standing desk', 'Task chair', 'Filing cabinet', 'Conference table', 'Monitor arm'] },
  Apparel: { margin: 0.46, returns: 0.22, price: 75, products: ['Softshell jacket', 'Work boots', 'Merino base layer', 'Hi-vis vest'] },
  'Office supplies': { margin: 0.38, returns: 0.03, price: 34, products: ['Copy paper case', 'Label printer tape', 'Whiteboard kit', 'Archive boxes'] },
  Software: { margin: 0.74, returns: 0.01, price: 890, products: ['Analytics seat', 'Backup licence', 'Security suite', 'Design licence'] },
  Industrial: { margin: 0.24, returns: 0.05, price: 1250, products: ['Pallet racking', 'Air compressor', 'Forklift battery', 'Safety cabinet'] },
  Grocery: { margin: 0.12, returns: 0.02, price: 48, products: ['Coffee pallet', 'Snack assortment', 'Bottled water case', 'Tea selection'] },
};
const PEOPLE = ['Ada Okafor', 'Ben Larsen', 'Chloe Tan', 'Diego Ramos', 'Elif Kaya', 'Farah Aziz', 'Grace Lin', 'Hugo Martin', 'Ines Costa', 'Jonas Weber', 'Kira Sato', 'Liam Byrne', 'Maya Patel', 'Noor Haddad', 'Owen Reid', 'Priya Nair', 'Quinn Ellis', 'Rosa Vidal', 'Sam Choi', 'Tara Novak'];
const CUSTOMER_A = ['Acme', 'Northwind', 'Globex', 'Initech', 'Umbrella', 'Stark', 'Wayne', 'Hooli', 'Vandelay', 'Soylent', 'Tyrell', 'Cyberdyne', 'Massive', 'Pied Piper', 'Wonka', 'Oscorp', 'Sterling', 'Dunder', 'Aperture', 'Gringotts', 'Monarch', 'Zenith', 'Bluth', 'Paper Street', 'Halcyon'];
const CUSTOMER_B = ['Industries', 'Logistics', 'Retail', 'Holdings', 'Group', 'Labs', 'Supply', 'Partners', 'Systems', 'Foods', 'Energy', 'Health'];
const PROMOS = ['SPRING10', 'BULK15', 'LOYAL5', 'WELCOME20', 'CLEARANCE30', 'PARTNER12'];
const TAGS = ['gift', 'fragile', 'hazmat', 'bulk', 'priority-client', 'renewal', 'cross-border', 'backorder', 'white-glove', 'first-order'];

const ORDER_STATUSES = [
  { value: 'Placed', status: 'neutral' },
  { value: 'Picking', status: 'info' },
  { value: 'Shipped', status: 'info' },
  { value: 'Delivered', status: 'positive' },
  { value: 'Delayed', status: 'warning' },
  { value: 'Returned', status: 'warning' },
  { value: 'Cancelled', status: 'error' },
] as const;
const PAYMENT_STATUSES = [
  { value: 'Paid', status: 'positive' },
  { value: 'Pending', status: 'info' },
  { value: 'Overdue', status: 'warning' },
  { value: 'Refunded', status: 'neutral' },
  { value: 'Failed', status: 'error' },
] as const;
const RISK_LEVELS = [
  { value: 'Low', status: 'positive' },
  { value: 'Medium', status: 'warning' },
  { value: 'High', status: 'error' },
] as const;

const asOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));
const withLabels = (values: readonly { value: string; status: StatusRole }[]) =>
  values.map((option) => ({ ...option, label: option.value }));

export const LEDGER_COLUMNS = [
  { key: 'orderId', header: 'Order', type: 'text', rowHeader: true, sortable: true, width: '130px', pin: 'start' },
  { key: 'placedOn', header: 'Placed', type: 'date', sortable: true, width: '130px' },
  { key: 'customer', header: 'Customer', sortable: true, groupable: true, width: '220px' },
  { key: 'segment', header: 'Segment', sortable: true, groupable: true, width: '150px', options: asOptions(SEGMENTS) },
  { key: 'status', header: 'Status', type: 'status', sortable: true, groupable: true, width: '130px', options: withLabels(ORDER_STATUSES) },
  { key: 'payment', header: 'Payment', type: 'status', sortable: true, groupable: true, width: '130px', options: withLabels(PAYMENT_STATUSES) },
  { key: 'risk', header: 'Risk', type: 'status', sortable: true, groupable: true, width: '110px', options: withLabels(RISK_LEVELS) },
  { key: 'region', header: 'Region', sortable: true, groupable: true, width: '180px', options: asOptions(Object.keys(REGIONS)) },
  { key: 'country', header: 'Country', sortable: true, groupable: true, width: '170px', options: asOptions(Object.values(REGIONS).flat()) },
  { key: 'category', header: 'Category', sortable: true, groupable: true, width: '150px', options: asOptions(Object.keys(CATEGORIES)) },
  { key: 'product', header: 'Product', sortable: true, groupable: true, width: '210px' },
  { key: 'carrier', header: 'Carrier', sortable: true, groupable: true, width: '140px', options: asOptions(Object.keys(CARRIERS)) },
  { key: 'netRevenue', header: 'Net revenue', type: 'currency', sortable: true, width: '130px', aggregate: 'sum' },
  { key: 'marginPct', header: 'Margin %', type: 'number', sortable: true, width: '110px', aggregate: 'avg', format: { fractionDigits: 1 } },
  { key: 'daysLate', header: 'Days late', type: 'number', sortable: true, width: '110px', aggregate: 'avg', format: { fractionDigits: 1 } },
  { key: 'accountOwner', header: 'Account owner', type: 'person', sortable: true, groupable: true, width: '180px', options: asOptions(PEOPLE), defaultHidden: true },
  { key: 'salesRep', header: 'Sales rep', type: 'person', sortable: true, groupable: true, width: '180px', options: asOptions(PEOPLE), defaultHidden: true },
  { key: 'promisedOn', header: 'Promised', type: 'date', sortable: true, width: '130px', defaultHidden: true },
  { key: 'shippedOn', header: 'Shipped', type: 'date', sortable: true, width: '130px', defaultHidden: true },
  { key: 'deliveredOn', header: 'Delivered', type: 'date', sortable: true, width: '130px', defaultHidden: true },
  { key: 'city', header: 'Ship-to code', type: 'text', sortable: true, width: '120px', defaultHidden: true },
  { key: 'warehouse', header: 'Warehouse', sortable: true, groupable: true, width: '130px', options: asOptions(WAREHOUSES), defaultHidden: true },
  { key: 'service', header: 'Service', sortable: true, groupable: true, width: '120px', options: asOptions(SERVICES), defaultHidden: true },
  { key: 'channel', header: 'Channel', sortable: true, groupable: true, width: '130px', options: asOptions(CHANNELS), defaultHidden: true },
  { key: 'sku', header: 'SKU', type: 'text', sortable: true, width: '130px', defaultHidden: true },
  { key: 'units', header: 'Units', type: 'number', sortable: true, width: '90px', aggregate: 'sum', defaultHidden: true },
  { key: 'unitPrice', header: 'Unit price', type: 'currency', sortable: true, width: '110px', aggregate: 'avg', format: { fractionDigits: 2 }, defaultHidden: true },
  { key: 'discountPct', header: 'Discount %', type: 'number', sortable: true, width: '110px', aggregate: 'avg', defaultHidden: true },
  { key: 'grossRevenue', header: 'Gross revenue', type: 'currency', sortable: true, width: '130px', aggregate: 'sum', defaultHidden: true },
  { key: 'cost', header: 'Cost', type: 'currency', sortable: true, width: '110px', aggregate: 'sum', defaultHidden: true },
  { key: 'margin', header: 'Margin', type: 'currency', sortable: true, width: '110px', aggregate: 'sum', defaultHidden: true },
  { key: 'tax', header: 'Tax', type: 'currency', sortable: true, width: '100px', aggregate: 'sum', defaultHidden: true },
  { key: 'shippingCost', header: 'Shipping cost', type: 'currency', sortable: true, width: '130px', aggregate: 'sum', defaultHidden: true },
  { key: 'refund', header: 'Refund', type: 'currency', sortable: true, width: '100px', aggregate: 'sum', defaultHidden: true },
  { key: 'fulfilment', header: 'Fulfilment', type: 'progress', sortable: true, width: '130px', aggregate: 'avg', defaultHidden: true },
  { key: 'onTime', header: 'On time', type: 'checkbox', sortable: true, width: '90px', defaultHidden: true },
  { key: 'returned', header: 'Returned', type: 'checkbox', sortable: true, width: '100px', defaultHidden: true },
  { key: 'expedited', header: 'Expedited', type: 'checkbox', sortable: true, width: '100px', defaultHidden: true },
  { key: 'tags', header: 'Tags', type: 'tags', width: '200px', options: asOptions(TAGS), defaultHidden: true },
  { key: 'promo', header: 'Promo', sortable: true, groupable: true, width: '130px', options: asOptions(PROMOS), defaultHidden: true },
  { key: 'daysToShip', header: 'Days to ship', type: 'number', sortable: true, width: '120px', aggregate: 'avg', format: { fractionDigits: 1 }, defaultHidden: true },
  { key: 'transitDays', header: 'Transit days', type: 'number', sortable: true, width: '120px', aggregate: 'avg', format: { fractionDigits: 1 }, defaultHidden: true },
  { key: 'weightKg', header: 'Weight (kg)', type: 'number', sortable: true, width: '110px', aggregate: 'sum', defaultHidden: true },
  { key: 'nps', header: 'NPS', type: 'number', sortable: true, width: '80px', aggregate: 'avg', format: { fractionDigits: 1 }, defaultHidden: true },
  { key: 'tickets', header: 'Tickets', type: 'number', sortable: true, width: '90px', aggregate: 'sum', defaultHidden: true },
  { key: 'fraudScore', header: 'Fraud score', type: 'number', sortable: true, width: '110px', aggregate: 'avg', format: { fractionDigits: 1 }, defaultHidden: true },
  { key: 'tracking', header: 'Tracking', type: 'link', width: '240px', defaultHidden: true },
] as const satisfies readonly DataTableColumn[];

export const COLUMN_KEYS = LEDGER_COLUMNS.map((col) => col.key) as string[];

/* mulberry32: small, fast, and the same on the server and in the browser. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const MS_PER_DAY = 86_400_000;
const TODAY_MS = Date.parse(`${LEDGER_TODAY}T00:00:00Z`);
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const round2 = (value: number) => Math.round(value * 100) / 100;

function makeRows(): DataTableRow[] {
  const random = seeded(20261030);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)];

  // A long tail of customers, some far larger than the rest, as real ledgers have.
  const customers = Array.from({ length: 2_400 }, (_, index) => ({
    name: `${pick(CUSTOMER_A)} ${pick(CUSTOMER_B)} ${index % 7 === 0 ? 'International' : index % 5 === 0 ? 'Co' : 'Ltd'}`,
    segment: pick(SEGMENTS),
    owner: pick(PEOPLE),
    region: pick(Object.keys(REGIONS)),
  }));
  const categoryNames = Object.keys(CATEGORIES);
  const carrierNames = Object.keys(CARRIERS);

  const rows: DataTableRow[] = new Array(ROW_COUNT);
  for (let index = 0; index < ROW_COUNT; index += 1) {
    const customer = customers[Math.floor(Math.pow(random(), 2.2) * customers.length)];
    const country = pick(REGIONS[customer.region]);
    const categoryName = pick(categoryNames);
    const category = CATEGORIES[categoryName];
    const product = pick(category.products);
    const carrierName = pick(carrierNames);
    const carrier = CARRIERS[carrierName];
    const service = pick(SERVICES);

    const age = Math.floor(Math.pow(random(), 1.4) * 720);
    const placed = TODAY_MS - age * MS_PER_DAY;
    const daysToShip = Math.round(random() * 4 * 10) / 10;
    const transit = Math.max(1, Math.round(carrier.transit + (random() - 0.4) * 4));
    const promised = placed + (daysToShip + carrier.transit + 2) * MS_PER_DAY;
    const isLate = random() < carrier.late;
    const daysLate = isLate ? Math.ceil(random() * 14) : 0;

    const units = 1 + Math.floor(Math.pow(random(), 3) * 200);
    const unitPrice = round2(category.price * (0.6 + random() * 0.9));
    const promo = random() < 0.28 ? pick(PROMOS) : '';
    const discountPct = promo ? Number(promo.match(/\d+/)![0]) : random() < 0.2 ? Math.floor(random() * 10) : 0;
    const gross = round2(units * unitPrice);
    const net = round2(gross * (1 - discountPct / 100));
    const cost = round2(gross * (1 - category.margin) * (0.92 + random() * 0.16));
    const margin = round2(net - cost);
    const returned = random() < category.returns;

    // Recent orders are still moving; old ones have finished, one way or the other.
    let status: string;
    if (random() < 0.025) status = 'Cancelled';
    else if (age < 2) status = 'Placed';
    else if (age < 4) status = 'Picking';
    else if (age < 9) status = isLate ? 'Delayed' : 'Shipped';
    else status = returned ? 'Returned' : 'Delivered';
    const finished = status === 'Delivered' || status === 'Returned';
    const moving = finished || status === 'Shipped' || status === 'Delayed';

    const payRoll = random();
    const payment =
      status === 'Returned' || status === 'Cancelled'
        ? 'Refunded'
        : payRoll < 0.8 ? 'Paid' : payRoll < 0.92 ? 'Pending' : payRoll < 0.98 ? 'Overdue' : 'Failed';
    const fraudScore = Math.round(Math.pow(random(), 4) * 1000) / 10;
    const risk = fraudScore > 60 || payment === 'Failed' ? 'High' : fraudScore > 25 || payment === 'Overdue' || isLate ? 'Medium' : 'Low';

    const tags: string[] = [];
    if (random() < 0.3) tags.push(pick(TAGS));
    if (random() < 0.08) {
      const extra = pick(TAGS);
      if (!tags.includes(extra)) tags.push(extra);
    }

    const orderId = `ORD-${String(1_000_000 + index)}`;
    rows[index] = {
      id: orderId,
      values: {
        orderId,
        placedOn: isoDay(placed),
        customer: customer.name,
        segment: customer.segment,
        status,
        payment,
        risk,
        region: customer.region,
        country,
        category: categoryName,
        product,
        carrier: carrierName,
        netRevenue: net,
        marginPct: net > 0 ? Math.round((margin / net) * 1000) / 10 : 0,
        daysLate,
        accountOwner: customer.owner,
        salesRep: pick(PEOPLE),
        promisedOn: isoDay(promised),
        shippedOn: moving ? isoDay(placed + daysToShip * MS_PER_DAY) : '',
        deliveredOn: finished ? isoDay(promised + daysLate * MS_PER_DAY) : '',
        city: `${country.slice(0, 2).toUpperCase()}-${100 + Math.floor(random() * 900)}`,
        warehouse: pick(WAREHOUSES),
        service,
        channel: pick(CHANNELS),
        sku: `${categoryName.slice(0, 3).toUpperCase()}-${product.length}${Math.floor(random() * 9000) + 1000}`,
        units,
        unitPrice,
        discountPct,
        grossRevenue: gross,
        cost,
        margin,
        tax: round2(net * 0.08),
        shippingCost: round2(4 + units * (service === 'Overnight' ? 2.4 : service === 'Express' ? 1.5 : 0.7)),
        refund: returned && finished ? net : 0,
        fulfilment: status === 'Placed' ? 5 : status === 'Picking' ? 30 : status === 'Cancelled' ? 0 : finished ? 100 : 70,
        onTime: moving && !isLate,
        returned: status === 'Returned',
        expedited: service === 'Express' || service === 'Overnight',
        tags,
        promo,
        daysToShip,
        transitDays: transit,
        weightKg: round2(units * (0.4 + random() * 6)),
        nps: Math.max(0, Math.min(10, Math.round(8.5 - daysLate * 0.45 + (random() - 0.5) * 4))),
        tickets: isLate || returned ? Math.floor(random() * 5) : random() < 0.05 ? 1 : 0,
        fraudScore,
        tracking: `https://track.example.com/${orderId}`,
      },
    };
  }
  return rows;
}

let cached: DataTableRow[] | undefined;
/** The ledger's rows, generated once per process. */
export const ledgerRows = () => (cached ??= makeRows());
