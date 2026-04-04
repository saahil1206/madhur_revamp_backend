const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../models");

let cachedColumns = null;

async function getColumns() {
  if (cachedColumns) return cachedColumns;
  const rows = await sequelize.query("SHOW COLUMNS FROM game_seo_pages", {
    type: QueryTypes.SELECT,
  });
  cachedColumns = rows.map((r) => r.Field);
  return cachedColumns;
}

function firstExisting(columns, candidates) {
  return candidates.find((c) => columns.includes(c)) || null;
}

async function listSites() {
  const columns = await getColumns();
  const siteCol = firstExisting(columns, ["site", "site_name", "domain", "website"]);
  if (!siteCol) {
    return [{ value: "madhurbazar.com" }];
  }
  const rows = await sequelize.query(
    `SELECT DISTINCT \`${siteCol}\` AS value FROM game_seo_pages WHERE \`${siteCol}\` IS NOT NULL AND \`${siteCol}\` <> ''`,
    { type: QueryTypes.SELECT }
  );
  return rows.length ? rows : [{ value: "madhurbazar.com" }];
}

async function getSeoEntry({ bazarId, seoType, site }) {
  const columns = await getColumns();
  const bazarCol = firstExisting(columns, ["bazar_id", "game_bazar_id"]);
  const typeCol = firstExisting(columns, ["seo_type", "type", "page_type"]);
  const siteCol = firstExisting(columns, ["site", "site_name", "domain", "website"]);
  const idCol = firstExisting(columns, ["id"]);
  const metaCol = firstExisting(columns, ["meta_header", "meta", "meta_tag", "meta_data"]);
  const titleCol = firstExisting(columns, ["page_title", "title"]);
  const subCol = firstExisting(columns, ["subheading", "sub_heading", "heading2"]);
  const htmlCol = firstExisting(columns, ["page_html", "html", "content", "description"]);

  const where = [];
  const replacements = {};
  if (bazarCol && bazarId) {
    where.push(`\`${bazarCol}\` = :bazarId`);
    replacements.bazarId = Number(bazarId);
  }
  if (typeCol && seoType) {
    where.push(`\`${typeCol}\` = :seoType`);
    replacements.seoType = seoType;
  }
  if (siteCol && site) {
    where.push(`\`${siteCol}\` = :site`);
    replacements.site = site;
  }

  const sql = `
    SELECT
      ${idCol ? `\`${idCol}\` AS id,` : "NULL AS id,"}
      ${metaCol ? `\`${metaCol}\` AS metaHeader,` : "'' AS metaHeader,"}
      ${titleCol ? `\`${titleCol}\` AS pageTitle,` : "'' AS pageTitle,"}
      ${subCol ? `\`${subCol}\` AS subheading,` : "'' AS subheading,"}
      ${htmlCol ? `\`${htmlCol}\` AS pageHtml` : "'' AS pageHtml"}
    FROM game_seo_pages
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY ${idCol ? `\`${idCol}\` DESC` : "1 DESC"}
    LIMIT 1
  `;

  const rows = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements,
  });

  return rows[0] || { id: null, metaHeader: "", pageTitle: "", subheading: "", pageHtml: "" };
}

async function upsertSeoEntry(payload) {
  const columns = await getColumns();
  const bazarCol = firstExisting(columns, ["bazar_id", "game_bazar_id"]);
  const typeCol = firstExisting(columns, ["seo_type", "type", "page_type"]);
  const siteCol = firstExisting(columns, ["site", "site_name", "domain", "website"]);
  const idCol = firstExisting(columns, ["id"]);
  const metaCol = firstExisting(columns, ["meta_header", "meta", "meta_tag", "meta_data"]);
  const titleCol = firstExisting(columns, ["page_title", "title"]);
  const subCol = firstExisting(columns, ["subheading", "sub_heading", "heading2"]);
  const htmlCol = firstExisting(columns, ["page_html", "html", "content", "description"]);
  const createdByCol = firstExisting(columns, ["createdby", "created_by", "updated_by"]);

  const data = {};
  if (bazarCol && payload.bazarId) data[bazarCol] = Number(payload.bazarId);
  if (typeCol && payload.seoType) data[typeCol] = payload.seoType;
  if (siteCol && payload.site) data[siteCol] = payload.site;
  if (metaCol) data[metaCol] = payload.metaHeader || "";
  if (titleCol) data[titleCol] = payload.pageTitle || "";
  if (subCol) data[subCol] = payload.subheading || "";
  if (htmlCol) data[htmlCol] = payload.pageHtml || "";
  if (createdByCol && payload.username) data[createdByCol] = payload.username;

  const existing = await getSeoEntry(payload);
  if (existing.id && idCol) {
    const setParts = Object.keys(data).map((k) => `\`${k}\` = :${k}`);
    await sequelize.query(
      `UPDATE game_seo_pages SET ${setParts.join(", ")} WHERE \`${idCol}\` = :id`,
      {
        type: QueryTypes.UPDATE,
        replacements: { ...data, id: existing.id },
      }
    );
    return { id: existing.id, updated: true };
  }

  const keys = Object.keys(data);
  const cols = keys.map((k) => `\`${k}\``).join(", ");
  const vals = keys.map((k) => `:${k}`).join(", ");
  await sequelize.query(`INSERT INTO game_seo_pages (${cols}) VALUES (${vals})`, {
    type: QueryTypes.INSERT,
    replacements: data,
  });
  return { created: true };
}

module.exports = { listSites, getSeoEntry, upsertSeoEntry };
