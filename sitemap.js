const SitemapGenerator = require('sitemap-generator');
// create generator
const generator = SitemapGenerator('https://niftyinvest.com', {
    maxDepth: 0,
    filepath: './public/xml/sitemap.xml',
    maxEntriesPerFile: 500000,
    stripQuerystring: true,
    changeFreq: 'daily',
    lastMod: true,
    priorityMap: [1.0, 0.8],
    maxConcurrency: 15
});

// register event listeners
generator.on('done', () => {
    console.log("sitemap created")
});
generator.on('add', (url) => {

    console.log(`adding ${url}`)
});
generator.on('error', (error) => {
    console.log(error);
    // => { code: 404, message: 'Not found.', url: 'http://example.com/foo' }
});
// start the crawler
generator.start();
