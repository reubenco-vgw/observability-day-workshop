import "./tracing"
import express, { Request, Response } from 'express';
import { trace } from '@opentelemetry/api';
import { download } from "./download";
import { applyTextWithImagemagick } from "./applyTextWithImagemagick";

const app = express();
const PORT = 10114;

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
    res.send("OK");
});

app.post('/applyPhraseToPicture', async (req, res) => {
    // const span = trace.getActiveSpan();
    try {
        const input = req.body;
        let { phrase: inputPhrase, imageUrl } = input;
        // span?.setAttributes({ // INSTRUMENTATION: record important things
        //     "app.meminator.phrase": inputPhrase, "app.meminator.imageUrl": imageUrl,
        //     "app.meminator.imageExtension": imageUrl ? path.extname(imageUrl) : "none"
        // });
        const phrase = inputPhrase.toLocaleUpperCase();

        // download the image, defaulting to a local image
        const inputImagePath = await download(imageUrl);

        const outputImagePath = await applyTextWithImagemagick(phrase, inputImagePath);
        res.sendFile(outputImagePath);
    }
    catch (error) {
        // span?.recordException(error as Error); // INSTRUMENTATION: record exceptions. This will someday happen automatically in express instrumentation
        // span?.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
        console.error('Error creating picture:', error);
        res.status(500).send('Internal Server Error');
    }
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
