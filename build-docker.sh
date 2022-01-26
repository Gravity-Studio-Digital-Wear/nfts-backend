#!/bin/bash
echo "Building all modules..."

declare -a modules=(
    "nfts-auth" 
    "nfts-polygon-adapter" 
    "nfts-stripe-adapter"    
    "nfts-warehouse"
    "nfts-notify"
    "hubspot-proxy"
)

function build_docker() {
    cd ${1}
    sh build-docker.sh
    cd ..
}

for (( i=0; i<${#modules[@]}; i++ ));
do
  let "INDEX=${i}+1"
  echo "[${INDEX}/${#modules[@]}] Building: ${modules[$i]}"
  build_docker ${modules[$i]}
done