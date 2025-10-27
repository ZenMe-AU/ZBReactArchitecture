async function withTransaction(sequelizeInstance, callback) {
  const t = await sequelizeInstance.transaction();
  try {
    const result = await callback({ transaction: t });
    await t.commit();
    return result;
  } catch (err) {
    await t.rollback();
    console.error("Transaction rolled back:", err);
    throw err;
  }
}

module.exports = { withTransaction };
