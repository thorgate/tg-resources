import basic from './basic_usage';
import errors from './error_handling';
import router from './router';

Promise.all([basic(), errors(), router()])
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
