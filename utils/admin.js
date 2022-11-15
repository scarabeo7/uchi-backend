import db from "../db";

// Get all admin emails
export const getAdminEmails = async () => {
  let emailQuery = `SELECT email FROM admins;`;
  try {
    const queryResult = await db.query(emailQuery);
    const emails = await queryResult.rows;
    const validEmails = await emails
      .filter((el) => el.email)
      .map((el) => el.email)
      .join(", ");
    return validEmails;
  } catch {
    (error) => console.log(error);
  }
};

export const getUserDetails = async (field, type) => {
  let detailsQuery = `SELECT * FROM admins WHERE ${type}=$1;`;
  try {
    const queryResult = await db.query(detailsQuery, [field]);
    const details = await queryResult.rows;
    const result = await details[0];
    return result;
  } catch {
    (error) => console.log(error);
  }
};
