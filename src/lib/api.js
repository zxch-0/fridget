async function request(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const api = {
  meta: () => request('/api/meta'),
  deals: () => request('/api/deals'),
  search: (q, extra = {}) => {
    const params = new URLSearchParams({ q, ...extra });
    return request(`/api/search?${params}`);
  },
  aiSearch: (query) => request('/api/ai/search', { method: 'POST', body: { query } }),
  product: (id) => request(`/api/products/${id}`),
  receipt: (payload) => request('/api/receipt', { method: 'POST', body: payload }),
  optimize: (items) => request('/api/basket/optimize', { method: 'POST', body: { items } }),
  basket: (id) => request(`/api/baskets/${id}`),
  compare: (storeIds, basketId) =>
    request('/api/compare', { method: 'POST', body: { storeIds, basketId } }),
};
