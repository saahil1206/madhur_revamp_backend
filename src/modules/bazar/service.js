const { GameBazar } = require("../../models");

async function list(query = {}) {
  const limit = Number(query.limit || 200);
  const offset = Number(query.offset || 0);
  const onlyActive = query.active !== "0";

  const where = {};
  if (onlyActive) where.status = 1;

  const rows = await GameBazar.findAll({
    where,
    attributes: ["id", "bazar_name", "open_time", "close_time", "status"],
    order: [["id", "ASC"]],
    limit,
    offset,
  });

  return rows;
}

async function getById(id) {
  return GameBazar.findByPk(id, {
    attributes: ["id", "bazar_name", "open_time", "close_time", "status", "Notice"],
  });
}

async function create(payload) {
  return GameBazar.create(payload);
}

async function update(id, payload) {
  const row = await GameBazar.findByPk(id);
  if (!row) return null;
  await row.update(payload);
  return row;
}

async function remove(id) {
  const row = await GameBazar.findByPk(id);
  if (!row) return { deleted: false };
  await row.destroy();
  return { deleted: true };
}

module.exports = { list, getById, create, update, remove };
