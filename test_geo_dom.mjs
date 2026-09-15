import React from 'react';
import ReactDOMServer from 'react-dom/server';
import defaultExperiments from './src/services/experimentCatalog.json' assert { type: 'json' };

// We will inspect the catalog entries for geography
const geoExps = defaultExperiments.filter(exp => 
  exp.subject === 'Địa lí' || exp.subject === 'Địa lý' || exp.interactiveType?.startsWith('geo_')
);

console.log("Found Geography experiments in catalog:", geoExps.length);
geoExps.forEach(e => console.log(`- ${e.id} | ${e.interactiveType} | ${e.title}`));
