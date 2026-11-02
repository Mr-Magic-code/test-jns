const mysql = require('mysql2/promise');

async function seedBlogs() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jnsedu-db'
  });

  console.log('Connected to MySQL database. Starting 50,000 blogs seeding...');
  
  const totalBlogs = 50000;
  const batchSize = 1000; // 1000 blogs per batch

  for (let i = 0; i < totalBlogs; i += batchSize) {
    const values = [];
    
    for (let j = 1; j <= batchSize; j++) {
      const currentId = i + j;
      const title = `Stress Test Blog Post Number ${currentId}`;
      const slug = `stress-test-blog-${currentId}`;
      const content = `<p>This is heavy generated mock content for stress testing raw mysql performance for blog post number ${currentId}.</p>`;
      const region = currentId % 3 === 0 ? 'pakistan' : currentId % 2 === 0 ? 'middleeast' : 'general';
      const status = 'Published';
      const authorName = 'System Tester';

      values.push([title, slug, content, region, status, authorName]);
    }

    const query = `INSERT INTO blogs (title, slug, content, region, status, author_name) VALUES ?`;
    await connection.query(query, [values]);
    
    console.log(`Successfully inserted ${i + batchSize} / ${totalBlogs} blogs...`);
  }

  console.log('🎉 50,000 blogs successfully seeded!');
  await connection.end();
}

seedBlogs().catch(err => {
  console.error('Seeding error:', err);
});