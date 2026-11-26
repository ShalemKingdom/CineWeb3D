const base=require('./lighthouserc.cjs');
module.exports={ci:{...base.ci,assert:{assertions:{...base.ci.assert.assertions,'categories:seo':['error',{aggregationMethod:'pessimistic',minScore:1}]}},upload:{target:'filesystem',outputDir:'./reports/lighthouse-production'}}};
