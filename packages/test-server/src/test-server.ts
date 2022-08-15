import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';
import multer from 'multer';
import uuid from 'uuid';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const port = 3002;
export const hostUrl = `http://127.0.0.1:${port}`;

// contains UTF-8 bytes of the string 'buffer'
export const expectedBuffer = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);

interface Dog {
    pk?: string;
    name: string;
}

const allDogs: Dog[] = [
    {
        pk: 'dd42e1d8-629e-48a1-9e96-42f7b1fdc167',
        name: 'Daisy',
    },
    {
        pk: '26fe9717-e494-43eb-b6d0-0c77422948a2',
        name: 'Lassie',
    },
    {
        pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815',
        name: 'Cody',
    },
];

function configureServer(logger = false) {
    const app = express();

    if (logger) {
        app.use(morgan('dev'));
    }

    app.use(express.raw()); // support text
    app.use(express.text()); // support text
    app.use(express.json()); // support json encoded bodies
    app.use(express.urlencoded({ extended: true })); // support encoded bodies
    app.use(cookieParser());

    app.get('/', (_0, res) => {
        res.status(200).send('home');
    });

    app.get('/hello', (_0, res) => {
        res.status(200).json({
            message: 'world',
        });
    });

    app.get('/query', (req, res) => {
        res.status(200).json({
            data: req.query,
        });
    });

    app.get('/headers', (req, res) => {
        if (req.headers.auth === 'foo') {
            res.status(200).json({
                authenticated: true,
            });
        } else {
            res.status(403).json({
                authenticated: false,
            });
        }
    });

    app.options('/options', (_0, res) => {
        res.status(200).json({
            message: 'options',
        });
    });

    app.get('/error500', (_0, res) => {
        res.status(500).json({
            message: 'yolo',
        });
    });

    app.get('/errorNetwork', (_0, res) => {
        res.socket?.destroy();
    });

    app.get('/cookies', (req, res) => {
        if (req.cookies.sessionid === 'secret') {
            res.status(200).json({
                authenticated: true,
            });
        } else {
            res.status(403).json({
                authenticated: false,
            });
        }
    });

    app.put('/dogs', (req, res) => {
        const data: Dog = {
            name: req.body.name,
        };

        if (data.name) {
            data.pk = uuid.v4();
            allDogs.push(data);

            res.status(201).json({
                pk: data.pk,
            });
        } else {
            res.status(400).json({
                errors: {
                    name: ['This field is required'],
                },
            });
        }
    });

    app.patch('/dogs/:id', (req, res) => {
        const dogId = req.params.id;
        const dogIndex = allDogs.findIndex((x) => x.pk === dogId);

        if (dogIndex !== -1) {
            if (req.body.name) {
                allDogs[dogIndex].name = req.body.name;

                res.status(200).json({ pk: dogId });
            } else {
                res.status(400).json({
                    errors: {
                        name: ['This field is required'],
                    },
                });
            }
        } else {
            res.status(404).json({
                message: 'object does not exist',
            });
        }
    });

    app.get('/dogs/:id', (req, res) => {
        const dogId = req.params.id;
        const dogIndex = allDogs.findIndex((x) => x.pk === dogId);

        if (dogIndex !== -1) {
            res.status(200).json(allDogs[dogIndex]);
        } else {
            res.status(404).json({
                message: 'object does not exist',
            });
        }
    });

    app.delete('/dogs/:id', (req, res) => {
        const dogId = req.params.id;
        const dogIndex = allDogs.findIndex((x) => x.pk === dogId);

        if (dogIndex !== -1) {
            allDogs.splice(dogIndex, 1);
            res.removeHeader('Content-Type');
            res.status(204).end();
        } else {
            res.status(404).json({
                message: 'object does not exist',
            });
        }
    });

    app.post('/url-encoded', (req, res) => {
        const { test } = req.body;
        res.set('Content-Type', 'application/x-www-form-urlencoded')
            .status(200)
            .send(`data%5Btest%5D=${test}`);
    });

    app.post('/error413', (_0, res) => {
        res.status(413).json({
            name: ['This field is required.'],
        });
    });

    app.get('/error400_nonField', (_0, res) => {
        res.status(400).json({
            non_field_errors: ['Sup dog'],
        });
    });

    app.get('/errorNested', (_0, res) => {
        res.status(400).json({
            a_number: ['A valid integer is required.'],
            list_of_things: [{}, { foo: ['A valid integer is required.'] }],
            nested: {
                bar: ['This field is required.'],
            },
        });
    });

    app.post('/attachments', upload.any(), (req, res) => {
        console.log('req.headers', req.headers);
        console.log('req.files', req.files);
        console.log('req.body', req.body);

        const files = req.files as Express.Multer.File[];
        const fields = req.body;

        if (!fields.name || fields.name !== 'foo') {
            res.status(400).json({
                errors: {
                    name: 'this field must be foo',
                },
            });
            return;
        }

        if (!fields.bool0 || fields.bool0 !== 'false') {
            res.status(400).json({
                errors: {
                    bool0: 'this field must be false',
                },
            });
            return;
        }

        if (!fields.bool1 || fields.bool1 !== 'true') {
            res.status(400).json({
                errors: {
                    bool0: 'this field must be false',
                },
            });
            return;
        }

        if (fields.ignored0 !== undefined || fields.ignored1 !== undefined) {
            res.status(400).json({
                errors: {
                    ignored0: 'this field must be undefined',
                    ignored1: 'this field must be undefined',
                },
            });
            return;
        }

        const postedArray = fields.array;

        if (!postedArray || !Array.isArray(postedArray)) {
            res.status(400).json({
                errors: {
                    array: 'this field must be an array',
                },
            });
            return;
        }

        if (
            postedArray.length !== 2 ||
            postedArray[0] !== 'first!' ||
            postedArray[1] !== 'first! E: missed it'
        ) {
            res.status(400).json({
                errors: {
                    array: 'invalid array contents',
                },
            });
            return;
        }

        if (!fields.object || fields.object !== '{"foo":1,"bar":0}') {
            res.status(400).json({
                errors: {
                    object: 'object must be converted to json',
                },
            });
            return;
        }

        if (!files || files.length !== 1) {
            res.status(400).json({
                errors: {
                    text: 'this field is required',
                },
            });
        }

        const fileData = files[0];

        if (fileData.originalname !== 'dummy.txt') {
            res.status(400).json({
                errors: {
                    text: 'this file must be named dummy.txt',
                },
            });
        }

        if (!fileData.buffer.equals(expectedBuffer)) {
            res.status(400).json({
                errors: {
                    text: 'invalid contents of file',
                },
            });
            return;
        }

        res.status(200).json({
            ack: req.headers.ack,
            name: fields.name,
            text: {
                name: fileData.originalname,
                size: fileData.buffer.length,
            },
            bool0: fields.bool0,
            bool1: fields.bool1,
            array: postedArray,
            object: fields.object,
        });
    });

    app.get('/abort', (_0, res) => {
        setTimeout(() => {
            res.status(200).json({
                notAborted: true,
            });
        }, 2000);
    });

    return app;
}

export const listen = (p: number = port, logger = false) =>
    configureServer(logger).listen(p);

export const getHostUrl = (p: number = port) => `http://127.0.0.1:${p}`;
