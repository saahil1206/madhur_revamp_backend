const service = require("./service");

async function list(req, res) {
  try {
    const data = await service.list(req.query);
    return res.json(data);
  } catch (_error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function generate(req, res) {
  try {
    const data = await service.generate(req.body);
    return res.status(201).json(data);
  } catch (error) {
    if (error.message) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function listRequests(req, res) {
  try {
    const data = await service.listRequests(req.query);
    return res.json(data);
  } catch (_error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { list, generate, listRequests };
