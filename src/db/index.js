import { Pool } from 'pg';
import config from '../config/index.js';

const pool = new Pool({
  connectionString: config.databaseUrl,
});

export default pool;