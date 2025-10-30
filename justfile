test_all:
    npm run test:unit

test file="":
    npm run test:unit {{file}}

# install dpes and build project
build:
    npm i
    npm run build:all
