const base=require('./lighthouserc.cjs');
module.exports={ci:{...base.ci,collect:{...base.ci.collect,url:['http://localhost/examples/the-grounds/index.html']},upload:{target:'filesystem',outputDir:'./reports/lighthouse-showcase'}}};
