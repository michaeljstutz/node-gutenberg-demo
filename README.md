# Gutenberg Demo

This project is to demo the use case of downloading the free Gutenberg metadata dump, processing the RDF data, and then saving to a database using NodeJS.

## Getting Started

### Prerequisites

* Docker installed (https://www.docker.com/get-started)

### Installing

Setup the .env file

```
cp .env.example .env
```

Install node dependencies

```
./gutenberg-demo yarn install
```

Initialize database

```
## After start give it a few seconds/minutes to let the instance start up
./gutenberg-demo start

## This will initialize the dev/test/prod databases
./gutenberg-demo migrate dev
./gutenberg-demo migrate test

## Use if diffrent then the dev DB 
#./gutenberg-demo migrate prod
```

## Running

This process can take a long time (60+ minutes) depending on your machine

```
## Run the app
./gutenberg-demo run
```

## Development

Run tests

```
## Runs jest --coverage
./gutenberg-demo test
```

## TODO

* Additional tests
* Increase the overall test coverage
* Expand the data being extracted from gutenberg
* Add elastic search layer to support content indexing
* Add book content

## Built With

* [Docker](https://www.docker.com/get-started) - Container Engine

## License

MIT
