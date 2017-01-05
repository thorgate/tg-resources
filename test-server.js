import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import uuid from 'uuid';


const port = 3000;
const allDogs = [
    {
        pk: '26fe9717-e494-43eb-b6d0-0c77422948a2',
        name: 'Lassie',
    },
    {
        pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815',
        name: 'Cody',
    }
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

export default () => app.listen(port);
