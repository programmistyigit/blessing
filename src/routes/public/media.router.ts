import { FastifyPluginAsync } from "fastify";
import fs from "fs"

const mediaRouter: FastifyPluginAsync = async (fastify) => {
    fastify.get('/image/:photoName', async (request, reply) => {
        const { photoName } = request.params as { photoName: string };
        const imagePath = "./upload/image/"+photoName // Adjust the path as needed
        // return imagePath
        try {
            const imageData = fs.readFileSync(imagePath);
            reply.type('image/jpeg'); // Adjust the content type based on the image format
            reply.send(imageData);
        } catch (err) {
            reply.code(404).send('Image not found');
        }
    });
}

export default mediaRouter