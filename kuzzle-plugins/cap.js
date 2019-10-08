const fs = require('fs');
const path = require('path');

const dockerfileLines = fs.readFileSync(path.join(__dirname, './docker', 'Dockerfile')).toString().split('\n');

for (let i = 0; i < dockerfileLines.length; i += 1) {
  let line = dockerfileLines[i];
  if (line.indexOf('COPY .') === 0) {
    dockerfileLines[i] = line.replace('COPY .', 'COPY ./src');
  }
}

const captainDefinition = JSON.stringify({
  schemaVersion: 1,
  dockerfileLines,
});

fs.writeFileSync(path.join(__dirname, '..', 'captain-definition'), captainDefinition);