const { Client } = require('pg');

async function testDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres', // Connect to default database first
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if our database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'level_up_daily'"
    );

    if (result.rows.length === 0) {
      console.log('Creating database level_up_daily...');
      await client.query('CREATE DATABASE level_up_daily');
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database level_up_daily already exists');
    }

    // Connect to our database
    await client.end();
    
    const dbClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'level_up_daily',
    });

    await dbClient.connect();
    console.log('✅ Connected to level_up_daily database');

    // Create uuid extension
    await dbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension created');

    await dbClient.end();
    console.log('✅ Database setup complete!');

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

testDatabase(); 