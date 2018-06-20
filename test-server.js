import fs from 'fs';

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import multiparty from 'multiparty';
import uuid from 'uuid';

import { isArray } from './src/typeChecks';


export const port = 3001;
export const hostUrl = `http://127.0.0.1:${port}`;

// contains UTF-8 bytes of the string 'buffer'
export const expectedBuffer = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);

const allDogs = [
    {
        pk: '26fe9717-e494-43eb-b6d0-0c77422948a2',
        name: 'Lassie',
    },
    {
        pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815',
        name: 'Cody',
    },
];

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).send('home');
});

app.get('/hello', (req, res) => {
    res.status(200).json({
        message: 'world',
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

app.options('/options', (req, res) => {
    res.status(200).json({
        message: 'options',
    });
});

app.get('/error500', (req, res) => {
    res.status(500).json({
        message: 'yolo',
    });
});

app.get('/errorNetwork', (req, res) => {
    res.connection.destroy();
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
    const data = {
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
    const dogIndex = allDogs.findIndex(x => x.pk === dogId);

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
    const dogIndex = allDogs.findIndex(x => x.pk === dogId);

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
    const dogIndex = allDogs.findIndex(x => x.pk === dogId);

    if (dogIndex !== -1) {
        allDogs.splice(dogIndex, 1);

        res.status(200).json({
            deleted: true,
        });
    } else {
        res.status(404).json({
            message: 'object does not exist',
        });
    }
});

app.post('/error413', (req, res) => {
    res.status(413).json({
        name: [
            'This field is required.',
        ],
    });
});

app.get('/error400_nonField', (req, res) => {
    res.status(400).json({
        non_field_errors: ['Sup dog'],
    });
});

app.get('/errorNested', (req, res) => {
    res.status(400).json({
        a_number: ['A valid integer is required.'],
        list_of_things: [{}, { foo: ['A valid integer is required.'] }],
        nested: {
            bar: ['This field is required.'] },
    });
});

app.post('/attachments', (req, res) => {
    const form = new multiparty.Form();

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        if (!fields.name || fields.name[0] !== 'foo') {
            res.status(400).json({
                errors: {
                    name: 'this field must be foo',
                },
            });
            return;
        }

        if (!fields.bool0 || fields.bool0[0] !== 'false') {
            res.status(400).json({
                errors: {
                    bool0: 'this field must be false',
                },
            });
            return;
        }

        if (!fields.bool1 || fields.bool1[0] !== 'true') {
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

        const postedArray = fields['array[]'];

        if (!postedArray || !isArray(postedArray)) {
            res.status(400).json({
                errors: {
                    array: 'this field must be an array',
                },
            });
            return;
        }

        if (postedArray.length !== 2 || postedArray[0] !== 'first!' || postedArray[1] !== 'first! E: missed it') {
            res.status(400).json({
                errors: {
                    array: 'invalid array contents',
                },
            });
            return;
        }

        if (!fields.object || fields.object[0] !== '{"foo":1,"bar":0}') {
            res.status(400).json({
                errors: {
                    object: 'object must be converted to json',
                },
            });
            return;
        }

        if (!files.text || files.text.length !== 1) {
            res.status(400).json({
                errors: {
                    text: 'this field is required',
                },
            });
        }

        const fileData = files.text[0];

        if (fileData.originalFilename !== 'dummy.txt') {
            res.status(400).json({
                errors: {
                    text: 'this file must be named dummy.txt',
                },
            });
        }

        fs.readFile(fileData.path, (readErr, data) => {
            if (readErr) {
                res.status(500).send(readErr);
                return;
            }

            if (!data.equals(expectedBuffer)) {
                res.status(400).json({
                    errors: {
                        text: 'invalid contents of file',
                    },
                });
                return;
            }

            res.status(200).json({
                name: fields.name[0],
                text: {
                    name: fileData.originalFilename,
                    size: data.length,
                },
                bool0: fields.bool0[0],
                bool1: fields.bool1[0],
                array: postedArray,
                object: fields.object[0],
            });
        });
    });
});

export default () => app.listen(port);
