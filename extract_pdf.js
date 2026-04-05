const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('namibia_fpu_geological_analysis.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(err => {
    console.error(err);
});
