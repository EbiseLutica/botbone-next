import { readConfigAsync, writeConfigAsync } from './api/config';

writeConfigAsync('test', {
  booleanTest: true,
  numberTest: 300,
  stringTest: 'Hello',
  arrayTest: [
    0, 1, 2, 'Meow', false,
  ],
  objectTest: {
    name: 'John',
    age: 30,
    isVerified: true,
  },
}).then(() => {
  readConfigAsync('test', {}).then(v => console.log(v));
});
