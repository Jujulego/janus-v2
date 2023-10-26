import 'reflect-metadata';

// Bootstrap
(async () => {
  try {
    // eslint-disable-next-line no-console
    console.log('Hello world !');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();