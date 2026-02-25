const fs = require('fs');
const lockfile = JSON.parse(fs.readFileSync('./package-lock.json', 'utf8'));

const pkg = {
  name: "flow-lab-connect-main",
  private: true,
  version: "0.0.0",
  type: "module",
  scripts: {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  dependencies: {},
  devDependencies: {}
};

const deps = lockfile.packages[''].dependencies || {};
const devDeps = lockfile.packages[''].devDependencies || {};

pkg.dependencies = deps;
pkg.devDependencies = devDeps;

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log('Created package.json');
