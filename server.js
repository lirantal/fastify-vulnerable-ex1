import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import fs from 'fs';
import path from 'path';

const fastify = Fastify({ logger: true });

// Register multipart plugin
fastify.register(multipart);

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

fastify.post('/api/uploads', async (req, reply) => {
    const data = await req.file();
    if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
    }

    const safeFileName = path.basename(data.filename).replace(/(\.\.(\/|\\))/g, '');
    const filePath = path.join(uploadDir, safeFileName);
    const writeStream = fs.createWriteStream(filePath);
    await data.file.pipe(writeStream);

    return reply.send({ message: 'File uploaded successfully', filename: data.filename });
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('Server running on http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
