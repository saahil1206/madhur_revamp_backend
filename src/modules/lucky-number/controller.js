const service = require("./service");

async function list(req, res) {
  try {
    const data = await service.list(req.query);
    return res.json(data);
  } catch (_error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { list };

