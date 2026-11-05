// Team roles and what each one can do. The database enforces the same rules, so hiding a
// button here is only for tidiness — it is never the only lock.
export const ROLES = {
  owner: { label: 'Owner', blurb: 'Everything, including the team' },
  manager: { label: 'Manager', blurb: 'Products, stock, discounts, orders and reviews' },
  fulfilment: { label: 'Fulfilment', blurb: 'Orders: packing, delivery fees and shipping' },
  support: { label: 'Support', blurb: 'Sees orders, moderates reviews' },
};
export const TEAM_ROLES = Object.keys(ROLES);
// can't be removed or downgraded by anyone (enforced in the database too)
export const PERMANENT_OWNERS = ['boluwatifeosuolale3@gmail.com'];

export const can = (role) => ({
  admin: TEAM_ROLES.includes(role),
  sales: role === 'owner' || role === 'manager',
  catalog: role === 'owner' || role === 'manager',
  orders: TEAM_ROLES.includes(role),
  editOrders: ['owner', 'manager', 'fulfilment'].includes(role),
  reviews: ['owner', 'manager', 'support'].includes(role),
  team: role === 'owner',
});

export const STATUS = {
  awaiting_payment: { label: 'Awaiting payment', tone: 'warn' },
  awaiting_transfer: { label: 'Awaiting transfer', tone: 'warn' },
  pay_on_delivery: { label: 'Pay on delivery', tone: 'accent' },
  paid: { label: 'Paid · to pack', tone: 'accent' },
  packed: { label: 'Packed', tone: 'accent' },
  shipped: { label: 'Shipped', tone: 'accent' },
  delivered: { label: 'Delivered', tone: 'good' },
  cancelled: { label: 'Cancelled', tone: 'bad' },
  failed: { label: 'Payment failed', tone: 'bad' },
};

// what staff may move an order to next (mirrors the database rule)
export const NEXT = {
  awaiting_payment: ['cancelled'],
  failed: ['cancelled'],
  awaiting_transfer: ['paid', 'cancelled'],
  pay_on_delivery: ['packed', 'shipped', 'delivered', 'cancelled'],
  paid: ['packed', 'shipped', 'delivered', 'cancelled'],
  packed: ['shipped', 'delivered', 'paid', 'cancelled'],
  shipped: ['delivered', 'packed', 'cancelled'],
  delivered: ['shipped'],
  cancelled: [],
};

// how far along an order is, to tell forward steps from going back
export const RANK = { awaiting_payment: 0, failed: 0, awaiting_transfer: 0, pay_on_delivery: 1, paid: 1, packed: 2, shipped: 3, delivered: 4 };
export const forwardSteps = (status, next) => next.filter((s) => s !== 'cancelled' && RANK[s] > RANK[status]);

// wording for an order's stages, which differs a little for pickup
export const stepLabel = (status, pickup) => ({
  paid: 'Paid',
  awaiting_transfer: 'Confirm transfer',
  packed: 'Packed',
  shipped: pickup ? 'Ready for pickup' : 'Shipped',
  delivered: pickup ? 'Collected' : 'Delivered',
  cancelled: 'Cancelled',
}[status] || STATUS[status]?.label || status);

export const actionLabel = (status, pickup) => ({
  paid: 'Transfer received — mark paid',
  packed: 'Mark as packed',
  shipped: pickup ? 'Mark ready for pickup' : 'Mark as shipped',
  delivered: pickup ? 'Mark as collected' : 'Mark as delivered',
  cancelled: 'Cancel order',
}[status] || status);

// short versions for the order list
export const shortAction = (status, pickup) => ({ paid: 'Mark paid', packed: 'Mark packed', shipped: pickup ? 'Ready for pickup' : 'Mark shipped', delivered: pickup ? 'Mark collected' : 'Mark delivered' }[status] || status);
