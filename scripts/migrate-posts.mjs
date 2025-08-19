import { readFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

// Since we can't use TypeScript directly in Node scripts, we'll need to import the compiled JS
// For now, let's use a simple approach with better-sqlite3 directly
import Database from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');


function initDatabase() {
    // Use environment-specific database path
    const dbPath = import.meta.env.NODE_ENV === 'production'
        ? '/app/data/content.db'
        : join(projectRoot, 'scripts', 'manage-sqlite', 'content.db');

    const db = new Database(dbPath);

    // Initialize schema
    const schemaPath = join(projectRoot, 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);

    return db;
}

function migratePost(db, filePath, fileName) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content: markdownContent } = matter(content);

        // Create slug from filename (remove .md extension)
        const slug = fileName.replace('.md', '');

        // Prepare post data
        const pubDate = frontmatter.pubDate
            ? (frontmatter.pubDate instanceof Date
                ? frontmatter.pubDate.toISOString().split('T')[0]
                : frontmatter.pubDate.toString())
            : new Date().toISOString().split('T')[0];

        const post = {
            title: frontmatter.title || 'Untitled',
            author: frontmatter.author || 'Unknown',
            description: frontmatter.description || null,
            image_url: frontmatter.image?.url || null,
            image_alt: frontmatter.image?.alt || null,
            pub_date: pubDate,
            tags: JSON.stringify(frontmatter.tags || []),
            content: markdownContent.trim(),
            slug: slug
        };

        // Insert into database
        const stmt = db.prepare(`
      INSERT OR REPLACE INTO posts (title, author, description, image_url, image_alt, pub_date, tags, content, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            post.title,
            post.author,
            post.description,
            post.image_url,
            post.image_alt,
            post.pub_date,
            post.tags,
            post.content,
            post.slug
        );

        console.log(`✅ Migrated: ${post.title} (ID: ${result.lastInsertRowid})`);
        return true;
    } catch (error) {
        console.error(`❌ Error migrating ${fileName}:`, error.message);
        return false;
    }
}

function main() {
    console.log('🚀 Starting post migration...');

    const db = initDatabase();
    const postsDir = join(projectRoot, 'src', 'pages', 'posts');

    try {
        const files = readdirSync(postsDir).filter(file => file.endsWith('.md'));

        if (files.length === 0) {
            console.log('📝 No markdown files found in posts directory');
            return;
        }

        console.log(`📚 Found ${files.length} markdown file(s) to migrate`);

        let successCount = 0;
        let errorCount = 0;

        for (const file of files) {
            const filePath = join(postsDir, file);
            const success = migratePost(db, filePath, file);

            if (success) {
                successCount++;
            } else {
                errorCount++;
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`   ✅ Successfully migrated: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);

        // Show all posts in database
        const allPosts = db.prepare('SELECT id, title, slug, pub_date FROM posts ORDER BY pub_date DESC').all();
        console.log('\n📋 Posts in database:');
        allPosts.forEach(post => {
            console.log(`   ${post.id}: ${post.title} (${post.slug}) - ${post.pub_date}`);
        });

    } catch (error) {
        console.error('💥 Migration failed:', error.message);
    } finally {
        db.close();
        console.log('\n✨ Migration complete!');
    }
}

main();