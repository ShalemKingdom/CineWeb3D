const base=require('./lighthouserc.cjs');
module.exports={ci:{...base.ci,collect:{...base.ci.collect,url:['http://localhost/examples/cafe-aurora/index.html']},upload:{target:'filesystem',outputDir:'./reports/lighthouse-aurora'}}};
