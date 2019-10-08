#!/bin/bash

# init submodules to install defaults kuzzle plugins
git submodule init
git submodule update

# install dependencies for all enabled plugins
for PLUGIN in ./plugins/enabled/*; do
  if [ -d "${PLUGIN}" ]; then
    ( cd "${PLUGIN}" && npm install )
  fi
done

