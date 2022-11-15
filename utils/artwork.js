import db from "../db";

// Get all artwork with status submitted
export const getSubmittedArtwork = async () => {
  try {
    const queryResult = await db.query(
      "SELECT * FROM artwork WHERE artwork_status='submitted'"
    );
    const submittedArtwork = await queryResult.rows;
    return submittedArtwork;
  } catch {
    (error) => console.log(error);
  }
};