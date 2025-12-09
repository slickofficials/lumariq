#!/bin/bash

chmod +x fix_all_prisma.sh
chmod +x patch_dockerfiles.sh
chmod +x patch_compose.sh
chmod +x setup_database.sh

./fix_all_prisma.sh
./patch_dockerfiles.sh
./patch_compose.sh
./setup_database.sh

echo "🎉 FULL LUMARIQ PLATFORM PATCHED, BUILT, AND READY!"
echo "🚀 Now start everything with:"
echo "    docker compose up --build"