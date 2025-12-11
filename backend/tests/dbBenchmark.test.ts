import pool from "../config/database";

async function runDbTest() {
  console.log("Database Benchmark Test\n");

  // ---------------------------------------
  // 1. Count rows in books table
  // ---------------------------------------
  const startCount = Date.now();
  const { rows: bookCount } = await pool.query("SELECT COUNT(*) FROM books");
  const endCount = Date.now();

  console.log(`Books count: ${bookCount[0].count} (took ${endCount - startCount} ms)`);


  // ---------------------------------------
  // 2. Bulk insert test (1000 rows)
  // ---------------------------------------
  const startInsert = Date.now();
  await pool.query("BEGIN");

  const insertQuery = `
    INSERT INTO books (title, author, total_copies)
    VALUES ($1, $2, $3)
  `;

  for (let i = 0; i < 1000; i++) {
    await pool.query(insertQuery, [
      `Benchmark Book ${i}`,
      "Benchmark Author",
      1
    ]);
  }

  await pool.query("COMMIT");
  const endInsert = Date.now();

  console.log(`Inserted 1000 rows in ${endInsert - startInsert} ms`);


  // ---------------------------------------
  // 3. Cleanup benchmark rows
  // ---------------------------------------
  await pool.query("DELETE FROM books WHERE author = 'Benchmark Author'");
  console.log("Cleanup complete.\n");
}

runDbTest()
  .then(() => {
    console.log("DB Benchmark Completed.");
    pool.end();
  })
  .catch(async (err) => {
    console.error("Error during benchmark:", err);
    await pool.query("ROLLBACK");
    pool.end();
  });
