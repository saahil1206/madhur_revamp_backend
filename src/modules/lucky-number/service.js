const { LuckyNumber } = require("../../models");

async function list(query = {}) {
  const limit = Number(query.limit || 1);
  const offset = Number(query.offset || 0);

  return LuckyNumber.findAll({
    attributes: ["id", "aakda", "pana", "jodi", "motor"],
    order: [["id", "DESC"]],
    limit,
    offset,
  });
}

module.exports = { list };

