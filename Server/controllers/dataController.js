import db from "../data/db";

exports.getDataFromDatabase = async (req, res) => {
  try {
    const data = await db.query();
    res.json({ info: data });
  } catch (err) {
    res.status(500).send("error");
  }
};
