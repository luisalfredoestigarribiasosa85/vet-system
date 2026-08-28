// backend/utils/pagination.js
// Helper de paginación retrocompatible para listados.
//
// Contrato:
//   - Si la request NO envía ?page ni ?limit => parsePagination() devuelve null y el
//     endpoint conserva su comportamiento actual (devolver TODOS los registros).
//   - Si envía page/limit => se devuelve { page, limit, offset } listo para usar
//     en findAndCountAll, y la respuesta se arma con paginateResponse().
//
// Límites: page >= 1; limit default DEFAULT_PAGE_LIMIT, máximo MAX_PAGE_LIMIT.

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 200;

const parseIntSafe = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parsePagination = (req) => {
  if (!req || !req.query) return null;
  if (req.query.page === undefined && req.query.limit === undefined) return null;

  const page = Math.max(1, parseIntSafe(req.query.page, 1));
  const limit = Math.min(parseIntSafe(req.query.limit, DEFAULT_PAGE_LIMIT), MAX_PAGE_LIMIT);

  return { page, limit, offset: (page - 1) * limit };
};

// Payload estándar de respuesta paginada ({ data, pagination })
const paginateResponse = (rows, total, { page, limit }) => ({
  data: rows,
  pagination: {
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    limit,
  },
});

module.exports = { parsePagination, paginateResponse, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT };